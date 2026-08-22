import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Pencil,
  X,
  Search
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  calculateJuzProgress, 
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

  // 4. Weekly Streak Circles (M, T, W, T, F, S, S)
  const weekLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekDays = weekLetters.map((letter, index) => {
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
      letter,
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
  const currentVersePercent = Math.min(100, Math.max(0, (lastAyah / (currentSurahMeta.numberOfAyahs || 1)) * 100))

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
    <div className="space-y-6 max-w-6xl mx-auto pb-24 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. TOP GREETING HEADER WITH STREAK & CALENDAR BADGE                      */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-emerald-300/90 text-gray-950 font-bold text-base flex items-center justify-center shadow-md shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="truncate">
            <p className="text-xs text-on-surface-variant font-medium">Asalam Alaykum,</p>
            <h1 className="text-lg sm:text-xl font-bold font-h1 text-on-surface truncate">
              {user?.name || 'Seeker'}
            </h1>
          </div>
        </div>

        {/* Top Right: Calendar + Flame Streak Pill */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container border border-outline-variant/30 shadow-sm shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-container-high border border-outline-variant/30">
            <span className="text-xs">📅</span>
            <div className="w-px h-3.5 bg-outline-variant/50" />
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{user?.currentStreak || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RESPONSIVE 2-COLUMN GRID (LEFT: GOAL & STATS | RIGHT: HABITS & SURAHS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: WEEKLY CIRCLES, GOAL HERO CARD, AND STATS (SPAN 7/12)     */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Weekly Consistency Circles (M, T, W, T, F, S, S) */}
          <div className="p-3.5 sm:p-4 rounded-3xl bg-surface-container/60 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between max-w-md mx-auto px-2">
              {weekDays.map((wd, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    title={wd.completed ? `Goal achieved (${wd.verses} verses)` : `Target: ${dailyGoalVerses} verses`}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                      wd.completed
                        ? 'bg-purple-600 text-white shadow-md'
                        : wd.isToday
                        ? 'border-2 border-purple-400 text-white bg-purple-600/30 ring-2 ring-purple-500/40'
                        : 'bg-surface-container-highest/60 text-outline'
                    }`}
                  >
                    {wd.letter}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🌟 QURANLY-INSPIRED GOAL & CONTINUE READING HERO CARD */}
          <div className="rounded-3xl bg-gradient-to-br from-[#a78bfa] via-[#8b5cf6] to-[#7c3aed] p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden border border-white/20 space-y-5 transition-all">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Top Row: Goal Title, Daily Verses Count & Live Reading Pill */}
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

              {/* Live Readers Pill with Overlapping Avatar Badges */}
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-sm self-start">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border border-white/40 flex items-center justify-center text-[9px] font-bold text-black">
                    👤
                  </div>
                  <div className="w-5 h-5 rounded-full bg-teal-300 border border-white/40 flex items-center justify-center text-[9px] font-bold text-black">
                    👤
                  </div>
                  <div className="w-5 h-5 rounded-full bg-indigo-300 border border-white/40 flex items-center justify-center text-[9px] font-bold text-black">
                    👤
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/95">
                  <span className="font-bold">249</span>
                  <span className="opacity-90">Reading Live</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
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

              {/* Progress Slider Track with Draggable/Glowing Dot */}
              <div className="relative w-full py-1">
                <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.max(3, currentVersePercent)}%` }}
                  />
                </div>
                {/* Glowing White Thumb Indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.95)] border-2 border-[#7c3aed] pointer-events-none transition-all duration-500"
                  style={{ left: `calc(${Math.min(96, Math.max(2, currentVersePercent))}% - 8px)` }}
                />
              </div>

              {/* Bottom of Progress: Juz Position and Percentage */}
              <div className="flex items-center justify-between text-xs font-semibold text-white/90 pt-0.5">
                <span>{juzProgress.juzNumber}/30 Juz</span>
                <span>{currentVersePercent.toFixed(1)}%</span>
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

          {/* Timeframe Filter Tabs & 2-Column Stats Cards */}
          <div className="space-y-4 pt-1">
            {/* Timeframe Switcher Tabs */}
            <div className="flex items-center justify-center bg-surface-container p-1 rounded-full border border-outline-variant/30 max-w-xs mx-auto">
              {(['today', 'week', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition cursor-pointer capitalize ${
                    timeframe === tf
                      ? 'bg-primary text-white shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf === 'all' ? 'All' : tf}
                </button>
              ))}
            </div>

            {/* 2-Column Stats Cards: Hasanat & Verses */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hasanat Card */}
              <div className="p-5 rounded-3xl glass-card border border-rose-500/20 bg-surface-container/70 flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                <div className="text-3xl sm:text-4xl animate-bounce duration-1000">
                  💖
                </div>
                <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps">
                  Hasanat
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {displayStats.hasanat.toLocaleString()}
                </p>
              </div>

              {/* Verses Card */}
              <div className="p-5 rounded-3xl glass-card border border-blue-500/20 bg-surface-container/70 flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                <div className="text-3xl sm:text-4xl">
                  📑
                </div>
                <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps">
                  Verses
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {displayStats.verses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: DAILY HABITS & RECOMMENDED RECITATION (SPAN 5/12)        */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Habits Checklist */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-h2 text-on-surface">Daily Habits</h3>
              <span className="text-xs text-tertiary font-semibold">
                {habits.filter((h) => h.completed).length}/{habits.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3 rounded-2xl flex items-center justify-between border cursor-pointer transition ${
                    habit.completed
                      ? 'bg-surface-container-highest/60 border-tertiary/30 text-on-surface'
                      : 'bg-surface-container/60 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {habit.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-outline shrink-0" />
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

          {/* Recommended Surahs for Today */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <h3 className="text-base font-bold font-h2 text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Recommended Recitation</span>
            </h3>

            <div className="space-y-2.5">
              {SUGGESTED_SURAHS.slice(0, 4).map((s) => (
                <div
                  key={s.number}
                  onClick={() => handleQuickLaunchSurah(s.number)}
                  className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/30 hover:border-primary/60 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-xs font-mono font-bold text-primary">
                      {s.number}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface group-hover:text-primary transition">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-outline">{s.tag}</p>
                    </div>
                  </div>

                  <span className="font-noto-serif text-sm text-primary-fixed-dim shrink-0">
                    {s.arabicName}
                  </span>
                </div>
              ))}
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
