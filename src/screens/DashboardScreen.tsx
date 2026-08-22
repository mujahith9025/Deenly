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
  Search,
  Play,
  Bookmark,
  Calendar,
  Check
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

// Daily Rotating Reflection Verse
const DAILY_VERSES = [
  { surahNum: 94, ayahNum: 5, surahName: 'Ash-Sharh', arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', translation: 'For indeed, with hardship [will be] ease.' },
  { surahNum: 2, ayahNum: 152, surahName: 'Al-Baqarah', arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ', translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.' },
  { surahNum: 13, ayahNum: 28, surahName: 'Ar-Ra\'d', arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', translation: 'Unquestionably, by the remembrance of Allah hearts are assured.' },
  { surahNum: 65, ayahNum: 3, surahName: 'At-Talaq', arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ', translation: 'And whoever relies upon Allah - then He is sufficient for him.' },
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

  // Daily Habits State
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
  const isDailyGoalMet = todayVerses >= dailyGoalVerses

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
      dayNum: targetDate.getDate(),
    }
  })

  // 5. Position & Bookmark Calculations
  const lastSurah = user?.lastReadSurah || currentSurahNumber || 1
  const lastAyah = user?.lastReadAyah || currentAyahNumber || 1
  const currentSurahMeta = SURAH_METADATA.find((s) => s.number === lastSurah) || SURAH_METADATA[0]
  const juzProgress = calculateJuzProgress(lastSurah, lastAyah)
  const khatmPercent = calculateKhatmProgress(user?.pages || 0)
  const overallQuranProgress = calculateOverallQuranProgress(lastSurah, lastAyah)

  // Rotating Verse index by day of month
  const dailyVerseIndex = new Date().getDate() % DAILY_VERSES.length
  const dailyVerse = DAILY_VERSES[dailyVerseIndex]

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
    <div className="space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto pb-24 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. TOP GREETING HEADER                                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-h1 text-on-surface">
            Assalamu Alaikum, {user?.name?.split(' ')[0] || 'Guest'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            "The most beloved deeds to Allah are those done regularly, even if small."
          </p>
        </div>

        {/* Status Pill on Desktop */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full glass-card border border-outline-variant/30 text-on-surface-variant self-start">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 🌟 SPLIT 2-COLUMN HERO ROW ON DESKTOP (READING & CONSISTENCY CARDS)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT HERO CARD: CONTINUE RECITATION (COMPACT & BALANCED) */}
        <div className="lg:col-span-7 xl:col-span-7 rounded-3xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-white/20 flex flex-col justify-between space-y-5">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          {/* Top Row: Session Tag & Surah Arabic Calligraphy */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-label-caps bg-white/15 px-3 py-1 rounded-full border border-white/20 inline-block">
                Current Reading Session
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentSurahMeta.number}. {currentSurahMeta.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Ayah {lastAyah} of {currentSurahMeta.numberOfAyahs} • {currentSurahMeta.englishNameTranslation}
              </p>
            </div>

            <span className="font-noto-serif text-3xl sm:text-4xl text-white/90 shrink-0 font-bold">
              {currentSurahMeta.arabicName}
            </span>
          </div>

          {/* Middle Row: Progress Slider with Juz Marker */}
          <div className="space-y-2 relative z-10 pt-1">
            <div className="relative w-full py-1">
              <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(2, overallQuranProgress.percent)}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.95)] border-2 border-[#6d28d9] pointer-events-none transition-all duration-500"
                style={{ left: `calc(${Math.min(97, Math.max(2, overallQuranProgress.percent))}% - 8px)` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-white/95">
              <span>Juz {juzProgress.juzNumber} of 30</span>
              <span title={`${overallQuranProgress.cumulativeVerses} of 6,236 verses completed`}>
                {overallQuranProgress.percent.toFixed(1)}% Whole Quran
              </span>
            </div>
          </div>

          {/* Bottom Action Row: Continue Button + Quick Surah Picker Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 pt-1">
            <Link
              to={`/reading?surah=${lastSurah}&ayah=${lastAyah}`}
              className="py-3 px-4 rounded-2xl bg-white text-[#6d28d9] hover:bg-white/95 active:scale-[0.99] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#6d28d9]" />
              <span>Continue Reading</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowSurahPickerModal(true)}
              className="py-3 px-4 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-[0.99] backdrop-blur-md border border-white/30 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Select Chapter</span>
            </button>
          </div>
        </div>

        {/* RIGHT HERO CARD: WEEKLY CONSISTENCY & DAILY GOAL */}
        <div className="lg:col-span-5 xl:col-span-5 p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-xl flex flex-col justify-between space-y-5">
          
          {/* Top Row: Daily Goal Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label-caps block">
                Daily Recitation Target
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {todayVerses} <span className="text-base sm:text-lg font-normal text-on-surface-variant">/ {dailyGoalVerses}</span>
                </span>
                <span className="text-xs font-semibold text-tertiary">Ayahs</span>
              </div>
            </div>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md shrink-0 ${
              isDailyGoalMet
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-primary/15 text-primary border border-primary/30'
            }`}>
              {isDailyGoalMet ? <Check className="w-6 h-6" /> : `${Math.round((todayVerses / dailyGoalVerses) * 100)}%`}
            </div>
          </div>

          {/* 7-Day Consistency Weekdays Row */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider block font-label-caps">
              Weekly Consistency
            </span>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((wd, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-outline font-medium">{wd.day}</span>
                  <div
                    title={wd.completed ? `Goal achieved (${wd.verses} verses)` : `Incomplete (${wd.verses}/${dailyGoalVerses} verses)`}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                      wd.completed
                        ? 'primary-gradient-btn text-white shadow-md'
                        : wd.isToday
                        ? 'border-2 border-primary text-primary bg-primary/10'
                        : 'bg-surface-container-highest text-outline'
                    }`}
                  >
                    {wd.completed ? '✓' : wd.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation Snippet Card */}
          <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>Current streak: <strong className="text-on-surface">{user?.currentStreak || 0} days</strong></span>
            </span>
            <Link to="/settings" className="text-primary font-bold hover:underline text-[11px]">
              Edit Goal →
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SPIRITUAL METRICS COMMAND BAR (4 GLASS METRIC CARDS)                    */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-outline uppercase tracking-wider font-label-caps">
            Spiritual Metrics
          </h2>

          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center bg-surface-container/80 p-1 rounded-full border border-outline-variant/30 text-xs">
            {(['today', 'week', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer capitalize ${
                  timeframe === tf
                    ? 'primary-gradient-btn text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tf === 'all' ? 'Lifetime' : tf}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Streak Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">Streak</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface">
              {user?.currentStreak || 0} <span className="text-xs font-normal text-on-surface-variant">days</span>
            </p>
            <p className="text-[11px] text-tertiary mt-1 truncate">
              {user?.currentStreak ? `Best: ${user?.bestStreak || 0} days` : 'Read daily to build streak'}
            </p>
          </div>

          {/* 2. Verses Recited Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">Verses Recited</span>
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface">
              {displayStats.verses.toLocaleString()} <span className="text-xs font-normal text-on-surface-variant">ayahs</span>
            </p>
            <p className="text-[11px] text-primary-fixed-dim mt-1 truncate">
              {displayStats.pages} pages read ({timeframe})
            </p>
          </div>

          {/* 3. Hasanat Points Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">Hasanat Earned</span>
              <div className="w-8 h-8 rounded-xl bg-tertiary/15 border border-tertiary/30 flex items-center justify-center text-tertiary">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-tertiary">
              {displayStats.hasanat.toLocaleString()} <span className="text-xs font-normal text-tertiary/70">pts</span>
            </p>
            <p className="text-[11px] text-outline mt-1 truncate">10 rewards per Arabic letter</p>
          </div>

          {/* 4. Reading Duration Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">Reading Time</span>
              <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface">
              {formatDurationHuman(displayStats.time)}
            </p>
            <p className="text-[11px] text-secondary mt-1 truncate">
              Juz {juzProgress.juzNumber} ({juzProgress.percent}%)
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 🌟 3-COLUMN BENTO GRID ON DESKTOP (HABITS, SUGGESTED, KHATM & VERSE)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: TODAY'S ISLAMIC HABITS & PRAYER CHECKLIST */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tertiary" />
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps">
                Daily Islamic Habits
              </h3>
            </div>
            <span className="text-xs text-tertiary font-bold px-2 py-0.5 rounded-full bg-tertiary/15">
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
                <div className="flex items-center gap-3 min-w-0">
                  {habit.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-tertiary shrink-0" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-outline shrink-0" />
                  )}
                  <div className="truncate">
                    <p className={`text-xs font-semibold truncate ${habit.completed ? 'line-through opacity-70' : 'text-on-surface'}`}>
                      {habit.name}
                    </p>
                    <p className="text-[10px] text-outline truncate">{habit.time}</p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-outline border border-outline-variant/30 shrink-0 ml-2">
                  {habit.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: QUICK JUMP & SUGGESTED SURAHS */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" />
              <span>Recommended Surahs</span>
            </h3>
            <Link to="/quran" className="text-[11px] text-primary font-bold hover:underline">
              All 114 →
            </Link>
          </div>

          <div className="space-y-2">
            {SUGGESTED_SURAHS.map((s) => (
              <button
                key={s.number}
                onClick={() => handleQuickLaunchSurah(s.number)}
                className={`w-full p-2.5 rounded-2xl bg-gradient-to-r ${s.color} border text-left flex items-center justify-between hover:scale-[1.01] transition-all shadow-sm cursor-pointer group`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-surface-container-high/80 text-[10px] font-bold text-outline flex items-center justify-center border border-outline-variant/20 shrink-0">
                    {s.number}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-outline truncate">{s.tag}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="font-noto-serif text-xs text-primary-fixed-dim">{s.arabicName}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 3: KHATM MILESTONE & AYAH OF REFLECTION */}
        <div className="space-y-6">
          {/* Khatm Milestone Tracker */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-secondary" />
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider font-label-caps">
                  Khatm Journey
                </h3>
              </div>
              <span className="text-xs font-bold text-secondary">{khatmPercent}%</span>
            </div>

            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(khatmPercent, (user?.pages || 0) > 0 ? 2 : 0)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>{user?.pages || 0} of 604 pages</span>
              <span className="text-outline">604 pages total</span>
            </div>
          </div>

          {/* Daily Ayah of Reflection */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary">
                <Bookmark className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider font-label-caps">Verse of the Day</span>
              </div>
              <span className="text-[11px] text-outline">{dailyVerse.surahName} {dailyVerse.surahNum}:{dailyVerse.ayahNum}</span>
            </div>

            <p className="font-noto-serif text-base text-on-surface text-right leading-relaxed pt-1" dir="rtl">
              {dailyVerse.arabic}
            </p>

            <p className="text-xs text-on-surface-variant italic leading-relaxed">
              "{dailyVerse.translation}"
            </p>

            <div className="pt-1">
              <Link
                to={`/reading?surah=${dailyVerse.surahNum}&ayah=${dailyVerse.ayahNum}`}
                className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Read in Context</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. SURAH PICKER MODAL (WHEN USER CLICKS SELECT CHAPTER)                    */}
      {/* ========================================================================= */}
      {showSurahPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-outline-variant/10">
              {filteredSurahsForPicker.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => handleSelectBookmarkSurah(surah.number)}
                  className="p-2.5 rounded-2xl hover:bg-primary/15 hover:border-primary/40 border border-transparent flex items-center justify-between cursor-pointer transition"
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
