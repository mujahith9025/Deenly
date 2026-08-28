import { supabase, isConfigured } from './supabase'
import type { UserProfile } from '../types/auth'
import type { Database } from '../types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

const LOCAL_STORAGE_KEY = 'deenly_auth_session'
const LOCAL_USERS_KEY = 'deenly_registered_users'
const DAILY_HISTORY_STORAGE_KEY = 'deenly_daily_history'

export function createDefaultProfile(params: {
  uid: string
  name: string
  email: string
  photoUrl?: string | null
  isGuest?: boolean
}): UserProfile {
  return {
    id: params.uid,
    uid: params.uid,
    name: params.name || (params.email ? params.email.split('@')[0] : 'Muslim Seeker'),
    email: params.email || '',
    photoUrl: params.photoUrl || null,
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
    prayerNotifications: true,
    readingReminders: true,
    lastReadSurah: 1,
    lastReadAyah: 1,
    isGuest: params.isGuest || false,
  }
}

export const authService = {
  async signUpWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
    if (isConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Sign up completed, but no user was returned.')
      }

      const newProfile = createDefaultProfile({
        uid: data.user.id,
        name: name || data.user.user_metadata?.full_name || email.split('@')[0],
        email: data.user.email || email,
        photoUrl: data.user.user_metadata?.avatar_url || null,
      })

      // Try inserting into profiles table if available
      try {
        const insertData: ProfileInsert = {
          id: newProfile.id,
          uid: newProfile.uid,
          name: newProfile.name,
          email: newProfile.email,
          photo_url: newProfile.photoUrl,
          created_at: newProfile.createdAt,
          preferred_translation: newProfile.preferredTranslation,
          daily_goal_verses: newProfile.dailyGoalVerses,
          hasanat: newProfile.hasanat,
          verses: newProfile.verses,
          time: newProfile.time,
          pages: newProfile.pages,
          current_streak: newProfile.currentStreak,
          best_streak: newProfile.bestStreak,
        }
        await supabase.from('profiles').upsert(insertData as never)
      } catch (dbErr) {
        console.warn('Could not insert profile into Supabase table, using memory/storage profile:', dbErr)
      }

      localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile))
      return newProfile
    }

    // Local / Sandbox Mode Fallback
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}')
    if (existingUsers[email]) {
      throw new Error('A user with this email address already exists.')
    }

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const profile = createDefaultProfile({
      uid,
      name: name || email.split('@')[0],
      email,
    })

    existingUsers[email] = { profile, password }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existingUsers))
    localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
    return profile
  },

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    if (isConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('No user returned from login.')
      }

      // Fetch or ensure profile
      let profile: UserProfile | null = null
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileRow) {
          const row = profileRow as unknown as ProfileRow
          profile = {
            id: row.id,
            uid: row.uid || row.id,
            name: row.name || data.user.user_metadata?.full_name || email.split('@')[0],
            email: row.email || data.user.email || email,
            photoUrl: row.photo_url || data.user.user_metadata?.avatar_url || null,
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
          }
        }
      } catch (fetchErr) {
        console.warn('Failed to fetch profile row from Supabase, creating fallback:', fetchErr)
      }

      if (!profile) {
        profile = createDefaultProfile({
          uid: data.user.id,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          photoUrl: data.user.user_metadata?.avatar_url || null,
        })
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
      return profile
    }

    // Local / Sandbox Mode Fallback
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}')
    const userRecord = existingUsers[email]

    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password.')
    }

    const profile: UserProfile = userRecord.profile
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
    return profile
  },

  async signInWithGoogle(): Promise<UserProfile | void> {
    if (isConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      })

      if (error) {
        throw new Error(error.message)
      }
      return
    }

    // Local / Sandbox Simulation
    const uid = `google_${Date.now()}`
    const profile = createDefaultProfile({
      uid,
      name: 'Google User',
      email: 'user@gmail.com',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    })

    localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
    return profile
  },

  async signOut(): Promise<void> {
    if (isConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signOut error:', err)
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
  },

  getStoredProfile(): UserProfile | null {
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_KEY)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  async getInitialUser(): Promise<UserProfile | null> {
    if (isConfigured) {
      try {
        // Fast timeout guard for mobile networks (max 1800ms)
        const fetchRemoteSession = async () => {
          const { data } = await supabase.auth.getSession()
          if (data?.session?.user) {
            const user = data.session.user
            
            // Fetch real profile row from database
            try {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

              if (profileRow) {
                const row = profileRow as unknown as ProfileRow
                const profile: UserProfile = {
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
                }
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
                return profile
              }
            } catch (fetchErr) {
              console.warn('Could not load profile from table, creating default:', fetchErr)
            }

            const stored = this.getStoredProfile()
            if (stored && stored.id === user.id) {
              return stored
            }
            return createDefaultProfile({
              uid: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Seeker',
              email: user.email || '',
              photoUrl: user.user_metadata?.avatar_url || null,
            })
          }
          return null
        }

        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 1800)
        )

        const remoteUser = await Promise.race([fetchRemoteSession(), timeoutPromise])
        if (remoteUser) return remoteUser
      } catch (err) {
        console.warn('Session restoration error:', err)
      }
    }

    return this.getStoredProfile()
  },
}
