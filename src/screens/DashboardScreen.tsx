import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Award,
  Compass,
  ChevronRight,
  Pencil,
  X,
  Search
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  calculateJuzProgress, 
  calculateKhatmProgress,
  calculateOverallQuranProgress,
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
  const [showSurahPickerModal, setShowSurahPickerModal] = useState(false)
  const [pickerSearchQuery, setPickerSearchQuery] = useState('')

  const user = useAuthStore((state) => state.user)
  const dailyHistory = useAuthStore((state) => state.dailyHistory)
  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)
  const setCurrentPosition = useReadingStore((state) => state.setCurrentPosition)
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
  const overallQuranProgress = calculateOverallQuranProgress(lastSurah, lastAyah)

  const handleQuickLaunchSurah = (surahNum: number) => {
    navigate(`/reading?surah=${surahNum}&ayah=1`)
  }

  const handleSelectBookmarkSurah = (surahNum: number) => {
    setCurrentPosition(surahNum, 1)
    setShowSurahPickerModal(false)
    navigate(`/reading?surah=${surahNum}&ayah=1`)
  }

  const filteredSurahsForPicker = SURAH_METADATA.filter(
    (s) =>
      s.name.toLowerCase().includes(pickerSearchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(pickerSearchQuery.toLowerCase()) ||
      s.number.toString().includes(pickerSearchQuery)
  )

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-24 animate-fade-in">
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
      {/* 2. WEEKLY CONSISTENCY CIRCLE DAYS                                         */}
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
      {/* 3. 🌟 QURANLY-INSPIRED GOAL & CONTINUE READING HERO CARD                  */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#a78bfa] via-[#8b5cf6] to-[#7c3aed] p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden border border-white/20 space-y-5 transition-all">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Top Row: Goal Title & Daily Verses Count (NO LIVE BADGE) */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-0.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-h2">
              Goal
            </h2>
            <p className="text-xs sm:text-sm font-medium text-white/85">
              Per Day Verses
            </p>
            <p className="text-base sm:text-lg font-bold text-white tracking-wide pt-0.5">
              {todayVerses}/{dailyGoalVerses}
            </p>
          </div>
        </div>

        {/* Middle Row: Surah Name, Verses Progress & Edit/Picker Button */}
        <div className="space-y-2 relative z-10 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white">
                {currentSurahMeta.number} {currentSurahMeta.name} | {lastAyah}/{currentSurahMeta.numberOfAyahs}
              </span>
              <button
                type="button"
                onClick={() => setShowSurahPickerModal(true)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                title="Change Surah or Ayah"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Slider Track with Draggable/Glowing Dot (Reflects Whole Quran Progress) */}
          <div className="relative w-full py-1">
            <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden relative">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(2, overallQuranProgress.percent)}%` }}
              />
            </div>
            {/* Glowing White Thumb Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.95)] border-2 border-[#7c3aed] pointer-events-none transition-all duration-500"
              style={{ left: `calc(${Math.min(97, Math.max(2, overallQuranProgress.percent))}% - 8px)` }}
            />
          </div>

          {/* Bottom of Progress: Juz Position and Overall Quran Completion Percentage */}
          <div className="flex items-center justify-between text-xs font-semibold text-white/90 pt-0.5">
            <span>{juzProgress.juzNumber}/30 Juz</span>
            <span title={`${overallQuranProgress.cumulativeVerses} of 6,236 verses completed (${overallQuranProgress.remainingPercent}% remaining to finish whole Quran)`}>
              {overallQuranProgress.percent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Bottom Action Button: Read Quran */}
        <div className="relative z-10 pt-2">
          <Link
            to={`/reading?surah=${lastSurah}&ayah=${lastAyah}`}
            className="w-full py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-[0.99] backdrop-blur-md border border-white/30 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>Read Quran</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TIMEFRAME FILTER TABS & 4 STAT CARDS (STREAK, VERSES, HASANAT, TIME)   */}
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
                {habits.filter((h) => h.completed).length}/{habits.length} Completed
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

      {/* Surah Picker Modal (when pencil icon is clicked) */}
      {showSurahPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-outline-variant/40 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30 shrink-0">
              <h3 className="text-base font-bold text-on-surface">Select Chapter to Read</h3>
              <button
                onClick={() => setShowSurahPickerModal(false)}
                className="p-1 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                placeholder="Search 114 Surahs..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredSurahsForPicker.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => handleSelectBookmarkSurah(surah.number)}
                  className="p-2.5 rounded-xl hover:bg-primary/10 hover:border-primary/40 border border-transparent flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-primary w-6">
                      {surah.number}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{surah.name}</p>
                      <p className="text-[10px] text-outline">{surah.englishNameTranslation} • {surah.numberOfAyahs} ayahs</p>
                    </div>
                  </div>
                  <span className="font-noto-serif text-sm text-primary-fixed-dim">
                    {surah.arabicName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
