import React, { useEffect, useState, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Bookmark, 
  Share2, 
  Type, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Check, 
  Loader2, 
  Clock, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useReadingStore } from '../store/useReadingStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  formatTimer, 
  calculateJuzProgress, 
  formatDurationHuman, 
  type SessionMetrics 
} from '../lib/hasanatEngine'
import { ScreenPlaceholder } from '../components/common/ScreenPlaceholder'

export const ReadingScreen: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // State
  const [showFullView, setShowFullView] = useState(true)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [completedSessionData, setCompletedSessionData] = useState<SessionMetrics | null>(null)
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)
  const currentSurah = useReadingStore((state) => state.currentSurah)
  const isLoadingSurah = useReadingStore((state) => state.isLoadingSurah)
  const fontSize = useReadingStore((state) => state.fontSize)
  const setFontSize = useReadingStore((state) => state.setFontSize)
  const translationLanguage = useReadingStore((state) => state.translationLanguage)
  const setTranslationLanguage = useReadingStore((state) => state.setTranslationLanguage)
  const loadSurah = useReadingStore((state) => state.loadSurah)
  const setCurrentPosition = useReadingStore((state) => state.setCurrentPosition)

  // Auth & Session
  const activeSession = useReadingStore((state) => state.activeSession)
  const startSession = useReadingStore((state) => state.startSession)
  const tickTimer = useReadingStore((state) => state.tickTimer)
  const markAyahRead = useReadingStore((state) => state.markAyahRead)
  const finishSession = useReadingStore((state) => state.finishSession)

  // Initialize Surah and query params
  useEffect(() => {
    const querySurah = searchParams.get('surah')
    const queryAyah = searchParams.get('ayah')

    if (querySurah) {
      const sNum = parseInt(querySurah, 10)
      const aNum = queryAyah ? parseInt(queryAyah, 10) : 1
      if (sNum >= 1 && sNum <= 114) {
        setCurrentPosition(sNum, aNum)
        loadSurah(sNum)
        startSession()
        return
      }
    }

    loadSurah(currentSurahNumber || 1)
    startSession()
  }, [searchParams, currentSurahNumber, loadSurah, startSession, setCurrentPosition])

  // Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer()
    }, 1000)
    return () => clearInterval(timer)
  }, [tickTimer])

  // Save session on unmount
  useEffect(() => {
    return () => {
      finishSession()
    }
  }, [finishSession])

  // Active Ayah
  const totalAyahs = currentSurah?.numberOfAyahs || 1
  const activeAyahIndex = Math.max(0, Math.min(totalAyahs - 1, (currentAyahNumber || 1) - 1))
  const currentAyah = currentSurah?.ayahs[activeAyahIndex] || currentSurah?.ayahs[0]
  const isCurrentAyahRead = currentAyah ? activeSession.readAyahsInSession.includes(currentAyah.number) : false

  // Audio URL using Mishary Rashid Alafasy 128kbps
  const audioUrl = currentAyah
    ? `https://everyayah.com/data/Alafasy_128kbps/${String(currentSurahNumber).padStart(3, '0')}${String(currentAyah.verseNumberInSurah).padStart(3, '0')}.mp3`
    : ''

  // Audio Play / Pause
  const togglePlayAudio = () => {
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => {
          console.warn('Audio playback error:', e)
          setIsPlayingAudio(false)
        })
    }
  }

  // When Ayah changes, pause audio
  useEffect(() => {
    setIsPlayingAudio(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [currentSurahNumber, currentAyahNumber])

  // Juz Progress Calculations
  const juzProgress = calculateJuzProgress(currentSurahNumber || 1, currentAyahNumber || 1)

  // Navigation: Next & Mark Read
  const handleMarkAndNext = () => {
    if (!currentAyah || !currentSurah) return

    const earned = markAyahRead(currentAyah)
    if (earned > 0) {
      setFloatingHasanat({ amount: earned, id: Date.now() })
      setTimeout(() => setFloatingHasanat(null), 1800)
    }

    // Advance to next Ayah or next Surah
    if (currentAyah.verseNumberInSurah < currentSurah.numberOfAyahs) {
      const nextAyahNum = currentAyah.verseNumberInSurah + 1
      const nextAyahObj = currentSurah.ayahs[nextAyahNum - 1]
      setCurrentPosition(
        currentSurahNumber,
        nextAyahNum,
        nextAyahObj?.page || currentAyah.page,
        nextAyahObj?.juz || currentAyah.juz
      )
    } else if (currentSurahNumber < 114) {
      loadSurah(currentSurahNumber + 1)
      setCurrentPosition(currentSurahNumber + 1, 1)
    }
  }

  // Navigation: Previous
  const handlePrevAyah = () => {
    if (!currentSurah) return

    if (currentAyahNumber > 1) {
      const prevAyahNum = currentAyahNumber - 1
      const prevAyahObj = currentSurah.ayahs[prevAyahNum - 1]
      setCurrentPosition(
        currentSurahNumber,
        prevAyahNum,
        prevAyahObj?.page,
        prevAyahObj?.juz
      )
    } else if (currentSurahNumber > 1) {
      const prevSurahMeta = SURAH_METADATA.find((s) => s.number === currentSurahNumber - 1)
      const lastAyahOfPrev = prevSurahMeta?.numberOfAyahs || 1
      loadSurah(currentSurahNumber - 1)
      setCurrentPosition(currentSurahNumber - 1, lastAyahOfPrev)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleMarkAndNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevAyah()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentAyah, currentSurah, currentAyahNumber, currentSurahNumber])

  const handleFinishSession = () => {
    const metrics = finishSession()
    if (metrics) {
      setCompletedSessionData(metrics)
    }
  }

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = parseInt(e.target.value, 10)
    if (num >= 1 && num <= 114) {
      loadSurah(num)
      setCurrentPosition(num, 1)
    }
  }

  const handleAyahJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = parseInt(e.target.value, 10)
    if (currentSurah && num >= 1 && num <= currentSurah.numberOfAyahs) {
      const targetAyah = currentSurah.ayahs[num - 1]
      setCurrentPosition(currentSurahNumber, num, targetAyah?.page, targetAyah?.juz)
    }
  }

  const handleShareAyah = () => {
    if (!currentAyah || !currentSurah) return
    const textToShare = `"${currentAyah.arabicText}"\n\n${currentAyah.translations[translationLanguage] || currentAyah.translations['en']}\n— Surah ${currentSurah.name} (${currentSurah.number}:${currentAyah.verseNumberInSurah}) via Deenly`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    }
  }

  const surahProgressPercent = Math.round(((currentAyahNumber || 1) / totalAyahs) * 100)

  return (
    <div className="space-y-6 pb-28 relative max-w-4xl mx-auto">
      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          onError={() => setIsPlayingAudio(false)}
        />
      )}

      {/* Floating Animated Hasanat Popover */}
      {floatingHasanat && (
        <div className="fixed top-24 right-8 z-50 animate-bounce pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-tertiary-container/95 border border-tertiary text-tertiary font-bold text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-tertiary animate-spin" />
            <span>+{floatingHasanat.amount} Hasanat!</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & CHAPTER / AYAH SELECTOR                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">
              {currentSurah ? `${currentSurah.number}. ${currentSurah.name}` : 'Quran Reader'}
            </h1>
            <span className="text-lg md:text-xl font-noto-serif text-primary-fixed-dim">
              {currentSurah?.arabicName}
            </span>
          </div>
          <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
            {currentSurah
              ? `${currentSurah.englishNameTranslation} • ${currentSurah.numberOfAyahs} Ayahs • ${currentSurah.revelationType} • Juz ${currentSurah.startJuz}`
              : 'Loading Surah...'}
          </p>
        </div>

        {/* Dropdown Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Surah Dropdown */}
          <select
            value={currentSurahNumber}
            onChange={handleSurahChange}
            className="bg-surface-container border border-outline-variant/40 rounded-full px-3.5 py-1.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer shadow-sm"
          >
            {SURAH_METADATA.map((s) => (
              <option key={s.number} value={s.number} className="bg-surface-container text-on-surface">
                {s.number}. {s.name} ({s.arabicName})
              </option>
            ))}
          </select>

          {/* Ayah Jump Stepper */}
          {currentSurah && (
            <select
              value={currentAyahNumber || 1}
              onChange={handleAyahJump}
              className="bg-surface-container border border-outline-variant/40 rounded-full px-3 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:border-secondary cursor-pointer shadow-sm"
            >
              {Array.from({ length: currentSurah.numberOfAyahs }, (_, i) => i + 1).map((aNum) => (
                <option key={aNum} value={aNum} className="bg-surface-container text-on-surface">
                  Ayah {aNum} of {currentSurah.numberOfAyahs}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowFullView(!showFullView)}
            className="text-xs px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-outline hover:text-on-surface hover:border-primary transition cursor-pointer"
          >
            {showFullView ? 'Scaffold' : 'Stitch UI'}
          </button>
        </div>
      </div>

      {showFullView ? (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 2. TOP METRICS STRIP (Timer, Hasanat, Juz Progress)                       */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Session Timer */}
            <div className="p-4 rounded-2xl glass-card border border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline font-label-caps">Reading Session</span>
                  <p className="text-xl font-bold font-mono text-on-surface">
                    {formatTimer(activeSession.elapsedSeconds)}
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse font-bold">
                Live
              </span>
            </div>

            {/* Session Hasanat */}
            <div className="p-4 rounded-2xl glass-card border border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline font-label-caps">Hasanat Earned</span>
                  <p className="text-xl font-bold text-tertiary">
                    +{activeSession.sessionHasanat.toLocaleString()} <span className="text-xs text-tertiary/70">pts</span>
                  </p>
                </div>
              </div>
              <span className="text-xs text-outline font-medium">
                {activeSession.sessionVersesRead} verses
              </span>
            </div>

            {/* Juz Progress */}
            <div className="p-4 rounded-2xl glass-card border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-bold text-on-surface">Juz {juzProgress.juzNumber}</span>
                </div>
                <span className="text-xs font-bold text-secondary">{juzProgress.percent}%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary-container h-full rounded-full transition-all duration-500" 
                  style={{ width: `${juzProgress.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Reader Controls Bar: Translation & Font Size */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex-wrap">
            {/* Translation Language Toggle */}
            <div className="flex items-center gap-1.5 bg-surface-container/80 p-1 rounded-full border border-outline-variant/30">
              <button
                onClick={() => setTranslationLanguage('en')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  translationLanguage === 'en'
                    ? 'bg-primary-container text-white shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setTranslationLanguage('ta')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  translationLanguage === 'ta'
                    ? 'bg-primary-container text-white shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Audio Reciter Button */}
            <button
              onClick={togglePlayAudio}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition cursor-pointer shadow-sm ${
                isPlayingAudio
                  ? 'bg-primary text-white border-primary animate-pulse'
                  : 'bg-surface-container hover:bg-surface-container-highest border-outline-variant/40 text-on-surface'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingAudio ? 'Pause Audio' : 'Play Recitation'}</span>
            </button>

            {/* Font Size Controls */}
            <div className="flex items-center gap-2 bg-surface-container/80 px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs">
              <Type className="w-3.5 h-3.5 text-primary" />
              <button
                onClick={() => setFontSize(Math.max(20, fontSize - 2))}
                className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface hover:bg-surface-variant font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono text-[11px] text-on-surface">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface hover:bg-surface-variant font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. CENTER FOCUSED SINGLE-VERSE CARD (Deenly Cosmic Dark Theme)           */}
          {/* ========================================================================= */}
          {isLoadingSurah ? (
            <div className="p-16 text-center space-y-3 glass-card rounded-3xl border border-outline-variant/30">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-on-surface-variant">Loading sacred verses and translations...</p>
            </div>
          ) : currentAyah ? (
            <div className="space-y-4">
              {/* Bismillah Header for Ayah 1 */}
              {currentAyahNumber === 1 && currentSurahNumber !== 9 && (
                <div className="text-center p-6 glass-card rounded-3xl border border-outline-variant/30 shadow-md">
                  <p className="font-noto-serif text-2xl md:text-3xl text-primary-fixed-dim select-none" dir="rtl">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2 font-sans">
                    {translationLanguage === 'ta'
                      ? 'அளவற்ற அருளாளனும், நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் திருப்பெயரால் (துவங்குகிறேன்)'
                      : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
                  </p>
                </div>
              )}

              {/* Main Focused Verse Card */}
              <div className="p-6 md:p-10 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/60 shadow-2xl space-y-6 relative ring-1 ring-primary/20">
                {/* Surah Progress Mini-Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-outline">
                    <span className="font-bold text-on-surface flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-mono text-xs font-bold">
                        {currentAyah.verseNumberInSurah}
                      </span>
                      <span>{currentSurah?.name} — Ayah {currentAyah.verseNumberInSurah} of {totalAyahs}</span>
                    </span>
                    <span className="font-mono font-semibold text-secondary">{surahProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-secondary-container h-full rounded-full transition-all duration-300"
                      style={{ width: `${surahProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Verse Meta Info Bar */}
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-outline font-medium">
                      Juz {currentAyah.juz} • Page {currentAyah.page}
                    </span>
                    {isCurrentAyahRead && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary/30 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Recited in Session</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareAyah}
                      className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-outline hover:text-primary transition cursor-pointer"
                      title="Copy & Share Ayah"
                    >
                      {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-outline hover:text-primary transition cursor-pointer"
                      title="Bookmark Ayah"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Calligraphy Typography */}
                <div className="py-4 md:py-6">
                  <p
                    className="font-noto-serif text-right text-on-surface tracking-wide leading-[220%] select-text drop-shadow-sm font-medium"
                    style={{ fontSize: `${fontSize}px` }}
                    dir="rtl"
                  >
                    {currentAyah.arabicText} <span className="text-primary font-serif text-2xl inline-block px-1">﴿{currentAyah.verseNumberInSurah}﴾</span>
                  </p>
                </div>

                {/* Translation Text */}
                <div className="p-5 rounded-2xl bg-surface-container/70 border border-outline-variant/20 space-y-1.5 text-left">
                  <span className="text-[10px] uppercase font-bold text-outline font-label-caps tracking-wider">
                    {translationLanguage === 'ta' ? 'தமிழ் மொழிபெயர்ப்பு (அப்துல் ஹமீது பாகவி)' : 'Sahih International Translation'}
                  </span>
                  <p className="font-sans text-base md:text-lg text-on-surface leading-relaxed pt-1 font-normal">
                    {currentAyah.translations[translationLanguage] ||
                      currentAyah.translations['en'] ||
                      'Translation loading...'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <ScreenPlaceholder
          title="Reading Screen"
          description="Sacred Quran recitation interface with single-verse focused navigation, Hadith-accurate Hasanat accumulation, multi-language translations, and Juz milestones."
          stitchScreenName="Deenly Reading Experience"
          stitchScreenId="0d8bf1fe21134a66a111a4574971c261"
          stitchReady={true}
          currentRoute="/reading"
          featuresList={[
            'Single-Verse focused recitation mode with next and previous navigation arrows',
            'Precomputed Arabic letter counts yielding 10 Hasanat points per letter',
            'Floating real-time Hasanat badges popping up on verse completion',
            'Instant translation switching between Sahih International (English) and Abdul Hameed Baqavi (Tamil)',
            'Dynamic typography scale with custom CSS font size sliders',
            'Juz completion bar and Khatm page progress tracker',
          ]}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. EXACT REQUESTED BOTTOM NAVIGATION BAR (Left Pill, Center I'm Done,     */}
      {/*    Right White Action Pill + Floating Hasanat Above Next Button)          */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-4 left-0 right-0 max-w-lg mx-auto px-4 z-40">
        <div className="flex items-center justify-between gap-3 relative">
          {/* Floating Hasanat Badge on Top of Right Next Arrow */}
          {currentAyah && (
            <div className="absolute -top-7 right-4 pointer-events-none">
              <span className="text-xs font-bold text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-md">
                +{currentAyah.hasanatValue}
              </span>
            </div>
          )}

          {/* Left Button: Previous Ayah Arrow (Rounded Pill) */}
          <button
            type="button"
            onClick={handlePrevAyah}
            disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
            className="w-24 h-13 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center hover:border-primary transition cursor-pointer shadow-lg disabled:opacity-40"
            title="Previous Ayah"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </button>

          {/* Center Button: "I'm Done" (Capsule shape) */}
          <button
            type="button"
            onClick={handleFinishSession}
            className="flex-1 h-13 rounded-full bg-surface-container-high border border-outline-variant/40 hover:border-primary text-on-surface text-xs md:text-sm font-bold flex items-center justify-center transition cursor-pointer shadow-lg active:scale-98"
          >
            I'm Done
          </button>

          {/* Right Button: Next Arrow (Large White Rounded Action Pill acting as Mark Read) */}
          <button
            type="button"
            onClick={handleMarkAndNext}
            className="w-24 h-13 rounded-full bg-white text-gray-900 flex items-center justify-center transition cursor-pointer shadow-xl hover:bg-gray-100 active:scale-95"
            title="Mark Read & Next Ayah"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 5. SESSION COMPLETION CELEBRATION MODAL                                  */}
      {/* ========================================================================= */}
      {completedSessionData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl glass-card border border-primary/50 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-container/30 border border-tertiary text-tertiary mx-auto flex items-center justify-center shadow-xl">
              <Award className="w-8 h-8 text-tertiary animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-tertiary font-label-caps tracking-wider">
                Masha'Allah! Session Complete
              </span>
              <h3 className="text-2xl font-bold font-h1 text-on-surface">Spiritual Rewards Earned</h3>
              <p className="text-xs text-on-surface-variant">
                Your recitation has been saved and synced to your cloud profile.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-surface-container/80 border border-outline-variant/30 text-center">
              <div className="p-2.5 rounded-xl bg-tertiary-container/20 border border-tertiary/20">
                <span className="text-[10px] text-tertiary font-bold font-label-caps uppercase">Hasanat</span>
                <p className="text-lg font-bold text-tertiary mt-0.5">
                  +{completedSessionData.hasanatEarned.toLocaleString()}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-highest/60 border border-outline-variant/20">
                <span className="text-[10px] text-outline font-bold font-label-caps uppercase">Verses</span>
                <p className="text-lg font-bold text-on-surface mt-0.5">
                  {completedSessionData.versesRead}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-highest/60 border border-outline-variant/20">
                <span className="text-[10px] text-outline font-bold font-label-caps uppercase">Duration</span>
                <p className="text-sm font-bold font-mono text-on-surface mt-1">
                  {formatDurationHuman(completedSessionData.durationSeconds)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletedSessionData(null)}
                className="flex-1 py-3 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-semibold text-on-surface hover:border-primary transition cursor-pointer"
              >
                Continue Reading
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedSessionData(null)
                  navigate('/dashboard')
                }}
                className="flex-1 py-3 rounded-full primary-gradient-btn text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
