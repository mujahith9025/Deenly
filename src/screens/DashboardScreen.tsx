import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Bookmark, 
  Clock, 
  Target, 
  Compass, 
  Star, 
  ChevronRight, 
  Award 
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  calculateJuzProgress, 
  calculateKhatmProgress, 
  formatDurationHuman, 
  getLocalDateString 
} from '../lib/hasanatEngine'

type TimeframeFilter = 'today' | 'week' | 'all'

interface SuggestedSurah {
  number: number
  name: string
  arabicName: string
  tag: string
  color: string
}

const SUGGESTED_SURAHS: SuggestedSurah[] = [
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', tag: 'Nightly Protection', color: 'from-purple-900/40 to-indigo-900/40 border-purple-500/30' },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', tag: 'Friday Sunnah', color: 'from-emerald-900/40 to-teal-900/40 border-emerald-500/30' },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', tag: 'Heart of Quran', color: 'from-amber-900/40 to-orange-900/40 border-amber-500/30' },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', tag: 'Divine Grace', color: 'from-cyan-900/40 to-blue-900/40 border-cyan-500/30' },
  { number: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', tag: 'Sustenance & Barakah', color: 'from-violet-900/40 to-fuchsia-900/40 border-violet-500/30' },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', tag: '1/3 of Quran', color: 'from-rose-900/40 to-pink-900/40 border-rose-500/30' },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', tag: 'Household Barakah', color: 'from-indigo-900/40 to-purple-900/40 border-indigo-500/30' },
]

const DEFAULT_HABITS = [
  { id: 'fajr', name: 'Fajr Prayer', time: '05:12 AM', category: 'prayer' },
  { id: 'adhkar_morning', name: 'Morning Adhkar', time: '06:00 AM', category: 'dhikr' },
  { id: 'dhuhr', name: 'Dhuhr Prayer', time: '12:30 PM', category: 'prayer' },
  { id: 'quran', name: 'Read Daily Quran', time: 'Daily Target', category: 'quran' },
  { id: 'asr', name: 'Asr Prayer', time: '03:45 PM', category: 'prayer' },
  { id: 'maghrib', name: 'Maghrib Prayer', time: '06:15 PM', category: 'prayer' },
  { id: 'isha', name: 'Isha Prayer', time: '07:30 PM', category: 'prayer' },
  { id: 'adhkar_evening', name: 'Evening Adhkar', time: '08:00 PM', category: 'dhikr' },
]

