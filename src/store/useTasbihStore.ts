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
  
  // Custom user-created Dhikrs & Duas
  customDhikrs: DhikrItem[]

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
  
  // Custom Dhikr Management
  addCustomDhikr: (item: Omit<DhikrItem, 'id' | 'isCustom'> & { id?: string }) => void
  updateCustomDhikr: (id: string, updates: Partial<DhikrItem>) => void
  deleteCustomDhikr: (id: string) => void
  
  incrementCount: () => { isTargetCompleted: boolean; newCount: number }
  decrementCount: () => void
  resetSessionCount: () => void
  resetDhikrForToday: (dhikrId: string) => void
  resetAllForToday: () => void
  resetAllTasbihStatsToZero: () => void
  advanceToNextDhikr: () => DhikrItem
  
  applyRemoteDhikrDelta: (data: { dhikrId: string; deltaCount: number; dateStr: string }) => void
  
  getTodayTotalCount: () => number
  getCompletedDhikrsCount: () => number
  getAllDhikrsCompleted: () => boolean
  getAllDhikrs: () => DhikrItem[]
  getAllDhikrProgress: () => DhikrProgressItem[]
  getOverallDailyProgress: () => {
    totalTargetSum: number
    totalCappedCount: number
    totalActualCount: number
    percentage: number
  }
  getActiveDhikr: () => DhikrItem
  getActiveDhikrTarget: () => number
}

const STORAGE_KEY = 'deenly_tasbih_storage_v3'

// Default per-Dhikr targets mapping from DHIKR_PRESETS
function getDefaultDhikrTargets(customDhikrs: DhikrItem[] = []): Record<string, number> {
  const map: Record<string, number> = {}
  for (const item of DHIKR_PRESETS) {
    map[item.id] = item.defaultTarget || 33
  }
  for (const item of customDhikrs) {
    map[item.id] = item.defaultTarget || 33
  }
  return map
}

interface StoredData {
  dailyGoal: number
  dhikrTargets: Record<string, number>
  soundEnabled: boolean
  hapticsEnabled: boolean
  customDhikrs: DhikrItem[]
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
    customDhikrs: [],
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
    const customDhikrs = parsed.customDhikrs || []

    // Check if new day
    const lastDate = parsed.lastDateStr || todayStr
    const isNewDay = lastDate !== todayStr

    const dhikrTargets = {
      ...getDefaultDhikrTargets(customDhikrs),
      ...(parsed.dhikrTargets || {}),
    }

