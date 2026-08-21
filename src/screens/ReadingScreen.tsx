import React, { useEffect, useState, useRef } from 'react'
import { 
  Type, 
  ChevronLeft, 
  ChevronRight,
  Sparkles, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  ListFilter,
  Eye,
  Check
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
  const [showFullView, setShowFullView] = useState(true)
  const [readingMode, setReadingMode] = useState<'single' | 'all'>('single')
  const [completedSessionData, setCompletedSessionData] = useState<SessionMetrics | null>(null)
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)

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

  // Active Session State & Actions
  const activeSession = useReadingStore((state) => state.activeSession)
  const startSession = useReadingStore((state) => state.startSession)
  const tickTimer = useReadingStore((state) => state.tickTimer)
  const markAyahRead = useReadingStore((state) => state.markAyahRead)
  const finishSession = useReadingStore((state) => state.finishSession)

  const activeAyahRef = useRef<HTMLDivElement | null>(null)

  // Initialize Surah and deep-link query parameters
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

  // Timer interval
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

  // Active Ayah Object
  const totalAyahs = currentSurah?.numberOfAyahs || 1
  const activeAyahIndex = Math.max(0, Math.min(totalAyahs - 1, (currentAyahNumber || 1) - 1))
  const currentAyah = currentSurah?.ayahs[activeAyahIndex] || currentSurah?.ayahs[0]
  const isCurrentAyahRead = currentAyah ? activeSession.readAyahsInSession.includes(currentAyah.number) : false

  // Dynamic Juz Progress
  const juzProgress = calculateJuzProgress(currentSurahNumber || 1, currentAyahNumber || 1)

  // Single-Verse Navigation: Mark Read & Advance to Next
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
      // Reached the end of the chapter -> advance to next Surah
      loadSurah(currentSurahNumber + 1)
      setCurrentPosition(currentSurahNumber + 1, 1)
    }
  }

  // Single-Verse Navigation: Go to Previous Ayah
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
      // Go to previous Surah's last verse
      const prevSurahMeta = SURAH_METADATA.find(s => s.number === currentSurahNumber - 1)
      const lastAyahOfPrev = prevSurahMeta?.numberOfAyahs || 1
      loadSurah(currentSurahNumber - 1)
      setCurrentPosition(currentSurahNumber - 1, lastAyahOfPrev)
    }
  }

  // Single-Verse Navigation: Skip to Next without marking
  const handleNextAyahOnly = () => {
    if (!currentSurah) return

    if (currentAyahNumber < currentSurah.numberOfAyahs) {
      const nextAyahNum = currentAyahNumber + 1
      const nextAyahObj = currentSurah.ayahs[nextAyahNum - 1]
      setCurrentPosition(
        currentSurahNumber,
        nextAyahNum,
        nextAyahObj?.page,
        nextAyahObj?.juz
      )
    } else if (currentSurahNumber < 114) {
      loadSurah(currentSurahNumber + 1)
      setCurrentPosition(currentSurahNumber + 1, 1)
    }
  }

  // Keyboard navigation shortcuts
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

  const handlePrevSurah = () => {
    if (currentSurahNumber > 1) {
      loadSurah(currentSurahNumber - 1)
      setCurrentPosition(currentSurahNumber - 1, 1)
    }
  }

  const handleNextSurah = () => {
    if (currentSurahNumber < 114) {
      loadSurah(currentSurahNumber + 1)
      setCurrentPosition(currentSurahNumber + 1, 1)
    }
  }

  // Surah Progress Percentage
  const surahProgressPercent = Math.round(((currentAyahNumber || 1) / totalAyahs) * 100)

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Floating Animated Hasanat Popover */}
      {floatingHasanat && (
        <div className="fixed top-24 right-8 z-50 animate-bounce pointer-events-none">
          <div className="px-4 py-2.5 rounded-2xl bg-tertiary-container/95 border border-tertiary text-tertiary font-bold text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-tertiary animate-spin" />
            <span>+{floatingHasanat.amount} Hasanat!</span>
          </div>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
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

        {/* Top Actions & Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Surah Dropdown Selector */}
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

          {/* Mode Toggle: Single Ayah vs All Ayahs */}
          <button
            onClick={() => setReadingMode(readingMode === 'single' ? 'all' : 'single')}
            className="text-xs px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary transition flex items-center gap-1.5 cursor-pointer"
            title="Toggle between Single-Verse Mode and Full-Chapter List"
          >
            {readingMode === 'single' ? (
              <>
                <ListFilter className="w-3.5 h-3.5 text-secondary" />
                <span className="hidden sm:inline">List View</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Single Verse</span>
              </>
            )}
          </button>

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
          {/* Mobile & Tablet Top Session Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:hidden">
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

          {/* Quick Reader Controls Bar */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex-wrap">
            {/* Translation Picker */}
            <div className="flex items-center gap-1.5 bg-surface-container/80 p-1 rounded-full border border-outline-variant/30">
              <button
                onClick={() => setTranslationLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  translationLanguage === 'en'
                    ? 'bg-primary-container text-white shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setTranslationLanguage('ta')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  translationLanguage === 'ta'
                    ? 'bg-primary-container text-white shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Typography Scale */}
            <div className="flex items-center gap-2 bg-surface-container/80 px-3 py-1 rounded-full border border-outline-variant/30 text-xs">
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

            {/* Finish Session */}
            <button
              onClick={handleFinishSession}
              className="px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I'm Done</span>
            </button>
          </div>

          {/* Desktop 2-Column Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left/Center Main Column */}
            <div className="flex-1 w-full max-w-3xl space-y-4">
              {isLoadingSurah ? (
                <div className="p-16 text-center space-y-3 glass-card rounded-3xl border border-outline-variant/30">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-on-surface-variant">Loading sacred verses and translations...</p>
                </div>
              ) : readingMode === 'single' ? (
                /* ========================================================== */
                /* 🎯 SINGLE-VERSE FOCUSED READING VIEW (Ayah-by-Ayah)       */
                /* ========================================================== */
                <div className="space-y-4">
                  {/* Bismillah Header for Verse 1 */}
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

                  {currentAyah ? (
                    <div className="p-6 md:p-10 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/60 shadow-2xl space-y-6 relative ring-1 ring-primary/20">
                      {/* Surah Progress Mini-Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-outline">
                          <span className="font-bold text-on-surface flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-mono text-xs">
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

                      {/* Verse Meta & Hasanat Badges */}
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-outline font-medium">
                            Juz {currentAyah.juz} • Page {currentAyah.page}
                          </span>
                          {isCurrentAyahRead && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary/30 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Recited</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] text-outline border border-outline-variant/30 font-mono">
                            {currentAyah.arabicLetterCount} letters
                          </span>
                          <span 
                            title={`Reciting this ayah earns ${currentAyah.hasanatValue} Hasanat (${currentAyah.arabicLetterCount} letters x 10)`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/40 text-tertiary text-xs font-bold shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-tertiary" />
                            +{currentAyah.hasanatValue} Hasanat
                          </span>
                        </div>
                      </div>

                      {/* Arabic Quranic Typography */}
                      <div className="py-4 md:py-6">
                        <p
                          className="font-noto-serif text-right text-on-surface tracking-wide leading-[220%] select-text drop-shadow-sm"
                          style={{ fontSize: `${fontSize}px` }}
                          dir="rtl"
                        >
                          {currentAyah.arabicText} <span className="text-primary font-serif">﴿{currentAyah.verseNumberInSurah}﴾</span>
                        </p>
                      </div>

                      {/* Translation Text */}
                      <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-outline font-label-caps">
                          {translationLanguage === 'ta' ? 'தமிழ் மொழிபெயர்ப்பு' : 'Translation (Sahih International)'}
                        </span>
                        <p className="font-sans text-base md:text-lg text-on-surface leading-relaxed pt-1">
                          {currentAyah.translations[translationLanguage] ||
                            currentAyah.translations['en'] ||
                            'Translation loading...'}
                        </p>
                      </div>

                      {/* 🔘 Single-Verse Navigation & Mark Read Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
                        {/* Previous Ayah Button */}
                        <button
                          type="button"
                          onClick={handlePrevAyah}
                          disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
                          className="w-full sm:w-auto px-5 py-3 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center justify-center gap-2 border border-outline-variant/40 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4 text-secondary" />
                          <span>Previous Ayah</span>
                        </button>

                        {/* Main Center Action: Mark Read & Next */}
                        <button
                          type="button"
                          onClick={handleMarkAndNext}
                          className="w-full sm:flex-1 py-3.5 px-6 rounded-full primary-gradient-btn text-white font-bold text-sm shadow-xl hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>
                            {currentAyah.verseNumberInSurah === totalAyahs
                              ? (currentSurahNumber === 114 ? 'Mark Read & Complete Quran' : 'Mark Read & Next Surah →')
                              : 'Mark Read & Next (→)'}
                          </span>
                        </button>

                        {/* Skip Forward Button */}
                        <button
                          type="button"
                          onClick={handleNextAyahOnly}
                          disabled={currentSurahNumber === 114 && currentAyahNumber === totalAyahs}
                          className="w-full sm:w-auto px-4 py-3 rounded-full bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 border border-outline-variant/30 disabled:opacity-40 transition cursor-pointer"
                          title="Skip to next verse without marking"
                        >
                          <span>Skip</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Keyboard shortcut tip */}
                      <p className="text-[10px] text-outline text-center font-mono">
                        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/40">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/40">→</kbd> to mark read and advance.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                /* ========================================================== */
                /* 📜 ALL-VERSES LIST READING VIEW                            */
                /* ========================================================== */
                <div className="space-y-4">
                  {/* Bismillah Header */}
                  {currentSurahNumber !== 9 && (
                    <div className="text-center p-6 glass-card rounded-3xl border border-outline-variant/30">
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

                  {/* Verses List */}
                  {currentSurah?.ayahs.map((verse) => {
                    const isReadInSession = activeSession.readAyahsInSession.includes(verse.number)
                    const isCurrentActiveAyah = verse.verseNumberInSurah === currentAyahNumber

                    return (
                      <div
                        key={verse.number}
                        ref={isCurrentActiveAyah ? activeAyahRef : null}
                        className={`p-6 md:p-8 rounded-3xl glass-card border transition duration-300 space-y-4 relative ${
                          isCurrentActiveAyah
                            ? 'border-primary/60 bg-primary/5 shadow-lg ring-1 ring-primary/30'
                            : isReadInSession
                            ? 'border-tertiary/40 bg-surface-container-low/80'
                            : 'border-outline-variant/30 hover:border-primary/40'
                        }`}
                      >
                        {/* Verse Header Pill */}
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                              isReadInSession
                                ? 'bg-tertiary text-on-tertiary border-tertiary'
                                : 'bg-surface-container-highest border-outline-variant/40 text-primary'
                            }`}>
                              {isReadInSession ? '✓' : verse.verseNumberInSurah}
                            </span>
                            <span className="text-[11px] text-outline font-medium">
                              {currentSurah.name} : {verse.verseNumberInSurah}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] text-outline border border-outline-variant/30">
                              {verse.arabicLetterCount} letters
                            </span>
                            <span 
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 border border-tertiary/30 text-tertiary text-[11px] font-semibold"
                            >
                              <Sparkles className="w-3 h-3" />
                              +{verse.hasanatValue} Hasanat
                            </span>
                          </div>
                        </div>

                        {/* Arabic Script */}
                        <p
                          className="font-noto-serif text-right text-on-surface tracking-wide leading-[180%] select-text"
                          style={{ fontSize: `${fontSize}px` }}
                          dir="rtl"
                        >
                          {verse.arabicText} ﴿{verse.verseNumberInSurah}﴾
                        </p>

                        {/* Translation Text */}
                        <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed pt-2 border-t border-outline-variant/10">
                          {verse.translations[translationLanguage] ||
                            verse.translations['en'] ||
                            'Translation loading...'}
                        </p>

                        {/* Mark Read Action Button */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-outline">
                            Juz {verse.juz} • Page {verse.page}
                          </span>

                          <button
                            onClick={() => {
                              setCurrentPosition(currentSurahNumber, verse.verseNumberInSurah, verse.page, verse.juz)
                              handleMarkAndNext()
                            }}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              isReadInSession
                                ? 'bg-surface-container text-tertiary border border-tertiary/40'
                                : 'primary-gradient-btn text-white hover:scale-105 shadow-md'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isReadInSession ? 'Read Again' : 'Mark Read & Next'}</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Next/Prev Chapter Navigation Footer */}
              <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
                <button
                  onClick={handlePrevSurah}
                  disabled={currentSurahNumber <= 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-xs text-on-surface hover:border-primary border border-outline-variant/30 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Surah</span>
                </button>

                <button
                  onClick={handleFinishSession}
                  className="px-6 py-2.5 rounded-full bg-tertiary-container text-on-tertiary-container font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Complete Session</span>
                </button>

                <button
                  onClick={handleNextSurah}
                  disabled={currentSurahNumber >= 114}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-xs text-on-surface hover:border-primary border border-outline-variant/30 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next Surah</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Rail: Desktop Dedicated Session & Progress Control Panel */}
            <div className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-5 h-fit">
              {/* Session Live Status Card */}
              <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-on-surface">Reading Session</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse font-bold">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/20">
                    <p className="text-[10px] text-outline font-label-caps uppercase">Duration</p>
                    <p className="text-xl font-bold font-mono text-on-surface mt-0.5">
                      {formatTimer(activeSession.elapsedSeconds)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-tertiary-container/20 border border-tertiary/30">
                    <p className="text-[10px] text-tertiary font-label-caps uppercase">Hasanat</p>
                    <p className="text-xl font-bold text-tertiary mt-0.5">
                      +{activeSession.sessionHasanat}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container/50 border border-outline-variant/20 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Ayahs Completed:</span>
                  <span className="font-bold text-on-surface">{activeSession.sessionVersesRead} verses</span>
                </div>

                {/* Desktop Complete Session Action */}
                <button
                  onClick={handleFinishSession}
                  className="w-full py-3 rounded-full bg-tertiary-container hover:bg-tertiary-container/90 text-on-tertiary-container font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I'm Done (Finish Session)</span>
                </button>
              </div>

              {/* Juz Progress Panel */}
              <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-on-surface">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span>Juz {juzProgress.juzNumber} Progress</span>
                  </div>
                  <span className="font-bold text-secondary">{juzProgress.percent}%</span>
                </div>

                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-secondary-container h-full rounded-full transition-all duration-500 shadow-sm" 
                    style={{ width: `${juzProgress.percent}%` }}
                  />
                </div>

                <p className="text-[10px] text-outline text-right">
                  {juzProgress.versesCompletedInJuz} of {juzProgress.totalVersesInJuz} verses in Juz
                </p>
              </div>

              {/* Reader Controls: Audio, Language & Typography */}
              <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-4">
                <h3 className="text-xs font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps">
                  Reader Settings
                </h3>

                {/* Language Switcher */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-outline">Translation Language:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setTranslationLanguage('en')}
                      className={`py-2 px-3 rounded-xl font-medium transition cursor-pointer text-center ${
                        translationLanguage === 'en'
                          ? 'bg-primary-container text-white shadow-sm font-semibold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setTranslationLanguage('ta')}
                      className={`py-2 px-3 rounded-xl font-medium transition cursor-pointer text-center ${
                        translationLanguage === 'ta'
                          ? 'bg-primary-container text-white shadow-sm font-semibold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>

                {/* Typography Scale */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-outline">
                    <span>Arabic Font Size:</span>
                    <span className="font-mono text-primary font-bold">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSize(Math.max(20, fontSize - 2))}
                      className="flex-1 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-highest font-bold text-xs cursor-pointer text-center"
                    >
                      - Smaller
                    </button>
                    <button
                      onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                      className="flex-1 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-highest font-bold text-xs cursor-pointer text-center"
                    >
                      + Larger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Session Completion Celebration Modal */}
      {completedSessionData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl glass-card border border-primary/50 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-container/30 border border-tertiary text-tertiary mx-auto flex items-center justify-center shadow-xl">
              <Award className="w-8 h-8 text-tertiary animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-outline font-label-caps tracking-wider">
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
