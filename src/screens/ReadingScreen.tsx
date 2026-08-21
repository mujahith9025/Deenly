import React, { useEffect, useState, useRef } from 'react'
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Clock, 
  Check, 
  Share2 
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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)

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
      const nextSurahNum = currentSurahNumber + 1
      loadSurah(nextSurahNum)
      setCurrentPosition(nextSurahNum, 1)
    }
  }

  // Navigation: Previous Ayah
  const handlePrevAyah = () => {
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
    } else if (currentSurahNumber > 1) {
      const prevSurahNum = currentSurahNumber - 1
      const prevSurahMeta = SURAH_METADATA.find((s) => s.number === prevSurahNum)
      loadSurah(prevSurahNum)
      setCurrentPosition(prevSurahNum, prevSurahMeta?.numberOfAyahs || 1)
    }
  }

  // Finish session and navigate back to Dashboard
  const handleFinishSession = () => {
    finishSession()
    navigate('/dashboard')
  }

  const handleShareAyah = () => {
    if (!currentAyah) return
    const text = `${currentAyah.arabicText}\n\n"${currentAyah.translations[translationLanguage] || currentAyah.translations.en}"\n\n[Surah ${currentSurah?.name} ${currentSurahNumber}:${currentAyah.verseNumberInSurah}]`
    navigator.clipboard.writeText(text)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  const surahProgressPercent = currentSurah
    ? Math.round(((currentAyahNumber || 1) / currentSurah.numberOfAyahs) * 100)
    : 0

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-2rem)] w-full max-w-4xl mx-auto overflow-hidden flex flex-col justify-between p-3 sm:p-4 select-none relative">
      <audio ref={audioRef} src={audioUrl} preload="none" />

      {/* ========================================================================= */}
      {/* 1. COMPACT TOP STRIP: SURAH TITLE & COMBINED MINI TIME + HASANAT BADGE    */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between gap-2 pb-2 shrink-0 border-b border-outline-variant/20">
        {/* Left: Surah Name & Ayah Counter */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={handleFinishSession}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition shrink-0 cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-on-surface truncate">
                {currentSurah?.name || 'Surah'}
              </span>
              <span className="font-noto-serif text-sm text-primary-fixed-dim shrink-0">
                {currentSurah?.arabicName}
              </span>
            </div>
            <p className="text-[10px] text-outline">
              Ayah {currentAyahNumber || 1} of {totalAyahs} • Juz {juzProgress.juzNumber}
            </p>
          </div>
        </div>

        {/* Center: Combined Small Time & Hasanat Space Allocation */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container/80 border border-outline-variant/30 text-xs shrink-0 shadow-sm">
          <div className="flex items-center gap-1 text-on-surface font-mono text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-primary" />
            <span>{formatTimer(activeSession.elapsedSeconds)}</span>
          </div>
          <span className="text-outline text-[10px]">•</span>
          <div className="flex items-center gap-1 text-tertiary font-bold text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>+{activeSession.sessionHasanat}</span>
          </div>
        </div>

        {/* Right: Audio Reciter & Language Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio Button */}
          <button
            onClick={togglePlayAudio}
            className={`p-1.5 rounded-full border transition cursor-pointer ${
              isPlayingAudio
                ? 'bg-primary text-white border-primary shadow-sm animate-pulse'
                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface'
            }`}
            title="Play / Pause Audio"
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setTranslationLanguage(translationLanguage === 'en' ? 'ta' : 'en')}
            className="px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-semibold text-primary hover:border-primary transition cursor-pointer"
            title="Toggle translation language"
          >
            {translationLanguage === 'ta' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Share / Copy */}
          <button
            onClick={handleShareAyah}
            className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer"
            title="Copy Ayah"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTER CONTENT: ARABIC HIGHLIGHTED WITH BACKGROUND CONTAINER            */}
      {/*    & TRANSLATION TEXT BELOW WITHOUT ANY HIGHLIGHT/BOX                     */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 py-2 overflow-hidden my-auto">
        {isLoadingSurah ? (
          <div className="p-8 text-center space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
            <p className="text-xs text-on-surface-variant">Loading sacred verse...</p>
          </div>
        ) : currentAyah ? (
          <div className="w-full flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto my-auto animate-fade-in">
            {/* Bismillah Header (Shown only on Ayah 1 if not Surah 9) */}
            {currentAyahNumber === 1 && currentSurahNumber !== 9 && (
              <div className="text-center py-0.5">
                <p className="font-noto-serif text-lg sm:text-xl text-primary-fixed-dim opacity-90" dir="rtl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* 🌟 ARABIC SCRIPT HIGHLIGHTED WITH BACKGROUND CARD CONTAINER */}
            <div className="w-full p-5 sm:p-8 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/75 shadow-2xl space-y-2 ring-1 ring-primary/20 text-center transition-all duration-200">
              <p
                className="font-noto-serif text-center text-on-surface leading-[2.1] sm:leading-[2.4] tracking-wide select-text drop-shadow-sm font-medium"
                style={{ fontSize: `${fontSize}px` }}
                dir="rtl"
              >
                {currentAyah.arabicText}{' '}
                <span className="text-primary font-serif text-xl sm:text-2xl inline-block px-1 select-none">
                  ﴿{currentAyah.verseNumberInSurah}﴾
                </span>
              </p>
            </div>

            {/* 🌟 TRANSLATION TEXT BELOW WITHOUT ANY HIGHLIGHT BACKGROUND */}
            <div className="w-full px-3 text-center space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-outline font-label-caps tracking-wider block">
                {translationLanguage === 'ta' ? 'தமிழ் மொழிபெயர்ப்பு (பாகவி)' : 'Sahih International'}
              </span>
              <p className="font-sans text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed font-normal">
                {currentAyah.translations[translationLanguage] ||
                  currentAyah.translations['en'] ||
                  'Translation loading...'}
              </p>
            </div>

            {/* Surah Mini Progress Indicator */}
            <div className="w-36 bg-surface-container-highest h-1 rounded-full overflow-hidden opacity-60">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${surahProgressPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* ========================================================================= */}
      {/* 3. DEDICATED 3-PILL BOTTOM NAVIGATION BAR (FIXED AT BOTTOM OF SCREEN)     */}
      {/*    ( ← ) Left Pill, "I'm Done" Center Pill, ( → ) Large White Next Pill   */}
      {/*    + Floating Hasanat Badge Above Next Button                             */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-lg mx-auto pt-2 pb-1 shrink-0 z-40">
        <div className="flex items-center justify-between gap-3 relative">
          {/* Floating Hasanat Badge on Top of Right Next Arrow */}
          {currentAyah && (
            <div className={`absolute -top-7 right-4 pointer-events-none transition-transform duration-300 ${floatingHasanat ? 'scale-125 animate-bounce' : ''}`}>
              <span className="text-xs font-bold text-amber-300 bg-black/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-md">
                +{floatingHasanat ? floatingHasanat.amount : currentAyah.hasanatValue}
              </span>
            </div>
          )}

          {/* Left Button: Previous Ayah Arrow (Rounded Pill) */}
          <button
            type="button"
            onClick={handlePrevAyah}
            disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
            className="w-24 h-12 sm:h-13 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center hover:border-primary transition cursor-pointer shadow-lg disabled:opacity-40"
            title="Previous Ayah"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </button>

          {/* Center Button: "I'm Done" (Direct return to Dashboard) */}
          <button
            type="button"
            onClick={handleFinishSession}
            className="flex-1 h-12 sm:h-13 rounded-full bg-surface-container-high border border-outline-variant/40 hover:border-primary text-on-surface text-xs sm:text-sm font-bold flex items-center justify-center transition cursor-pointer shadow-lg active:scale-98"
          >
            I'm Done
          </button>

          {/* Right Button: Next Arrow (Large White Rounded Action Pill acting as Mark Read) */}
          <button
            type="button"
            onClick={handleMarkAndNext}
            className="w-24 h-12 sm:h-13 rounded-full bg-white text-gray-900 flex items-center justify-center transition cursor-pointer shadow-xl hover:bg-gray-100 active:scale-95"
            title="Mark Read & Next Ayah"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </footer>
    </div>
  )
}
