import type { DailyReadingRecord } from './reading'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export interface SessionDelta {
  id: string
  userId: string
  deviceId: string
  deltaHasanat: number
  deltaVerses: number
  deltaTimeSeconds: number
  deltaPages: number
  lastSurah: number
  lastAyah: number
  lastPage: number
  lastJuz: number
  timestamp: number
  dateStr: string // YYYY-MM-DD
}

import type { ArabicFontStyle } from '../lib/quranFonts'
import type { EnglishTranslationKey, TamilTranslationKey } from '../lib/quranTranslations'
import type { AppLanguage } from '../lib/i18n'

export interface UserProfile {
  id: string
  uid: string
  name: string
  email: string
  photoUrl: string | null
  createdAt: string
  appLanguage?: AppLanguage
  preferredTranslation: 'english' | 'tamil' | string
  englishTranslation?: EnglishTranslationKey
  tamilTranslation?: TamilTranslationKey
  dailyGoalVerses: number
  hasanat: number
  verses: number
  time: number // total reading time in seconds
  pages: number
  currentStreak: number
  bestStreak: number
  arabicFontSize?: number
  arabicFontStyle?: ArabicFontStyle
  mushafTheme?: import('../lib/mushafThemes').MushafThemeId
  tajweedRulesEnabled?: boolean
  prayerNotifications?: boolean
  readingReminders?: boolean
  authProvider?: 'google' | 'email' | 'guest'
  lastReadSurah?: number
  lastReadAyah?: number
  lastReadAt?: string
  isGuest?: boolean
}

export interface AuthState {
  user: UserProfile | null
  session: unknown | null
  dailyHistory: Record<string, DailyReadingRecord>
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  pendingOfflineCount: number
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}
