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
  Smartphone
} from 'lucide-react'
import { DHIKR_PRESETS, type DhikrItem } from '../lib/dhikrData'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { getLocalDateString } from '../lib/hasanatEngine'

// Synthesized gentle Web Audio chime for count and completion
function playChime(isCompletion = false) {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    
    if (isCompletion) {
      // Golden double completion harmonic chime
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
      // Subtle single tap click
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
    // AudioContext blocked or not supported
  }
}

export const DigitalTasbihEngine: React.FC = () => {
  const gradientId = useId()
  const user = useAuthStore((state) => state.user)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const isTamilTranslation = appLanguage === 'ta' || user?.preferredTranslation === 'tamil'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const [activeDhikrId, setActiveDhikrId] = useState<string>('subhanallah')
  const [count, setCount] = useState<number>(0)
  const [target, setTarget] = useState<number>(33)
  const [laps, setLaps] = useState<number>(0)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true)
  const [showVirtue, setShowVirtue] = useState<boolean>(false)
  const [isCompletedAnim, setIsCompletedAnim] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const todayDateStr = getLocalDateString(new Date())
  const [todayTotalDhikr, setTodayTotalDhikr] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const raw = localStorage.getItem(`deenly_tasbih_daily_${todayDateStr}`)
    return raw ? parseInt(raw, 10) || 0 : 0
  })

  // Load active Dhikr details
  const activeDhikr = DHIKR_PRESETS.find((d) => d.id === activeDhikrId) || DHIKR_PRESETS[0]

  // Filtered Dhikr presets
  const filteredPresets = activeCategory === 'all' 
    ? DHIKR_PRESETS 
    : DHIKR_PRESETS.filter((d) => d.category === activeCategory)

  // Switch Dhikr
  const handleSelectDhikr = (dhikr: DhikrItem) => {
    setActiveDhikrId(dhikr.id)
    setCount(0)
    setTarget(dhikr.defaultTarget)
    setLaps(0)
    setIsCompletedAnim(false)
  }

  // Handle Incremental Tap
  const handleTap = useCallback(() => {
    const nextCount = count + 1
    const nextTodayTotal = todayTotalDhikr + 1

    // Sound
    if (soundEnabled) {
      playChime(target > 0 && nextCount >= target)
    }

    // Haptics
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (target > 0 && nextCount >= target) {
          navigator.vibrate([40, 80, 40])
        } else {
          navigator.vibrate(25)
        }
      } catch {
        // ignore
      }
    }

    // Today total update
    setTodayTotalDhikr(nextTodayTotal)
    try {
      localStorage.setItem(`deenly_tasbih_daily_${todayDateStr}`, nextTodayTotal.toString())
    } catch {
      // ignore
    }

    // Check if target hit
    if (target > 0 && nextCount >= target) {
      setCount(target)
      setLaps((prev) => prev + 1)
      setIsCompletedAnim(true)
      setTimeout(() => {
        setIsCompletedAnim(false)
        setCount(0)
      }, 1200)
    } else {
      setCount(nextCount)
    }
  }, [count, target, todayTotalDhikr, soundEnabled, hapticsEnabled, todayDateStr])

  // Reset count
  const handleReset = () => {
    setCount(0)
    setLaps(0)
    setIsCompletedAnim(false)
  }

  // Target options
  const targetOptions = [33, 100, 300, 0] // 0 means Free/Unlimited

  // Calculate Progress Percent
  const progressPercent = target > 0 ? Math.min(100, (count / target) * 100) : 100

  // SVG Circular parameters
  const radius = 68
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
    <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-6 shadow-md relative overflow-hidden">
      
      {/* 🌟 1. SECTION HEADER WITH CONTROLS & DAILY TOTAL */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span>{isTamil ? 'டிஜிட்டல் தஸ்பீஹ் & தினசரி திக்ர்' : 'Digital Tasbih & Daily Dhikr'}</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {isTamil ? 'இறை நினைவூட்டல் & தொழுகைக்குப் பின் சுன்னத் திக்ருகள்' : 'Prophetic remembrance and Sunnah post-prayer supplications'}
            </p>
          </div>
        </div>

        {/* Action Controls & Total Today Count */}
        <div className="flex items-center gap-2">
          {/* Today Count Badge */}
          <div className="px-3 py-1.5 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-primary text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>{isTamil ? 'இன்று ஓதியவை' : 'Today'}:</span>
            <span className="text-on-surface font-extrabold">{todayTotalDhikr}</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              soundEnabled 
                ? 'bg-surface-container-high text-primary border-primary/30' 
                : 'bg-surface-container text-outline border-outline-variant/30 opacity-60'
            }`}
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptics Toggle */}
          <button
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
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

      {/* 🌟 2. CATEGORY PILLS FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', labelEn: 'All Dhikr', labelTa: 'அனைத்து திக்ர்' },
          { id: 'after_prayer', labelEn: 'After Salah (Sunnah)', labelTa: 'தொழுகைக்குப் பின்' },
          { id: 'forgiveness', labelEn: 'Istighfar & Forgiveness', labelTa: 'பாவமன்னிப்பு' },
          { id: 'daily', labelEn: 'Daily Praise', labelTa: 'தினசரி துதி' },
          { id: 'salawat', labelEn: 'Durood / Salawat', labelTa: 'ஸலவாத்' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
            }`}
          >
            {isTamil ? cat.labelTa : cat.labelEn}
          </button>
        ))}
      </div>

      {/* 🌟 3. MAIN INTERACTIVE TASBIH & DHIKR DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* LEFT / CENTER: DHIKR SCRIPT, TRANSLATIONS & VIRTUES (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Dhikr Script Box */}
          <div className="p-5 rounded-2xl bg-surface-container/70 border border-outline-variant/30 space-y-3 relative">
            
            {/* Header with Preset Selector Dropdown / Pills */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-label-caps">
                {activeDhikr.transliteration}
              </span>
              
              <button
                onClick={() => setShowVirtue(!showVirtue)}
                className="text-[11px] text-secondary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showVirtue ? (isTamil ? 'மறைக்க' : 'Hide Virtue') : (isTamil ? 'சிறப்புகள் & ஆதாரம்' : 'Virtue & Reference')}</span>
              </button>
            </div>

            {/* Arabic Script */}
            <p 
              className="text-2xl sm:text-3xl text-on-surface text-right leading-relaxed py-2 select-none" 
              style={{ fontFamily: arabicFontFamily }}
              dir="rtl"
            >
              {activeDhikr.arabic}
            </p>

            {/* Translation Text */}
            <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
              "{isTamilTranslation ? activeDhikr.translationTa : activeDhikr.translationEn}"
            </p>

            {/* Expandable Authentic Virtue & Reference */}
            {showVirtue && (
              <div className="pt-3 mt-2 border-t border-outline-variant/25 text-xs text-on-surface space-y-1 bg-surface-container-high/60 p-3 rounded-xl">
                <p className="font-medium leading-relaxed">
                  <span className="text-primary font-bold">{isTamil ? 'ஆன்மீகச் சிறப்பு' : 'Virtue'}: </span>
                  {isTamil ? activeDhikr.virtueTa : activeDhikr.virtueEn}
                </p>
                <p className="text-[11px] text-outline font-semibold">
                  <span>{isTamil ? 'ஆதாரம்' : 'Reference'}: </span>
                  {isTamil ? activeDhikr.referenceTa : activeDhikr.reference}
                </p>
              </div>
            )}
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredPresets.map((dhikr) => (
              <button
                key={dhikr.id}
                onClick={() => handleSelectDhikr(dhikr)}
                className={`px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border flex items-center gap-2 ${
                  activeDhikrId === dhikr.id
                    ? 'bg-secondary/15 text-secondary border-secondary/40 shadow-sm'
                    : 'bg-surface-container/60 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                }`}
              >
                <span>{dhikr.transliteration}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container-high text-outline">
                  {dhikr.defaultTarget}x
                </span>
              </button>
            ))}
          </div>

          {/* Sunnah Post-Prayer Sequence Prompt */}
          {['subhanallah', 'alhamdulillah', 'allahu_akbar'].includes(activeDhikrId) && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 text-xs">
              <span className="text-on-surface-variant font-medium">
                {isTamil ? 'சுன்னத் தொடர் முறை (33 - 33 - 34)' : 'Sunnah Post-Salah Sequence (33 - 33 - 34)'}
              </span>
              <button
                onClick={nextInSequence}
                className="text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{isTamil ? 'அடுத்த திக்ர்' : 'Next Dhikr'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* RIGHT: TACTILE CIRCULAR COUNTER & TARGET CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          
          {/* Circular Counter Dial */}
          <div 
            onClick={handleTap}
            className={`relative w-48 h-48 sm:w-52 sm:h-52 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 shadow-xl ${
              isCompletedAnim 
                ? 'ring-8 ring-primary/40 scale-105 transition-all duration-300' 
                : 'hover:shadow-2xl'
            }`}
          >
            {/* SVG Radial Track & Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-surface-container-highest"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Arc */}
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
                className="transition-all duration-200"
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
              <span className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight font-headline">
                {count}
              </span>
              
              <span className="text-xs font-semibold text-outline mt-0.5">
                {target > 0 ? `${isTamil ? 'இலக்கு' : 'Target'}: ${target}` : (isTamil ? 'தடையற்றது' : 'Free Count')}
              </span>

              {laps > 0 && (
                <span className="mt-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                  {isTamil ? `${laps} சுற்றுகள்` : `Set ${laps}`}
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
                  onClick={() => {
                    setTarget(t)
                    setCount(0)
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    target === t
                      ? 'bg-surface-container-highest text-primary shadow-xs border border-primary/30'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {t === 0 ? '∞' : t}
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold"
              title="Reset Count"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isTamil ? 'மீட்டமை' : 'Reset'}</span>
            </button>
          </div>

          {/* Tap Prompt Hint */}
          <p className="text-[11px] text-outline text-center">
            {isTamil ? 'எண்ணிக்கையை அதிகரிக்க வட்டத்தைத் தொடவும்' : 'Tap the circular dial to increment your count'}
          </p>

        </div>

      </div>

    </div>
  )
}
