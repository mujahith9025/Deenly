import { create } from 'zustand'
import type { UserProfile, AuthState, SessionDelta, SyncStatus } from '../types/auth'
import type { DailyReadingRecord } from '../types/reading'
import type { Database } from '../types/database.types'
import { authService, createDefaultProfile } from '../lib/authService'
import { supabase, isConfigured } from '../lib/supabase'
import { calculateDailyStreak, getLocalDateString, type SessionMetrics } from '../lib/hasanatEngine'
import { syncService, getDeviceId } from '../lib/syncService'
import { useReadingStore } from './useReadingStore'
import { quranCache } from '../lib/quranCache'
import { logger } from '../lib/logger'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const DAILY_HISTORY_STORAGE_KEY = 'deenly_daily_history'
const LAST_SYNCED_KEY = 'deenly_last_synced_at'

let cleanupRealtimeSync: (() => void) | null = null

interface AuthStoreActions {
  setUser: (user: UserProfile | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSyncStatus: (status: SyncStatus) => void
  initAuth: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => void
  signOut: () => Promise<void>
  updateUserSettings: (settings: Partial<UserProfile>) => Promise<void>
  resetUserStatsToZero: () => Promise<void>
  deleteAccount: () => Promise<void>
  recordSessionCompletion: (metrics: SessionMetrics) => Promise<void>
  applyDeltaUpdate: (delta: SessionDelta, isRemote?: boolean) => void
  syncNow: () => Promise<void>
}

export type AuthStore = AuthState & AuthStoreActions

// Clean initial guest profile with zero stats
const initialGuestUser: UserProfile = {
  id: 'guest-user',
  uid: 'guest-user',
  name: 'Guest Seeker',
  email: 'guest@deenly.app',
  photoUrl: null,
  createdAt: new Date().toISOString(),
  preferredTranslation: 'english',
  dailyGoalVerses: 10,
  hasanat: 0,
  verses: 0,
  time: 0,
  pages: 0,
  currentStreak: 0,
  bestStreak: 0,
  arabicFontSize: 28,
  arabicFontStyle: 'madani',
  prayerNotifications: true,
  readingReminders: true,
  authProvider: 'guest',
  lastReadSurah: 1,
  lastReadAyah: 1,
  isGuest: true,
}

function loadStoredDailyHistory(): Record<string, DailyReadingRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DAILY_HISTORY_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to load daily reading history:', err)
  }
  return {}
}