export const DashboardScreen: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('today')

  const user = useAuthStore((state) => state.user)
  const dailyHistory = useAuthStore((state) => state.dailyHistory)
  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)
  const navigate = useNavigate()

  const todayStr = getLocalDateString(new Date())
  const habitStorageKey = `deenly_habits_${user?.id || 'guest'}_${todayStr}`

  // Daily Habits State - Zero checked by default
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(habitStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Synchronize when user changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(habitStorageKey)
      setCompletedHabitIds(stored ? JSON.parse(stored) : [])
    } catch {
      setCompletedHabitIds([])
    }
  }, [habitStorageKey])

  const toggleHabit = (id: string) => {
    setCompletedHabitIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(habitStorageKey, JSON.stringify(next))
      } catch (err) {
        console.warn('Failed to save habits to localStorage:', err)
      }
      return next
    })
  }

  const habits = DEFAULT_HABITS.map((h) => ({
    ...h,
    completed: completedHabitIds.includes(h.id),
  }))

  // 1. Goal Calculations
  const dailyGoalVerses = user?.dailyGoalVerses || 10
  const todayLog = dailyHistory[todayStr] || {
    hasanat: 0,
    verses: 0,
    timeSeconds: 0,
    pages: 0,
    lastSurah: 1,
    lastAyah: 1,
  }

  const todayVerses = todayLog.verses || 0
  const goalProgressPercent = Math.min(100, Math.round((todayVerses / dailyGoalVerses) * 100))
  const isGoalCompleted = todayVerses >= dailyGoalVerses

  // 2. Week Metrics Aggregation (Rolling 7 days)
  let weekHasanat = 0
  let weekVerses = 0
  let weekTimeSeconds = 0
  let weekPages = 0
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const entry = dailyHistory[key]
    if (entry) {
      weekHasanat += entry.hasanat || 0
      weekVerses += entry.verses || 0
      weekTimeSeconds += entry.timeSeconds || 0
      weekPages += entry.pages || 0
    }
  }

  // 3. Selected Timeframe Metrics
  const displayStats = {
    hasanat:
      timeframe === 'today'
        ? todayLog.hasanat
        : timeframe === 'week'
        ? weekHasanat
        : user?.hasanat || 0,
    verses:
      timeframe === 'today'
        ? todayLog.verses
        : timeframe === 'week'
        ? weekVerses
        : user?.verses || 0,
    time:
      timeframe === 'today'
        ? todayLog.timeSeconds
        : timeframe === 'week'
        ? weekTimeSeconds
        : user?.time || 0,
    pages:
      timeframe === 'today'
        ? todayLog.pages
        : timeframe === 'week'
        ? weekPages
        : user?.pages || 0,
  }

  // 4. Weekly Streak Circles (Monday - Sunday of Current Week)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
    const curr = new Date()
    const dayOfWeek = curr.getDay() // 0 = Sun, 1 = Mon ...
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = Mon ... 6 = Sun
    const diff = index - adjustedDay

    const targetDate = new Date()
    targetDate.setDate(curr.getDate() + diff)
    const dateKey = targetDate.toISOString().split('T')[0]
    const rec = dailyHistory[dateKey]
    const versesReadOnDay = rec ? rec.verses : 0
    const isGoalMetOnDay = versesReadOnDay >= dailyGoalVerses || versesReadOnDay > 0
    const isToday = index === adjustedDay

    return {
      day: dayName,
      completed: isGoalMetOnDay,
      verses: versesReadOnDay,
      isToday,
    }
  })

  // 5. Position & Bookmark Calculations
  const lastSurah = user?.lastReadSurah || currentSurahNumber || 1
  const lastAyah = user?.lastReadAyah || currentAyahNumber || 1
  const currentSurahMeta = SURAH_METADATA.find((s) => s.number === lastSurah) || SURAH_METADATA[0]
  const juzProgress = calculateJuzProgress(lastSurah, lastAyah)
  const khatmPercent = calculateKhatmProgress(user?.pages || 0)

  // Zero-state flag
  const isNewUser = (user?.verses || 0) === 0 && todayVerses === 0

  const handleQuickLaunchSurah = (surahNum: number) => {
    navigate(`/reading?surah=${surahNum}&ayah=1`)
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP GREETING HEADER                                                   */}
      {/* ========================================================================= */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">
          Assalamu Alaikum, {user?.name?.split(' ')[0] || 'Seeker'}
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
          "The most beloved deeds to Allah are those done regularly, even if small."
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. WEEKLY CONSISTENCY CIRCLE DAYS ONLY                                    */}
      {/* ========================================================================= */}
      <div className="p-4 md:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-md">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((wd, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-outline font-medium">{wd.day}</span>
              <div
                title={wd.completed ? `Goal achieved (${wd.verses} verses)` : `Incomplete (${wd.verses}/${dailyGoalVerses} verses)`}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                  wd.completed
                    ? 'primary-gradient-btn text-white shadow-md'
                    : wd.isToday
                    ? 'border-2 border-primary text-primary bg-primary/10'
                    : 'bg-surface-container-highest text-outline'
                }`}
              >
                {wd.completed ? '✓' : i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DAILY GOAL & CONTINUE READING DUAL HERO                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Daily Goal Progress Card */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps flex items-center gap-1.5">
                <Target className="w-4 h-4 text-tertiary" />
                <span>Daily Goal</span>
              </span>
              {isGoalCompleted ? (
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/40 border border-tertiary/40 text-tertiary text-[11px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-tertiary" />
                  <span>Goal Met!</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-secondary">
                  {Math.max(0, dailyGoalVerses - todayVerses)} verses left
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-3xl font-bold text-on-surface">{todayVerses}</span>
              <span className="text-sm text-on-surface-variant font-medium">/ {dailyGoalVerses} verses today</span>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-outline">Today's Consistency</span>
              <span className="font-bold text-tertiary">{goalProgressPercent}%</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-tertiary-container h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(goalProgressPercent, todayVerses > 0 ? 5 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Continue Reading Card (Deep-Linked) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2 text-xs text-primary font-semibold">
              <Bookmark className="w-4 h-4" />
              <span>{isNewUser ? 'START YOUR JOURNEY' : 'CONTINUE READING'}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold font-h2 text-on-surface">
              {currentSurahMeta.number}. {currentSurahMeta.name} ({currentSurahMeta.arabicName})
            </h2>

            <p className="text-xs text-on-surface-variant">
              {isNewUser
                ? 'Begin with the Opening Chapter (Al-Fatihah) • 7 Ayahs • Meccan'
                : `Ayah ${lastAyah} of ${currentSurahMeta.numberOfAyahs} • Juz ${juzProgress.juzNumber} (${juzProgress.percent}% completed) • Page ${currentSurahMeta.startPage}`}
            </p>

            {/* Juz Progress Indicator */}
            {!isNewUser && (
              <div className="w-56 max-w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all duration-500"
                  style={{ width: `${juzProgress.percent}%` }}
                />
              </div>
            )}
          </div>

          <Link
            to={`/reading?surah=${lastSurah}&ayah=${lastAyah}`}
            className="primary-gradient-btn text-white px-6 py-3 rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 z-10 hover:scale-105 transition shadow-lg cursor-pointer"
          >
            <span>{isNewUser ? 'Start Reading' : 'Resume Reading'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TIMEFRAME FILTER TABS & 4 STAT CARDS                                   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-outline uppercase tracking-wider font-label-caps">
            Spiritual Metrics
          </h2>

          <div className="flex items-center bg-surface-container/80 p-1 rounded-full border border-outline-variant/30 text-xs">
            {(['today', 'week', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer capitalize ${
                  timeframe === tf
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tf === 'all' ? 'Lifetime' : tf}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Metrics Bar: 2x2 on Mobile -> Single Row of 4 on Tablet & Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak Card */}
          <div className="p-4 md:p-5 rounded-2xl glass-card border border-outline-variant/30 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline tracking-wider uppercase font-label-caps">Streak</span>
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-on-surface">
              {user?.currentStreak || 0} <span className="text-sm font-normal text-on-surface-variant">days</span>
            </p>
            <p className="text-[11px] text-tertiary mt-1">
              {user?.currentStreak ? `Best streak: ${user?.bestStreak || 0} days` : 'Read daily to build streak'}
            </p>
          </div>

          {/* Verses Recited */}
          <div className="p-4 md:p-5 rounded-2xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline tracking-wider uppercase font-label-caps">Verses Recited</span>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-on-surface">
              {displayStats.verses.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">ayahs</span>
            </p>
            <p className="text-[11px] text-primary-fixed-dim mt-1">
              {displayStats.pages} pages ({timeframe})
            </p>
          </div>

          {/* Hasanat Points */}
          <div className="p-4 md:p-5 rounded-2xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline tracking-wider uppercase font-label-caps">Hasanat Earned</span>
              <Sparkles className="w-5 h-5 text-tertiary" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-tertiary">
              {displayStats.hasanat.toLocaleString()} <span className="text-sm font-normal text-tertiary/70">pts</span>
            </p>
            <p className="text-[11px] text-outline mt-1">10 rewards per Arabic letter</p>
          </div>

          {/* Reading Duration */}
          <div className="p-4 md:p-5 rounded-2xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline tracking-wider uppercase font-label-caps">Reading Time</span>
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-on-surface">
              {formatDurationHuman(displayStats.time)}
            </p>
            <p className="text-[11px] text-secondary mt-1">
              Juz {juzProgress.juzNumber} ({juzProgress.percent}%)
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN HABITS CHECKLIST & RIGHT RAIL                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left/Main Column: Habits Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-h2 text-on-surface">Today's Islamic Habits</h3>
              <span className="text-xs text-tertiary font-semibold">
                {habits.filter(h => h.completed).length}/{habits.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3.5 rounded-2xl flex items-center justify-between border cursor-pointer transition ${
                    habit.completed
                      ? 'bg-surface-container-highest/60 border-tertiary/30 text-on-surface'
                      : 'bg-surface-container/60 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {habit.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-outline shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold ${habit.completed ? 'line-through opacity-70' : 'text-on-surface'}`}>
                        {habit.name}
                      </p>
                      <p className="text-[10px] text-outline">{habit.time}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-outline border border-outline-variant/30">
                    {habit.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Suggested Surahs & Khatm Progress */}
        <div className="space-y-6">
          {/* Suggested Surahs Quick Launch List */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-primary" />
                <span>Suggested Surahs</span>
              </h3>
              <span className="text-[10px] text-outline">Quick Jump</span>
            </div>

            <div className="space-y-2">
              {SUGGESTED_SURAHS.map((s) => (
                <button
                  key={s.number}
                  onClick={() => handleQuickLaunchSurah(s.number)}
                  className={`w-full p-3 rounded-2xl bg-gradient-to-r ${s.color} border text-left flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm cursor-pointer group`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-surface-container-high/80 text-[10px] font-bold text-outline flex items-center justify-center border border-outline-variant/20">
                      {s.number}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-outline">{s.tag}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-noto-serif text-sm text-primary-fixed-dim">{s.arabicName}</span>
                    <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Khatm Milestone Tracker */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                <h3 className="text-sm font-bold text-on-surface">Khatm Completion</h3>
              </div>
              <span className="text-xs font-bold text-secondary">{khatmPercent}%</span>
            </div>

            <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary-container h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(khatmPercent, (user?.pages || 0) > 0 ? 2 : 0)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>{user?.pages || 0} of 604 pages</span>
              <span className="text-outline">Goal: 1 Quran Khatm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
