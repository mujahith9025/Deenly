import React, { useEffect, useState, useCallback, useId, useRef } from 'react'
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight, 
  Minus, 
  Sparkles,
  Check
} from 'lucide-react'
import { useTasbihStore } from '../store/useTasbihStore'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { triggerHapticMedium, triggerHapticSuccess, triggerHapticLight } from '../lib/haptics'

// Gentle Web Audio chime for count and completion
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

interface TasbihFocusModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TasbihFocusModal: React.FC<TasbihFocusModalProps> = ({ isOpen, onClose }) => {
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
    soundEnabled,
    hapticsEnabled,
    sessionCount,
    sessionLaps,
    setActiveDhikrId,
    setTarget,
    toggleSound,
    toggleHaptics,
    incrementCount,
    decrementCount,
    resetSessionCount,
    getActiveDhikr,
    getAllDhikrs,
  } = useTasbihStore()

  const [isCompletedAnim, setIsCompletedAnim] = useState<boolean>(false)
  const [tapEffect, setTapEffect] = useState<{ x: number; y: number; id: number } | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const activeDhikr = getActiveDhikr()
  const allDhikrs = getAllDhikrs()
  const targetOptions = [33, 100, 300, 0] // 0 means Free/Unlimited

  // Screen Wake Lock API to prevent display from sleeping during Dhikr session
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
          if (isMounted) {
            wakeLockRef.current = lock
          } else {
            lock.release()
          }
        }
      } catch {
        // WakeLock unsupported or permission denied
      }
    }

    requestWakeLock()

    return () => {
      isMounted = false
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [isOpen])

  // Handle Incremental Tap anywhere on the screen
  const handleScreenTap = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'clientX' in e && e.clientX && e.clientY) {
      setTapEffect({ x: e.clientX, y: e.clientY, id: Date.now() })
    }

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

  // Keyboard Navigation: Spacebar / ArrowUp to count, Escape to close, ArrowDown to decrement
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault()
        handleScreenTap()
      } else if (e.key === 'ArrowDown' || e.key === 'Backspace') {
        e.preventDefault()
        triggerHapticLight()
        decrementCount()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleScreenTap, decrementCount, onClose])

  if (!isOpen) return null

  // Radial Progress
  const progressPercent = target > 0 ? Math.min(100, (sessionCount / target) * 100) : 100
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  // Switch to Prev / Next Dhikr across all Dhikrs (presets + custom)
  const currentIndex = allDhikrs.findIndex((d) => d.id === activeDhikrId)
  const handlePrevDhikr = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHapticLight()
    const nextIdx = (currentIndex - 1 + allDhikrs.length) % allDhikrs.length
    setActiveDhikrId(allDhikrs[nextIdx].id)
  }

  const handleNextDhikr = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHapticLight()
    const nextIdx = (currentIndex + 1) % allDhikrs.length
    setActiveDhikrId(allDhikrs[nextIdx].id)
  }

  return (
    <div 
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#090d16] via-[#05070c] to-[#020305] text-white flex flex-col justify-between p-4 sm:p-8 select-none backdrop-blur-2xl animate-fade-in cursor-pointer overflow-hidden"
    >
      {/* Background Subtle Breathing Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Ripple Animation on Tap */}
      {tapEffect && (
        <div 
          key={tapEffect.id}
          className="absolute w-20 h-20 rounded-full bg-primary/20 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{ left: tapEffect.x, top: tapEffect.y }}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP BAR: DHIKR SWITCHER & SETTING TOGGLES                              */}
      {/* ========================================================================= */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-between gap-3 relative z-10 shrink-0"
      >
        {/* Left: Prev / Next Dhikr Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
          <button
            onClick={handlePrevDhikr}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer active:scale-95"
            title="Previous Dhikr"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <span className="text-xs sm:text-sm font-bold px-2 truncate max-w-[120px] sm:max-w-[200px]">
            {activeDhikr.transliteration}
          </span>

          <button
            onClick={handleNextDhikr}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer active:scale-95"
            title="Next Dhikr"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right: Sound, Haptics, Target Presets, and Close */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Target Selectors */}
          <div className="hidden xs:flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/15">
            {targetOptions.map((t) => (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation()
                  triggerHapticLight()
                  setTarget(t)
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  target === t
                    ? 'bg-primary text-white shadow-xs border border-primary/50'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {t === 0 ? '∞' : t}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              triggerHapticLight()
              toggleSound()
            }}
            className={`p-2 sm:p-2.5 rounded-2xl border transition cursor-pointer ${
              soundEnabled 
                ? 'bg-white/15 text-primary border-primary/40 shadow-xs' 
                : 'bg-white/5 text-white/40 border-white/10'
            }`}
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Haptics Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              triggerHapticLight()
              toggleHaptics()
            }}
            className={`p-2 sm:p-2.5 rounded-2xl border transition cursor-pointer ${
              hapticsEnabled 
                ? 'bg-white/15 text-emerald-400 border-emerald-500/40 shadow-xs' 
                : 'bg-white/5 text-white/40 border-white/10'
            }`}
            title={hapticsEnabled ? 'Disable Vibration' : 'Enable Vibration'}
          >
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Exit Focus Mode Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              triggerHapticLight()
              onClose()
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/20 border border-white/20 hover:border-rose-500/50 text-white hover:text-rose-400 transition cursor-pointer shadow-md active:scale-95"
            title={isTamil ? 'முழுத்திரையிலிருந்து வெளியேற' : 'Exit Focus Mode'}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER: SPIRITUAL ARABIC & MASSIVE BLIND-TAP COUNTER DIAL              */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 sm:space-y-8 relative z-10">
        
        {/* Arabic Calligraphy & Translation */}
        <div className="text-center space-y-2 max-w-xl px-4 pointer-events-none">
          <p 
            className="text-3xl sm:text-5xl md:text-6xl text-white font-bold leading-relaxed drop-shadow-md"
            style={{ fontFamily: arabicFontFamily }}
            dir="rtl"
          >
            {activeDhikr.arabic}
          </p>

          <p className="text-sm sm:text-lg text-primary font-bold tracking-wide">
            {activeDhikr.transliteration}
          </p>

          <p className="text-xs sm:text-sm text-white/70 italic line-clamp-2">
            "{isTamilTranslation ? activeDhikr.translationTa : activeDhikr.translationEn}"
          </p>
        </div>

        {/* Massive Circular Pulse Counter */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="text-white/10"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active Progress Ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={`url(#${gradientId})`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-150"
            />
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-6xl sm:text-8xl font-black text-white tracking-tight font-mono drop-shadow-lg">
              {sessionCount}
            </span>

            <span className="text-xs sm:text-sm font-semibold text-white/70 mt-1">
              {target > 0 ? `${isTamil ? 'இலக்கு' : 'Target'}: ${target}` : (isTamil ? 'தடையற்றது' : 'Free Count')}
            </span>

            {sessionLaps > 0 && (
              <span className="mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-bold">
                {isTamil ? `${sessionLaps} சுற்றுகள் நிறைவு` : `Set ${sessionLaps} Done`}
              </span>
            )}
          </div>

          {/* Target Reached Burst Overlay */}
          {isCompletedAnim && (
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 backdrop-blur-xs flex items-center justify-center animate-pulse">
              <div className="p-4 rounded-full bg-emerald-500 text-white shadow-2xl scale-110 transition-transform">
                <Check className="w-12 h-12 stroke-[3]" />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM CONTROLS & SUBTLE BLIND-TAP GUIDANCE                            */}
      {/* ========================================================================= */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-between gap-4 relative z-10 shrink-0 max-w-xl mx-auto"
      >
        {/* Decrement / Undo Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            triggerHapticLight()
            decrementCount()
          }}
          className="p-3 sm:p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          title="Undo 1 count"
        >
          <Minus className="w-4 h-4" />
          <span className="hidden xs:inline">{isTamil ? 'குறைக்க' : 'Undo'}</span>
        </button>

        {/* Center Guidance Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] sm:text-xs font-medium text-center">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
          <span>
            {isTamil 
              ? 'திரையில் எங்கு வேண்டுமானாலும் தொட்டு திக்ர் செய்க' 
              : 'Blind Tap: Tap anywhere on screen to count'}
          </span>
        </div>

        {/* Reset Active Count Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            triggerHapticLight()
            resetSessionCount()
          }}
          className="p-3 sm:p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          title="Reset session count"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden xs:inline">{isTamil ? 'மீட்டமைக்க' : 'Reset'}</span>
        </button>
      </div>

    </div>
  )
}
