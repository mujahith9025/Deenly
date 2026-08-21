export type HabitType =
  | 'quran'
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'dhikr'
  | 'charity'

export interface HabitItem {
  id: string
  title: string
  type: HabitType
  isCompleted: boolean
  hasanatValue: number
  category: 'prayer' | 'quran' | 'sunnah' | 'mindfulness'
}

export interface DayStreak {
  dayName: string // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  isCompleted: boolean
  isToday: boolean
}
