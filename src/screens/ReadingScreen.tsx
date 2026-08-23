import React, { useEffect, useState, useRef, useCallback } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Bookmark,
  Heart,
  ZoomIn,
  Target
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useReadingStore } from '../store/useReadingStore'
import { useAuthStore } from '../store/useAuthStore'
import { useBookmarkStore } from '../store/useBookmarkStore'
import { useFavoriteStore } from '../store/useFavoriteStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  formatTimer, 
  calculateJuzProgress,
  getLocalDateString
} from '../lib/hasanatEngine'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { 
  getTranslationMeta, 
  type EnglishTranslationKey, 
  type TamilTranslationKey,
  DEFAULT_ENGLISH_TRANSLATION,
  DEFAULT_TAMIL_TRANSLATION
} from '../lib/quranTranslations'
import { useI18nStore } from '../lib/i18n'

export const ReadingScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const t = useI18nStore((state) => state.t)

  // State
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)
  const [chapterCompletedBanner, setChapterCompletedBanner] = useState<string | null>(null)
  const [zoomFeedback, setZoomFeedback] = useState<number | null>(null)

  const mainCanvasRef = useRef<HTMLElement | null>(null)
  const zoomFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinchStartDistanceRef = useRef<number | null>(null)
  const baseFontSizeRef = useRef<number>(28)
  const isPinchingRef = useRef(false)

  const user = useAuthStore((state) => state.user)
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings)
  const storeFontSize = useReadingStore((state) => state.fontSize)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const storeEnglishTranslation = useReadingStore((state) => state.englishTranslation)
  const storeTamilTranslation = useReadingStore((state) => state.tamilTranslation)
  const setFontSize = useReadingStore((state) => state.setFontSize)
  const fontSize = storeFontSize || user?.arabicFontSize || 28
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const currentEnglishTranslation: EnglishTranslationKey = user?.englishTranslation || storeEnglishTranslation || DEFAULT_ENGLISH_TRANSLATION
  const currentTamilTranslation: TamilTranslationKey = user?.tamilTranslation || storeTamilTranslation || DEFAULT_TAMIL_TRANSLATION

  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)
  const currentSurah = useReadingStore((state) => state.currentSurah)
  const isLoadingSurah = useReadingStore((state) => state.isLoadingSurah)
  const translationLanguage = useReadingStore((state) => state.translationLanguage)
  const setTranslationLanguage = useReadingStore((state) => state.setTranslationLanguage)
  const effectiveTranslationLanguage: 'en' | 'ta' = appLanguage === 'ta' ? 'ta' : translationLanguage
  const loadSurah = useReadingStore((state) => state.loadSurah)
  const setCurrentPosition = useReadingStore((state) => state.setCurrentPosition)

  const isQuranBookmarked = useBookmarkStore((state) => state.isQuranBookmarked)
  const toggleQuranBookmark = useBookmarkStore((state) => state.toggleQuranBookmark)
  const isQuranFavorite = useFavoriteStore((state) => state.isQuranFavorite)
  const toggleQuranFavorite = useFavoriteStore((state) => state.toggleQuranFavorite)

  // Auth & Session
  const activeSession = useReadingStore((state) => state.activeSession)
  const startSession = useReadingStore((state) => state.startSession)
  const tickTimer = useReadingStore((state) => state.tickTimer)
  const markAyahRead = useReadingStore((state) => state.markAyahRead)
  const finishSession = useReadingStore((state) => state.finishSession)

  // Zoom feedback indicator
  const showZoomIndicator = useCallback((size: number) => {
    setZoomFeedback(size)
    if (zoomFeedbackTimer.current) clearTimeout(zoomFeedbackTimer.current)
    zoomFeedbackTimer.current = setTimeout(() => {
      setZoomFeedback(null)
    }, 1400)
  }, [])

  // Apply & Persist Zoomed Font Size
  const applyFontSizeChange = useCallback((newSize: number) => {
    const clamped = Math.max(18, Math.min(54, Math.round(newSize / 2) * 2))
    setFontSize(clamped)
    updateUserSettings({ arabicFontSize: clamped })
    showZoomIndicator(clamped)
  }, [setFontSize, updateUserSettings, showZoomIndicator])

  // Pinch-to-Zoom & Ctrl+Wheel Gestures
  useEffect(() => {
    const el = mainCanvasRef.current
    if (!el) return

    // 1. Wheel Zoom (Trackpad pinch or Ctrl + MouseWheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY < 0 ? 2 : -2
        const current = useReadingStore.getState().fontSize || 28
        applyFontSizeChange(current + delta)
      }
    }

    // 2. Mobile Touch Pinch-to-Zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinchingRef.current = true
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        pinchStartDistanceRef.current = dist
        baseFontSizeRef.current = useReadingStore.getState().fontSize || 28
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistanceRef.current !== null) {
        e.preventDefault() // prevent full-page browser scaling
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const scale = currentDist / pinchStartDistanceRef.current
        const deltaSize = (scale - 1) * 22
        const targetSize = baseFontSizeRef.current + deltaSize
        applyFontSizeChange(targetSize)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStartDistanceRef.current = null
        setTimeout(() => {
          isPinchingRef.current = false
        }, 150)
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [applyFontSizeChange])

  // Sync user's preferred translation on initial load
  useEffect(() => {
    if (user?.preferredTranslation) {
      setTranslationLanguage(user.preferredTranslation === 'tamil' ? 'ta' : 'en')
    }
  }, [user?.preferredTranslation, setTranslationLanguage])

  // Handle URL Query Params: e.g. /reading?surah=2&ayah=255
  useEffect(() => {
    const surahParam = searchParams.get('surah')
    const ayahParam = searchParams.get('ayah')

    if (surahParam) {
      const sNum = parseInt(surahParam, 10)
      const aNum = ayahParam ? parseInt(ayahParam, 10) : 1
      if (sNum >= 1 && sNum <= 114) {
        setCurrentPosition(sNum, aNum)
      }
    } else {
      // If user directly opened /reading without query params, resume from exact last saved position!
      const resumeSurah = user?.lastReadSurah || currentSurahNumber || 1
      const resumeAyah = user?.lastReadAyah || currentAyahNumber || 1
      setCurrentPosition(resumeSurah, resumeAyah)
      setSearchParams({ surah: resumeSurah.toString(), ayah: resumeAyah.toString() }, { replace: true })
    }
  }, [searchParams, setCurrentPosition, user?.lastReadSurah, user?.lastReadAyah])

  // Save current position when unmounting or navigating away
  useEffect(() => {
    return () => {
      const state = useReadingStore.getState()
      if (state.currentSurahNumber && state.currentAyahNumber) {
        useAuthStore.getState().updateLastReadPosition(state.currentSurahNumber, state.currentAyahNumber)
      }
    }
  }, [])

  // Start reading session timer
  useEffect(() => {
    startSession()
    const timer = setInterval(() => {
      tickTimer()
    }, 1000)
    return () => clearInterval(timer)
  }, [startSession, tickTimer])

  // Fetch Surah data
  useEffect(() => {
    if (currentSurahNumber) {
      loadSurah(currentSurahNumber)
    }
  }, [currentSurahNumber, loadSurah])

  // Current Ayah Object
  const currentAyah = currentSurah?.ayahs?.find(
    (a) => a.verseNumberInSurah === currentAyahNumber
  ) || currentSurah?.ayahs?.[0]

  const totalAyahs = currentSurah?.numberOfAyahs || currentSurah?.ayahs?.length || 7
  const juzProgress = calculateJuzProgress(currentSurahNumber, currentAyahNumber)

  // Daily Verse Goal Metrics
  const dailyHistory = useAuthStore((state) => state.dailyHistory)
  const dailyGoalVerses = user?.dailyGoalVerses || 20
  const todayDateKey = getLocalDateString(new Date())
  const todayLoggedVerses = dailyHistory[todayDateKey]?.verses || 0
  const currentSessionVerses = activeSession.sessionVersesRead || 0
  const totalTodayVerses = todayLoggedVerses + currentSessionVerses
  const goalPercent = Math.min(100, Math.round((totalTodayVerses / dailyGoalVerses) * 100))

  // Mark Read & Advance to Next Ayah
  const handleMarkAndNext = useCallback(() => {
    if (isPinchingRef.current) return
    if (!currentAyah || !currentSurah) return

    // 1. Record Hasanat and Verses in reading store
    const earned = markAyahRead(currentAyah)

    // 2. Trigger floating notification
    setFloatingHasanat({ amount: earned, id: Date.now() })
    setTimeout(() => setFloatingHasanat(null), 1800)

    // 3. Navigation: Next Ayah or Next Surah
    if (currentAyahNumber < totalAyahs) {
      const nextAyahNum = currentAyahNumber + 1
      setCurrentPosition(currentSurahNumber, nextAyahNum)
      setSearchParams({ surah: currentSurahNumber.toString(), ayah: nextAyahNum.toString() })
      useAuthStore.getState().updateLastReadPosition(currentSurahNumber, nextAyahNum)
    } else {
      // Completed current Surah!
      const completedName = currentSurah.name
      setChapterCompletedBanner(`🎉 Completed Surah ${completedName}! Advancing to next chapter...`)
      setTimeout(() => setChapterCompletedBanner(null), 3000)

      if (currentSurahNumber < 114) {
        const nextSurahNum = currentSurahNumber + 1
        setCurrentPosition(nextSurahNum, 1)
        setSearchParams({ surah: nextSurahNum.toString(), ayah: '1' })
        useAuthStore.getState().updateLastReadPosition(nextSurahNum, 1)
      } else {
        // Full Quran Khatam!
        navigate('/dashboard')
      }
    }
  }, [
    currentAyah,
    currentSurah,
    currentAyahNumber,
    totalAyahs,
    currentSurahNumber,
    markAyahRead,
    setCurrentPosition,
    setSearchParams,
    navigate,
  ])

  // Go to Previous Ayah
  const handlePrevAyah = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (currentAyahNumber > 1) {
      const prevAyahNum = currentAyahNumber - 1
      setCurrentPosition(currentSurahNumber, prevAyahNum)
      setSearchParams({ surah: currentSurahNumber.toString(), ayah: prevAyahNum.toString() })
      useAuthStore.getState().updateLastReadPosition(currentSurahNumber, prevAyahNum)
    } else if (currentSurahNumber > 1) {
      const prevSurahNum = currentSurahNumber - 1
      const prevMeta = SURAH_METADATA.find((s) => s.number === prevSurahNum)
      const prevTotalAyahs = prevMeta?.numberOfAyahs || 7
      setCurrentPosition(prevSurahNum, prevTotalAyahs)
      setSearchParams({ surah: prevSurahNum.toString(), ayah: prevTotalAyahs.toString() })
      useAuthStore.getState().updateLastReadPosition(prevSurahNum, prevTotalAyahs)
    }
  }

  // Finish Reading Session -> Go to Dashboard
  const handleFinishSession = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (currentSurahNumber && currentAyahNumber) {
      useAuthStore.getState().updateLastReadPosition(currentSurahNumber, currentAyahNumber)
    }
    finishSession()
    navigate('/dashboard')
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleMarkAndNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevAyah()
      } else if (e.key === 'Escape') {
        handleFinishSession()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMarkAndNext, handlePrevAyah, handleFinishSession])

  const isCurrentAyahFavorite = currentSurahNumber && currentAyah
    ? isQuranFavorite(currentSurahNumber, currentAyah.verseNumberInSurah)
    : false

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentAyah || !currentSurah) return
    toggleQuranFavorite({
      surahNumber: currentSurahNumber,
      surahName: currentSurah.name,
      arabicName: currentSurah.arabicName,
      ayahNumber: currentAyah.verseNumberInSurah,
      arabicText: currentAyah.arabicText,
      translationText: currentAyah.translations[translationLanguage] || currentAyah.translations.en || '',
    })
  }

  const isCurrentAyahBookmarked = currentSurahNumber && currentAyah 
    ? isQuranBookmarked(currentSurahNumber, currentAyah.verseNumberInSurah)
    : false

  const handleToggleBookmark = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentAyah || !currentSurah) return
    toggleQuranBookmark({
      surahNumber: currentSurahNumber,
      surahName: currentSurah.name,
      arabicName: currentSurah.arabicName,
      ayahNumber: currentAyah.verseNumberInSurah,
      arabicText: currentAyah.arabicText,
      translationText: currentAyah.translations[translationLanguage] || currentAyah.translations.en || '',
    })
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-4xl mx-auto flex flex-col justify-between select-none relative overflow-hidden px-3 sm:px-6 py-2.5 sm:py-3.5 gap-2 sm:gap-3">
      {/* Floating Zoom Size Indicator Pill */}
      {zoomFeedback && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full glass-card border border-primary/50 text-primary font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <ZoomIn className="w-4 h-4 text-primary animate-pulse" />
          <span>{appLanguage === 'ta' ? `அரபு அளவு: ${zoomFeedback}px` : `Arabic Size: ${zoomFeedback}px`}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FIXED TOP BAR: PINNED TO TOP (MATCHED DIMENSIONS WITH FOOTER)          */}
      {/*    Includes Surah Name, Responsive Scaled Timer & Hasanat, Language Switch */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between gap-2.5 sm:gap-4 px-3.5 sm:px-5 py-3 sm:py-3.5 shrink-0 rounded-2xl sm:rounded-3xl glass-card border border-outline-variant/30 shadow-md z-30 bg-surface/95 backdrop-blur-lg">
        {/* Left: Surah Name & Ayah Counter */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={(e) => handleFinishSession(e)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="font-bold text-sm sm:text-base md:text-lg text-on-surface truncate">
                {appLanguage === 'ta' ? (currentSurah?.nameTa || currentSurah?.name || 'அத்தியாயம்') : (currentSurah?.name || 'Surah')}
              </span>
              <span className="font-noto-serif text-sm sm:text-base md:text-xl text-primary-fixed-dim shrink-0">
                {currentSurah?.arabicName}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-outline">
              {t('ayahOfTotal')} {currentAyahNumber || 1} {t('of')} {totalAyahs} • {t('juzNumber')} {juzProgress.juzNumber}
            </p>
          </div>
        </div>

        {/* Center: RESPONSIVELY SCALED TIME & HASANAT EARNED */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-surface-container-high/90 border border-outline-variant/40 shrink-0 shadow-sm">
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-on-surface font-mono text-xs sm:text-sm md:text-base font-bold">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>{formatTimer(activeSession.elapsedSeconds)}</span>
          </div>

          <span className="text-outline text-xs">•</span>

          {/* Hasanat Badge */}
          <div className="flex items-center gap-1.5 text-tertiary font-bold text-xs sm:text-sm md:text-base">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>+{activeSession.sessionHasanat}</span>
            <span className="hidden sm:inline text-[10px] md:text-xs opacity-75 font-normal">{t('pts')}</span>
          </div>
        </div>

        {/* Right: Language Switcher, Bookmark & Favorite */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Toggle */}
          {appLanguage === 'en' ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTranslationLanguage(translationLanguage === 'en' ? 'ta' : 'en')
              }}
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs sm:text-xs font-bold text-primary hover:border-primary transition cursor-pointer shadow-sm flex items-center justify-center"
              title="Toggle translation language"
            >
              {translationLanguage === 'ta' ? 'தமிழ்' : 'EN'}
            </button>
          ) : (
            <div className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary shadow-sm flex items-center justify-center">
              தமிழ்
            </div>
          )}

          {/* 🌟 1. Favorite Button (Heart - SWAPPED FIRST) */}
          <button
            onClick={(e) => handleToggleFavorite(e)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition cursor-pointer flex items-center justify-center shadow-sm ${
              isCurrentAyahFavorite
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-outline hover:text-rose-400'
            }`}
            title={isCurrentAyahFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isCurrentAyahFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* 🌟 2. Bookmark Button (Bookmark Ribbon - SWAPPED SECOND) */}
          <button
            onClick={(e) => handleToggleBookmark(e)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition cursor-pointer flex items-center justify-center shadow-sm ${
              isCurrentAyahBookmarked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-outline hover:text-amber-400'
            }`}
            title={isCurrentAyahBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
          >
            <Bookmark className={`w-4 h-4 ${isCurrentAyahBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 🌟 1.5 DAILY VERSE GOAL LINE PROGRESS BAR (BETWEEN TIMER & QURAN CANVAS)  */}
      {/* ========================================================================= */}
      <div className="w-full px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl glass-card border border-outline-variant/30 shadow-sm shrink-0 space-y-1.5 bg-surface-container-low/75">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-on-surface">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">
              {appLanguage === 'ta' ? 'இன்றைய ஓதும் இலக்கு' : 'Daily Recitation Goal'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-primary ml-1">
              {totalTodayVerses} <span className="text-[10px] sm:text-xs text-outline font-normal">/ {dailyGoalVerses} {appLanguage === 'ta' ? 'வசனங்கள்' : 'Ayahs'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {totalTodayVerses >= dailyGoalVerses ? (
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{appLanguage === 'ta' ? 'இலக்கு நிறைவு!' : 'Goal Met!'} ({goalPercent}%)</span>
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-medium text-tertiary">
                {goalPercent}% {appLanguage === 'ta' ? 'முடிந்தது' : 'Complete'}
                <span className="text-outline hidden sm:inline text-[10px] ml-1">({Math.max(0, dailyGoalVerses - totalTodayVerses)} {appLanguage === 'ta' ? 'மீதம்' : 'left'})</span>
              </span>
            )}
          </div>
        </div>

        {/* Line Shaped Progress Bar */}
        <div className="relative w-full py-0.5">
          <div className="w-full bg-surface-container-highest/80 h-2 rounded-full overflow-hidden relative border border-outline-variant/20">
            <div
              className="bg-gradient-to-r from-primary via-[#a855f7] to-tertiary h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(2, goalPercent)}%` }}
            />
          </div>
          {goalPercent > 0 && goalPercent < 100 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.95)] border-2 border-primary pointer-events-none transition-all duration-500"
              style={{ left: `calc(${Math.min(98, Math.max(2, goalPercent))}% - 6px)` }}
            />
          )}
        </div>
      </div>

      {/* Chapter Completed Transition Toast Banner */}
      {chapterCompletedBanner && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in shadow-lg shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{chapterCompletedBanner}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PROPORTIONED CENTER: PINCH-TO-ZOOM / WHEEL-ZOOM SUPPORTED CANVAS       */}
      {/*    🌟 Pinch in/out with 2 fingers or Ctrl+Wheel to resize Arabic text     */}
      {/*    🌟 TOUCHING/CLICKING ANYWHERE ADVANCES TO NEXT AYAH                    */}
      {/* ========================================================================= */}
      <main 
        ref={mainCanvasRef as React.RefObject<HTMLElement>}
        onClick={handleMarkAndNext}
        className="flex-1 overflow-y-auto w-full px-2 sm:px-4 py-2 sm:py-3 min-h-0 cursor-pointer select-none overscroll-contain touch-pan-y"
        title="Pinch to zoom text size • Tap anywhere to advance to next verse"
      >
        {isLoadingSurah ? (
          <div className="p-8 text-center space-y-2 my-auto flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {appLanguage === 'ta' ? 'புனித வசனம் ஏற்றப்படுகிறது...' : 'Loading sacred verse...'}
            </p>
          </div>
        ) : currentAyah ? (
          <div className="min-h-full flex flex-col justify-center items-center space-y-3 sm:space-y-4 max-w-3xl mx-auto py-2 animate-fade-in">
            {/* Bismillah Header (Shown only on Ayah 1 if not Surah 9) */}
            {currentAyahNumber === 1 && currentSurahNumber !== 9 && (
              <div className="text-center py-0.5">
                <p 
                  className="text-base sm:text-xl md:text-2xl text-primary-fixed-dim opacity-90 transition-all duration-150"
                  style={{ fontFamily: arabicFontFamily }}
                  dir="rtl"
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* 🌟 1. ARABIC SCRIPT HIGHLIGHTED CARD (SCALES ON PINCH/ZOOM & USES SELECTED FONT) */}
            <div 
              className="w-full p-5 sm:p-8 md:p-10 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/85 shadow-xl space-y-2 ring-1 ring-primary/20 text-center transition-all duration-150 active:scale-[0.99] hover:border-primary/70 select-none flex flex-col items-center justify-center break-words"
            >
              <p
                className="text-center text-on-surface leading-[2.3] sm:leading-[2.6] md:leading-[2.8] tracking-wide select-none drop-shadow-sm font-medium break-words w-full transition-all duration-150"
                style={{ fontSize: `${fontSize}px`, fontFamily: arabicFontFamily }}
                dir="rtl"
              >
                {currentAyah.arabicText}{' '}
                <span className="text-primary font-serif text-xl sm:text-2xl md:text-3xl inline-block px-1 select-none whitespace-nowrap">
                  ﴿{currentAyah.verseNumberInSurah}﴾
                </span>
              </p>
            </div>

            {/* 🌟 2. TRANSLATION CONTAINER */}
            <div 
              className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-container/50 border border-outline-variant/20 text-center space-y-1.5 select-none shadow-sm break-words"
            >
              <span className="text-[10px] sm:text-xs uppercase font-bold text-outline font-label-caps tracking-wider block">
                {effectiveTranslationLanguage === 'ta' 
                  ? `தமிழ் மொழிபெயர்ப்பு (${getTranslationMeta(currentTamilTranslation).name})`
                  : getTranslationMeta(currentEnglishTranslation).name}
              </span>
              <p className="font-sans text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed font-normal max-w-2xl mx-auto break-words">
                {effectiveTranslationLanguage === 'ta'
                  ? (currentAyah.translations[currentTamilTranslation] || currentAyah.translations['ta'] || currentAyah.translations['ta_baqavi'] || 'மொழிபெயர்ப்பு ஏற்றப்படுகிறது...')
                  : (currentAyah.translations[currentEnglishTranslation] || currentAyah.translations['en'] || currentAyah.translations['en_sahih'] || 'Translation loading...')}
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* ========================================================================= */}
      {/* 3. FIXED BOTTOM BAR: MATCHED HEIGHT & WIDTH TO HEADER                     */}
      {/*    ( ← ) Previous Ayah, "I'm Done" Center Pill, ( → ) Next Ayah           */}
      {/*    🌟 ENLARGED BUTTONS FOR ERGONOMIC TOUCH                                */}
      {/* ========================================================================= */}
      <footer className="w-full px-3.5 sm:px-5 py-3 sm:py-3.5 shrink-0 z-30 rounded-2xl sm:rounded-3xl glass-card border border-outline-variant/30 shadow-md bg-surface/95 backdrop-blur-lg">
        <div className="flex items-center justify-between gap-3 sm:gap-4 relative">
          {/* Floating Hasanat Badge on Top of Right Next Arrow */}
          {currentAyah && (
            <div className={`absolute -top-10 right-6 pointer-events-none transition-transform duration-300 ${floatingHasanat ? 'scale-125 animate-bounce' : ''}`}>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-amber-300 bg-black/90 px-3.5 py-1 rounded-full border border-amber-500/50 shadow-lg">
                +{floatingHasanat ? floatingHasanat.amount : currentAyah.hasanatValue}
              </span>
            </div>
          )}

          {/* Left Button: Previous Ayah Arrow */}
          <button
            type="button"
            onClick={(e) => handlePrevAyah(e)}
            disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
            className="w-24 sm:w-32 md:w-36 h-13 sm:h-15 md:h-16 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center hover:border-primary transition cursor-pointer shadow-md disabled:opacity-40 active:scale-95"
            title="Previous Ayah"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-on-surface" />
          </button>

          {/* Center Button: "I'm Done" */}
          <button
            type="button"
            onClick={(e) => handleFinishSession(e)}
            className="flex-1 h-13 sm:h-15 md:h-16 rounded-full bg-surface-container-high border border-outline-variant/40 hover:border-primary text-on-surface text-sm sm:text-base md:text-lg font-bold flex items-center justify-center transition cursor-pointer shadow-md active:scale-98"
          >
            {t('imDone')}
          </button>

          {/* Right Button: Next Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleMarkAndNext()
            }}
            className="w-24 sm:w-32 md:w-36 h-13 sm:h-15 md:h-16 rounded-full bg-white text-gray-900 flex items-center justify-center transition cursor-pointer shadow-xl hover:bg-gray-100 active:scale-95"
            title={currentAyah && currentAyah.verseNumberInSurah === totalAyahs ? 'Complete Chapter & Next Surah' : 'Mark Read & Next Ayah'}
          >
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
          </button>
        </div>
      </footer>
    </div>
  )
}
