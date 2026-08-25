import { create } from 'zustand'
import { DHIKR_PRESETS, type DhikrItem } from '../lib/dhikrData'
import { getLocalDateString } from '../lib/hasanatEngine'
import { calculateDhikrStreak } from '../lib/dhikrAnalyticsEngine'
import { syncService } from '../lib/syncService'
import { useAuthStore } from './useAuthStore'

export interface DailyDhikrLog {
  date: string // YYYY-MM-DD
  totalCount: number
  goalMet: boolean
  byDhikr: Record<string, number>
}

export interface DhikrProgressItem {
  dhikr: DhikrItem
  todayCount: number
  target: number
  isCompleted: boolean
  percentage: number
}

interface TasbihState {
  activeDhikrId: string
  target: number // Target for the currently active session
  dailyGoal: number // Global aggregate daily goal (e.g. 300)
  dhikrTargets: Record<string, number> // Individual targets for each Dhikr
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
  
  // Streaks
  currentStreak: number
  bestStreak: number
  
  // Actions
  setActiveDhikrId: (id: string) => void
  setTarget: (target: number) => void
  setDailyGoal: (goal: number) => void
  setDhikrTarget: (dhikrId: string, target: number) => void
  setAllDhikrTargets: (target: number) => void
  toggleSound: () => void
  toggleHaptics: () => void
  
  incrementCount: () => { isTargetCompleted: boolean; newCount: number }
  decrementCount: () => void
  resetSessionCount: () => void
  resetDhikrForToday: (dhikrId: string) => void
  resetAllForToday: () => void
  
  applyRemoteDhikrDelta: (data: { dhikrId: string; deltaCount: number; dateStr: string }) => void
  
  getTodayTotalCount: () => number
  getCompletedDhikrsCount: () => number
  getAllDhikrsCompleted: () => boolean
  getAllDhikrProgress: () => DhikrProgressItem[]
  getActiveDhikr: () => DhikrItem
  getActiveDhikrTarget: () => number
}

const STORAGE_KEY = 'deenly_tasbih_storage_v3'

// Default per-Dhikr targets mapping from DHIKR_PRESETS
function getDefaultDhikrTargets(): Record<string, number> {
  const map: Record<string, number> = {}
  for (const item of DHIKR_PRESETS) {
    map[item.id] = item.defaultTarget || 33
  }
  return map
}

interface StoredData {
  dailyGoal: number
  dhikrTargets: Record<string, number>
  soundEnabled: boolean
  hapticsEnabled: boolean
  todayDhikrCounts: Record<string, number>
  lifetimeDhikrCounts: Record<string, number>
  dailyHistory: Record<string, DailyDhikrLog>
  lastDateStr: string
}

