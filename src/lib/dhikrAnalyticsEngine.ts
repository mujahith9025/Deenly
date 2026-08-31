import { DHIKR_PRESETS, type DhikrItem } from './dhikrData'
import { getLocalDateString } from './hasanatEngine'
import type { DailyDhikrLog } from '../store/useTasbihStore'

export interface DhikrDayStat {
  date: string // YYYY-MM-DD
  dayLabel: string // e.g. "Mon", "Tue"
  dayNum: number
  totalCount: number
  goalMet: boolean
  byDhikr: Record<string, number>
}

export interface DhikrMilestone {
  id: string
  titleEn: string
  titleTa: string
  descEn: string
  descTa: string
  icon: string
  unlocked: boolean
  progress: number // 0 to 100
  currentVal: number
  targetVal: number
}

export function calculateDhikrStreak(
  history: Record<string, DailyDhikrLog>,
  _dailyGoal?: number
): { currentStreak: number; bestStreak: number } {
  const dates = Object.keys(history).sort()
  if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 }

  const todayStr = getLocalDateString(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getLocalDateString(yesterday)

  // Check if today or yesterday had activity
  const todayCount = history[todayStr]?.totalCount || 0
  const yesterdayCount = history[yesterdayStr]?.totalCount || 0

  if (todayCount === 0 && yesterdayCount === 0) {
    // Streak broken
    let best = 0
    let temp = 0
    // calculate all-time best
    for (let i = 0; i < dates.length; i++) {
      const log = history[dates[i]]
      if (log && log.totalCount > 0) {
        temp += 1
        best = Math.max(best, temp)
      } else {
        temp = 0
      }
    }
    return { currentStreak: 0, bestStreak: best }
  }

  // Calculate current streak backwards from today or yesterday
  let currentStreak = 0
  const checkDate = new Date()
  
  // If today hasn't met or done any dhikr yet, check starting from yesterday
  if (todayCount === 0) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (true) {
    const dStr = getLocalDateString(checkDate)
    const log = history[dStr]
    if (log && log.totalCount > 0) {
      currentStreak += 1
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Calculate all-time best streak
  let bestStreak = currentStreak
  let running = 0
  for (const d of dates) {
    const log = history[d]
    if (log && log.totalCount > 0) {
      running += 1
      bestStreak = Math.max(bestStreak, running)
    } else {
      running = 0
    }
  }

  return { currentStreak, bestStreak }
}

export function getDhikrHistoryRange(
  history: Record<string, DailyDhikrLog>,
  days = 7,
  dailyGoal = 300
): DhikrDayStat[] {
  const result: DhikrDayStat[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dStr = getLocalDateString(d)
    const log = history[dStr]
    const totalCount = log ? log.totalCount : 0

    result.push({
      date: dStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      totalCount,
      goalMet: totalCount >= dailyGoal,
      byDhikr: log ? log.byDhikr : {},
    })
  }

  return result
}

export function getDhikrDistribution(
  lifetimeCounts: Record<string, number>,
  allDhikrs: DhikrItem[] = DHIKR_PRESETS
): Array<{
  dhikr: DhikrItem
  count: number
  percentage: number
}> {
  const total = Object.values(lifetimeCounts).reduce((acc, c) => acc + c, 0)
  
  return allDhikrs.map((d) => {
    const count = lifetimeCounts[d.id] || 0
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
    return {
      dhikr: d,
      count,
      percentage,
    }
  }).sort((a, b) => b.count - a.count)
}

export function getDhikrMilestones(
  totalLifetimeDhikr: number,
  currentStreak: number,
  todayCompletedDhikrsCount: number,
  totalPresetsCount: number
): DhikrMilestone[] {
  return [
    {
      id: 'first_100',
      titleEn: 'Spiritual Awakening',
      titleTa: 'ஆன்மீக விழிப்புணர்வு',
      descEn: 'Recite 100 total Dhikrs',
      descTa: '100 திக்ருகளை ஓதி நிறைவு செய்யுங்கள்',
      icon: '🌱',
      unlocked: totalLifetimeDhikr >= 100,
      progress: Math.min(100, Math.round((totalLifetimeDhikr / 100) * 100)),
      currentVal: totalLifetimeDhikr,
      targetVal: 100,
    },
    {
      id: 'reach_1000',
      titleEn: 'Devoted Soul',
      titleTa: 'பக்திமிக்க உள்ளம்',
      descEn: 'Recite 1,000 total Dhikrs',
      descTa: '1,000 திக்ருகளை ஓதி நிறைவு செய்யுங்கள்',
      icon: '📿',
      unlocked: totalLifetimeDhikr >= 1000,
      progress: Math.min(100, Math.round((totalLifetimeDhikr / 1000) * 100)),
      currentVal: totalLifetimeDhikr,
      targetVal: 1000,
    },
    {
      id: 'reach_5000',
      titleEn: 'Garden of Remembrance',
      titleTa: 'இறை நினைவின் பூங்கா',
      descEn: 'Recite 5,000 total Dhikrs',
      descTa: '5,000 திக்ருகளை ஓதி நிறைவு செய்யுங்கள்',
      icon: '🌿',
      unlocked: totalLifetimeDhikr >= 5000,
      progress: Math.min(100, Math.round((totalLifetimeDhikr / 5000) * 100)),
      currentVal: totalLifetimeDhikr,
      targetVal: 5000,
    },
    {
      id: 'reach_10000',
      titleEn: 'Master of Remembrance',
      titleTa: 'திக்ரின் பேரறிஞர்',
      descEn: 'Recite 10,000 total Dhikrs',
      descTa: '10,000 திக்ருகளை ஓதி நிறைவு செய்யுங்கள்',
      icon: '👑',
      unlocked: totalLifetimeDhikr >= 10000,
      progress: Math.min(100, Math.round((totalLifetimeDhikr / 10000) * 100)),
      currentVal: totalLifetimeDhikr,
      targetVal: 10000,
    },
    {
      id: 'streak_7',
      titleEn: '7-Day Dhikr Streak',
      titleTa: '7-நாள் தொடர் திக்ர்',
      descEn: 'Maintain a 7-day daily Dhikr habit',
      descTa: 'தொடர்ந்து 7 நாட்கள் திக்ர் ஓதும் பழக்கம்',
      icon: '🔥',
      unlocked: currentStreak >= 7,
      progress: Math.min(100, Math.round((currentStreak / 7) * 100)),
      currentVal: currentStreak,
      targetVal: 7,
    },
    {
      id: 'all_dhikr_master',
      titleEn: 'All-Dhikr Daily Master',
      titleTa: 'அனைத்து திக்ர் சாதனையாளர்',
      descEn: 'Complete the daily targets for all Dhikr presets today',
      descTa: 'இன்றைய அனைத்து திக்ர் இலக்குகளையும் நிறைவு செய்யுங்கள்',
      icon: '⭐',
      unlocked: todayCompletedDhikrsCount >= totalPresetsCount && totalPresetsCount > 0,
      progress: totalPresetsCount > 0 ? Math.min(100, Math.round((todayCompletedDhikrsCount / totalPresetsCount) * 100)) : 0,
      currentVal: todayCompletedDhikrsCount,
      targetVal: totalPresetsCount,
    },
  ]
}
