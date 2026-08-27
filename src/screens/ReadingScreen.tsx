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
  Target,
  Palette
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
import { TajweedArabicText } from '../components/TajweedArabicText'
import { TajweedLegendModal } from '../components/TajweedLegendModal'
import { MUSHAF_THEMES, type MushafThemeId } from '../lib/mushafThemes'
import { MushafThemeModal } from '../components/MushafThemeModal'
import { ChapterCompletionModal } from '../components/ChapterCompletionModal'
import { getArabicTransliteration } from '../lib/transliteration'
import { countArabicLetters } from '../lib/quranApi'

export const ReadingScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const t = useI18nStore((state) => state.t)

  // State
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false)
  const [zoomFeedback, setZoomFeedback] = useState<number | null>(null)
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false)
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false)

  const mainCanvasRef = useRef<HTMLElement | null>(null)
  const zoomFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinchStartDistanceRef = useRef<number | null>(null)
  const baseFontSizeRef = useRef<number>(28)
  const isPinchingRef = useRef(false)

  const user = useAuthStore((state) => state.user)
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings)
  const storeFontSize = useReadingStore((state) => state.fontSize)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const storeMushafTheme = useReadingStore((state) => state.mushafTheme)
  const setMushafTheme = useReadingStore((state) => state.setMushafTheme)
  const activeMushafTheme: MushafThemeId = user?.mushafTheme || storeMushafTheme || 'cosmic'
  const themeMeta = MUSHAF_THEMES[activeMushafTheme] || MUSHAF_THEMES.cosmic

  const storeEnglishTranslation = useReadingStore((state) => state.englishTranslation)
  const storeTamilTranslation = useReadingStore((state) => state.tamilTranslation)
  const isTajweedEnabled = useReadingStore((state) => state.isTajweedEnabled)
  const setIsTajweedEnabled = useReadingStore((state) => state.setIsTajweedEnabled)
  const storeShowTransliteration = useReadingStore((state) => state.showTransliteration)
  const storeTransliterationLang = useReadingStore((state) => state.transliterationLanguage)
  const showTransliteration = user?.showTransliteration !== undefined ? user.showTransliteration : storeShowTransliteration
  const transliterationLang: 'en' | 'ta' = user?.transliterationLanguage || storeTransliterationLang || (appLanguage === 'ta' ? 'ta' : 'en')
  const surahTajweedMap = useReadingStore((state) => state.surahTajweedMap)
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
        if (currentSurahNumber !== sNum || currentAyahNumber !== aNum) {
          setCurrentPosition(sNum, aNum)
        }
      }
    } else {
      // If user directly opened /reading without query params, resume from exact last saved position!
      const resumeSurah = user?.lastReadSurah || currentSurahNumber || 1
      const resumeAyah = user?.lastReadAyah || currentAyahNumber || 1
      if (currentSurahNumber !== resumeSurah || currentAyahNumber !== resumeAyah) {
        setCurrentPosition(resumeSurah, resumeAyah)
      }
      setSearchParams({ surah: resumeSurah.toString(), ayah: resumeAyah.toString() }, { replace: true })
    }
  }, [searchParams, setCurrentPosition])

  // Save current position and finalize reading session metrics when unmounting or navigating away
  useEffect(() => {
    return () => {
      const state = useReadingStore.getState()
      if (state.activeSession.sessionVersesRead > 0 || state.activeSession.elapsedSeconds >= 3) {
        state.finishSession()
      } else if (state.currentSurahNumber && state.currentAyahNumber) {
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

    // 3. Navigation: Next Ayah or Trigger Celebratory Chapter Khatam Modal
    if (currentAyahNumber < totalAyahs) {
      const nextAyahNum = currentAyahNumber + 1
      setCurrentPosition(currentSurahNumber, nextAyahNum)
      setSearchParams({ surah: currentSurahNumber.toString(), ayah: nextAyahNum.toString() })
      useAuthStore.getState().updateLastReadPosition(currentSurahNumber, nextAyahNum)
    } else {
      // 🎉 Completed current Surah! Open Celebratory Chapter Completion Modal with Golden Confetti
      setIsCompletionModalOpen(true)
    }
  }, [
    currentAyah,
    currentAyahNumber,
    totalAyahs,
    currentSurahNumber,
    markAyahRead,
    setCurrentPosition,
    setSearchParams,
  ])

  // Advance to Next Chapter from Milestone Modal
  const handleContinueNextChapter = () => {
    setIsCompletionModalOpen(false)
    if (currentSurahNumber < 114) {
      const nextSurahNum = currentSurahNumber + 1
      setCurrentPosition(nextSurahNum, 1)
      setSearchParams({ surah: nextSurahNum.toString(), ayah: '1' })
      useAuthStore.getState().updateLastReadPosition(nextSurahNum, 1)
    } else {
      handleFinishSession()
    }
  }

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
    <div className={`h-[100dvh] max-h-[100dvh] w-full max-w-4xl mx-auto flex flex-col justify-between select-none relative overflow-hidden px-2 sm:px-6 py-2 sm:py-3.5 gap-1.5 sm:gap-3 transition-colors duration-300 ${themeMeta.classes.container}`}>
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
      <header className={`w-full flex items-center justify-between gap-1.5 sm:gap-4 px-2.5 sm:px-5 py-2 sm:py-3 shrink-0 rounded-2xl sm:rounded-3xl border shadow-md z-30 transition-colors duration-300 ${themeMeta.classes.header}`}>
        {/* Left: Surah Name & Ayah Counter */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={(e) => handleFinishSession(e)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-xs sm:text-base md:text-lg truncate max-w-[85px] sm:max-w-[160px] md:max-w-none">
                {appLanguage === 'ta' ? (currentSurah?.nameTa || currentSurah?.name || 'அத்தியாயம்') : (currentSurah?.name || 'Surah')}
              </span>
              <span className="font-noto-serif text-xs sm:text-base md:text-xl text-primary-fixed-dim shrink-0 hidden xs:inline">
                {currentSurah?.arabicName}
              </span>
            </div>
            <p className="text-[9px] sm:text-xs opacity-75 truncate">
              {t('ayahOfTotal')} {currentAyahNumber || 1} {t('of')} {totalAyahs} • {t('juzNumber')} {juzProgress.juzNumber}
            </p>
          </div>
        </div>

        {/* Center: RESPONSIVELY SCALED TIME & HASANAT EARNED */}
        <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-surface-container-high/90 border border-outline-variant/40 shrink-0 shadow-sm">
          {/* Timer */}
          <div className="flex items-center gap-1 font-mono text-[11px] sm:text-sm md:text-base font-bold">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span>{formatTimer(activeSession.elapsedSeconds)}</span>
          </div>

          <span className="opacity-50 text-[10px] sm:text-xs">•</span>

          {/* Hasanat Badge */}
          <div className="flex items-center gap-1 text-tertiary font-bold text-[11px] sm:text-sm md:text-base">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>+{activeSession.sessionHasanat}</span>
            <span className="hidden sm:inline text-[10px] md:text-xs opacity-75 font-normal">{t('pts')}</span>
          </div>
        </div>

        {/* Right: Theme Switcher, Tajweed Toggle, Language Switcher, Favorite & Bookmark */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* 🌟 Mushaf Eye-Comfort Theme Switcher */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsThemeModalOpen(true)
            }}
            className="w-8 h-8 sm:h-10 sm:w-auto sm:px-3 rounded-full border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition cursor-pointer shadow-sm flex items-center justify-center gap-1 text-xs font-bold shrink-0"
            title={appLanguage === 'ta' ? `முஸ்ஹஃப் தீம்: ${themeMeta.nameTa}` : `Mushaf Theme: ${themeMeta.nameEn}`}
          >
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="hidden md:inline text-[11px]">{themeMeta.icon}</span>
          </button>

          {/* Tajweed Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsTajweedEnabled(!isTajweedEnabled)
            }}
            className={`w-8 h-8 sm:h-10 sm:w-auto sm:px-3 rounded-full border transition cursor-pointer shadow-sm flex items-center justify-center gap-1 text-xs font-bold shrink-0 ${
              isTajweedEnabled
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-outline'
            }`}
            title={
              isTajweedEnabled
                ? (appLanguage === 'ta' ? 'தஜ்வீத் வண்ணங்கள் இயக்கப்பட்டுள்ளது' : 'Tajweed Colors Active')
                : (appLanguage === 'ta' ? 'தஜ்வீத் வண்ணங்களை இயக்கு' : 'Enable Tajweed Colors')
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{appLanguage === 'ta' ? 'தஜ்வீத்' : 'Tajweed'}</span>
          </button>

          {/* Language Toggle */}
          {appLanguage === 'en' ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTranslationLanguage(translationLanguage === 'en' ? 'ta' : 'en')
              }}
              className="h-8 px-2 sm:h-10 sm:px-3.5 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] sm:text-xs font-bold text-primary hover:border-primary transition cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              title="Toggle translation language"
            >
              {translationLanguage === 'ta' ? 'தமிழ்' : 'EN'}
            </button>
          ) : (
            <div className="h-8 px-2 sm:h-10 sm:px-3.5 rounded-full bg-primary/10 border border-primary/30 text-[11px] sm:text-xs font-bold text-primary shadow-sm flex items-center justify-center shrink-0">
              தமிழ்
            </div>
          )}

          {/* 🌟 1. Favorite Button (Heart) */}
          <button
            onClick={(e) => handleToggleFavorite(e)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition cursor-pointer flex items-center justify-center shadow-sm shrink-0 ${
              isCurrentAyahFavorite
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-outline hover:text-rose-400'
            }`}
            title={isCurrentAyahFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCurrentAyahFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* 🌟 2. Bookmark Button (Bookmark Ribbon) */}
          <button
            onClick={(e) => handleToggleBookmark(e)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition cursor-pointer flex items-center justify-center shadow-sm shrink-0 ${
              isCurrentAyahBookmarked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-outline hover:text-amber-400'
            }`}
            title={isCurrentAyahBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
          >
            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCurrentAyahBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 🌟 1.5 DAILY VERSE GOAL LINE PROGRESS BAR (BETWEEN TIMER & QURAN CANVAS)  */}
      {/* ========================================================================= */}
      <div className="w-full px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl glass-card border border-outline-variant/30 shadow-sm shrink-0 space-y-1 bg-surface-container-low/75">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-on-surface min-w-0">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-outline uppercase tracking-wider font-label-caps truncate">
              {appLanguage === 'ta' ? 'இன்றைய இலக்கு' : 'Daily Goal'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-primary ml-1 shrink-0">
              {totalTodayVerses} <span className="text-[10px] sm:text-xs text-outline font-normal">/ {dailyGoalVerses} {appLanguage === 'ta' ? 'வசனங்கள்' : 'Ayahs'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalTodayVerses >= dailyGoalVerses ? (
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{appLanguage === 'ta' ? 'நிறைவு!' : 'Goal Met!'}</span>
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-medium text-tertiary">
                {goalPercent}% {appLanguage === 'ta' ? 'முடிந்தது' : 'Complete'}
              </span>
            )}
          </div>
        </div>

        {/* Line Shaped Progress Bar */}
        <div className="relative w-full py-0.5">
          <div className="w-full bg-surface-container-highest/80 h-1.5 sm:h-2 rounded-full overflow-hidden relative border border-outline-variant/20">
            <div
              className="bg-gradient-to-r from-primary via-[#a855f7] to-tertiary h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(2, goalPercent)}%` }}
            />
          </div>
          {goalPercent > 0 && goalPercent < 100 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.95)] border-2 border-primary pointer-events-none transition-all duration-500"
              style={{ left: `calc(${Math.min(98, Math.max(2, goalPercent))}% - 5px)` }}
            />
          )}
        </div>
      </div>



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
          <div className="space-y-2 sm:space-y-3.5 max-w-3xl mx-auto w-full animate-fade-in my-auto">
            {/* 🌟 1. ARABIC AYAH CONTAINER */}
            <div 
              className={`w-full p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl space-y-3 text-center transition-all duration-200 active:scale-[0.99] select-none flex flex-col items-center justify-center break-words border shadow-md ${themeMeta.classes.card}`}
            >
              <p
                className={`font-normal tracking-wide text-center w-full max-w-2xl mx-auto break-words leading-[2.4] sm:leading-[2.8] md:leading-[3.1] select-none ${themeMeta.classes.textArabic}`}
                style={{
                  fontFamily: arabicFontFamily,
                  fontSize: `${fontSize}px`,
                  fontFeatureSettings: '"cv01" 1, "cv02" 1, "cv03" 1, "ss01" 1',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                }}
                dir="rtl"
              >
                <TajweedArabicText
                  rawTajweedText={surahTajweedMap[currentAyah.verseNumberInSurah]}
                  fallbackText={currentAyah.arabicText}
                  isEnabled={isTajweedEnabled}
                />{' '}
                <span className="text-primary font-serif text-lg sm:text-2xl md:text-3xl inline-block px-1 select-none whitespace-nowrap">
                  ﴿{currentAyah.verseNumberInSurah}﴾
                </span>
              </p>
            </div>

            {/* 🌟 2. PHONETIC TRANSLITERATION (IF ENABLED IN SETTINGS) */}
            {showTransliteration && (
              <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30 text-left space-y-1 select-none shadow-xs">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-outline">
                  <span className="uppercase font-label-caps tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>
                      {transliterationLang === 'ta' ? 'தமிழ் ஒலிபெயர்ப்பு (Phonetic)' : 'English Phonetic'}
                    </span>
                  </span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-2xs">
                    +{countArabicLetters(currentAyah.arabicText) * 10} {t('pts')}
                  </span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-secondary/95 font-medium leading-relaxed italic">
                  {getArabicTransliteration(currentAyah.arabicText, currentSurahNumber, currentAyah.verseNumberInSurah, transliterationLang)}
                </p>
              </div>
            )}

            {/* 🌟 3. TRANSLATION CONTAINER */}
            <div 
              className={`w-full p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border text-center space-y-1 sm:space-y-1.5 select-none shadow-sm break-words transition-colors duration-200 ${themeMeta.classes.card}`}
            >
              <span className={`text-[10px] sm:text-xs uppercase font-bold font-label-caps tracking-wider block ${themeMeta.classes.textMuted}`}>
                {effectiveTranslationLanguage === 'ta' 
                  ? `தமிழ் மொழிபெயர்ப்பு (${getTranslationMeta(currentTamilTranslation).name})`
                  : getTranslationMeta(currentEnglishTranslation).name}
              </span>
              <p className={`font-sans text-xs sm:text-base md:text-lg leading-relaxed font-normal max-w-2xl mx-auto break-words ${themeMeta.classes.textTranslation}`}>
                {effectiveTranslationLanguage === 'ta'
                  ? (currentAyah.translations[currentTamilTranslation] || currentAyah.translations['ta'] || currentAyah.translations['ta_baqavi'] || 'மொழிபெயர்ப்பு ஏற்றப்படுகிறது...')
                  : (currentAyah.translations[currentEnglishTranslation] || currentAyah.translations['en'] || currentAyah.translations['en_sahih'] || 'Translation loading...')}
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* ========================================================================= */}
      {/* 4. ENLARGED FIXED BOTTOM BAR: LARGER HIT TARGETS & PROMINENT SIZING       */}
      {/*    ( ← ) Previous Ayah, "I'm Done" Center Pill, ( → ) Next Ayah           */}
      {/* ========================================================================= */}
      <footer className={`w-full px-3 sm:px-6 py-3 sm:py-4.5 shrink-0 z-30 rounded-2xl sm:rounded-3xl border shadow-xl transition-colors duration-300 ${themeMeta.classes.footer}`}>
        <div className="flex items-center justify-between gap-2.5 sm:gap-5 relative">
          {/* Floating Hasanat Badge on Top of Right Next Arrow */}
          {currentAyah && (
            <div className={`absolute -top-9 sm:-top-11 right-4 sm:right-8 pointer-events-none transition-transform duration-300 ${floatingHasanat ? 'scale-125 animate-bounce' : ''}`}>
              <span className="text-xs sm:text-sm md:text-base font-black text-amber-300 bg-black/90 px-3 sm:px-4 py-1 rounded-full border border-amber-500/50 shadow-2xl">
                +{floatingHasanat ? floatingHasanat.amount : currentAyah.hasanatValue}
              </span>
            </div>
          )}

          {/* Left Button: Previous Ayah Arrow */}
          <button
            type="button"
            onClick={(e) => handlePrevAyah(e)}
            disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
            className={`w-16 sm:w-32 md:w-44 h-13 sm:h-16 md:h-18 rounded-2xl sm:rounded-full border flex items-center justify-center transition cursor-pointer shadow-md disabled:opacity-30 active:scale-95 shrink-0 ${themeMeta.classes.buttonSecondary}`}
            title="Previous Ayah"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.5]" />
          </button>

          {/* Center Button: "I'm Done" */}
          <button
            type="button"
            onClick={(e) => handleFinishSession(e)}
            className={`flex-1 h-13 sm:h-16 md:h-18 rounded-2xl sm:rounded-full border text-xs sm:text-base md:text-lg font-black tracking-wide flex items-center justify-center transition cursor-pointer shadow-md active:scale-98 min-w-0 px-3 truncate ${themeMeta.classes.buttonSecondary}`}
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
            className={`w-16 sm:w-32 md:w-44 h-13 sm:h-16 md:h-18 rounded-2xl sm:rounded-full font-black flex items-center justify-center transition cursor-pointer shadow-xl active:scale-95 shrink-0 ${themeMeta.classes.buttonPrimary}`}
            title={currentAyah && currentAyah.verseNumberInSurah === totalAyahs ? 'Complete Chapter & Next Surah' : 'Mark Read & Next Ayah'}
          >
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[3]" />
          </button>
        </div>
      </footer>

      {/* Tajweed Legend Interactive Modal */}
      <TajweedLegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        isEnabled={isTajweedEnabled}
        onToggleEnabled={setIsTajweedEnabled}
      />

      {/* 🌟 Mushaf Eye-Comfort Theme Selector Modal */}
      <MushafThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={activeMushafTheme}
        onSelectTheme={(selectedTheme) => setMushafTheme(selectedTheme)}
      />

      {/* 🎉 Celebratory Chapter Completion Modal with Golden Confetti & Star Burst */}
      <ChapterCompletionModal
        isOpen={isCompletionModalOpen}
        surahNumber={currentSurahNumber}
        surahName={currentSurah?.name || ''}
        surahNameTa={currentSurah?.nameTa || currentSurah?.name || ''}
        arabicName={currentSurah?.arabicName || ''}
        onContinueNextChapter={handleContinueNextChapter}
        onFinishSession={() => {
          setIsCompletionModalOpen(false)
          handleFinishSession()
        }}
        onClose={() => setIsCompletionModalOpen(false)}
      />
    </div>
  )
}
