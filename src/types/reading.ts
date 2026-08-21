import type { SurahDetail } from './quran'

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

export interface ReadingSessionState {
  currentSurahNumber: number
  currentAyahNumber: number
  currentJuzNumber: number
  currentPageNumber: number
  fontSize: number
  translationLanguage: 'en' | 'ta'
  isPlayingAudio: boolean
  isAudioMuted: boolean
  currentSurah: SurahDetail | null
  isLoadingSurah: boolean
  error: string | null
  activeSession: ActiveReadingSession
}
