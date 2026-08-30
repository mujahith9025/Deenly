import React, { useState, useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Flame, 
  Trophy, 
  Target, 
  Sparkles,
  Sliders,
  Check
} from 'lucide-react'
import { useTasbihStore } from '../store/useTasbihStore'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { 
  getDhikrHistoryRange, 
  getDhikrDistribution 
} from '../lib/dhikrAnalyticsEngine'
import { DHIKR_PRESETS } from '../lib/dhikrData'

export const DhikrAnalyticsView: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const isTamilTranslation = appLanguage === 'ta' || user?.preferredTranslation === 'tamil'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const {
    dailyGoal,
    dhikrTargets,
    todayDhikrCounts,
    lifetimeDhikrCounts,
    dailyHistory,
    currentStreak,
    bestStreak,
    setDailyGoal,
    setDhikrTarget,
    setAllDhikrTargets,
    getAllDhikrProgress,
    getCompletedDhikrsCount,
  } = useTasbihStore()

  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7)
  const [showTargetModal, setShowTargetModal] = useState(false)
  const [selectedDhikrForTarget, setSelectedDhikrForTarget] = useState<string | null>(null)
  const [tempTargetVal, setTempTargetVal] = useState<string>('100')

  const todayTotal = useMemo(() => {
    return Object.values(todayDhikrCounts).reduce((acc, v) => acc + v, 0)
  }, [todayDhikrCounts])

  const totalLifetime = useMemo(() => {
    return Object.values(lifetimeDhikrCounts).reduce((acc, v) => acc + v, 0)
  }, [lifetimeDhikrCounts])

  const completedDhikrsCount = getCompletedDhikrsCount()
  const totalPresetsCount = DHIKR_PRESETS.length
  const allCompleted = completedDhikrsCount >= totalPresetsCount && totalPresetsCount > 0
  const allDhikrProgress = getAllDhikrProgress()

  const historyRange = useMemo(() => {
    return getDhikrHistoryRange(dailyHistory, timeRange, dailyGoal)
  }, [dailyHistory, timeRange, dailyGoal])

  const distribution = useMemo(() => {
    return getDhikrDistribution(lifetimeDhikrCounts)
  }, [lifetimeDhikrCounts])

  // Max value in history for chart scaling
  const maxHistoryVal = Math.max(dailyGoal, ...historyRange.map((d) => d.totalCount), 50)

  const handleOpenTargetModal = (dhikrId?: string) => {
    if (dhikrId) {
      setSelectedDhikrForTarget(dhikrId)
      setTempTargetVal((dhikrTargets[dhikrId] || 33).toString())
    } else {
      setSelectedDhikrForTarget(null)
      setTempTargetVal(dailyGoal.toString())
    }
    setShowTargetModal(true)
  }

  const handleSaveTarget = () => {
    const val = parseInt(tempTargetVal, 10)
    if (val > 0) {
      if (selectedDhikrForTarget) {
        setDhikrTarget(selectedDhikrForTarget, val)
      } else {
        setDailyGoal(val)
      }
      setShowTargetModal(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 🌟 1. SPIRITUAL METRICS HIGHLIGHT ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Lifetime Dhikrs */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider font-label-caps">
              {isTamil ? 'மொத்த திக்ருகள்' : 'Lifetime Dhikrs'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline">
            {totalLifetime.toLocaleString()}
          </p>
          <p className="text-[11px] text-primary font-semibold">
            {isTamil ? `இன்று: +${todayTotal}` : `Today: +${todayTotal} Dhikrs`}
          </p>
        </div>

        {/* Current Dhikr Streak */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider font-label-caps">
              {isTamil ? 'தொடர் திக்ர் பழக்கம்' : 'Dhikr Streak'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline flex items-center gap-1.5">
            <span>{currentStreak}</span>
            <span className="text-sm font-bold text-outline">{isTamil ? 'நாட்கள்' : 'Days'}</span>
          </p>
          <p className="text-[11px] text-amber-500 font-semibold">
            {isTamil ? `சிறந்த சாதனை: ${bestStreak} நாட்கள்` : `Best: ${bestStreak} Days`}
          </p>
        </div>

        {/* Today's All-Dhikr Goals Completed */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider font-label-caps">
              {isTamil ? 'இன்றைய திக்ர் இலக்குகள்' : 'All-Dhikr Goals'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline flex items-center gap-1.5">
            <span>{completedDhikrsCount}</span>
            <span className="text-sm font-bold text-outline">/ {totalPresetsCount}</span>
          </p>
          <p className="text-[11px] text-emerald-500 font-semibold">
            {allCompleted 
              ? (isTamil ? 'அனைத்தும் நிறைவு பெற்றது!' : 'All Targets Completed!') 
              : (isTamil ? `${totalPresetsCount - completedDhikrsCount} திக்ருகள் எஞ்சியுள்ளன` : `${totalPresetsCount - completedDhikrsCount} remaining today`)}
          </p>
        </div>

        {/* Global Daily Target Progress */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider font-label-caps">
              {isTamil ? 'தினசரி மொத்த இலக்கு' : 'Daily Aggregate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline flex items-center gap-1.5">
            <span>{todayTotal}</span>
            <span className="text-sm font-bold text-outline">/ {dailyGoal}</span>
          </p>
          <p className="text-[11px] text-secondary font-semibold">
            {Math.min(100, Math.round((todayTotal / Math.max(1, dailyGoal)) * 100))}% {isTamil ? 'நிறைவு' : 'Achieved'}
          </p>
        </div>

      </div>

      {/* 🌟 2. MULTI-DAY ACTIVITY TRENDS & BAR CHART */}
      <div className="p-6 sm:p-7 rounded-3xl glass-card border border-outline-variant/30 space-y-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>{isTamil ? 'தினசரி திக்ர் அளவு' : 'Daily Dhikr Volume'}</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              {isTamil ? 'நாட்கள்தோறும் உங்கள் திக்ர் பழக்கத்தை கண்காணித்து சீராக ஓதி வாருங்கள்' : 'Track your daily Dhikr consistency and streak goals'}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-2xl border border-outline-variant/25">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timeRange === days
                    ? 'bg-surface-container-highest text-primary shadow-xs border border-primary/30'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {days} {isTamil ? 'நாட்கள்' : 'Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Bar Chart Grid */}
        <div className="pt-4 space-y-2">
          <div className="h-44 sm:h-52 flex items-end gap-2 sm:gap-3 px-2">
            {historyRange.map((stat) => {
              const heightPercent = maxHistoryVal > 0 
                ? Math.max(8, Math.min(100, Math.round((stat.totalCount / maxHistoryVal) * 100))) 
                : 8
              return (
                <div 
                  key={stat.date}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="px-3 py-1.5 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-on-surface shadow-lg text-center text-xs whitespace-nowrap">
                      <p className="font-bold">{stat.date}</p>
                      <p className="text-primary font-black">{stat.totalCount} {isTamil ? 'திக்ருகள்' : 'Dhikrs'}</p>
                      <p className="text-[10px] text-outline">
                        {stat.goalMet ? (isTamil ? '✅ இலக்கு நிறைவு' : '✅ Goal Met') : (isTamil ? 'இலக்கு நிறைவடையவில்லை' : 'Goal not met')}
                      </p>
                    </div>
                  </div>

                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[36px] rounded-2xl transition-all duration-300 shadow-sm ${
                      stat.goalMet
                        ? 'bg-linear-to-t from-emerald-600 to-amber-500 hover:brightness-110'
                        : stat.totalCount > 0
                        ? 'bg-linear-to-t from-primary/60 to-primary hover:brightness-110'
                        : 'bg-surface-container-highest/60'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Day Label */}
                  <span className="text-[10px] sm:text-xs font-semibold text-outline group-hover:text-on-surface truncate">
                    {stat.dayLabel}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-outline px-2 pt-2 border-t border-outline-variant/20">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-linear-to-r from-emerald-500 to-amber-500" />
              <span>{isTamil ? 'இலக்கு எட்டப்பட்ட நாட்கள்' : 'Daily Goal Achieved'}</span>
            </span>
            <span>
              {isTamil ? `இலக்கு வரம்பு: ${dailyGoal} திக்ருகள்/நாள்` : `Target Threshold: ${dailyGoal} Dhikrs/day`}
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 3. ALL DHIKR TARGETS & TODAY'S BREAKDOWN TABLE */}
      <div className="p-6 sm:p-7 rounded-3xl glass-card border border-outline-variant/30 space-y-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span>{isTamil ? 'அனைத்து திக்ர் இலக்குகள் & இன்றைய முன்னேற்றம்' : 'All Dhikr Targets & Today\'s Breakdown'}</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              {isTamil 
                ? 'ஒவ்வொரு திக்ருக்கும் குறிப்பிட்ட இலக்கை அமைத்து அனைத்தையும் இன்று நிறைவு செய்யுங்கள்' 
                : 'Set custom targets for each Dhikr and track completion for all presets today'}
            </p>
          </div>

          {/* Quick Universal Target Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-outline font-semibold hidden sm:inline">
              {isTamil ? 'அனைத்திற்கும்:' : 'Apply to all:'}
            </span>
            <button
              onClick={() => setAllDhikrTargets(33)}
              className="px-3 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface transition cursor-pointer"
            >
              33x
            </button>
            <button
              onClick={() => setAllDhikrTargets(100)}
              className="px-3 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface transition cursor-pointer"
            >
              100x
            </button>
            <button
              onClick={() => handleOpenTargetModal()}
              className="px-3 py-1 rounded-xl bg-primary text-on-primary text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>{isTamil ? 'மொத்த இலக்கு' : 'Daily Goal'}</span>
            </button>
          </div>
        </div>

        {/* All Dhikr Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allDhikrProgress.map(({ dhikr, todayCount, target, isCompleted, percentage }) => (
            <div
              key={dhikr.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                isCompleted
                  ? 'bg-primary/10 border-primary/40 shadow-xs'
                  : 'bg-surface-container/60 border-outline-variant/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-on-surface">
                      {dhikr.transliteration}
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{isTamil ? 'நிறைவு' : 'Done'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-outline truncate max-w-[220px]">
                    {isTamilTranslation ? dhikr.translationTa : dhikr.translationEn}
                  </p>
                </div>

                {/* Target Adjuster */}
                <button
                  onClick={() => handleOpenTargetModal(dhikr.id)}
                  className="px-2.5 py-1 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] font-bold text-primary flex items-center gap-1 transition cursor-pointer"
                  title="Adjust Target"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{target}x</span>
                </button>
              </div>

              {/* Arabic Script */}
              <p 
                className="text-lg text-on-surface text-right select-none"
                style={{ fontFamily: arabicFontFamily }}
                dir="rtl"
              >
                {dhikr.arabic}
              </p>

              {/* Progress Bar & Stats */}
              <div className="space-y-1.5 pt-1 border-t border-outline-variant/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline font-medium">
                    {isTamil ? 'இன்றைய ஓதுதல்' : 'Today\'s Recitation'}: <strong className="text-on-surface">{todayCount}</strong> / {target}
                  </span>
                  <span className="font-extrabold text-primary">{percentage}%</span>
                </div>

                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-linear-to-r from-emerald-500 to-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-outline pt-0.5">
                  <span>{isTamil ? 'மொத்த ஓதுதல்' : 'All-time lifetime'}: {lifetimeDhikrCounts[dhikr.id] || 0}</span>
                  {todayCount < target && (
                    <span className="text-amber-500 font-semibold">
                      {isTamil ? `${target - todayCount} முறை மீதம்` : `${target - todayCount} more to go`}
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 🌟 4. DHIKR DISTRIBUTION BREAKDOWN */}
      <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>{isTamil ? 'அதிகம் ஓதிய திக்ருகள்' : 'Your Most Recited Dhikrs'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {distribution.map(({ dhikr, count, percentage }) => (
            <div key={dhikr.id} className="space-y-1.5 p-3 rounded-2xl bg-surface-container/50 border border-outline-variant/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface truncate">{dhikr.transliteration}</span>
                <span className="text-outline font-semibold">{count} ({percentage}%)</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 5. TARGET CONFIGURATION MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-surface-container-highest border border-primary/30 max-w-sm w-full space-y-4 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-on-surface">
              {selectedDhikrForTarget 
                ? (isTamil ? 'திக்ர் இலக்கை மாற்றவும்' : 'Set Specific Dhikr Target')
                : (isTamil ? 'தினசரி மொத்த இலக்கை மாற்றவும்' : 'Set Global Daily Target')}
            </h3>

            <div className="space-y-3">
              <input
                type="number"
                min="1"
                max="10000"
                value={tempTargetVal}
                onChange={(e) => setTempTargetVal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-sm font-bold text-on-surface focus:outline-none focus:border-primary text-center"
              />

              <div className="flex items-center gap-2 justify-center">
                {[33, 100, 300, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTempTargetVal(preset.toString())}
                    className="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-outline hover:text-on-surface cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowTargetModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition cursor-pointer"
              >
                {isTamil ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveTarget}
                className="flex-1 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
              >
                {isTamil ? 'சேமி' : 'Save Target'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
