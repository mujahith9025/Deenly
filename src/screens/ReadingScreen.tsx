import React, { useEffect, useState, useRef, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Clock, 
  Check, 
  Share2,
  CheckCircle2
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useReadingStore } from '../store/useReadingStore'
import { useAuthStore } from '../store/useAuthStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  formatTimer, 
  calculateJuzProgress 
} from '../lib/hasanatEngine'

export const ReadingScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)
  const [chapterCompletedBanner, setChapterCompletedBanner] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const user = useAuthStore((state) => state.user)
  const fontSize = user?.arabicFontSize || 28

  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)
  const currentSurah = useReadingStore((state) => state.currentSurah)
  const isLoadingSurah = useReadingStore((state) => state.isLoadingSurah)
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

  // Sync user's preferred translation on initial load
  useEffect(() => {
    if (user?.preferredTranslation === 'tamil') {
      setTranslationLanguage('ta')
    } else {
      setTranslationLanguage('en')
    }
  }, [user?.preferredTranslation, setTranslationLanguage])

  // Track initial load from URL params once on mount
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
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
    }
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

  // Audio URL using Mishary Rashid Alafasy 128kbps
  const audioUrl = currentAyah
    ? `https://everyayah.com/data/Alafasy_128kbps/${String(currentSurahNumber).padStart(3, '0')}${String(currentAyah.verseNumberInSurah).padStart(3, '0')}.mp3`
    : ''

  // Juz Progress Calculations
  const juzProgress = calculateJuzProgress(currentSurahNumber || 1, currentAyahNumber || 1)

  // Navigation: Next Ayah & Automatic Chapter Transition
  const handleMarkAndNext = useCallback(() => {
    if (!currentAyah || !currentSurah) return

    const earned = markAyahRead(currentAyah)
    if (earned > 0) {
      setFloatingHasanat({ amount: earned, id: Date.now() })
      setTimeout(() => setFloatingHasanat(null), 1800)
    }

    // 1. If within the current chapter: advance to next Ayah
    if (currentAyah.verseNumberInSurah < currentSurah.numberOfAyahs) {
      const nextAyahNum = currentAyah.verseNumberInSurah + 1
      const nextAyahObj = currentSurah.ayahs[nextAyahNum - 1]
      setCurrentPosition(
        currentSurahNumber,
        nextAyahNum,
        nextAyahObj?.page || currentAyah.page,
        nextAyahObj?.juz || currentAyah.juz
      )
      setSearchParams({ surah: currentSurahNumber.toString(), ayah: nextAyahNum.toString() }, { replace: true })
    } 
    // 2. Chapter completed! Automatically advance to the next chapter!
    else {
      const nextSurahNum = currentSurahNumber < 114 ? currentSurahNumber + 1 : 1
      const nextSurahMeta = SURAH_METADATA.find((s) => s.number === nextSurahNum)

      setChapterCompletedBanner(`Completed Surah ${currentSurah.name}! Now beginning Surah ${nextSurahMeta?.name || nextSurahNum}.`)
      setTimeout(() => setChapterCompletedBanner(null), 4000)

      loadSurah(nextSurahNum)
      setCurrentPosition(nextSurahNum, 1)
      setSearchParams({ surah: nextSurahNum.toString(), ayah: '1' }, { replace: true })
    }
  }, [currentAyah, currentSurah, currentSurahNumber, markAyahRead, setCurrentPosition, loadSurah, setSearchParams])

  // Navigation: Previous Ayah & Previous Chapter
  const handlePrevAyah = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentAyah || !currentSurah) return

    if (currentAyah.verseNumberInSurah > 1) {
      const prevAyahNum = currentAyah.verseNumberInSurah - 1
      const prevAyahObj = currentSurah.ayahs[prevAyahNum - 1]
      setCurrentPosition(
        currentSurahNumber,
        prevAyahNum,
        prevAyahObj?.page || currentAyah.page,
        prevAyahObj?.juz || currentAyah.juz
      )
      setSearchParams({ surah: currentSurahNumber.toString(), ayah: prevAyahNum.toString() }, { replace: true })
    } else if (currentSurahNumber > 1) {
      const prevSurahNum = currentSurahNumber - 1
      const prevSurahMeta = SURAH_METADATA.find((s) => s.number === prevSurahNum)
      const lastAyahOfPrevSurah = prevSurahMeta?.numberOfAyahs || 1

      loadSurah(prevSurahNum)
      setCurrentPosition(prevSurahNum, lastAyahOfPrevSurah)
      setSearchParams({ surah: prevSurahNum.toString(), ayah: lastAyahOfPrevSurah.toString() }, { replace: true })
    }
  }

  // Audio Play / Pause
  const togglePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
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

  // Handle auto-advance on audio finish
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      handleMarkAndNext()
    }

    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [handleMarkAndNext])

  // When Ayah changes, update audio src
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlayingAudio
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlayingAudio(false))
      }
    }
  }, [currentSurahNumber, currentAyahNumber])

  // Finish session and navigate back to Dashboard
  const handleFinishSession = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    finishSession()
    navigate('/dashboard')
  }

  const handleShareAyah = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentAyah) return
    const text = `${currentAyah.arabicText}\n\n"${currentAyah.translations[translationLanguage] || currentAyah.translations.en}"\n\n[Surah ${currentSurah?.name} ${currentSurahNumber}:${currentAyah.verseNumberInSurah}]`
    navigator.clipboard.writeText(text)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  return (
    <div className="h-full w-full max-w-5xl mx-auto flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden">
      <audio ref={audioRef} src={audioUrl} preload="none" />

      {/* ========================================================================= */}
      {/* 1. FIXED TOP BAR: PINNED TO TOP (DOES NOT SCROLL)                         */}
      {/*    Includes Surah Name, Responsive Scaled Timer & Hasanat, and Audio Tools */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between gap-2 sm:gap-4 pb-2.5 pt-1 shrink-0 border-b border-outline-variant/20 z-20 bg-surface/80 backdrop-blur-md">
        {/* Left: Surah Name & Ayah Counter */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={(e) => handleFinishSession(e)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition shrink-0 cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="font-bold text-sm sm:text-base md:text-lg text-on-surface truncate">
                {currentSurah?.name || 'Surah'}
              </span>
              <span className="font-noto-serif text-sm sm:text-base md:text-xl text-primary-fixed-dim shrink-0">
                {currentSurah?.arabicName}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-outline">
              Ayah {currentAyahNumber || 1} of {totalAyahs} • Juz {juzProgress.juzNumber}
            </p>
          </div>
        </div>

        {/* Center: RESPONSIVELY SCALED TIME & HASANAT EARNED (LARGER ON DESKTOP) */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 rounded-full bg-surface-container/90 border border-outline-variant/40 shrink-0 shadow-md">
          {/* Timer with larger font on Tablet / Desktop */}
          <div className="flex items-center gap-1.5 text-on-surface font-mono text-xs sm:text-sm md:text-base font-bold">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>{formatTimer(activeSession.elapsedSeconds)}</span>
          </div>

          <span className="text-outline text-xs">•</span>

          {/* Hasanat Badge with larger font on Tablet / Desktop */}
          <div className="flex items-center gap-1.5 text-tertiary font-bold text-xs sm:text-sm md:text-base">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>+{activeSession.sessionHasanat}</span>
            <span className="hidden sm:inline text-[10px] md:text-xs opacity-75 font-normal">pts</span>
          </div>
        </div>

        {/* Right: Audio Reciter & Language Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Audio Button */}
          <button
            onClick={(e) => togglePlayAudio(e)}
            className={`p-1.5 sm:p-2 rounded-full border transition cursor-pointer ${
              isPlayingAudio
                ? 'bg-primary text-white border-primary shadow-sm animate-pulse'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface'
            }`}
            title="Play / Pause Audio"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setTranslationLanguage(translationLanguage === 'en' ? 'ta' : 'en')
            }}
            className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs sm:text-xs font-bold text-primary hover:border-primary transition cursor-pointer shadow-sm"
            title="Toggle translation language"
          >
            {translationLanguage === 'ta' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Share / Copy */}
          <button
            onClick={(e) => handleShareAyah(e)}
            className="p-1.5 sm:p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer"
            title="Copy Ayah"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Chapter Completed Transition Toast Banner */}
      {chapterCompletedBanner && (
        <div className="my-2 p-2.5 sm:p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in shadow-lg shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{chapterCompletedBanner}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED SCROLLABLE CENTER: ONLY THIS SECTION SCROLLS                  */}
      {/*    Contains Highlighted Arabic Card & Clean Translation Underneath        */}
      {/*    🌟 CLICKING/TOUCHING ANYWHERE ON MAIN ADVANCES TO NEXT VERSE           */}
      {/* ========================================================================= */}
      <main 
        onClick={handleMarkAndNext}
        className="flex-1 overflow-y-auto w-full px-2 sm:px-6 py-4 min-h-0 flex flex-col justify-start sm:justify-center items-center cursor-pointer select-none"
        title="Tap anywhere to mark read and advance to next verse"
      >
        {isLoadingSurah ? (
          <div className="p-8 text-center space-y-2 my-auto">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs sm:text-sm text-on-surface-variant">Loading sacred verse...</p>
          </div>
        ) : currentAyah ? (
          <div className="w-full flex flex-col items-center justify-center space-y-4 md:space-y-6 max-w-3xl mx-auto my-auto py-2 animate-fade-in">
            {/* Bismillah Header (Shown only on Ayah 1 if not Surah 9) */}
            {currentAyahNumber === 1 && currentSurahNumber !== 9 && (
              <div className="text-center py-1">
                <p className="font-noto-serif text-lg sm:text-2xl md:text-3xl text-primary-fixed-dim opacity-90" dir="rtl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* 🌟 ARABIC SCRIPT HIGHLIGHTED WITH BACKGROUND CARD CONTAINER (TOUCH TO ADVANCE) */}
            <div 
              className="w-full p-5 sm:p-8 md:p-10 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/80 shadow-2xl space-y-2 ring-1 ring-primary/20 text-center transition-all duration-200 active:scale-[0.99] hover:border-primary/70 select-none group"
            >
              <p
                className="font-noto-serif text-center text-on-surface leading-[2.2] sm:leading-[2.5] md:leading-[2.7] tracking-wide select-none drop-shadow-sm font-medium"
                style={{ fontSize: `${fontSize}px` }}
                dir="rtl"
              >
                {currentAyah.arabicText}{' '}
                <span className="text-primary font-serif text-xl sm:text-2xl md:text-3xl inline-block px-1 select-none">
                  ﴿{currentAyah.verseNumberInSurah}﴾
                </span>
              </p>
            </div>

            {/* 🌟 TRANSLATION TEXT BELOW WITHOUT ANY HIGHLIGHT BACKGROUND (TOUCH TO ADVANCE) */}
            <div 
              className="w-full px-4 text-center space-y-1.5 pt-1 select-none"
            >
              <span className="text-[10px] sm:text-xs uppercase font-bold text-outline font-label-caps tracking-wider block">
                {translationLanguage === 'ta' ? 'தமிழ் மொழிபெயர்ப்பு (பாகவி)' : 'Sahih International'}
              </span>
              <p className="font-sans text-sm sm:text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed font-normal max-w-2xl mx-auto">
                {currentAyah.translations[translationLanguage] ||
                  currentAyah.translations['en'] ||
                  'Translation loading...'}
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* ========================================================================= */}
      {/* 3. FIXED BOTTOM BAR: PINNED TO BOTTOM (DOES NOT SCROLL)                   */}
      {/*    ( ← ) Left Pill, "I'm Done" Center Pill, ( → ) Large White Next Pill   */}
      {/*    🌟 ENLARGED BUTTONS FOR ERGONOMIC MOBILE & DESKTOP READING             */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-xl mx-auto pt-3 pb-2 shrink-0 z-20 bg-surface/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 sm:gap-4 relative">
          {/* Floating Hasanat Badge on Top of Right Next Arrow */}
          {currentAyah && (
            <div className={`absolute -top-8 right-6 pointer-events-none transition-transform duration-300 ${floatingHasanat ? 'scale-125 animate-bounce' : ''}`}>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-amber-300 bg-black/90 px-3.5 py-1 rounded-full border border-amber-500/50 shadow-lg">
                +{floatingHasanat ? floatingHasanat.amount : currentAyah.hasanatValue}
              </span>
            </div>
          )}

          {/* Left Button: Previous Ayah Arrow (Rounded Pill - Enlarged) */}
          <button
            type="button"
            onClick={(e) => handlePrevAyah(e)}
            disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
            className="w-24 sm:w-32 md:w-36 h-14 sm:h-16 md:h-17 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center hover:border-primary transition cursor-pointer shadow-lg disabled:opacity-40 active:scale-95"
            title="Previous Ayah"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.5] text-on-surface" />
          </button>

          {/* Center Button: "I'm Done" (Direct return to Dashboard - Enlarged) */}
          <button
            type="button"
            onClick={(e) => handleFinishSession(e)}
            className="flex-1 h-14 sm:h-16 md:h-17 rounded-full bg-surface-container-high border border-outline-variant/40 hover:border-primary text-on-surface text-sm sm:text-base md:text-lg font-bold flex items-center justify-center transition cursor-pointer shadow-lg active:scale-98"
          >
            I'm Done
          </button>

          {/* Right Button: Next Arrow (Large White Rounded Action Pill - Enlarged) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleMarkAndNext()
            }}
            className="w-24 sm:w-32 md:w-36 h-14 sm:h-16 md:h-17 rounded-full bg-white text-gray-900 flex items-center justify-center transition cursor-pointer shadow-2xl hover:bg-gray-100 active:scale-95"
            title={currentAyah && currentAyah.verseNumberInSurah === totalAyahs ? 'Complete Chapter & Next Surah' : 'Mark Read & Next Ayah'}
          >
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[3]" />
          </button>
        </div>
      </footer>
    </div>
  )
}
