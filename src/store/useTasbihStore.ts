import { create } from 'zustand'
import { DHIKR_PRESETS, type DhikrItem } from '../lib/dhikrData'
import { getLocalDateString } from '../lib/hasanatEngine'

export interface DailyDhikrLog {
  date: string // YYYY-MM-DD
  totalCount: number
  byDhikr: Record<string, number>
}

interface TasbihState {
  activeDhikrId: string
  target: number
  dailyGoal: number
  soundEnabled: boolean
  hapticsEnabled: boolean
  
  // Current active session counters
  sessionCount: number
  sessionLaps: number
  
  // Per-Dhikr counts for today: Record<dhikrId, number>
  todayDhikrCounts: Record<string, number>
  // Lifetime counts per dhikr: Record<dhikrId, number>
  lifetimeDhikrCounts: Record<string, number>
  // Daily history: Record<dateStr, DailyDhikrLog>
  dailyHistory: Record<string, DailyDhikrLog>
  
  // Actions
  setActiveDhikrId: (id: string) => void
  setTarget: (target: number) => void
  setDailyGoal: (goal: number) => void
  toggleSound: () => void
  toggleHaptics: () => void
  
  incrementCount: () => { isTargetCompleted: boolean; newCount: number }
  decrementCount: () => void
  resetSessionCount: () => void
  resetAllForToday: () => void
  
  getTodayTotalCount: () => number
  getActiveDhikr: () => DhikrItem
}

const STORAGE_KEY = 'deenly_tasbih_storage_v2'

interface StoredData {
  dailyGoal: number
  soundEnabled: boolean
  hapticsEnabled: boolean
  todayDhikrCounts: Record<string, number>
  lifetimeDhikrCounts: Record<string, number>
  dailyHistory: Record<string, DailyDhikrLog>
  lastDateStr: string
}

function loadInitialData(): StoredData {
  const todayStr = getLocalDateString(new Date())
  const fallback: StoredData = {
    dailyGoal: 300,
    soundEnabled: true,
    hapticsEnabled: true,
    todayDhikrCounts: {},
    lifetimeDhikrCounts: {},
    dailyHistory: {},
    lastDateStr: todayStr,
  }

  if (typeof window === 'undefined') return fallback

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<StoredData>

    // Check if new day
    const lastDate = parsed.lastDateStr || todayStr
    const isNewDay = lastDate !== todayStr

    return {
      dailyGoal: parsed.dailyGoal || 300,
      soundEnabled: parsed.soundEnabled ?? true,
      hapticsEnabled: parsed.hapticsEnabled ?? true,
      todayDhikrCounts: isNewDay ? {} : (parsed.todayDhikrCounts || {}),
      lifetimeDhikrCounts: parsed.lifetimeDhikrCounts || {},
      dailyHistory: parsed.dailyHistory || {},
      lastDateStr: todayStr,
    }
  } catch (err) {
    console.warn('Failed to load Tasbih state from storage:', err)
    return fallback
  }
}

