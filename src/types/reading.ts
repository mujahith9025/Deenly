import type { SurahDetail } from './quran'
import type { ArabicFontStyle } from '../lib/quranFonts'

export interface Surah {
  number: number
  name: string
  arabicName: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

export interface DailyReadingRecord {
  date: string // YYYY-MM-DD
  hasanat: number
  verses: number
  timeSeconds: number
  pages: number
  lastSurah: number
  lastAyah: number
}

export interface ActiveReadingSession {
  isActive: boolean
  startTime: number | null
  elapsedSeconds: number
  sessionHasanat: number
  sessionVersesRead: number
  readAyahsInSession: number[] // Set of unique ayah IDs marked read in this session
  recentHasanatGain: { amount: number; timestamp: number } | null
}

import type { EnglishTranslationKey, TamilTranslationKey } from '../lib/quranTranslations'

export interface ReadingSessionState {
  currentSurahNumber: number
  currentAyahNumber: number
  currentJuzNumber: number
  currentPageNumber: number
  fontSize: number
  fontStyle: ArabicFontStyle
  translationLanguage: 'en' | 'ta'
  englishTranslation: EnglishTranslationKey
  tamilTranslation: TamilTranslationKey
  isPlayingAudio: boolean
  isAudioMuted: boolean
  currentSurah: SurahDetail | null
  isLoadingSurah: boolean
  error: string | null
  activeSession: ActiveReadingSession
}
