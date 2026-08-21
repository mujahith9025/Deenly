import React, { useEffect, useState, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Repeat, 
  Heart, 
  Bookmark, 
  Share2, 
  BookOpen, 
  Edit3, 
  Settings, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Check, 
  Loader2
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useReadingStore } from '../store/useReadingStore'
import { useAuthStore } from '../store/useAuthStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  formatTimer, 
  calculateJuzProgress, 
  formatDurationHuman, 
  type SessionMetrics 
} from '../lib/hasanatEngine'

export const ReadingScreen: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(13042)
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false)
  const [completedSessionData, setCompletedSessionData] = useState<SessionMetrics | null>(null)
  const [floatingHasanat, setFloatingHasanat] = useState<{ amount: number; id: number } | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)
  const [showReflectionModal, setShowReflectionModal] = useState(false)
  const [reflectionText, setReflectionText] = useState('')

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
  const user = useAuthStore((state) => state.user)
  const dailyHistory = useAuthStore((state) => state.dailyHistory)
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

  // When Ayah changes, pause previous audio
  useEffect(() => {
    setIsPlayingAudio(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [currentSurahNumber, currentAyahNumber])

  // Juz Progress Calculations
  const juzProgress = calculateJuzProgress(currentSurahNumber || 1, currentAyahNumber || 1)
  const remainingVersesInJuz = Math.max(0, juzProgress.totalVersesInJuz - juzProgress.versesCompletedInJuz)

  // Daily Goal
  const dailyGoalVerses = user?.dailyGoalVerses || 10
  const todayStr = new Date().toISOString().split('T')[0]
  const todayLog = dailyHistory[todayStr] || { verses: 0 }
  const todayVerses = (todayLog.verses || 0) + activeSession.sessionVersesRead

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

  const handleShareAyah = () => {
    if (!currentAyah || !currentSurah) return
    const textToShare = `"${currentAyah.arabicText}"\n\n${currentAyah.translations[translationLanguage] || currentAyah.translations['en']}\n— Surah ${currentSurah.name} (${currentSurah.number}:${currentAyah.verseNumberInSurah}) via Deenly`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <div className="min-h-screen bg-[#0E0C18] text-white flex flex-col items-center justify-between pb-28 pt-2 px-4 max-w-lg mx-auto select-none relative font-sans">
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
        <div className="fixed top-28 right-6 z-50 animate-bounce pointer-events-none">
          <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400 text-white font-bold text-sm shadow-2xl flex items-center gap-2 backdrop-blur-lg">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>+{floatingHasanat.amount} Hasanat!</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP APP BAR (Back, Stats Capsule, Settings)                           */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between gap-3 pt-2">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-12 h-10 rounded-full bg-[#1B182E] border border-purple-900/40 text-purple-200 flex items-center justify-center hover:border-purple-500/60 transition cursor-pointer shrink-0 shadow-md"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Pill: Hasanat | Verses | Timer */}
        <div className="flex-1 max-w-[240px] h-10 rounded-full bg-[#1B182E]/90 border border-purple-900/50 px-3 flex items-center justify-between text-xs font-semibold shadow-inner">
          {/* Hasanat */}
          <div className="flex items-center gap-1.5 text-purple-300">
            <span className="text-sm">💜</span>
            <span>{activeSession.sessionHasanat}</span>
          </div>

          <span className="text-purple-700/60">|</span>

          {/* Verses */}
          <div className="flex items-center gap-1.5 text-blue-300">
            <span className="text-sm">📑</span>
            <span>{activeSession.sessionVersesRead}</span>
          </div>

          <span className="text-purple-700/60">|</span>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
            <span className="text-sm">⏱️</span>
            <span>{formatTimer(activeSession.elapsedSeconds)}</span>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          className="w-10 h-10 rounded-full bg-[#1B182E] border border-purple-900/40 text-purple-200 flex items-center justify-center hover:border-purple-500/60 transition cursor-pointer shrink-0 shadow-md"
          title="Reader Preferences"
        >
          <Settings className="w-5 h-5 text-purple-300" />
        </button>
      </header>

      {/* Quick Settings Drawer Modal */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-[#1B182E] border border-purple-800/40 rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Reading Settings</span>
              </h3>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs px-3 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Translation Language */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-purple-300">Translation Language:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTranslationLanguage('en')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
                    translationLanguage === 'en'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#25213E] text-purple-200 hover:bg-[#2F2A4E]'
                  }`}
                >
                  English (Sahih Intl)
                </button>
                <button
                  onClick={() => setTranslationLanguage('ta')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
                    translationLanguage === 'ta'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#25213E] text-purple-200 hover:bg-[#2F2A4E]'
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
              </div>
            </div>

            {/* Arabic Font Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span>Arabic Font Size:</span>
                <span className="font-mono text-amber-300">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="44"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 h-2 bg-purple-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP GAMIFICATION LEVEL CARD (Purple Gradient Box with Digit Counters) */}
      {/* ========================================================================= */}
      <section className="w-full mt-4 p-4 md:p-5 rounded-3xl bg-gradient-to-r from-[#6355C7] via-[#5143B8] to-[#4032A3] shadow-xl text-white relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold">
          {/* Level Badge */}
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold tracking-wide backdrop-blur-md">
            Lvl 01
          </span>

          {/* Goal Title */}
          <span className="text-sm font-bold tracking-wide">Break the egg</span>

          {/* Total Reading Minutes */}
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-black/20 text-white/90">
            Total: {Math.max(1, Math.floor(((user?.time || 0) + activeSession.elapsedSeconds) / 60))} min
          </span>
        </div>

        {/* Center Row: Egg Badge + Digit Countdown Boxes */}
        <div className="flex items-center justify-between mt-3 px-2">
          {/* Egg / Spiritual Milestone Badge */}
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner relative">
            <span className="text-2xl filter drop-shadow-md">🥚</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-900 border border-white text-[9px] font-bold flex items-center justify-center">
              1
            </div>
          </div>

          {/* Flip / Counter Digit Display */}
          <div className="flex items-center gap-1.5 font-mono font-bold text-xl md:text-2xl">
            {/* Box 1 */}
            <div className="w-10 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-md">
              {String(Math.floor(activeSession.elapsedSeconds / 60)).padStart(2, '0')[0]}
            </div>
            {/* Box 2 */}
            <div className="w-10 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-md">
              {String(Math.floor(activeSession.elapsedSeconds / 60)).padStart(2, '0')[1]}
            </div>

            <span className="text-white/80 font-bold px-0.5">:</span>

            {/* Box 3 */}
            <div className="w-10 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-md">
              {String(activeSession.elapsedSeconds % 60).padStart(2, '0')[0]}
            </div>
            {/* Box 4 */}
            <div className="w-10 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-md">
              {String(activeSession.elapsedSeconds % 60).padStart(2, '0')[1]}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROGRESS BAR & JUZ COUNTER STRIP                                       */}
      {/* ========================================================================= */}
      <section className="w-full mt-3 space-y-1.5">
        {/* Progress Bar */}
        <div className="w-full bg-[#1B182E] h-2 rounded-full overflow-hidden border border-purple-900/30">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, juzProgress.percent)}%` }}
          />
        </div>

        {/* Text Subtitle */}
        <div className="flex items-center justify-between text-xs font-semibold text-purple-300/90 px-1">
          <span>{todayVerses}/{dailyGoalVerses}</span>
          <span className="text-white/95">
            Juz {juzProgress.juzNumber} : {remainingVersesInJuz} Verses left
          </span>
          <span>{juzProgress.percent}%</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CENTER FLOATING WHITE AYAH CARD (Quranly Style)                       */}
      {/* ========================================================================= */}
      <main className="w-full mt-4 space-y-4">
        {isLoadingSurah ? (
          <div className="p-16 text-center space-y-3 bg-[#1B182E] rounded-[32px] border border-purple-900/40">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
            <p className="text-xs text-purple-300">Loading sacred Quranic verses...</p>
          </div>
        ) : currentAyah ? (
          <>
            {/* White Floating Ayah Card */}
            <div className="w-full p-6 md:p-8 rounded-[32px] bg-[#F9FAFC] text-gray-900 shadow-2xl space-y-5 border border-purple-100">
              {/* Card Header: Audio Play, Surah & Ayah Info, Heart, Bookmark */}
              <div className="flex items-center justify-between">
                {/* Left: Audio Play + Loop */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
                    title="Recite Ayah Audio"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold"
                    title="Loop Audio"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center: Surah Name & Ayah Counter */}
                <div className="text-center">
                  <h2 className="text-base font-bold text-gray-900">
                    {currentSurah?.number}. {currentSurah?.name}
                  </h2>
                  <p className="text-xs font-semibold text-gray-500">
                    {currentAyah.verseNumberInSurah}/{totalAyahs}
                  </p>
                </div>

                {/* Right: Like Count + Bookmark */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleLike}
                    className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`} />
                    <span className="text-[10px] font-bold text-gray-500">{(likeCount / 1000).toFixed(1)}K</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleBookmark}
                    className="text-gray-700 hover:text-purple-600 transition cursor-pointer"
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-purple-600 text-purple-600' : 'text-gray-700'}`} />
                  </button>
                </div>
              </div>

              {/* Arabic Calligraphy Script */}
              <div className="py-3 px-1 text-right" dir="rtl">
                <p
                  className="font-noto-serif text-gray-900 tracking-normal leading-[220%] select-text font-medium"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {currentAyah.arabicText} <span className="text-purple-600 font-serif text-2xl inline-block px-1">﴿{currentAyah.verseNumberInSurah}﴾</span>
                </p>
              </div>

              {/* Bottom Actions Row on White Card (Share, Rehal Book, Notes) */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShareAyah}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
                  title="Copy and Share Ayah"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>

                {/* Open Book Rehal Icon */}
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(true)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
                  title="Mushaf Page & Translation Settings"
                >
                  <BookOpen className="w-4 h-4" />
                </button>

                {/* Reflection Notes Icon */}
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(true)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
                  title="Write Personal Reflection"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 5. TRANSLITERATION & TRANSLATION SECTION (Dark Background Below Card)   */}
            {/* ========================================================================= */}
            <div className="space-y-3 px-2 pt-1 text-left">
              {/* English / Tamil Translation */}
              <p className="font-sans text-sm md:text-base text-white/90 leading-relaxed font-normal">
                {currentAyah.translations[translationLanguage] ||
                  currentAyah.translations['en'] ||
                  'Translation loading...'}
              </p>
            </div>
          </>
        ) : null}
      </main>

      {/* Reflection Note Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B182E] border border-purple-800/40 rounded-3xl p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>Personal Reflection (Surah {currentSurah?.name} : {currentAyah?.verseNumberInSurah})</span>
            </h3>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What spiritual lesson or reflection did you gain from this Ayah?"
              rows={4}
              className="w-full p-3 rounded-2xl bg-[#110E22] border border-purple-900/40 text-white text-xs placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReflectionModal(false)}
                className="px-4 py-2 rounded-full bg-[#25213E] text-xs font-semibold text-purple-200"
              >
                Close
              </button>
              <button
                onClick={() => setShowReflectionModal(false)}
                className="px-5 py-2 rounded-full bg-purple-600 text-xs font-bold text-white shadow-md hover:bg-purple-500"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BOTTOM NAVIGATION BAR (Previous Arrow, I'm Done, Next Arrow + Hasanat)*/}
      {/* ========================================================================= */}
      <footer className="fixed bottom-4 left-0 right-0 max-w-lg mx-auto px-4 z-40">
        <div className="flex items-center justify-between gap-3 relative">
          {/* Floating Hasanat Pill above the Next Button */}
          {currentAyah && (
            <div className="absolute -top-7 right-4 pointer-events-none">
              <span className="text-[11px] font-bold text-purple-200 tracking-wide">
                +{currentAyah.hasanatValue}
              </span>
            </div>
          )}

          {/* Left Button: Previous Ayah Arrow (Pill shape) */}
          <button
            type="button"
            onClick={handlePrevAyah}
            disabled={currentSurahNumber === 1 && currentAyahNumber === 1}
            className="w-24 h-13 rounded-full bg-[#1B182E] border border-purple-900/40 text-white flex items-center justify-center hover:border-purple-500 transition cursor-pointer shadow-lg disabled:opacity-40"
            title="Previous Ayah"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Center Button: "I'm Done" */}
          <button
            type="button"
            onClick={handleFinishSession}
            className="flex-1 h-13 rounded-full bg-[#1B182E] border border-purple-900/40 hover:border-purple-500 text-white text-xs md:text-sm font-bold flex items-center justify-center transition cursor-pointer shadow-lg active:scale-98"
          >
            I'm Done
          </button>

          {/* Right Button: Next Arrow (White Rounded Pill) */}
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
      {/* 7. SESSION COMPLETION CELEBRATION MODAL                                  */}
      {/* ========================================================================= */}
      {completedSessionData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-[32px] bg-[#1B182E] border border-purple-700/50 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-400 text-purple-300 mx-auto flex items-center justify-center shadow-xl">
              <Award className="w-8 h-8 text-purple-300 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-400 font-label-caps tracking-wider">
                Masha'Allah! Session Complete
              </span>
              <h3 className="text-2xl font-bold text-white">Spiritual Rewards Earned</h3>
              <p className="text-xs text-purple-300/80">
                Your recitation has been saved and synced to your cloud profile.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-[#120F24] border border-purple-900/40 text-center">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/30">
                <span className="text-[10px] text-purple-300 font-bold font-label-caps uppercase">Hasanat</span>
                <p className="text-lg font-bold text-purple-200 mt-0.5">
                  +{completedSessionData.hasanatEarned.toLocaleString()}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/30">
                <span className="text-[10px] text-purple-300 font-bold font-label-caps uppercase">Verses</span>
                <p className="text-lg font-bold text-white mt-0.5">
                  {completedSessionData.versesRead}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/30">
                <span className="text-[10px] text-purple-300 font-bold font-label-caps uppercase">Duration</span>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {formatDurationHuman(completedSessionData.durationSeconds)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletedSessionData(null)}
                className="flex-1 py-3 rounded-full bg-[#25213E] border border-purple-800/40 text-xs font-semibold text-purple-200 hover:border-purple-400 transition cursor-pointer"
              >
                Continue Reading
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedSessionData(null)
                  navigate('/dashboard')
                }}
                className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
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