function loadInitialData(): StoredData {
  const todayStr = getLocalDateString(new Date())
  const defaultTargets = getDefaultDhikrTargets()
  
  const fallback: StoredData = {
    dailyGoal: 300,
    dhikrTargets: defaultTargets,
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
    if (!raw) {
      // Check legacy v2
      const legacyRaw = localStorage.getItem('deenly_tasbih_storage_v2')
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw)
        return {
          ...fallback,
          dailyGoal: legacy.dailyGoal || 300,
          todayDhikrCounts: legacy.todayDhikrCounts || {},
          lifetimeDhikrCounts: legacy.lifetimeDhikrCounts || {},
          dailyHistory: legacy.dailyHistory || {},
          lastDateStr: legacy.lastDateStr || todayStr,
        }
      }
      return fallback
    }
    
    const parsed = JSON.parse(raw) as Partial<StoredData>

    // Check if new day
    const lastDate = parsed.lastDateStr || todayStr
    const isNewDay = lastDate !== todayStr

    const dhikrTargets = {
      ...defaultTargets,
      ...(parsed.dhikrTargets || {}),
    }

    return {
      dailyGoal: parsed.dailyGoal || 300,
      dhikrTargets,
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
      dhikrTargets: state.dhikrTargets,
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
const initialStreaks = calculateDhikrStreak(initial.dailyHistory, initial.dailyGoal)

export const useTasbihStore = create<TasbihState>((set, get) => ({
  activeDhikrId: 'subhanallah',
  target: initial.dhikrTargets['subhanallah'] || 33,
  dailyGoal: initial.dailyGoal,
  dhikrTargets: initial.dhikrTargets,
  soundEnabled: initial.soundEnabled,
  hapticsEnabled: initial.hapticsEnabled,
  
  sessionCount: 0,
  sessionLaps: 0,
  
  todayDhikrCounts: initial.todayDhikrCounts,
  lifetimeDhikrCounts: initial.lifetimeDhikrCounts,
  dailyHistory: initial.dailyHistory,
  currentStreak: initialStreaks.currentStreak,
  bestStreak: initialStreaks.bestStreak,

  setActiveDhikrId: (id: string) => {
    const item = DHIKR_PRESETS.find((d) => d.id === id) || DHIKR_PRESETS[0]
    const state = get()
    const customTarget = state.dhikrTargets[id] || item.defaultTarget || 33
    set({
      activeDhikrId: id,
      target: customTarget,
      sessionCount: 0,
      sessionLaps: 0,
    })
  },

  setTarget: (target: number) => {
    const state = get()
    const updatedTargets = {
      ...state.dhikrTargets,
      [state.activeDhikrId]: target,
    }
    set({ 
      target, 
      dhikrTargets: updatedTargets 
    })
    persistData({ ...state, target, dhikrTargets: updatedTargets })
  },

  setDailyGoal: (goal: number) => {
    const state = get()
    const newStreaks = calculateDhikrStreak(state.dailyHistory, goal)
    set({ 
      dailyGoal: goal,
      currentStreak: newStreaks.currentStreak,
      bestStreak: newStreaks.bestStreak
    })
    persistData({ ...state, dailyGoal: goal })
  },

  setDhikrTarget: (dhikrId: string, target: number) => {
    const state = get()
    const updatedTargets = {
      ...state.dhikrTargets,
      [dhikrId]: target,
    }
    const currentActiveTarget = state.activeDhikrId === dhikrId ? target : state.target
    set({
      target: currentActiveTarget,
      dhikrTargets: updatedTargets,
    })
    persistData({ ...state, target: currentActiveTarget, dhikrTargets: updatedTargets })
  },

  setAllDhikrTargets: (target: number) => {
    const state = get()
    const updatedTargets: Record<string, number> = {}
    for (const item of DHIKR_PRESETS) {
      updatedTargets[item.id] = target
    }
    set({
      target,
      dhikrTargets: updatedTargets,
    })
    persistData({ ...state, target, dhikrTargets: updatedTargets })
  },

  toggleSound: () => {
    const state = get()
    const nextVal = !state.soundEnabled
    set({ soundEnabled: nextVal })
    persistData({ ...state, soundEnabled: nextVal })
  },

  toggleHaptics: () => {
    const state = get()
    const nextVal = !state.hapticsEnabled
    set({ hapticsEnabled: nextVal })
    persistData({ ...state, hapticsEnabled: nextVal })
  },

  incrementCount: () => {
    const state = get()
    const todayStr = getLocalDateString(new Date())
    const activeId = state.activeDhikrId
    const target = state.target

    const newSessionCount = state.sessionCount + 1
    const isTargetCompleted = target > 0 && newSessionCount >= target
    const newLaps = isTargetCompleted ? state.sessionLaps + 1 : state.sessionLaps

    // Update today count for this dhikr
    const currentTodayCount = state.todayDhikrCounts[activeId] || 0
    const newTodayCount = currentTodayCount + 1
    const updatedTodayCounts = {
      ...state.todayDhikrCounts,
      [activeId]: newTodayCount,
    }

    // Update lifetime count for this dhikr
    const currentLifetimeCount = state.lifetimeDhikrCounts[activeId] || 0
    const newLifetimeCount = currentLifetimeCount + 1
    const updatedLifetimeCounts = {
      ...state.lifetimeDhikrCounts,
      [activeId]: newLifetimeCount,
    }

    // Update daily history log for today
    const newTotalToday = Object.values(updatedTodayCounts).reduce((acc, v) => acc + v, 0)
    const updatedHistoryLog: DailyDhikrLog = {
      date: todayStr,
      totalCount: newTotalToday,
      goalMet: newTotalToday >= state.dailyGoal,
      byDhikr: updatedTodayCounts,
    }

    const updatedDailyHistory = {
      ...state.dailyHistory,
      [todayStr]: updatedHistoryLog,
    }

    // Recalculate streak
    const { currentStreak, bestStreak } = calculateDhikrStreak(updatedDailyHistory, state.dailyGoal)

    const nextState = {
      ...state,
      sessionCount: newSessionCount,
      sessionLaps: newLaps,
      todayDhikrCounts: updatedTodayCounts,
      lifetimeDhikrCounts: updatedLifetimeCounts,
      dailyHistory: updatedDailyHistory,
      currentStreak,
      bestStreak,
    }

    set(nextState)
    persistData(nextState)

    // Broadcast to other devices / cloud via syncService
    try {
      const authUser = useAuthStore.getState().user
      if (authUser?.id) {
        syncService.publishDhikrDelta(authUser.id, activeId, 1, todayStr)
      }
    } catch {
      // ignore
    }

    return {
      isTargetCompleted,
      newCount: newSessionCount,
    }
  },

  decrementCount: () => {
    const state = get()
    if (state.sessionCount <= 0) return

    const todayStr = getLocalDateString(new Date())
    const activeId = state.activeDhikrId

    const newSessionCount = Math.max(0, state.sessionCount - 1)
    const newTodayCount = Math.max(0, (state.todayDhikrCounts[activeId] || 1) - 1)
    const newLifetimeCount = Math.max(0, (state.lifetimeDhikrCounts[activeId] || 1) - 1)

    const updatedTodayCounts = {
      ...state.todayDhikrCounts,
      [activeId]: newTodayCount,
    }
    const updatedLifetimeCounts = {
      ...state.lifetimeDhikrCounts,
      [activeId]: newLifetimeCount,
    }

    const newTotalToday = Object.values(updatedTodayCounts).reduce((acc, v) => acc + v, 0)
    const updatedHistoryLog: DailyDhikrLog = {
      date: todayStr,
      totalCount: newTotalToday,
      goalMet: newTotalToday >= state.dailyGoal,
      byDhikr: updatedTodayCounts,
    }

    const updatedDailyHistory = {
      ...state.dailyHistory,
      [todayStr]: updatedHistoryLog,
    }

    const nextState = {
      ...state,
      sessionCount: newSessionCount,
      todayDhikrCounts: updatedTodayCounts,
      lifetimeDhikrCounts: updatedLifetimeCounts,
      dailyHistory: updatedDailyHistory,
    }

    set(nextState)
    persistData(nextState)
  },

  resetSessionCount: () => {
    set({ sessionCount: 0 })
  },

  resetDhikrForToday: (dhikrId: string) => {
    const state = get()
    const todayStr = getLocalDateString(new Date())
    const updatedTodayCounts = {
      ...state.todayDhikrCounts,
      [dhikrId]: 0,
    }
    const newTotalToday = Object.values(updatedTodayCounts).reduce((acc, v) => acc + v, 0)
    const updatedDailyHistory = {
      ...state.dailyHistory,
      [todayStr]: {
        date: todayStr,
        totalCount: newTotalToday,
        goalMet: newTotalToday >= state.dailyGoal,
        byDhikr: updatedTodayCounts,
      },
    }
    const nextState = {
      ...state,
      sessionCount: state.activeDhikrId === dhikrId ? 0 : state.sessionCount,
      todayDhikrCounts: updatedTodayCounts,
      dailyHistory: updatedDailyHistory,
    }
    set(nextState)
    persistData(nextState)
  },

  resetAllForToday: () => {
    const state = get()
    const todayStr = getLocalDateString(new Date())
    const updatedDailyHistory = {
      ...state.dailyHistory,
      [todayStr]: {
        date: todayStr,
        totalCount: 0,
        goalMet: false,
        byDhikr: {},
      },
    }
    const nextState = {
      ...state,
      sessionCount: 0,
      sessionLaps: 0,
      todayDhikrCounts: {},
      dailyHistory: updatedDailyHistory,
    }
    set(nextState)
    persistData(nextState)
  },

  applyRemoteDhikrDelta: (data: { dhikrId: string; deltaCount: number; dateStr: string }) => {
    const state = get()
    const todayStr = getLocalDateString(new Date())
    const isForToday = data.dateStr === todayStr

    const updatedTodayCounts = isForToday
      ? {
          ...state.todayDhikrCounts,
          [data.dhikrId]: (state.todayDhikrCounts[data.dhikrId] || 0) + data.deltaCount,
        }
      : state.todayDhikrCounts

    const updatedLifetimeCounts = {
      ...state.lifetimeDhikrCounts,
      [data.dhikrId]: (state.lifetimeDhikrCounts[data.dhikrId] || 0) + data.deltaCount,
    }

    const logForDate = state.dailyHistory[data.dateStr] || {
      date: data.dateStr,
      totalCount: 0,
      goalMet: false,
      byDhikr: {},
    }

    const newDateByDhikr = {
      ...logForDate.byDhikr,
      [data.dhikrId]: (logForDate.byDhikr[data.dhikrId] || 0) + data.deltaCount,
    }
    const newDateTotal = Object.values(newDateByDhikr).reduce((acc, v) => acc + v, 0)

    const updatedDailyHistory = {
      ...state.dailyHistory,
      [data.dateStr]: {
        date: data.dateStr,
        totalCount: newDateTotal,
        goalMet: newDateTotal >= state.dailyGoal,
        byDhikr: newDateByDhikr,
      },
    }

    const { currentStreak, bestStreak } = calculateDhikrStreak(updatedDailyHistory, state.dailyGoal)

    const nextState = {
      ...state,
      sessionCount: state.activeDhikrId === data.dhikrId ? state.sessionCount + data.deltaCount : state.sessionCount,
      todayDhikrCounts: updatedTodayCounts,
      lifetimeDhikrCounts: updatedLifetimeCounts,
      dailyHistory: updatedDailyHistory,
      currentStreak,
      bestStreak,
    }

    set(nextState)
    persistData(nextState)
  },

  getTodayTotalCount: () => {
    const counts = get().todayDhikrCounts
    return Object.values(counts).reduce((acc, v) => acc + v, 0)
  },

  getCompletedDhikrsCount: () => {
    const state = get()
    let completed = 0
    for (const dhikr of DHIKR_PRESETS) {
      const todayCount = state.todayDhikrCounts[dhikr.id] || 0
      const target = state.dhikrTargets[dhikr.id] || dhikr.defaultTarget || 33
      if (todayCount >= target && target > 0) {
        completed += 1
      }
    }
    return completed
  },

  getAllDhikrsCompleted: () => {
    const state = get()
    return state.getCompletedDhikrsCount() >= DHIKR_PRESETS.length && DHIKR_PRESETS.length > 0
  },

  getAllDhikrProgress: (): DhikrProgressItem[] => {
    const state = get()
    return DHIKR_PRESETS.map((d) => {
      const todayCount = state.todayDhikrCounts[d.id] || 0
      const target = state.dhikrTargets[d.id] || d.defaultTarget || 33
      const isCompleted = target > 0 && todayCount >= target
      const percentage = target > 0 ? Math.min(100, Math.round((todayCount / target) * 100)) : 100
      return {
        dhikr: d,
        todayCount,
        target,
        isCompleted,
        percentage,
      }
    })
  },

  getActiveDhikr: () => {
    const activeId = get().activeDhikrId
    return DHIKR_PRESETS.find((d) => d.id === activeId) || DHIKR_PRESETS[0]
  },

  getActiveDhikrTarget: () => {
    const state = get()
    return state.dhikrTargets[state.activeDhikrId] || state.target || 33
  },
}))
