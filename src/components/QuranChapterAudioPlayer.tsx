import React, { useRef, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Repeat1, 
  ChevronDown, 
  X, 
  Compass, 
  Radio,
  Maximize2,
  Mic,
  Search,
  Check,
  Sparkles
} from 'lucide-react'
import { useQuranAudioStore, type RepeatMode } from '../store/useQuranAudioStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { QARI_LIST, getQariById, type QariStyle } from '../lib/qariData'
import { getArabicFontFamily } from '../lib/quranFonts'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import { useI18nStore } from '../lib/i18n'

function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export const QuranChapterAudioPlayer: React.FC = () => {
  const {
    isPlaying,
    isLoadingAudio,
    surahNumber,
    currentAyahNumberInSurah,
    currentAyahArabicText,
    currentAyahText,
    currentTime,
    duration,
    playbackRate,
    isMuted,
    volume,
    autoScroll,
    repeatMode,
    isPlayerVisible,
    isExpanded,
    selectedQariId,
    hifzRepeatCount,
    hifzCurrentIteration,
    togglePlay,
    seekTo,
    seekRelative,
    nextAyah,
    previousAyah,
    nextSurah,
    previousSurah,
    setPlaybackRate,
    toggleMute,
    setAutoScroll,
    setRepeatMode,
    setIsExpanded,
    setQari,
    setHifzRepeatCount,
    closePlayer,
  } = useQuranAudioStore()

  const [isQariModalOpen, setIsQariModalOpen] = useState(false)
  const [qariSearchQuery, setQariSearchQuery] = useState('')
  const [activeQariFilter, setActiveQariFilter] = useState<'all' | QariStyle>('all')
  const [previewingQariId, setPreviewingQariId] = useState<string | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const progressBarRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isReadingPage = location.pathname.startsWith('/reading')

  const appLanguage = useI18nStore((state) => state.appLanguage)
  const user = useAuthStore((state) => state.user)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const fontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const currentQari = useMemo(() => getQariById(selectedQariId), [selectedQariId])

  // Filter Qaris based on search query and style filter
  const filteredQaris = useMemo(() => {
    return QARI_LIST.filter((q) => {
      const matchesFilter = activeQariFilter === 'all' || q.style === activeQariFilter
      const query = qariSearchQuery.toLowerCase().trim()
      if (!query) return matchesFilter

      const matchesSearch = 
        q.nameEn.toLowerCase().includes(query) ||
        q.nameTa.toLowerCase().includes(query) ||
        q.nameAr.includes(query) ||
        q.country.toLowerCase().includes(query) ||
        q.styleLabelEn.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [qariSearchQuery, activeQariFilter])

  // Handle preview audio playback
  const handlePreviewQari = (qariId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewingQariId === qariId) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        setPreviewingQariId(null)
      }
      return
    }

    const q = getQariById(qariId)
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }
    const sampleUrl = `https://everyayah.com/data/${q.folderName}/001001.mp3`
    const audio = new Audio(sampleUrl)
    previewAudioRef.current = audio
    setPreviewingQariId(qariId)

    audio.play().catch(console.warn)
    audio.onended = () => setPreviewingQariId(null)
    audio.onerror = () => setPreviewingQariId(null)
  }

  const handleSelectQari = (qariId: string) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      setPreviewingQariId(null)
    }
    setQari(qariId)
    setIsQariModalOpen(false)
  }

  if (!isPlayerVisible) return null

  const surahMeta = SURAH_METADATA.find((s) => s.number === surahNumber) || SURAH_METADATA[0]
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeekbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width))
    seekTo(newPercent * duration)
  }

  const handleRepeatModeCycle = () => {
    const modes: RepeatMode[] = ['continuous', 'surah', 'verse', 'none']
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length
    setRepeatMode(modes[nextIdx])
  }

  const handleHifzRepeatCycle = () => {
    const counts = [1, 3, 5, 10, Infinity]
    const nextIdx = (counts.indexOf(hifzRepeatCount) + 1) % counts.length
    setHifzRepeatCount(counts[nextIdx])
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 🌟 1. IMMERSIVE EXPANDED FULLSCREEN MODAL (SPOTIFY NOW PLAYING STYLE)     */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col justify-between p-5 sm:p-8 animate-fade-in text-on-surface overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition cursor-pointer"
              title="Minimize to Floating Island"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary font-label-caps block">
                {appLanguage === 'ta' ? 'தற்போது ஓதப்படுகிறது • தொடர் ஓதுதல்' : 'Now Reciting • Continuous Mode'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                {surahMeta.number}. {appLanguage === 'ta' ? (surahMeta.nameTa || surahMeta.name) : surahMeta.name} ({appLanguage === 'ta' ? (surahMeta.englishNameTranslationTa || surahMeta.englishNameTranslation) : surahMeta.englishNameTranslation})
              </h2>
            </div>

            <button
              onClick={closePlayer}
              className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface hover:text-rose-400 transition cursor-pointer"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Verse Canvas */}
          <div className="max-w-3xl mx-auto w-full my-auto py-6 space-y-5 text-center">
            {/* Active Qari Capsule Switcher */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsQariModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-primary/40 bg-surface-container-high/80 hover:border-primary text-xs font-bold transition shadow-sm cursor-pointer group"
              >
                <span className="text-base">{currentQari.flag}</span>
                <span className="text-on-surface group-hover:text-primary transition-colors">
                  {appLanguage === 'ta' ? currentQari.nameTa : currentQari.nameEn}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/25">
                  {currentQari.bitrate}
                </span>
                <Mic className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>

            {/* Arabic Script */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/85 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-outline font-semibold pb-2 border-b border-outline-variant/20">
                <span className="text-primary font-bold">
                  {appLanguage === 'ta' ? `வசனம் ${currentAyahNumberInSurah} / ${surahMeta.numberOfAyahs}` : `Ayah ${currentAyahNumberInSurah} of ${surahMeta.numberOfAyahs}`}
                </span>
                <span className="text-tertiary flex items-center gap-1.5">
                  <span>{currentQari.flag}</span>
                  <span>{appLanguage === 'ta' ? currentQari.nameTa : currentQari.nameEn}</span>
                </span>
              </div>

              <p
                className="text-on-surface text-center leading-[2.6] sm:leading-[2.8] tracking-wide pt-3 text-2xl sm:text-3xl md:text-4xl"
                style={{ fontFamily: arabicFontFamily }}
                dir="rtl"
              >
                {currentAyahArabicText}{' '}
                <span className="text-primary font-serif text-2xl inline-block px-1">
                  ﴿{currentAyahNumberInSurah}﴾
                </span>
              </p>
            </div>

            {/* Translation */}
            {currentAyahText && (
              <p className="text-sm sm:text-base text-on-surface-variant italic max-w-xl mx-auto leading-relaxed">
                "{currentAyahText}"
              </p>
            )}
          </div>

          {/* Expanded Bottom Controls */}
          <div className="max-w-xl mx-auto w-full space-y-4 pt-2">
            {/* Seekbar */}
            <div className="space-y-1.5">
              <div
                ref={progressBarRef}
                onClick={handleSeekbarClick}
                className="h-2 w-full bg-surface-container-highest rounded-full cursor-pointer relative overflow-hidden group"
              >
                <div
                  className="h-full primary-gradient-btn rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-outline">
                <span>{formatAudioTime(currentTime)}</span>
                <span>{formatAudioTime(duration)}</span>
              </div>
            </div>

            {/* Main Control Buttons */}
            <div className="flex items-center justify-between">
              {/* Repeat Mode */}
              <button
                onClick={handleRepeatModeCycle}
                className={`p-3 rounded-full transition cursor-pointer ${
                  repeatMode !== 'none'
                    ? 'text-primary bg-primary/15'
                    : 'text-outline hover:text-on-surface'
                }`}
                title={`Repeat Mode: ${repeatMode}`}
              >
                {repeatMode === 'verse' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>

              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={previousAyah}
                  className="p-3 rounded-full text-on-surface hover:text-primary transition cursor-pointer"
                  title="Previous Verse"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={() => seekRelative(-10)}
                  className="p-2.5 rounded-full text-outline hover:text-on-surface transition cursor-pointer"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full primary-gradient-btn flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoadingAudio ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 fill-white ml-1" />
                  )}
                </button>

                <button
                  onClick={() => seekRelative(10)}
                  className="p-2.5 rounded-full text-outline hover:text-on-surface transition cursor-pointer"
                  title="Forward 10s"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                <button
                  onClick={nextAyah}
                  className="p-3 rounded-full text-on-surface hover:text-primary transition cursor-pointer"
                  title="Next Verse"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Speed Button */}
              <button
                onClick={() => {
                  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0]
                  const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]
                  setPlaybackRate(nextSpeed)
                }}
                className="text-xs font-bold font-mono px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary transition cursor-pointer"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>
            </div>

            {/* Auxiliary Tools Row (Qari Picker, Hifz Repeat, Mute, Autoscroll) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-outline-variant/20">
              {/* Qari Selector Trigger */}
              <button
                onClick={() => setIsQariModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[130px] font-semibold">{currentQari.nameEn.split(' ').slice(-1)[0]}</span>
              </button>

              {/* Hifz Repeat Loop */}
              <button
                onClick={handleHifzRepeatCycle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition cursor-pointer ${
                  hifzRepeatCount > 1
                    ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                    : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface'
                }`}
                title="Hifz Memorization Loop Counter"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Hifz:{' '}
                  {hifzRepeatCount === Infinity
                    ? '∞ Loop'
                    : hifzRepeatCount === 1
                    ? '1x (Off)'
                    : `${hifzCurrentIteration}/${hifzRepeatCount}x`}
                </span>
              </button>

              {/* Prev / Next Surah Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={previousSurah}
                  className="px-2.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-bold text-outline hover:text-on-surface transition cursor-pointer"
                  title="Previous Chapter"
                >
                  |« Prev Surah
                </button>
                <button
                  onClick={nextSurah}
                  className="px-2.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-bold text-outline hover:text-on-surface transition cursor-pointer"
                  title="Next Chapter"
                >
                  Next Surah »|
                </button>
              </div>

              {/* Volume / Mute */}
              <button
                onClick={toggleMute}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer"
                title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                )}
                <span className="text-[11px]">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
              </button>

              {/* Autoscroll Toggle */}
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition cursor-pointer ${
                  autoScroll
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface'
                }`}
                title={autoScroll ? 'Autoscroll Active' : 'Autoscroll Disabled'}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="text-[11px]">{autoScroll ? 'Autoscroll On' : 'Autoscroll'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 2. MINI FLOATING DYNAMIC ISLAND PLAYER (SLEEK CAPSULE HOVERING)        */}
      {/* ========================================================================= */}
      {!isExpanded && (
        <div
          className={`fixed z-40 transition-all duration-300 pointer-events-auto ${
            isReadingPage
              ? 'bottom-20 right-3 sm:right-6 sm:bottom-6 max-w-[340px] sm:max-w-[420px]'
              : 'bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[430px]'
          }`}
        >
          {/* Dynamic Island Capsule Outer Wrapper */}
          <div className="relative rounded-full glass-card border border-primary/50 bg-surface/92 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.55)] ring-1 ring-primary/25 p-2 pl-2.5 pr-2 transition-all duration-300 flex items-center justify-between gap-2.5 hover:border-primary hover:shadow-[0_16px_50px_rgba(124,58,237,0.3)] animate-spring-up group overflow-hidden">
            
            {/* Integrated Slim Scrubber Line at bottom */}
            <div
              ref={progressBarRef}
              onClick={handleSeekbarClick}
              className="absolute bottom-0 left-3 right-3 h-[2px] bg-outline-variant/30 cursor-pointer group-hover:h-[3px] transition-all overflow-hidden rounded-full"
              title="Click to seek"
            >
              <div
                className="h-full primary-gradient-btn relative transition-all duration-100 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Left: Animated Sound Wave Avatar & Surah Info (Click to Expand) */}
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none"
              title="Tap to open full player view"
            >
              {/* Pulsating Audio Equalizer Icon */}
              <div className="w-9 h-9 rounded-full primary-gradient-btn flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform relative">
                {isPlaying ? (
                  <div className="flex items-end gap-[2px] h-3.5">
                    <span className="w-[2.5px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                    <span className="w-[2.5px] bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" style={{ height: '100%' }} />
                    <span className="w-[2.5px] bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '45%' }} />
                  </div>
                ) : (
                  <Radio className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Title & Ayah Progress */}
              <div className="min-w-0 flex-1 truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {surahMeta.number}. {appLanguage === 'ta' ? (surahMeta.nameTa || surahMeta.name) : surahMeta.name}
                  </span>
                  <span className="text-[11px] text-primary font-bold hidden sm:inline shrink-0" dir="rtl" style={{ fontFamily: arabicFontFamily }}>
                    {surahMeta.arabicName}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant truncate flex items-center gap-1">
                  <span className="font-semibold text-primary">
                    {appLanguage === 'ta' ? `வசனம் ${currentAyahNumberInSurah}/${surahMeta.numberOfAyahs}` : `Ayah ${currentAyahNumberInSurah}/${surahMeta.numberOfAyahs}`}
                  </span>
                  <span>•</span>
                  <span className="truncate">{currentQari.flag} {currentQari.nameEn.split(' ').slice(-1)[0]}</span>
                  {playbackRate !== 1.0 && (
                    <span className="text-[9px] font-mono px-1 rounded bg-surface-container font-bold text-primary">
                      {playbackRate}x
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Touch Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Qari Switcher Quick Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsQariModalOpen(true)
                }}
                className="w-7 h-7 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high flex items-center justify-center transition cursor-pointer"
                title={`Change Reciter: ${currentQari.nameEn}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* Prev Verse */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  previousAyah()
                }}
                className="w-7 h-7 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition cursor-pointer"
                title="Previous Ayah"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Main Play/Pause Floating Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full primary-gradient-btn flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoadingAudio ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ml-0.5" />
                )}
              </button>

              {/* Next Verse */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextAyah()
                }}
                className="w-7 h-7 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition cursor-pointer"
                title="Next Ayah"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Expand Fullscreen Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(true)
                }}
                className="w-7 h-7 rounded-full text-outline hover:text-primary hover:bg-surface-container-high flex items-center justify-center transition cursor-pointer ml-0.5"
                title="Expand to Fullscreen Player"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Dismiss / Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closePlayer()
                }}
                className="w-7 h-7 rounded-full text-outline hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition cursor-pointer"
                title="Dismiss Player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 3. MULTI-QARI SELECTOR MODAL / BOTTOM SHEET                            */}
      {/* ========================================================================= */}
      {isQariModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div 
            className="w-full sm:max-w-2xl bg-surface border border-outline-variant/30 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-outline-variant/20 flex items-center justify-between shrink-0 bg-surface-container-low/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">
                    {appLanguage === 'ta' ? 'காரீ ஓதுபவர் தேர்வு' : 'Choose Quran Reciter (Qari)'}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {appLanguage === 'ta' 
                      ? '13 உலகப் புகழ்பெற்ற காரீக்கள் • உயர்தர ஆடியோ' 
                      : '13 World-renowned authentic reciters • High-fidelity audio'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (previewAudioRef.current) previewAudioRef.current.pause()
                  setIsQariModalOpen(false)
                }}
                className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar & Filter Chips */}
            <div className="p-4 border-b border-outline-variant/20 space-y-3 shrink-0 bg-surface-container-lowest">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={qariSearchQuery}
                  onChange={(e) => setQariSearchQuery(e.target.value)}
                  placeholder={appLanguage === 'ta' ? 'காரீ பெயர் அல்லது நாட்டைத் தேடுங்கள்...' : 'Search by Qari name, style, or country...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition"
                />
                {qariSearchQuery && (
                  <button
                    onClick={() => setQariSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: 'all', label: appLanguage === 'ta' ? 'அனைத்தும் (13)' : 'All (13)' },
                  { id: 'murattal', label: appLanguage === 'ta' ? 'முரத்தல் (Studio)' : 'Murattal' },
                  { id: 'haramain', label: appLanguage === 'ta' ? 'மக்கா ஹரமைன்' : 'Makkah Imams' },
                  { id: 'mujawwad', label: appLanguage === 'ta' ? 'முஜவ்வத் (Maqam)' : 'Mujawwad' },
                  { id: 'teaching', label: appLanguage === 'ta' ? 'கற்றல் முறை' : 'Teaching / Hifz' },
                  { id: 'emotional', label: appLanguage === 'ta' ? 'ஆன்மீக உணர்வு' : 'Emotional' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveQariFilter(chip.id as any)}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border ${
                      activeQariFilter === chip.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container/70 border-outline-variant/30 text-outline hover:text-on-surface hover:border-primary/40'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Qari Cards List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {filteredQaris.map((q) => {
                const isSelected = selectedQariId === q.id
                const isPreviewing = previewingQariId === q.id

                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQari(q.id)}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary/15 border-primary shadow-md ring-2 ring-primary/40'
                        : 'glass-card border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    {/* Qari Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        <span>{q.flag}</span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-on-surface block truncate">
                            {appLanguage === 'ta' ? q.nameTa : q.nameEn}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {appLanguage === 'ta' ? (q.badgeTa || q.styleLabelTa) : (q.badgeEn || q.styleLabelEn)}
                          </span>
                        </div>

                        <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                          {appLanguage === 'ta' ? q.descriptionTa : q.descriptionEn}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-outline pt-0.5">
                          <span className="font-semibold">{q.country}</span>
                          <span>•</span>
                          <span className="font-mono">{q.bitrate}</span>
                          <span>•</span>
                          <span className="font-arabic" dir="rtl">{q.nameAr}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Sample Audio Preview & Select Status */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
                      <button
                        type="button"
                        onClick={(e) => handlePreviewQari(q.id, e)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isPreviewing
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                            : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface hover:border-primary/40'
                        }`}
                        title="Listen to sample audio"
                      >
                        {isPreviewing ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Previewing</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Preview</span>
                          </>
                        )}
                      </button>

                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredQaris.length === 0 && (
                <div className="text-center py-10 text-outline space-y-2">
                  <Mic className="w-8 h-8 mx-auto text-outline/50" />
                  <p className="text-xs font-semibold">No reciters found matching "{qariSearchQuery}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low text-center text-[11px] text-outline shrink-0">
              {appLanguage === 'ta'
                ? '💡 ஆடியோ தடையின்றி இயங்க EveryAyah & QuranCDN வழியாக நேரடியாக ஸ்ட்ரீம் செய்யப்படுகிறது.'
                : '💡 High-definition audio is streamed dynamically via EveryAyah & QuranCDN.'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
