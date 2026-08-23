import { create } from 'zustand'
import type { ReadingSessionState, ActiveReadingSession } from '../types/reading'
import type { Ayah } from '../types/quran'
import { quranApi } from '../lib/quranApi'
import { calculateVerseHasanat, type SessionMetrics } from '../lib/hasanatEngine'
import { useAuthStore } from './useAuthStore'

import type { ArabicFontStyle } from '../lib/quranFonts'
import { DEFAULT_ARABIC_FONT } from '../lib/quranFonts'
import type { EnglishTranslationKey, TamilTranslationKey } from '../lib/quranTranslations'
import { getStoredEnglishTranslation, getStoredTamilTranslation } from '../lib/quranTranslations'

interface ReadingStoreActions {
  setCurrentPosition: (surah: number, ayah: number, page?: number, juz?: number) => void
  setFontSize: (size: number) => void
  setFontStyle: (style: ArabicFontStyle) => void
  setTranslationLanguage: (lang: 'en' | 'ta') => void
  setEnglishTranslation: (trans: EnglishTranslationKey) => void
  setTamilTranslation: (trans: TamilTranslationKey) => void
  setIsPlayingAudio: (isPlaying: boolean) => void
  toggleAudioMute: () => void
  loadSurah: (surahNumber: number) => Promise<void>
  startSession: () => void
  tickTimer: () => void
  markAyahRead: (ayah: Ayah) => number
  finishSession: () => SessionMetrics | null
  resetSession: () => void
}

export type ReadingStore = ReadingSessionState & ReadingStoreActions

const initialActiveSession: ActiveReadingSession = {
  isActive: false,
  startTime: null,
  elapsedSeconds: 0,
  sessionHasanat: 0,
  sessionVersesRead: 0,
  readAyahsInSession: [],
  recentHasanatGain: null,
}

const getStoredFontSize = (): number => {
  if (typeof window === 'undefined') return 28
  try {
    const s = localStorage.getItem('deenly_arabic_font_size')
    return s ? parseInt(s, 10) : 28
  } catch {
    return 28
  }
}

const getStoredFontStyle = (): ArabicFontStyle => {
  if (typeof window === 'undefined') return DEFAULT_ARABIC_FONT
  try {
    const s = localStorage.getItem('deenly_arabic_font_style') as ArabicFontStyle
    return s || DEFAULT_ARABIC_FONT
  } catch {
    return DEFAULT_ARABIC_FONT
  }
}

const getStoredLastPosition = (): { surah: number; ayah: number } => {
  if (typeof window === 'undefined') return { surah: 1, ayah: 1 }
  try {
    const rawPos = localStorage.getItem('deenly_last_position')
    if (rawPos) {
      const parsed = JSON.parse(rawPos)
      if (parsed.surah && parsed.ayah) return { surah: parsed.surah, ayah: parsed.ayah }
    }
    const rawAuth = localStorage.getItem('deenly_auth_session')
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth)
      if (parsed.lastReadSurah) return { surah: parsed.lastReadSurah, ayah: parsed.lastReadAyah || 1 }
    }
  } catch {}
  return { surah: 1, ayah: 1 }
}

const lastPos = getStoredLastPosition()

const initialReadingState: ReadingSessionState = {
  currentSurahNumber: lastPos.surah,
  currentAyahNumber: lastPos.ayah,
  currentJuzNumber: 1,
  currentPageNumber: 1,
  fontSize: getStoredFontSize(),
  fontStyle: getStoredFontStyle(),
  translationLanguage: 'en',
  englishTranslation: getStoredEnglishTranslation(),
  tamilTranslation: getStoredTamilTranslation(),
  isPlayingAudio: false,
  isAudioMuted: false,
  currentSurah: null,
  isLoadingSurah: false,
  error: null,
  activeSession: initialActiveSession,
}

