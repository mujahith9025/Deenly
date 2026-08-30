import React, { useState, useCallback, useId } from 'react'
import { 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Award,
  Info,
  Smartphone,
  Target,
  Minus,
  Sliders,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { DHIKR_PRESETS, type DhikrItem } from '../lib/dhikrData'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { useTasbihStore } from '../store/useTasbihStore'
import { triggerHapticMedium, triggerHapticSuccess } from '../lib/haptics'

// Synthesized gentle Web Audio chime for count and completion
function playChime(isCompletion = false) {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    
    if (isCompletion) {
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, now) // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(880, now) // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2) // D6

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.6)
      osc2.stop(now + 0.6)
    } else {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, now) // E5
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    }
  } catch {
    // AudioContext blocked
  }
}

interface DigitalTasbihEngineProps {
  onOpenAnalytics?: () => void
}

export const DigitalTasbihEngine: React.FC<DigitalTasbihEngineProps> = ({ onOpenAnalytics }) => {
  const gradientId = useId()
  const user = useAuthStore((state) => state.user)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const isTamilTranslation = appLanguage === 'ta' || user?.preferredTranslation === 'tamil'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const {
    activeDhikrId,
    target,
    dailyGoal,
    dhikrTargets,
    soundEnabled,
    hapticsEnabled,
    sessionCount,
    sessionLaps,
    todayDhikrCounts,
    lifetimeDhikrCounts,
    currentStreak,
    setActiveDhikrId,
    setTarget,
    setAllDhikrTargets,
    toggleSound,
    toggleHaptics,
    incrementCount,
    decrementCount,
    resetSessionCount,
    getCompletedDhikrsCount,
    getAllDhikrsCompleted,
    getOverallDailyProgress,
    getActiveDhikr,
  } = useTasbihStore()

  const [showVirtue, setShowVirtue] = useState<boolean>(true)
  const [virtueLanguage, setVirtueLanguage] = useState<'en' | 'ta'>(isTamilTranslation ? 'ta' : 'en')
  const [isCompletedAnim, setIsCompletedAnim] = useState<boolean>(false)
  const [showGoalEditor, setShowGoalEditor] = useState<boolean>(false)
  const [customGoalInput, setCustomGoalInput] = useState<string>(dailyGoal.toString())

  const activeDhikr = getActiveDhikr()
  const { totalTargetSum, totalActualCount, percentage: dailyProgressPercent } = getOverallDailyProgress()
  
  const completedCount = getCompletedDhikrsCount()
  const totalPresets = DHIKR_PRESETS.length
  const allDhikrsDone = getAllDhikrsCompleted()

  // Switch Dhikr
  const handleSelectDhikr = (dhikr: DhikrItem) => {
    setActiveDhikrId(dhikr.id)
    setIsCompletedAnim(false)
  }

  // Handle Incremental Tap
  const handleTap = useCallback(() => {
    const { isTargetCompleted } = incrementCount()

    // Sound
    if (soundEnabled) {
      playChime(isTargetCompleted)
    }

    // Haptics
    if (hapticsEnabled) {
      if (isTargetCompleted) {
        triggerHapticSuccess()
      } else {
        triggerHapticMedium()
      }
    }

    if (isTargetCompleted) {
      setIsCompletedAnim(true)
      setTimeout(() => {
        setIsCompletedAnim(false)
        resetSessionCount()
      }, 1000)
    }
  }, [incrementCount, soundEnabled, hapticsEnabled, resetSessionCount])

  // Save Goal for All Dhikrs
  const handleSaveGoal = (val: number) => {
    if (val > 0) {
      setAllDhikrTargets(val)
      setCustomGoalInput(val.toString())
      setShowGoalEditor(false)
    }
  }

  // Target options
  const targetOptions = [33, 100, 300, 0] // 0 means Free/Unlimited

  // Radial Progress
  const progressPercent = target > 0 ? Math.min(100, (sessionCount / target) * 100) : 100
  const radius = 72
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  // Auto next in Sunnah After-Prayer sequence
  const nextInSequence = () => {
    if (activeDhikrId === 'subhanallah') {
      const next = DHIKR_PRESETS.find((d) => d.id === 'alhamdulillah')
      if (next) handleSelectDhikr(next)
    } else if (activeDhikrId === 'alhamdulillah') {
      const next = DHIKR_PRESETS.find((d) => d.id === 'allahu_akbar')
      if (next) handleSelectDhikr(next)
    } else if (activeDhikrId === 'allahu_akbar') {
      const next = DHIKR_PRESETS.find((d) => d.id === 'subhanallah')
      if (next) handleSelectDhikr(next)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 🌟 1. TOP HEADER & CONTROL BAR */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isTamil ? 'தஸ்பீஹ் & திக்ர் அரங்கம்' : 'Tasbih & Dhikr Studio'}</span>
              {currentStreak > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-extrabold border border-amber-500/30">
                  🔥 {currentStreak} {isTamil ? 'நாள் தொடர்' : 'Day Streak'}
                </span>
              )}
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              {isTamil 
                ? 'தினசரி திக்ர் இலக்குகள், சுன்னத் நினைவுகள் மற்றும் ஆதாரப்பூர்வ ஹதீஸ் சிறப்புகள்.' 
                : 'Track daily targets across all Dhikrs, Sunnah remembrance, and authentic Hadith virtues'}
            </p>
          </div>
        </div>

        {/* Audio, Haptic, Goal & Analytics Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-primary/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer text-primary shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isTamil ? 'பகுப்பாய்வு' : 'Analytics'}</span>
            </button>
          )}

          <button
            onClick={() => setShowGoalEditor(!showGoalEditor)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer text-on-surface shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isTamil ? 'இலக்குகளை மாற்று' : 'Set Targets'}</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              soundEnabled 
                ? 'bg-surface-container-high text-primary border-primary/30' 
                : 'bg-surface-container text-outline border-outline-variant/30 opacity-60'
            }`}
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleHaptics}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              hapticsEnabled 
                ? 'bg-surface-container-high text-secondary border-secondary/30' 
                : 'bg-surface-container text-outline border-outline-variant/30 opacity-60'
            }`}
            title={hapticsEnabled ? 'Disable Vibration' : 'Enable Vibration'}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🌟 2. MAIN INTERACTIVE TASBIH & DHIKR ENGINE (POSITIONED AT TOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: SCRIPT, TRANSLATION, AUTHENTIC VIRTUES & CITATIONS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Dhikr Card */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 relative shadow-md">
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-label-caps">
                {activeDhikr.transliteration}
              </span>
              
              <div className="flex items-center gap-2">
                {/* 🌟 Single Language Toggle for Translation & Hadith Virtues */}
                <button
                  onClick={() => setVirtueLanguage(virtueLanguage === 'en' ? 'ta' : 'en')}
                  className="px-3 py-1 rounded-xl glass-card border border-primary/40 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs flex items-center gap-1 active:scale-95"
                  title="Switch translation language between English and தமிழ்"
                >
                  <span>{virtueLanguage === 'ta' ? 'தமிழ்' : 'English'}</span>
                </button>

                <button
                  onClick={() => setShowVirtue(!showVirtue)}
                  className="text-xs text-secondary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                  <span>{showVirtue ? (isTamil ? 'சிறப்புகளை மறைக்க' : 'Hide Virtues') : (isTamil ? 'சிறப்புகள் & ஆதாரம்' : 'View Virtues & Hadith')}</span>
                </button>
              </div>
            </div>

            {/* Arabic Script */}
            <p 
              className="text-2xl sm:text-3xl text-on-surface text-right leading-relaxed py-2 select-none" 
              style={{ fontFamily: arabicFontFamily }}
              dir="rtl"
            >
              {activeDhikr.arabic}
            </p>

            {/* Translation Text (Contextual according to single toggle) */}
            <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
              "{virtueLanguage === 'ta' ? activeDhikr.translationTa : activeDhikr.translationEn}"
            </p>

            {/* Expandable Authentic Virtue & Reference */}
            {showVirtue && (
              <div className="pt-3 mt-2 border-t border-outline-variant/25 text-xs text-on-surface space-y-2 bg-surface-container-high/60 p-4 rounded-2xl animate-fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/15">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-label-caps flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{virtueLanguage === 'ta' ? 'ஹதீஸ் சிறப்புகள் & ஆதாரம்' : 'Hadith Virtues & Reference'}</span>
                  </span>

                  <span className="text-[10px] text-outline font-semibold">
                    {virtueLanguage === 'ta' ? 'தமிழ் விளக்கம்' : 'English Translation'}
                  </span>
                </div>

                {/* Virtue Text & Reference */}
                <div className="space-y-1">
                  <p className="font-medium leading-relaxed">
                    <span className="text-primary font-bold">{virtueLanguage === 'ta' ? 'ஆன்மீகச் சிறப்பு: ' : 'Virtue: '}</span>
                    {virtueLanguage === 'ta' ? activeDhikr.virtueTa : activeDhikr.virtueEn}
                  </p>
                  <p className="text-[11px] text-outline font-semibold">
                    <span>{virtueLanguage === 'ta' ? 'ஆதாரம்: ' : 'Reference: '}</span>
                    {virtueLanguage === 'ta' ? activeDhikr.referenceTa : activeDhikr.reference}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sunnah Post-Prayer Sequence Navigation */}
          {['subhanallah', 'alhamdulillah', 'allahu_akbar'].includes(activeDhikrId) && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/20 text-xs shadow-xs">
              <span className="text-on-surface font-semibold">
                {isTamil ? 'சுன்னத் தொடர் முறை (33 - 33 - 34)' : 'Sunnah Post-Salah Sequence (33 - 33 - 34)'}
              </span>
              <button
                onClick={nextInSequence}
                className="text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{isTamil ? 'அடுத்த திக்ர்' : 'Next in Sequence'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* RIGHT: TACTILE CIRCULAR COUNTER & TARGET CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-6 shadow-md flex flex-col items-center justify-center">
          
          {/* Circular Counter Dial */}
          <div 
            onClick={handleTap}
            className={`relative w-52 h-52 sm:w-56 sm:h-56 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 shadow-xl ${
              isCompletedAnim 
                ? 'ring-8 ring-primary/40 scale-105 transition-all duration-300' 
                : 'hover:shadow-2xl'
            }`}
          >
            {/* SVG Radial Track & Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-surface-container-highest"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={`url(#${gradientId})`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-150"
              />
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Count & Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-on-surface tracking-tight font-headline">
                {sessionCount}
              </span>
              
              <span className="text-xs font-semibold text-outline mt-0.5">
                {target > 0 ? `${isTamil ? 'இலக்கு' : 'Target'}: ${target}` : (isTamil ? 'தடையற்றது' : 'Free Count')}
              </span>

              {sessionLaps > 0 && (
                <span className="mt-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                  {isTamil ? `${sessionLaps} சுற்றுகள் நிறைவு` : `Set ${sessionLaps} Done`}
                </span>
              )}
            </div>

            {/* Completed Stamp Overlay */}
            {isCompletedAnim && (
              <div className="absolute inset-0 rounded-full bg-primary/20 backdrop-blur-xs flex items-center justify-center animate-pulse">
                <div className="p-3 rounded-full bg-primary text-on-primary shadow-lg">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Target Selectors & Reset Bar */}
          <div className="flex items-center gap-3 w-full max-w-xs justify-between">
            {/* Target Selectors */}
            <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-2xl border border-outline-variant/20">
              {targetOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    target === t
                      ? 'bg-surface-container-highest text-primary shadow-xs border border-primary/30'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {t === 0 ? '∞' : t}
                </button>
              ))}
            </div>

            {/* Decrement & Reset Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={decrementCount}
                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer shadow-xs"
                title="Undo 1 count"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={resetSessionCount}
                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer shadow-xs"
                title="Reset active count"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tap Prompt Hint */}
          <p className="text-xs text-outline text-center">
            {isTamil ? 'எண்ணிக்கையை அதிகரிக்க வட்டத்தைத் தொடவும்' : 'Tap the circular dial or press spacebar to count'}
          </p>

          {/* Today & Lifetime Stats for Active Dhikr */}
          <div className="w-full pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
              <span className="text-[10px] text-outline uppercase font-label-caps block">
                {isTamil ? 'இன்றைய திக்ர்' : "Today's Count"}
              </span>
              <span className="text-base font-extrabold text-on-surface">
                {todayDhikrCounts[activeDhikrId] || 0}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
              <span className="text-[10px] text-outline uppercase font-label-caps block">
                {isTamil ? 'மொத்த திக்ர்' : 'All-time Lifetime'}
              </span>
              <span className="text-base font-extrabold text-primary">
                {lifetimeDhikrCounts[activeDhikrId] || 0}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 🌟 3. DUAL PROGRESS & GOAL CUSTOMIZER */}
      <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card A: Daily Progress (Calculated across all Dhikrs) */}
          <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/25 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-on-surface">
                <Target className="w-4 h-4 text-primary" />
                <span>{isTamil ? 'தினசரி முன்னேற்றம்' : 'Daily Progress'}</span>
              </div>
              <div className="font-extrabold text-primary">
                <span>{totalActualCount}</span>
                <span className="text-outline font-normal"> / {totalTargetSum}</span>
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px]">
                  {dailyProgressPercent}%
                </span>
              </div>
            </div>

            <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Card B: All Dhikr Completion Rate */}
          <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/25 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isTamil ? 'அனைத்து திக்ர் இலக்குகள் நிறைவு' : 'All-Dhikr Goals Met'}</span>
              </div>
              <div className="font-extrabold text-emerald-500">
                <span>{completedCount}</span>
                <span className="text-outline font-normal"> / {totalPresets} {isTamil ? 'திக்ருகள்' : 'Dhikrs'}</span>
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px]">
                  {Math.round((completedCount / totalPresets) * 100)}%
                </span>
              </div>
            </div>

            <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalPresets) * 100}%` }}
              />
            </div>
          </div>

        </div>

        {allDhikrsDone && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-500 font-bold">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {isTamil 
                ? 'மாஷா அல்லாஹ்! இன்றைய அனைத்து திக்ர் இலக்குகளையும் வெற்றிகரமாக நிறைவு செய்துள்ளீர்கள்!' 
                : 'Māshā’Allāh! You have completed the daily target for every single Dhikr in the studio!'}
            </span>
          </div>
        )}

        {/* Goal Customizer Modal / Tray */}
        {showGoalEditor && (
          <div className="p-4 rounded-2xl bg-surface-container-high/90 border border-primary/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-on-surface">
              <span>{isTamil ? 'அனைத்து திக்ருகளுக்குமான தினசரி இலக்கை அமைக்கவும்' : 'Set Target for All Dhikrs'}</span>
              <button 
                onClick={() => setShowGoalEditor(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-outline font-semibold">
                {isTamil ? 'அனைத்து திக்ர்களுக்கும்:' : 'Apply to all dhikrs:'}
              </span>
              {[33, 100, 300].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    handleSaveGoal(preset)
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    dailyGoal === preset 
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-highest border-outline-variant/30 text-on-surface'
                  }`}
                >
                  {preset}x
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-outline font-semibold">{isTamil ? 'இலக்கு' : 'Target'}:</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  className="w-20 px-2 py-1 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface focus:outline-none focus:border-primary text-center"
                />
                <button
                  onClick={() => handleSaveGoal(parseInt(customGoalInput, 10) || 100)}
                  className="px-3 py-1 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                >
                  {isTamil ? 'அனைத்திற்கும் சேமி' : 'Set All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 4. ALL DHIKRS LIBRARY (SHOWING ALL 8 PRESETS - NO CATEGORY TABS) */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-outline font-label-caps">
            {isTamil ? 'அனைத்து திக்ர் பட்டியல் & இலக்குகள்' : 'All Dhikr Library & Targets'}
          </h4>
          <span className="text-xs text-primary font-semibold">
            {completedCount} / {totalPresets} {isTamil ? 'நிறைவு' : 'completed'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DHIKR_PRESETS.map((dhikr) => {
            const currentToday = todayDhikrCounts[dhikr.id] || 0
            const currentTarget = dhikrTargets[dhikr.id] || dhikr.defaultTarget || 33
            const isDone = currentToday >= currentTarget && currentTarget > 0

            return (
              <div
                key={dhikr.id}
                onClick={() => handleSelectDhikr(dhikr)}
                className={`p-3.5 rounded-2xl flex items-center justify-between border cursor-pointer transition duration-200 ${
                  activeDhikrId === dhikr.id
                    ? 'bg-secondary/15 border-secondary/40 text-on-surface shadow-xs ring-1 ring-secondary/30'
                    : isDone
                    ? 'bg-primary/10 border-primary/30 text-on-surface'
                    : 'bg-surface-container/60 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                <div className="truncate min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold truncate text-on-surface">
                      {dhikr.transliteration}
                    </p>
                    {isDone && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-outline truncate mt-0.5">
                    {virtueLanguage === 'ta' ? dhikr.translationTa : dhikr.translationEn}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-extrabold block ${isDone ? 'text-emerald-500' : 'text-primary'}`}>
                    {currentToday} / {currentTarget}
                  </span>
                  <span className="text-[10px] text-outline">
                    {isDone ? (isTamil ? 'நிறைவு' : 'Target Done') : `${currentTarget - currentToday} left`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
