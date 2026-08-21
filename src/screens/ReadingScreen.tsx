import React, { useEffect, useState, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  Share2, 
  Type, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
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
  const [showFullView, setShowFullView] = useState(true)
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
  const isPlayingAudio = useReadingStore((state) => state.isPlayingAudio)
  const setIsPlayingAudio = useReadingStore((state) => state.setIsPlayingAudio)
  const isAudioMuted = useReadingStore((state) => state.isAudioMuted)
  const toggleAudioMute = useReadingStore((state) => state.toggleAudioMute)
  const loadSurah = useReadingStore((state) => state.loadSurah)

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
        useReadingStore.getState().setCurrentPosition(sNum, aNum)
        loadSurah(sNum)
        startSession()
        return
      }
    }

    loadSurah(currentSurahNumber || 1)
    startSession()
  }, [searchParams, currentSurahNumber, loadSurah, startSession])

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

  // Calculate dynamic Juz progress
  const juzProgress = calculateJuzProgress(currentSurahNumber || 1, currentAyahNumber || 1)

  const handleMarkAyahRead = (ayah: NonNullable<typeof currentSurah>['ayahs'][number]) => {
    const earned = markAyahRead(ayah)
    if (earned > 0) {
      setFloatingHasanat({ amount: earned, id: Date.now() })
      setTimeout(() => setFloatingHasanat(null), 1800)
    }

    // Auto-advance to next Ayah or next Surah
    if (currentSurah) {
      if (ayah.verseNumberInSurah < currentSurah.numberOfAyahs) {
        useReadingStore.getState().setCurrentPosition(
          currentSurahNumber,
          ayah.verseNumberInSurah + 1,
          ayah.page,
          ayah.juz
        )
      } else if (currentSurahNumber < 114) {
        // Move to next Surah
        loadSurah(currentSurahNumber + 1)
      }
    }
  }

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
    }
  }

  const handlePrevSurah = () => {
    if (currentSurahNumber > 1) {
      loadSurah(currentSurahNumber - 1)
    }
  }

  const handleNextSurah = () => {
    if (currentSurahNumber < 114) {
      loadSurah(currentSurahNumber + 1)
    }
  }

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Floating Animated Hasanat Indicator */}
      {floatingHasanat && (
        <div className="fixed top-24 right-8 z-50 animate-bounce pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-tertiary-container/90 border border-tertiary text-tertiary font-bold text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-tertiary animate-spin" />
            <span>+{floatingHasanat.amount} Hasanat!</span>
          </div>
        </div>
      )}

      {/* Top Header & Mobile/Tablet Controls */}
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

        <div className="flex items-center gap-2.5">
          {/* Surah Dropdown Selector */}
          <select
            value={currentSurahNumber}
            onChange={handleSurahChange}
            className="bg-surface-container border border-outline-variant/40 rounded-full px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
          >
            {SURAH_METADATA.map((s) => (
              <option key={s.number} value={s.number} className="bg-surface-container text-on-surface">
                {s.number}. {s.name} ({s.arabicName})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFullView(!showFullView)}
            className="text-xs px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-secondary hover:border-primary transition shrink-0 cursor-pointer"
          >
            {showFullView ? 'Show Project Scaffold View' : 'Show Stitch UI View'}
          </button>
        </div>
      </div>

      {showFullView ? (
        <div className="space-y-6">
          {/* Mobile & Tablet Top Session Strip (Hidden on Desktop, as Desktop has Dedicated Right Rail) */}
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
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
              <p className="text-[10px] text-outline text-right">
                {juzProgress.versesCompletedInJuz} of {juzProgress.totalVersesInJuz} verses in Juz
              </p>
            </div>
          </div>

          {/* Sticky Reader Controls Bar (Mobile & Tablet) */}
          <div className="lg:hidden sticky top-20 z-30 p-3.5 rounded-2xl glass-nav border border-outline-variant/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-10 h-10 rounded-full primary-gradient-btn text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={toggleAudioMute}
                className="p-2 rounded-lg text-outline hover:text-on-surface transition cursor-pointer"
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4 text-error" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-surface-container/80 p-1 rounded-full border border-outline-variant/30 text-xs">
              <Globe className="w-3.5 h-3.5 text-secondary ml-1.5 mr-0.5" />
              <button
                onClick={() => setTranslationLanguage('en')}
                className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                  translationLanguage === 'en'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setTranslationLanguage('ta')}
                className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                  translationLanguage === 'ta'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Typography Scale */}
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

            {/* Finish Session */}
            <button
              onClick={handleFinishSession}
              className="px-4 py-2 rounded-full bg-tertiary-container text-on-tertiary-container font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I'm Done</span>
            </button>
          </div>

          {/* Desktop 2-Column Responsive Layout: Left Main Verses + Right Session Control Rail */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left/Center Main Column: Verses Reading Feed */}
            <div className="flex-1 w-full max-w-3xl space-y-4">
              {isLoadingSurah ? (
                <div className="p-16 text-center space-y-3 glass-card rounded-3xl border border-outline-variant/30">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-on-surface-variant">Loading sacred verses and translations...</p>
                </div>
              ) : (
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

                          {/* Hasanat & Letter Count Badges */}
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] text-outline border border-outline-variant/30">
                              {verse.arabicLetterCount} letters
                            </span>
                            <span 
                              title={`Reciting this ayah earns ${verse.hasanatValue} Hasanat (${verse.arabicLetterCount} letters x 10)`}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 border border-tertiary/30 text-tertiary text-[11px] font-semibold"
                            >
                              <Sparkles className="w-3 h-3" />
                              +{verse.hasanatValue} Hasanat
                            </span>

                            <button 
                              title="Bookmark Ayah"
                              className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary cursor-pointer"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button 
                              title="Share Ayah"
                              className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Arabic Script (Noto Serif with CSS font size) */}
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
                            onClick={() => handleMarkAyahRead(verse)}
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

                  {/* Next/Prev Chapter Navigation Footer */}
                  <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 flex items-center justify-between">
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
              )}
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

                {/* Desktop "I'm Done" Action */}
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

                {/* Audio Recitation Bar */}
                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-9 h-9 rounded-full primary-gradient-btn text-white flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-on-surface">Mishary Alafasy</p>
                      <p className="text-[10px] text-tertiary">Reciter</p>
                    </div>
                  </div>

                  <button
                    onClick={toggleAudioMute}
                    className="p-2 rounded-lg text-outline hover:text-on-surface transition cursor-pointer"
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4 text-error" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ScreenPlaceholder
          title="Quran Reading Screen"
          description="Immersive Quran reader featuring Arabic typography with diacritics, live session timer, precomputed Arabic letter counts for Hasanat rewards, multi-language translations (English & Tamil), and offline IndexedDB caching."
          stitchScreenName="Deenly Reading Interface / Deenly Reading - Desktop / Deenly Reading - Tablet"
          stitchScreenId="138d0a978cca40c5b98c1997cea27d6d / 4b77f69b61df40108504081e6b39348f"
          stitchReady={true}
          currentRoute="/reading"
          featuresList={[
            'Desktop two-column layout with centered verses and sticky session control rail',
            'Active session timer recording reading duration to daily and lifetime stats',
            'Live +N Hasanat animated badge calculation on marking Ayahs read',
            'Dynamic Juz-level progress bar and percentage tracker',
            'Multi-language translation storage with instant English / Tamil toggle',
          ]}
        />
      )}

      {/* Session Completion Celebration Modal */}
      {completedSessionData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl glass-card border border-tertiary/40 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-container/40 border border-tertiary text-tertiary mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold font-h2 text-on-surface">Masha'Allah! Session Complete</h3>
              <p className="text-xs text-on-surface-variant">
                May Allah accept your recitation and elevate your ranks.
              </p>
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
              <div>
                <p className="text-xs text-outline font-medium">Hasanat</p>
                <p className="text-lg font-bold text-tertiary">+{completedSessionData.hasanatEarned.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-outline font-medium">Verses</p>
                <p className="text-lg font-bold text-on-surface">{completedSessionData.versesRead}</p>
              </div>
              <div>
                <p className="text-xs text-outline font-medium">Duration</p>
                <p className="text-lg font-bold text-on-surface">{formatDurationHuman(completedSessionData.durationSeconds)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCompletedSessionData(null)
                  startSession()
                }}
                className="flex-1 py-3 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-semibold text-on-surface hover:border-primary transition cursor-pointer"
              >
                Keep Reading
              </button>
              <Link
                to="/dashboard"
                onClick={() => setCompletedSessionData(null)}
                className="flex-1 py-3 rounded-full primary-gradient-btn text-xs font-semibold text-white shadow-lg flex items-center justify-center cursor-pointer"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
