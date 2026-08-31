import React, { useCallback, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Check, 
  Target,
  ArrowUpRight,
  Maximize2
} from 'lucide-react'
import { useTasbihStore } from '../store/useTasbihStore'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { triggerHapticMedium, triggerHapticSuccess, triggerHapticLight } from '../lib/haptics'
import { TasbihFocusModal } from './TasbihFocusModal'

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

export const DashboardTasbihWidget: React.FC = () => {
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
    sessionCount,
    sessionLaps,
    soundEnabled,
    hapticsEnabled,
    setActiveDhikrId,
    incrementCount,
    resetSessionCount,
    toggleSound,
    getTodayTotalCount,
    getOverallDailyProgress,
    getActiveDhikr,
    getAllDhikrs,
    advanceToNextDhikr,
  } = useTasbihStore()

  const [isCompletedAnim, setIsCompletedAnim] = useState(false)
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
  const activeDhikr = getActiveDhikr()
  const allDhikrs = getAllDhikrs()
  const { totalTargetSum } = getOverallDailyProgress()
  const todayTotal = getTodayTotalCount()
  const displayGoalTarget = totalTargetSum > 0 ? totalTargetSum : dailyGoal
  const displayGoalPercent = Math.min(100, Math.round((todayTotal / Math.max(1, displayGoalTarget)) * 100))

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
        advanceToNextDhikr()
      }, 900)
    }
  }, [incrementCount, soundEnabled, hapticsEnabled, advanceToNextDhikr])

  // Radial Progress
  const progressPercent = target > 0 ? Math.min(100, (sessionCount / target) * 100) : 100
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div id="dashboard-tasbih" className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-5 shadow-md relative overflow-hidden">
      
      {/* 🌟 1. COMPACT HEADER WITH DAILY GOAL SUMMARY & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">
              {isTamil ? 'டிஜிட்டல் தஸ்பீஹ்' : 'Digital Tasbih'}
            </h3>
            <p className="text-[11px] text-on-surface-variant truncate max-w-[200px] sm:max-w-none">
              {isTamilTranslation ? (activeDhikr.transliterationTa || activeDhikr.transliteration) : activeDhikr.transliteration} • {isTamilTranslation ? activeDhikr.translationTa : activeDhikr.translationEn}
            </p>
          </div>
        </div>

        {/* Daily Goal Badge & Controls */}
        <div className="flex items-center gap-2">
          {/* Daily Goal Badge */}
          <div className="px-3 py-1 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-outline text-[11px]">{isTamil ? 'தினசரி இலக்கு' : 'Goal'}:</span>
            <span className="text-on-surface font-extrabold">{todayTotal}/{displayGoalTarget}</span>
            <span className="text-[10px] text-primary font-bold">({displayGoalPercent}%)</span>
          </div>

          {/* 📱 Full-Screen Blind Tap Focus Mode Button with Text */}
          <button
            onClick={() => {
              triggerHapticLight()
              setIsFocusModalOpen(true)
            }}
            className="px-2.5 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/35 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
            title={isTamil ? 'முழுத்திரை திக்ர் (Blind Tap Mode)' : 'Full-Screen Blind Tap Focus Mode'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="font-bold">{isTamil ? 'முழுத்திரை' : 'Focus Mode'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              soundEnabled 
                ? 'bg-surface-container-high text-primary border-primary/30' 
                : 'bg-surface-container text-outline border-outline-variant/30 opacity-60'
            }`}
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 🌟 2. INTERACTIVE CIRCULAR DIAL & ACTIVE DHIKR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* LEFT: CIRCULAR COUNTING DIAL (5 COLS) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div 
            onClick={handleTap}
            className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 shadow-lg ${
              isCompletedAnim 
                ? 'ring-6 ring-primary/40 scale-105 transition-all duration-300' 
                : 'hover:shadow-xl'
            }`}
          >
            {/* SVG Radial Track & Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
              <circle
                cx="75"
                cy="75"
                r={radius}
                className="text-surface-container-highest"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke={`url(#${gradientId})`}
                strokeWidth="9"
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

            {/* Center Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-on-surface tracking-tight font-headline">
                {sessionCount}
              </span>
              <span className="text-[11px] font-semibold text-outline">
                {target > 0 ? `/ ${target}` : '∞'}
              </span>
              {sessionLaps > 0 && (
                <span className="mt-0.5 px-1.5 py-0.2 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                  {isTamil ? `${sessionLaps} சுற்றுகள்` : `Set ${sessionLaps}`}
                </span>
              )}
            </div>

            {/* Completed Overlay */}
            {isCompletedAnim && (
              <div className="absolute inset-0 rounded-full bg-primary/25 backdrop-blur-xs flex items-center justify-center animate-pulse">
                <div className="p-2 rounded-full bg-primary text-on-primary shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <button
              onClick={resetSessionCount}
              className="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-outline hover:text-on-surface text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isTamil ? 'மீட்டமை' : 'Reset'}</span>
            </button>

            <button
              onClick={() => {
                triggerHapticLight()
                setIsFocusModalOpen(true)
              }}
              className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Maximize2 className="w-3 h-3" />
              <span>{isTamil ? 'முழுத்திரை திக்ர்' : 'Focus Mode'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: DHIKR SCRIPT & QUICK SWITCHER + EXPLORE HUB LINK (7 COLS) */}
        <div className="md:col-span-7 space-y-3.5">
          
          {/* Active Dhikr Arabic Banner */}
          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5">
            <p 
              className="text-xl sm:text-2xl text-on-surface text-right leading-relaxed select-none" 
              style={{ fontFamily: arabicFontFamily }}
              dir="rtl"
            >
              {activeDhikr.arabic}
            </p>
            <p className="text-xs text-on-surface-variant italic">
              "{isTamilTranslation ? activeDhikr.translationTa : activeDhikr.translationEn}"
            </p>
          </div>

          {/* Quick Dhikr Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {allDhikrs.map((dhikr) => (
              <button
                key={dhikr.id}
                onClick={() => setActiveDhikrId(dhikr.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  activeDhikrId === dhikr.id
                    ? 'bg-secondary/15 text-secondary border-secondary/40 shadow-xs'
                    : 'bg-surface-container/50 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                }`}
              >
                {isTamilTranslation ? (dhikr.transliterationTa || dhikr.transliteration) : dhikr.transliteration}
              </button>
            ))}
          </div>

          {/* Direct Link to Detailed Explore Section */}
          <Link
            to="/explore?cat=dhikr"
            className="w-full py-2.5 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest border border-primary/25 text-primary text-xs font-bold flex items-center justify-between transition cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <span>
                {isTamil 
                  ? 'முழு தஸ்பீஹ் அரங்கம் & தினசரி இலக்குகளைக் காண்க' 
                  : 'Open Full Tasbih Studio, Virtues & Goals'
                }
              </span>
            </div>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

        </div>

      </div>

      {/* 📱 Full-Screen Blind-Tap Focus Modal */}
      <TasbihFocusModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
      />

    </div>
  )
}