export const useReadingStore = create<ReadingStore>((set, get) => ({
  ...initialReadingState,

  setCurrentPosition: (surah, ayah, page = 1, juz = 1) => {
    set({
      currentSurahNumber: surah,
      currentAyahNumber: ayah,
      currentPageNumber: page,
      currentJuzNumber: juz,
    })
    try {
      localStorage.setItem('deenly_last_position', JSON.stringify({ surah, ayah, page, juz, timestamp: Date.now() }))
    } catch {}
    useAuthStore.getState().updateLastReadPosition(surah, ayah)
  },

  setFontSize: (fontSize) => {
    try {
      localStorage.setItem('deenly_arabic_font_size', fontSize.toString())
    } catch {}
    set({ fontSize })
  },
  setFontStyle: (fontStyle) => {
    try {
      localStorage.setItem('deenly_arabic_font_style', fontStyle)
    } catch {}
    set({ fontStyle })
    useAuthStore.getState().updateUserSettings({ arabicFontStyle: fontStyle })
  },
  setTranslationLanguage: (translationLanguage) => set({ translationLanguage }),
  setEnglishTranslation: (englishTranslation) => {
    try {
      localStorage.setItem('deenly_english_translation', englishTranslation)
    } catch {}
    set({ englishTranslation })
    useAuthStore.getState().updateUserSettings({ englishTranslation })
  },
  setTamilTranslation: (tamilTranslation) => {
    try {
      localStorage.setItem('deenly_tamil_translation', tamilTranslation)
    } catch {}
    set({ tamilTranslation })
    useAuthStore.getState().updateUserSettings({ tamilTranslation })
  },
  setIsPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),
  toggleAudioMute: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),

  loadSurah: async (surahNumber: number) => {
    set({ isLoadingSurah: true, error: null, currentSurahNumber: surahNumber })
    try {
      const state = get()
      const surahData = await quranApi.getSurah(surahNumber, ['en', 'ta', state.englishTranslation, state.tamilTranslation])
      set({
        currentSurah: surahData,
        currentSurahNumber: surahNumber,
        currentPageNumber: surahData.startPage,
        currentJuzNumber: surahData.startJuz,
        isLoadingSurah: false,
        error: null,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load Quran chapter.'
      set({ error: msg, isLoadingSurah: false })
    }
  },

  startSession: () => {
    const current = get().activeSession
    if (!current.isActive) {
      set({
        activeSession: {
          ...current,
          isActive: true,
          startTime: Date.now(),
        },
      })
    }
  },

  tickTimer: () => {
    const current = get().activeSession
    if (current.isActive) {
      set({
        activeSession: {
          ...current,
          elapsedSeconds: current.elapsedSeconds + 1,
        },
      })
    }
  },

  markAyahRead: (ayah: Ayah) => {
    const state = get()
    const session = state.activeSession
    const ayahUniqueKey = ayah.number

    // Avoid double counting the same verse within a single active reading session
    const alreadyRead = session.readAyahsInSession.includes(ayahUniqueKey)
    const hasanatGain = alreadyRead ? 0 : calculateVerseHasanat(ayah.arabicLetterCount)

    const updatedSession: ActiveReadingSession = {
      ...session,
      isActive: true,
      startTime: session.startTime || Date.now(),
      sessionHasanat: session.sessionHasanat + hasanatGain,
      sessionVersesRead: session.sessionVersesRead + (alreadyRead ? 0 : 1),
      readAyahsInSession: alreadyRead
        ? session.readAyahsInSession
        : [...session.readAyahsInSession, ayahUniqueKey],
      recentHasanatGain: { amount: calculateVerseHasanat(ayah.arabicLetterCount), timestamp: Date.now() },
    }

    set({
      currentAyahNumber: ayah.verseNumberInSurah,
      currentJuzNumber: ayah.juz,
      currentPageNumber: ayah.page,
      activeSession: updatedSession,
    })

    try {
      localStorage.setItem('deenly_last_position', JSON.stringify({
        surah: state.currentSurahNumber,
        ayah: ayah.verseNumberInSurah,
        page: ayah.page,
        juz: ayah.juz,
        timestamp: Date.now()
      }))
    } catch {}
    useAuthStore.getState().updateLastReadPosition(state.currentSurahNumber, ayah.verseNumberInSurah)

    return hasanatGain
  },

  finishSession: () => {
    const state = get()
    const session = state.activeSession

    const pagesRead = Math.max(
      session.sessionVersesRead > 0 ? 1 : 0,
      Math.ceil(session.sessionVersesRead / 15) // Rough heuristic or based on distinct pages
    )

    const metrics: SessionMetrics = {
      hasanatEarned: session.sessionHasanat,
      versesRead: session.sessionVersesRead,
      durationSeconds: Math.max(session.elapsedSeconds, 1),
      pagesRead,
      lastSurah: state.currentSurahNumber,
      lastAyah: state.currentAyahNumber,
      lastPage: state.currentPageNumber,
      lastJuz: state.currentJuzNumber,
    }

    // Persist to user profile, daily history, and Supabase cloud
    useAuthStore.getState().recordSessionCompletion(metrics)

    // Explicitly guarantee position is saved
    useAuthStore.getState().updateLastReadPosition(state.currentSurahNumber, state.currentAyahNumber)

    // Reset session
    set({
      activeSession: initialActiveSession,
    })

    return metrics
  },

  resetSession: () =>
    set({
      ...initialReadingState,
      activeSession: initialActiveSession,
    }),
}))