const initialStoredUser = typeof window !== 'undefined' ? authService.getStoredProfile() : null

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: initialStoredUser,
  session: null,
  dailyHistory: loadStoredDailyHistory(),
  syncStatus: 'synced',
  lastSyncedAt: typeof window !== 'undefined' ? localStorage.getItem(LAST_SYNCED_KEY) || new Date().toISOString() : null,
  pendingOfflineCount: syncService.getPendingCount(),
  isLoading: initialStoredUser ? false : true,
  isAuthenticated: Boolean(initialStoredUser),
  error: null,

  setUser: (user) => set({ user, isAuthenticated: Boolean(user), error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),

  initAuth: async () => {
    set({ isLoading: true })
    try {
      const initialUser = await authService.getInitialUser()
      let history = loadStoredDailyHistory()

      if (initialUser) {
        // Auto-sanitize legacy demo stats (24500 hasanat / 450 verses)
        if (initialUser.hasanat === 24500 && initialUser.verses === 450) {
          initialUser.hasanat = 0
          initialUser.verses = 0
          initialUser.time = 0
          initialUser.pages = 0
          initialUser.currentStreak = 0
          initialUser.bestStreak = 0
          history = {}
          localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
          localStorage.setItem('deenly_auth_session', JSON.stringify(initialUser))
        }

        // Re-compute streak based on history
        const { currentStreak } = calculateDailyStreak(history)
        const savedFontSize = typeof window !== 'undefined' 
          ? parseInt(localStorage.getItem('deenly_arabic_font_size') || '0', 10) 
          : 0
        const effectiveFontSize = savedFontSize > 0 ? savedFontSize : (initialUser.arabicFontSize || 28)

        const updatedUser = {
          ...initialUser,
          currentStreak: Math.max(initialUser.currentStreak || 0, currentStreak),
          arabicFontSize: effectiveFontSize,
        }

        // Apply CSS variable
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty(
            '--arabic-font-size',
            `${updatedUser.arabicFontSize}px`
          )
        }

        // Sync Reading Store
        useReadingStore.getState().setFontSize(updatedUser.arabicFontSize)
        useReadingStore.getState().setTranslationLanguage(
          updatedUser.preferredTranslation === 'tamil' ? 'ta' : 'en'
        )

        set({
          user: updatedUser,
          dailyHistory: history,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          pendingOfflineCount: syncService.getPendingCount(),
        })

        // Setup Realtime Cross-Device Synchronization
        if (cleanupRealtimeSync) cleanupRealtimeSync()
        cleanupRealtimeSync = syncService.initRealtimeSync(
          initialUser.uid || initialUser.id,
          (delta) => {
            get().applyDeltaUpdate(delta, true)
          }
        )
      } else {
        set({
          user: null,
          dailyHistory: {},
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      }

      // Supabase Realtime Auth listener
      if (isConfigured) {
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const user = session.user
            const isGoogle = user.app_metadata?.provider === 'google'

            // Fetch actual user profile row from Supabase database
            let profile: UserProfile | null = null
            try {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

              if (profileRow) {
                const row = profileRow as unknown as ProfileRow
                profile = {
                  id: row.id,
                  uid: row.uid || row.id,
                  name: row.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Seeker',
                  email: row.email || user.email || '',
                  photoUrl: row.photo_url || user.user_metadata?.avatar_url || null,
                  createdAt: row.created_at || new Date().toISOString(),
                  preferredTranslation: row.preferred_translation || 'english',
                  dailyGoalVerses: row.daily_goal_verses ?? 10,
                  hasanat: row.hasanat ?? 0,
                  verses: row.verses ?? 0,
                  time: row.time ?? 0,
                  pages: row.pages ?? 0,
                  currentStreak: row.current_streak ?? 0,
                  bestStreak: row.best_streak ?? 0,
                  lastReadSurah: row.last_read_surah ?? 1,
                  lastReadAyah: row.last_read_ayah ?? 1,
                  arabicFontSize: 28,
                  prayerNotifications: true,
                  readingReminders: true,
                  authProvider: isGoogle ? 'google' : 'email',
                }
              }
            } catch (fetchErr) {
              console.warn('Failed to load profile row on auth change:', fetchErr)
            }

            if (!profile) {
              profile = createDefaultProfile({
                uid: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Seeker',
                email: user.email || '',
                photoUrl: user.user_metadata?.avatar_url || null,
              })
              profile.authProvider = isGoogle ? 'google' : 'email'
            }

            // Auto-clean legacy demo stats if present
            if (profile.hasanat === 24500 && profile.verses === 450) {
              profile.hasanat = 0
              profile.verses = 0
              profile.time = 0
              profile.pages = 0
              profile.currentStreak = 0
              profile.bestStreak = 0
              localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
            }

            localStorage.setItem('deenly_auth_session', JSON.stringify(profile))

            set({
              user: profile,
              session,
              dailyHistory: loadStoredDailyHistory(),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })

            if (cleanupRealtimeSync) cleanupRealtimeSync()
            cleanupRealtimeSync = syncService.initRealtimeSync(user.id, (delta) => {
              get().applyDeltaUpdate(delta, true)
            })
          } else if (event === 'SIGNED_OUT') {
            if (cleanupRealtimeSync) {
              cleanupRealtimeSync()
              cleanupRealtimeSync = null
            }
            localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
            localStorage.removeItem('deenly_auth_session')
            set({
              user: null,
              session: null,
              dailyHistory: {},
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        })
      }
    } catch (err: unknown) {
      console.warn('Auth initialization error:', err)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const profile = await authService.signInWithEmail(email, password)
      profile.authProvider = 'email'
      set({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      if (cleanupRealtimeSync) cleanupRealtimeSync()
      cleanupRealtimeSync = syncService.initRealtimeSync(profile.uid, (delta) => {
        get().applyDeltaUpdate(delta, true)
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  signUpWithEmail: async (email, password, name) => {
    set({ isLoading: true, error: null })
    try {
      const profile = await authService.signUpWithEmail(email, password, name)
      profile.authProvider = 'email'
      set({
        user: profile,
        dailyHistory: {},
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      if (cleanupRealtimeSync) cleanupRealtimeSync()
      cleanupRealtimeSync = syncService.initRealtimeSync(profile.uid, (delta) => {
        get().applyDeltaUpdate(delta, true)
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await authService.signInWithGoogle()
      if (profile) {
        profile.authProvider = 'google'
        set({
          user: profile,
          dailyHistory: {},
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        if (cleanupRealtimeSync) cleanupRealtimeSync()
        cleanupRealtimeSync = syncService.initRealtimeSync(profile.uid, (delta) => {
          get().applyDeltaUpdate(delta, true)
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  signInAsGuest: () => {
    localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
    localStorage.setItem('deenly_auth_session', JSON.stringify(initialGuestUser))
    set({
      user: initialGuestUser,
      dailyHistory: {},
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
    if (cleanupRealtimeSync) cleanupRealtimeSync()
    cleanupRealtimeSync = syncService.initRealtimeSync(initialGuestUser.uid, (delta) => {
      get().applyDeltaUpdate(delta, true)
    })
  },

  signOut: async () => {
    set({ isLoading: true })
    if (cleanupRealtimeSync) {
      cleanupRealtimeSync()
      cleanupRealtimeSync = null
    }
    try {
      await authService.signOut()
    } finally {
      localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
      localStorage.removeItem('deenly_auth_session')
      set({
        user: null,
        session: null,
        dailyHistory: {},
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  updateUserSettings: async (settings: Partial<UserProfile>) => {
    const state = get()
    const currentUser = state.user
    if (!currentUser) return

    const updatedUser: UserProfile = {
      ...currentUser,
      ...settings,
    }

    // 1. Sync CSS variable and localStorage for Arabic font size if updated
    if (settings.arabicFontSize) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('deenly_arabic_font_size', settings.arabicFontSize.toString())
      }
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty(
          '--arabic-font-size',
          `${settings.arabicFontSize}px`
        )
      }
      useReadingStore.getState().setFontSize(settings.arabicFontSize)
    }

    // 2. Sync Translation Language with Reading Store
    if (settings.preferredTranslation) {
      const langCode = settings.preferredTranslation === 'tamil' ? 'ta' : 'en'
      useReadingStore.getState().setTranslationLanguage(langCode)
    }

    // 3. Persist to localStorage
    try {
      localStorage.setItem('deenly_auth_session', JSON.stringify(updatedUser))
    } catch (err) {
      console.warn('LocalStorage save failed:', err)
    }

    // 4. Update Supabase profile row if configured
    if (isConfigured && currentUser.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            preferred_translation: updatedUser.preferredTranslation,
            daily_goal_verses: updatedUser.dailyGoalVerses,
          } as never)
          .eq('id', currentUser.id)
      } catch (err) {
        console.warn('Supabase profile settings update error:', err)
      }
    }

    set({ user: updatedUser })
  },

  resetUserStatsToZero: async () => {
    const state = get()
    const currentUser = state.user
    if (!currentUser) return

    const cleanedUser: UserProfile = {
      ...currentUser,
      hasanat: 0,
      verses: 0,
      time: 0,
      pages: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastReadSurah: 1,
      lastReadAyah: 1,
    }

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
      localStorage.setItem('deenly_auth_session', JSON.stringify(cleanedUser))
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('deenly_habits_')) {
          localStorage.removeItem(k)
        }
      })
    }

    // Reset Supabase table row
    if (isConfigured && currentUser.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            hasanat: 0,
            verses: 0,
            time: 0,
            pages: 0,
            current_streak: 0,
            best_streak: 0,
            last_read_surah: 1,
            last_read_ayah: 1,
          } as never)
          .eq('id', currentUser.id)
      } catch (err) {
        console.warn('Supabase reset stats error:', err)
      }
    }

    set({
      user: cleanedUser,
      dailyHistory: {},
    })
    logger.info('User stats and reading history reset to zero.')
  },

  deleteAccount: async () => {
    set({ isLoading: true })
    const currentUser = get().user

    // 1. Clean Supabase profile row & auth if configured
    if (isConfigured && currentUser?.id) {
      try {
        await supabase.from('profiles').delete().eq('id', currentUser.id)
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase delete account error:', err)
      }
    }

    // 2. Clear all local caches and stored user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deenly_auth_session')
      localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
      localStorage.removeItem(LAST_SYNCED_KEY)
      localStorage.removeItem('deenly_offline_sync_queue')
    }

    await quranCache.clearCache()

    if (cleanupRealtimeSync) {
      cleanupRealtimeSync()
      cleanupRealtimeSync = null
    }

    set({
      user: null,
      session: null,
      dailyHistory: {},
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  applyDeltaUpdate: (delta: SessionDelta, isRemote = false) => {
    const state = get()
    const currentUser = state.user
    if (!currentUser) return

    const dateKey = delta.dateStr || getLocalDateString(new Date(delta.timestamp))
    const currentHistory = { ...state.dailyHistory }
    const targetDayLog = currentHistory[dateKey] || {
      date: dateKey,
      hasanat: 0,
      verses: 0,
      timeSeconds: 0,
      pages: 0,
      lastSurah: delta.lastSurah,
      lastAyah: delta.lastAyah,
    }

    // 1. Additive Counter Merge for Daily History
    targetDayLog.hasanat += delta.deltaHasanat
    targetDayLog.verses += delta.deltaVerses
    targetDayLog.timeSeconds += delta.deltaTimeSeconds
    targetDayLog.pages += delta.deltaPages
    targetDayLog.lastSurah = delta.lastSurah
    targetDayLog.lastAyah = delta.lastAyah
    currentHistory[dateKey] = targetDayLog

    // 2. Re-compute Streak
    const { currentStreak } = calculateDailyStreak(currentHistory)

    // 3. Additive Counter Merge for Lifetime Totals
    const updatedUser: UserProfile = {
      ...currentUser,
      hasanat: (currentUser.hasanat || 0) + delta.deltaHasanat,
      verses: (currentUser.verses || 0) + delta.deltaVerses,
      time: (currentUser.time || 0) + delta.deltaTimeSeconds,
      pages: (currentUser.pages || 0) + delta.deltaPages,
      currentStreak: Math.max(currentStreak, currentUser.currentStreak || 0),
      bestStreak: Math.max(currentStreak, currentUser.bestStreak || 0),
      lastReadSurah: delta.lastSurah,
      lastReadAyah: delta.lastAyah,
      lastReadAt: new Date(delta.timestamp).toISOString(),
    }

    const nowIso = new Date().toISOString()

    try {
      localStorage.setItem('deenly_auth_session', JSON.stringify(updatedUser))
      localStorage.setItem(DAILY_HISTORY_STORAGE_KEY, JSON.stringify(currentHistory))
      localStorage.setItem(LAST_SYNCED_KEY, nowIso)
    } catch (e) {
      logger.warn('Storage persistence warning in applyDeltaUpdate', { error: e })
    }

    set({
      user: updatedUser,
      dailyHistory: currentHistory,
      lastSyncedAt: nowIso,
      syncStatus: 'synced',
      pendingOfflineCount: syncService.getPendingCount(),
    })

    if (isRemote) {
      logger.info('Applied remote delta merge from another device', { delta })
    }
  },

  recordSessionCompletion: async (metrics: SessionMetrics) => {
    const state = get()
    const currentUser = state.user
    if (!currentUser) return

    const todayStr = getLocalDateString(new Date())
    const delta: SessionDelta = {
      id: `delta_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: currentUser.uid || currentUser.id,
      deviceId: getDeviceId(),
      deltaHasanat: metrics.hasanatEarned,
      deltaVerses: metrics.versesRead,
      deltaTimeSeconds: metrics.durationSeconds,
      deltaPages: metrics.pagesRead,
      lastSurah: metrics.lastSurah,
      lastAyah: metrics.lastAyah,
      lastPage: metrics.lastPage,
      lastJuz: metrics.lastJuz,
      timestamp: Date.now(),
      dateStr: todayStr,
    }

    logger.trackEvent('session_complete', {
      hasanatEarned: metrics.hasanatEarned,
      versesRead: metrics.versesRead,
      durationSeconds: metrics.durationSeconds,
    })

    // 1. Apply local delta merge immediately
    state.applyDeltaUpdate(delta, false)

    // 2. Publish delta to Realtime Cloud & BroadcastChannel
    set({ syncStatus: 'syncing' })
    try {
      const result = await syncService.publishSessionDelta(delta)
      set({
        syncStatus: result.queued ? 'offline' : 'synced',
        pendingOfflineCount: syncService.getPendingCount(),
        lastSyncedAt: new Date().toISOString(),
      })
      if (result.queued) {
        logger.warn('Reading session queued offline for next sync', { deltaId: delta.id })
      }
    } catch (syncErr) {
      logger.error('Failed to publish session delta to cloud', syncErr)
      set({
        syncStatus: 'offline',
        pendingOfflineCount: syncService.getPendingCount(),
      })
    }
  },

  syncNow: async () => {
    set({ syncStatus: 'syncing' })
    try {
      const flushedCount = await syncService.flushOfflineQueue((delta) => {
        get().applyDeltaUpdate(delta, false)
      })

      const nowIso = new Date().toISOString()
      localStorage.setItem(LAST_SYNCED_KEY, nowIso)

      set({
        syncStatus: 'synced',
        lastSyncedAt: nowIso,
        pendingOfflineCount: 0,
      })
      logger.info(`Manual sync complete. Flushed ${flushedCount} offline items.`)
    } catch (err) {
      logger.error('Manual sync failed', err)
      set({ syncStatus: 'error' })
    }
  },
}))
