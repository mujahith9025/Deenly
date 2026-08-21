import { SURAH_METADATA, JUZ_METADATA } from './quranMetadata'

export interface JuzProgressResult {
  juzNumber: number
  percent: number
  totalVersesInJuz: number
  versesCompletedInJuz: number
  juzName: string
  arabicName: string
}

export interface SessionMetrics {
  hasanatEarned: number
  versesRead: number
  durationSeconds: number
  pagesRead: number
  lastSurah: number
  lastAyah: number
  lastPage: number
  lastJuz: number
}

/**
 * Calculates Hasanat rewards for a given verse based on Arabic letter count.
 * Hadith: 10 rewards per letter recited (Sunan at-Tirmidhi 2910).
 */
export function calculateVerseHasanat(arabicLetterCount: number): number {
  if (arabicLetterCount <= 0) return 0
  return arabicLetterCount * 10
}

/**
 * Calculates current progress within the active Juz based on Surah and Ayah position.
 */
export function calculateJuzProgress(surahNumber: number, ayahNumber: number): JuzProgressResult {
  // 1. Locate which Juz this verse belongs to
  let activeJuz = JUZ_METADATA[0]
  for (const j of JUZ_METADATA) {
    if (
      (surahNumber > j.startSurah || (surahNumber === j.startSurah && ayahNumber >= j.startAyah)) &&
      (surahNumber < j.endSurah || (surahNumber === j.endSurah && ayahNumber <= j.endAyah))
    ) {
      activeJuz = j
      break
    }
  }

  // 2. Count total verses in this Juz
  let totalVersesInJuz = 0
  let versesCompletedInJuz = 0

  for (let s = activeJuz.startSurah; s <= activeJuz.endSurah; s++) {
    const meta = SURAH_METADATA.find((sm) => sm.number === s)
    const surahAyahs = meta ? meta.numberOfAyahs : 0

    const startAyah = s === activeJuz.startSurah ? activeJuz.startAyah : 1
    const endAyah = s === activeJuz.endSurah ? activeJuz.endAyah : surahAyahs
    const versesInThisSurah = Math.max(0, endAyah - startAyah + 1)
    totalVersesInJuz += versesInThisSurah

    // Count how many verses completed up to the current position
    if (surahNumber > s) {
      versesCompletedInJuz += versesInThisSurah
    } else if (surahNumber === s) {
      const completedInThisSurah = Math.min(
        versesInThisSurah,
        Math.max(0, ayahNumber - startAyah + 1)
      )
      versesCompletedInJuz += completedInThisSurah
    }
  }

  const percent =
    totalVersesInJuz > 0
      ? Math.min(100, Math.round((versesCompletedInJuz / totalVersesInJuz) * 1000) / 10)
      : 0

  return {
    juzNumber: activeJuz.juzNumber,
    percent,
    totalVersesInJuz,
    versesCompletedInJuz,
    juzName: activeJuz.name,
    arabicName: activeJuz.arabicName,
  }
}

/**
 * Calculates overall Quran Khatm progress percentage (out of 604 Mushaf pages).
 */
export function calculateKhatmProgress(totalPagesRead: number, totalPagesInQuran = 604): number {
  if (totalPagesRead <= 0) return 0
  return Math.min(100, Math.round((totalPagesRead / totalPagesInQuran) * 1000) / 10)
}

/**
 * Returns the local date formatted as YYYY-MM-DD (safe against UTC midnight skew).
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats seconds into MM:SS for live session timer.
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formats total seconds into human-readable duration (e.g. "14m", "1h 20m").
 */
export function formatDurationHuman(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
}

/**
 * Calculates consecutive daily reading streak based on daily history map in local timezone.
 */
export function calculateDailyStreak(dailyHistory: Record<string, { verses: number }>): {
  currentStreak: number
  isTodayCompleted: boolean
} {
  const todayStr = getLocalDateString(new Date())
  const todayRecord = dailyHistory[todayStr]
  const isTodayCompleted = Boolean(todayRecord && todayRecord.verses > 0)

  let streak = 0
  const d = new Date()

  // If today isn't completed yet, start checking from yesterday to see if unbroken
  if (!isTodayCompleted) {
    d.setDate(d.getDate() - 1)
  }

  while (true) {
    const key = getLocalDateString(d)
    const rec = dailyHistory[key]
    if (rec && rec.verses > 0) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  return {
    currentStreak: streak,
    isTodayCompleted,
  }
}