    return {
      dailyGoal: parsed.dailyGoal || 300,
      dhikrTargets,
      soundEnabled: parsed.soundEnabled ?? true,
      hapticsEnabled: parsed.hapticsEnabled ?? true,
      customDhikrs,
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
      customDhikrs: state.customDhikrs || [],
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
  
  sessionCount: initial.todayDhikrCounts['subhanallah'] || 0,
  sessionLaps: (initial.dhikrTargets['subhanallah'] || 33) > 0 ? Math.floor((initial.todayDhikrCounts['subhanallah'] || 0) / (initial.dhikrTargets['subhanallah'] || 33)) : 0,
  
  customDhikrs: initial.customDhikrs,
  todayDhikrCounts: initial.todayDhikrCounts,
  lifetimeDhikrCounts: initial.lifetimeDhikrCounts,
  dailyHistory: initial.dailyHistory,
  currentStreak: initialStreaks.currentStreak,
  bestStreak: initialStreaks.bestStreak,

  setActiveDhikrId: (id: string) => {
    const state = get()
    const allDhikrs = [...DHIKR_PRESETS, ...(state.customDhikrs || [])]
    const item = allDhikrs.find((d) => d.id === id) || DHIKR_PRESETS[0]
    const customTarget = state.dhikrTargets[id] || item.defaultTarget || 33
    const countToday = state.todayDhikrCounts[id] || 0
    set({
      activeDhikrId: id,
      target: customTarget,
      sessionCount: countToday,
      sessionLaps: customTarget > 0 ? Math.floor(countToday / customTarget) : 0,
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
    const allDhikrs = [...DHIKR_PRESETS, ...(state.customDhikrs || [])]
    const updatedTargets: Record<string, number> = {}
    for (const item of allDhikrs) {
      updatedTargets[item.id] = goal
    }
    const totalGoal = goal * allDhikrs.length
    const newStreaks = calculateDhikrStreak(state.dailyHistory, totalGoal)
    const nextState = {
      ...state,
      dailyGoal: totalGoal,
      dhikrTargets: updatedTargets,
      target: goal,
      currentStreak: newStreaks.currentStreak,
      bestStreak: newStreaks.bestStreak,
    }
    set(nextState)
    persistData(nextState)
  },

  setDhikrTarget: (dhikrId: string, target: number) => {
    const state = get()
    const updatedTargets = {
      ...state.dhikrTargets,
      [dhikrId]: target,
    }
    const currentActiveTarget = state.activeDhikrId === dhikrId ? target : state.target
    const nextState = {
      ...state,
      target: currentActiveTarget,
      dhikrTargets: updatedTargets,
    }
    set(nextState)
    persistData(nextState)
  },

  setAllDhikrTargets: (target: number) => {
    const state = get()
    const allDhikrs = [...DHIKR_PRESETS, ...(state.customDhikrs || [])]
    const updatedTargets: Record<string, number> = {}
    for (const item of allDhikrs) {
      updatedTargets[item.id] = target
    }
    const totalGoal = target * allDhikrs.length
    const newStreaks = calculateDhikrStreak(state.dailyHistory, totalGoal)
    const nextState = {
      ...state,
      dailyGoal: totalGoal,
      dhikrTargets: updatedTargets,
      target: target,
      currentStreak: newStreaks.currentStreak,
      bestStreak: newStreaks.bestStreak,
    }
    set(nextState)
    persistData(nextState)
  },

  advanceToNextDhikr: () => {
    const state = get()
    const allDhikrs = state.getAllDhikrs()
    const currentIndex = allDhikrs.findIndex((d) => d.id === state.activeDhikrId)
    const nextIdx = (currentIndex + 1) % allDhikrs.length
    const nextDhikr = allDhikrs[nextIdx]
    const nextTarget = state.dhikrTargets[nextDhikr.id] || nextDhikr.defaultTarget || 33
    const nextCount = state.todayDhikrCounts[nextDhikr.id] || 0
    const nextState = {
      ...state,
      activeDhikrId: nextDhikr.id,
      target: nextTarget,
      sessionCount: nextCount,
      sessionLaps: nextTarget > 0 ? Math.floor(nextCount / nextTarget) : 0,
    }
    set(nextState)
    persistData(nextState)
    return nextDhikr
  },

  addCustomDhikr: (item: Omit<DhikrItem, 'id' | 'isCustom'> & { id?: string }) => {
    const state = get()
    const id = item.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newDhikr: DhikrItem = {
      ...item,
      id,
      category: 'custom',
      isCustom: true,
      defaultTarget: item.defaultTarget || 33,
    }
    const updatedCustomDhikrs = [...(state.customDhikrs || []), newDhikr]
    const updatedTargets = {
      ...state.dhikrTargets,
      [id]: newDhikr.defaultTarget,
    }
    const nextState = {
      ...state,
      customDhikrs: updatedCustomDhikrs,
      dhikrTargets: updatedTargets,
      activeDhikrId: id,
      target: newDhikr.defaultTarget,
      sessionCount: 0,
      sessionLaps: 0,
    }
    set(nextState)
    persistData(nextState)
  },

  updateCustomDhikr: (id: string, updates: Partial<DhikrItem>) => {
    const state = get()
    const updatedCustomDhikrs = (state.customDhikrs || []).map((d) => 
      d.id === id ? { ...d, ...updates } : d
    )
    const updatedTargets = updates.defaultTarget !== undefined
      ? { ...state.dhikrTargets, [id]: updates.defaultTarget }
      : state.dhikrTargets

    const nextState = {
      ...state,
      customDhikrs: updatedCustomDhikrs,
      dhikrTargets: updatedTargets,
      target: state.activeDhikrId === id && updates.defaultTarget !== undefined ? updates.defaultTarget : state.target,
    }
    set(nextState)
    persistData(nextState)
  },

  deleteCustomDhikr: (id: string) => {
    const state = get()
    const updatedCustomDhikrs = (state.customDhikrs || []).filter((d) => d.id !== id)
    const fallbackId = DHIKR_PRESETS[0].id
    const newActiveId = state.activeDhikrId === id ? fallbackId : state.activeDhikrId
    const newTarget = state.dhikrTargets[newActiveId] || 33

    const nextState = {
      ...state,
      customDhikrs: updatedCustomDhikrs,
      activeDhikrId: newActiveId,
      target: newTarget,
    }
    set(nextState)
    persistData(nextState)
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
    const currentTarget = state.target

    const newSessionCount = state.sessionCount + 1
    const isTargetCompleted = currentTarget > 0 && newSessionCount >= currentTarget

    let nextSessionCount = newSessionCount
    let nextLaps = state.sessionLaps

    if (isTargetCompleted) {
      nextLaps += 1
    }

    const currentToday = state.todayDhikrCounts[activeId] || 0
    const newToday = currentToday + 1
    const updatedTodayCounts = {
      ...state.todayDhikrCounts,
      [activeId]: newToday,
    }

    const currentLifetime = state.lifetimeDhikrCounts[activeId] || 0
    const updatedLifetimeCounts = {
      ...state.lifetimeDhikrCounts,
      [activeId]: currentLifetime + 1,
    }

    const logForToday = state.dailyHistory[todayStr] || {
      date: todayStr,
      totalCount: 0,
      goalMet: false,
      byDhikr: {},
    }

    const newByDhikr = {
      ...logForToday.byDhikr,
      [activeId]: (logForToday.byDhikr[activeId] || 0) + 1,
    }
    const newTotalCount = Object.values(newByDhikr).reduce((acc, v) => acc + v, 0)
    const goalMet = newTotalCount >= state.dailyGoal

    const updatedDailyHistory = {
      ...state.dailyHistory,
      [todayStr]: {
        date: todayStr,
        totalCount: newTotalCount,
        goalMet,
        byDhikr: newByDhikr,
      },
    }

    const { currentStreak, bestStreak } = calculateDhikrStreak(updatedDailyHistory, state.dailyGoal)

    const nextState = {
      ...state,
      sessionCount: nextSessionCount,
      sessionLaps: nextLaps,
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

    return { isTargetCompleted, newCount: nextSessionCount }
  },

  decrementCount: () => {
    const state = get()
    if (state.sessionCount <= 0) return

    const todayStr = getLocalDateString(new Date())
    const activeId = state.activeDhikrId

    const newSessionCount = Math.max(0, state.sessionCount - 1)
    const currentToday = state.todayDhikrCounts[activeId] || 0
    const newToday = Math.max(0, currentToday - 1)

    const updatedTodayCounts = {
      ...state.todayDhikrCounts,
      [activeId]: newToday,
    }

    const currentLifetime = state.lifetimeDhikrCounts[activeId] || 0
    const updatedLifetimeCounts = {
      ...state.lifetimeDhikrCounts,
      [activeId]: Math.max(0, currentLifetime - 1),
    }

    const logForToday = state.dailyHistory[todayStr] || {
      date: todayStr,
      totalCount: 0,
      goalMet: false,
      byDhikr: {},
    }

    const newByDhikr = {
      ...logForToday.byDhikr,
      [activeId]: Math.max(0, (logForToday.byDhikr[activeId] || 0) - 1),
    }
    const newTotalCount = Object.values(newByDhikr).reduce((acc, v) => acc + v, 0)
    const goalMet = newTotalCount >= state.dailyGoal

    const updatedDailyHistory = {
      ...state.dailyHistory,
      [todayStr]: {
        date: todayStr,
        totalCount: newTotalCount,
        goalMet,
        byDhikr: newByDhikr,
      },
    }

    const { currentStreak, bestStreak } = calculateDhikrStreak(updatedDailyHistory, state.dailyGoal)

    const nextState = {
      ...state,
      sessionCount: newSessionCount,
      todayDhikrCounts: updatedTodayCounts,
      lifetimeDhikrCounts: updatedLifetimeCounts,
      dailyHistory: updatedDailyHistory,
      currentStreak,
      bestStreak,
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
    
    const updatedToday = { ...state.todayDhikrCounts }
    delete updatedToday[dhikrId]

    const log = state.dailyHistory[todayStr]
    let updatedDailyHistory = state.dailyHistory
    if (log) {
      const newByDhikr = { ...log.byDhikr }
      delete newByDhikr[dhikrId]
      const newTotal = Object.values(newByDhikr).reduce((acc, v) => acc + v, 0)
      updatedDailyHistory = {
        ...state.dailyHistory,
        [todayStr]: {
          ...log,
          totalCount: newTotal,
          goalMet: newTotal >= state.dailyGoal,
          byDhikr: newByDhikr,
        },
      }
    }

    const nextState = {
      ...state,
      sessionCount: state.activeDhikrId === dhikrId ? 0 : state.sessionCount,
      todayDhikrCounts: updatedToday,
      dailyHistory: updatedDailyHistory,
    }
    set(nextState)
    persistData(nextState)
  },

  resetAllForToday: () => {
    const state = get()
    const todayStr = getLocalDateString(new Date())
    const updatedDailyHistory = { ...state.dailyHistory }
    delete updatedDailyHistory[todayStr]

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

  resetAllTasbihStatsToZero: () => {
    const todayStr = getLocalDateString(new Date())
    const defaultTargets = getDefaultDhikrTargets()
    const nextState: Partial<TasbihState> = {
      sessionCount: 0,
      sessionLaps: 0,
      todayDhikrCounts: {},
      lifetimeDhikrCounts: {},
      dailyHistory: {},
      currentStreak: 0,
      bestStreak: 0,
      target: defaultTargets['subhanallah'] || 33,
      dhikrTargets: defaultTargets,
    }
    set(nextState as TasbihState)
    if (typeof window !== 'undefined') {
      const dataToSave: StoredData = {
        dailyGoal: 300,
        dhikrTargets: defaultTargets,
        soundEnabled: true,
        hapticsEnabled: true,
        customDhikrs: get().customDhikrs || [],
        todayDhikrCounts: {},
        lifetimeDhikrCounts: {},
        dailyHistory: {},
        lastDateStr: todayStr,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }
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

  getAllDhikrs: () => {
    const state = get()
    return [...DHIKR_PRESETS, ...(state.customDhikrs || [])]
  },

  getCompletedDhikrsCount: () => {
    const state = get()
    const allDhikrs = state.getAllDhikrs()
    let completed = 0
    for (const dhikr of allDhikrs) {
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
    const allDhikrs = state.getAllDhikrs()
    return state.getCompletedDhikrsCount() >= allDhikrs.length && allDhikrs.length > 0
  },

  getAllDhikrProgress: (): DhikrProgressItem[] => {
    const state = get()
    const allDhikrs = state.getAllDhikrs()
    return allDhikrs.map((d) => {
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

  getOverallDailyProgress: () => {
    const state = get()
    const allDhikrs = state.getAllDhikrs()
    let totalTargetSum = 0
    let totalCappedCount = 0
    let totalActualCount = 0
    for (const dhikr of allDhikrs) {
      const target = state.dhikrTargets[dhikr.id] || dhikr.defaultTarget || 33
      const count = state.todayDhikrCounts[dhikr.id] || 0
      totalTargetSum += target
      totalCappedCount += Math.min(count, target)
      totalActualCount += count
    }
    const percentage = totalTargetSum > 0 ? Math.min(100, Math.round((totalCappedCount / totalTargetSum) * 100)) : 0
    return {
      totalTargetSum,
      totalCappedCount,
      totalActualCount,
      percentage,
    }
  },

  getActiveDhikr: () => {
    const state = get()
    const activeId = state.activeDhikrId
    const allDhikrs = [...DHIKR_PRESETS, ...(state.customDhikrs || [])]
    return allDhikrs.find((d) => d.id === activeId) || DHIKR_PRESETS[0]
  },

  getActiveDhikrTarget: () => {
    const state = get()
    return state.dhikrTargets[state.activeDhikrId] || state.target || 33
  },
}))