function persistData(state: TasbihState) {
  if (typeof window === 'undefined') return
  try {
    const todayStr = getLocalDateString(new Date())
    const dataToSave: StoredData = {
      dailyGoal: state.dailyGoal,
      soundEnabled: state.soundEnabled,
      hapticsEnabled: state.hapticsEnabled,
      todayDhikrCounts: state.todayDhikrCounts,
      lifetimeDhikrCounts: state.lifetimeDhikrCounts,
      dailyHistory: state.dailyHistory,
      lastDateStr: todayStr,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (err) {
    console.warn('Failed to persist Tasbih state:', err)
  }
}

const initial = loadInitialData()
const defaultDhikr = DHIKR_PRESETS[0]

export const useTasbihStore = create<TasbihState>((set, get) => ({
  activeDhikrId: defaultDhikr.id,
  target: defaultDhikr.defaultTarget,
  dailyGoal: initial.dailyGoal,
  soundEnabled: initial.soundEnabled,
  hapticsEnabled: initial.hapticsEnabled,
  sessionCount: 0,
  sessionLaps: 0,
  todayDhikrCounts: initial.todayDhikrCounts,
  lifetimeDhikrCounts: initial.lifetimeDhikrCounts,
  dailyHistory: initial.dailyHistory,

  setActiveDhikrId: (id: string) => {
    const item = DHIKR_PRESETS.find((d) => d.id === id) || defaultDhikr
    set({
      activeDhikrId: item.id,
      target: item.defaultTarget,
      sessionCount: 0,
      sessionLaps: 0,
    })
  },

  setTarget: (target: number) => {
    set({ target, sessionCount: 0 })
  },

  setDailyGoal: (dailyGoal: number) => {
    set({ dailyGoal })
    persistData(get())
  },

  toggleSound: () => {
    const next = !get().soundEnabled
    set({ soundEnabled: next })
    persistData(get())
  },

  toggleHaptics: () => {
    const next = !get().hapticsEnabled
    set({ hapticsEnabled: next })
    persistData(get())
  },

  incrementCount: () => {
    const state = get()
    const todayStr = getLocalDateString(new Date())
    const nextSessionCount = state.sessionCount + 1
    const dhikrId = state.activeDhikrId

    // Update today per-dhikr count
    const nextTodayCounts = { ...state.todayDhikrCounts }
    nextTodayCounts[dhikrId] = (nextTodayCounts[dhikrId] || 0) + 1

    // Update lifetime count
    const nextLifetimeCounts = { ...state.lifetimeDhikrCounts }
    nextLifetimeCounts[dhikrId] = (nextLifetimeCounts[dhikrId] || 0) + 1

    // Update daily history
    const nextHistory = { ...state.dailyHistory }
    const todayLog: DailyDhikrLog = nextHistory[todayStr] || {
      date: todayStr,
      totalCount: 0,
      byDhikr: {},
    }
    todayLog.totalCount += 1
    todayLog.byDhikr[dhikrId] = (todayLog.byDhikr[dhikrId] || 0) + 1
    nextHistory[todayStr] = todayLog

    // Target completion check
    const isTargetCompleted = state.target > 0 && nextSessionCount >= state.target
    const nextLaps = isTargetCompleted ? state.sessionLaps + 1 : state.sessionLaps

    const updatedState = {
      ...state,
      sessionCount: isTargetCompleted ? state.target : nextSessionCount,
      sessionLaps: nextLaps,
      todayDhikrCounts: nextTodayCounts,
      lifetimeDhikrCounts: nextLifetimeCounts,
      dailyHistory: nextHistory,
    }

    set({
      sessionCount: isTargetCompleted ? state.target : nextSessionCount,
      sessionLaps: nextLaps,
      todayDhikrCounts: nextTodayCounts,
      lifetimeDhikrCounts: nextLifetimeCounts,
      dailyHistory: nextHistory,
    })

    persistData(updatedState)

    return {
      isTargetCompleted,
      newCount: nextSessionCount,
    }
  },

  decrementCount: () => {
    const state = get()
    if (state.sessionCount <= 0) return

    const todayStr = getLocalDateString(new Date())
    const dhikrId = state.activeDhikrId

    const nextTodayCounts = { ...state.todayDhikrCounts }
    if (nextTodayCounts[dhikrId] && nextTodayCounts[dhikrId] > 0) {
      nextTodayCounts[dhikrId] -= 1
    }

    const nextLifetimeCounts = { ...state.lifetimeDhikrCounts }
    if (nextLifetimeCounts[dhikrId] && nextLifetimeCounts[dhikrId] > 0) {
      nextLifetimeCounts[dhikrId] -= 1
    }

    const nextHistory = { ...state.dailyHistory }
    const todayLog = nextHistory[todayStr]
    if (todayLog && todayLog.totalCount > 0) {
      todayLog.totalCount -= 1
      if (todayLog.byDhikr[dhikrId] && todayLog.byDhikr[dhikrId] > 0) {
        todayLog.byDhikr[dhikrId] -= 1
      }
    }

    const updatedState = {
      ...state,
      sessionCount: Math.max(0, state.sessionCount - 1),
      todayDhikrCounts: nextTodayCounts,
      lifetimeDhikrCounts: nextLifetimeCounts,
      dailyHistory: nextHistory,
    }

    set({
      sessionCount: Math.max(0, state.sessionCount - 1),
      todayDhikrCounts: nextTodayCounts,
      lifetimeDhikrCounts: nextLifetimeCounts,
      dailyHistory: nextHistory,
    })

    persistData(updatedState)
  },

  resetSessionCount: () => {
    set({ sessionCount: 0, sessionLaps: 0 })
  },

  resetAllForToday: () => {
    const todayStr = getLocalDateString(new Date())
    const nextHistory = { ...get().dailyHistory }
    delete nextHistory[todayStr]

    const updated = {
      sessionCount: 0,
      sessionLaps: 0,
      todayDhikrCounts: {},
      dailyHistory: nextHistory,
    }
    set(updated)
    persistData({ ...get(), ...updated })
  },

  getTodayTotalCount: () => {
    const todayStr = getLocalDateString(new Date())
    const history = get().dailyHistory[todayStr]
    if (history) return history.totalCount

    // Sum of todayDhikrCounts as fallback
    const counts = get().todayDhikrCounts
    return Object.values(counts).reduce((acc, val) => acc + val, 0)
  },

  getActiveDhikr: () => {
    const id = get().activeDhikrId
    return DHIKR_PRESETS.find((d) => d.id === id) || defaultDhikr
  },
}))
