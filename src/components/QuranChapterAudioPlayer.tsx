import React, { useRef } from 'react'
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
  ChevronUp, 
  ChevronDown, 
  X, 
  Compass, 
  Radio 
} from 'lucide-react'
import { useQuranAudioStore, type RepeatMode } from '../store/useQuranAudioStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { getArabicFontFamily } from '../lib/quranFonts'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'

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
    closePlayer,
  } = useQuranAudioStore()

  const progressBarRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((state) => state.user)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const fontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

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

  return (
    <>
      {/* ========================================================================= */}
      {/* 🌟 1. IMMERSIVE EXPANDED FULLSCREEN MODAL (SPOTIFY NOW PLAYING STYLE)     */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 animate-fade-in text-on-surface overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition cursor-pointer"
              title="Minimize Player"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary font-label-caps block">
                Now Reciting • Continuous Mode
              </span>
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                {surahMeta.number}. {surahMeta.name} ({surahMeta.englishNameTranslation})
              </h2>
            </div>

            <button
              onClick={closePlayer}
              className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition cursor-pointer"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Verse Canvas */}
          <div className="max-w-3xl mx-auto w-full my-auto py-8 space-y-6 text-center">
            {/* Arabic Script */}
            <div className="p-8 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/85 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-outline font-semibold pb-2 border-b border-outline-variant/20">
                <span className="text-primary font-bold">
                  Ayah {currentAyahNumberInSurah} of {surahMeta.numberOfAyahs}
                </span>
                <span className="text-tertiary">Mishary Rashid Alafasy</span>
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
          <div className="max-w-xl mx-auto w-full space-y-4 pt-4">
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

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleRepeatModeCycle}
                className={`p-3 rounded-full transition cursor-pointer ${
                  repeatMode !== 'none'
                    ? 'text-primary bg-primary/15'
                    : 'text-outline hover:text-on-surface'
                }`}
                title={`Repeat: ${repeatMode}`}
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
                  const speeds = [0.75, 1.0, 1.25, 1.5]
                  const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]
                  setPlaybackRate(nextSpeed)
                }}
                className="text-xs font-bold font-mono px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary transition cursor-pointer"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 2. FLOATING FOOTER DOCKED AUDIO BAR (SPOTIFY / APPLE MUSIC STYLE)      */}
      {/* ========================================================================= */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-surface-container/95 backdrop-blur-2xl border-t border-outline-variant/30 shadow-2xl p-2.5 sm:p-3 transition-all duration-300">
        
        {/* Continuous Scrubber Line at the very top of the dock */}
        <div
          ref={progressBarRef}
          onClick={handleSeekbarClick}
          className="absolute -top-1 left-0 right-0 h-1.5 bg-surface-container-highest/80 cursor-pointer group hover:h-2 transition-all"
          title="Click to seek"
        >
          <div
            className="h-full primary-gradient-btn relative transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Track Info & Animated Equalizer */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-initial sm:w-72 cursor-pointer group"
          >
            {/* Pulsating Audio Equalizer Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl primary-gradient-btn flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                  <span className="w-1 bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" style={{ height: '100%' }} />
                  <span className="w-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
                </div>
              ) : (
                <Radio className="w-5 h-5 text-white" />
              )}
            </div>

            <div className="truncate">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs sm:text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {surahMeta.number}. {surahMeta.name}
                </span>
                <span className="font-noto-serif text-xs text-primary font-bold hidden sm:inline truncate" dir="rtl">
                  ({surahMeta.arabicName})
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-outline truncate flex items-center gap-1">
                <span>Ayah {currentAyahNumberInSurah}/{surahMeta.numberOfAyahs}</span>
                <span>•</span>
                <span className="truncate">Mishary Alafasy</span>
              </p>
            </div>
          </div>

          {/* Center: Main Playback Controls */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Prev Chapter */}
              <button
                onClick={previousSurah}
                className="p-1.5 sm:p-2 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition cursor-pointer hidden md:flex"
                title="Previous Surah"
              >
                <span className="text-[10px] font-bold">|«</span>
              </button>

              {/* Prev Verse */}
              <button
                onClick={previousAyah}
                className="p-1.5 sm:p-2 rounded-full text-on-surface hover:text-primary transition cursor-pointer"
                title="Previous Ayah"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* -10s */}
              <button
                onClick={() => seekRelative(-10)}
                className="p-1.5 rounded-full text-outline hover:text-on-surface transition cursor-pointer hidden sm:flex"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Main Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full primary-gradient-btn flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoadingAudio ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                )}
              </button>

              {/* +10s */}
              <button
                onClick={() => seekRelative(10)}
                className="p-1.5 rounded-full text-outline hover:text-on-surface transition cursor-pointer hidden sm:flex"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Next Verse */}
              <button
                onClick={nextAyah}
                className="p-1.5 sm:p-2 rounded-full text-on-surface hover:text-primary transition cursor-pointer"
                title="Next Ayah"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Next Chapter */}
              <button
                onClick={nextSurah}
                className="p-1.5 sm:p-2 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition cursor-pointer hidden md:flex"
                title="Next Surah"
              >
                <span className="text-[10px] font-bold">»|</span>
              </button>
            </div>

            {/* Time stamps */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-outline">
              <span>{formatAudioTime(currentTime)}</span>
              <span>/</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>

          {/* Right: Extra Tools (Speed, Autoscroll, Repeat, Expand, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Repeat Mode */}
            <button
              onClick={handleRepeatModeCycle}
              className={`p-2 rounded-full transition cursor-pointer hidden sm:flex ${
                repeatMode !== 'none'
                  ? 'text-primary bg-primary/15'
                  : 'text-outline hover:text-on-surface'
              }`}
              title={`Repeat Mode: ${repeatMode} (Tap to change)`}
            >
              {repeatMode === 'verse' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>

            {/* Speed Pill */}
            <button
              onClick={() => {
                const speeds = [0.75, 1.0, 1.25, 1.5]
                const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]
                setPlaybackRate(nextSpeed)
              }}
              className="px-2 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-[10px] font-mono font-bold text-on-surface hover:border-primary transition cursor-pointer hidden sm:block"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* AutoScroll Toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 rounded-full transition cursor-pointer hidden md:flex ${
                autoScroll
                  ? 'text-tertiary bg-tertiary/15'
                  : 'text-outline hover:text-on-surface'
              }`}
              title={autoScroll ? 'Autoscroll Active' : 'Autoscroll Disabled'}
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Volume / Mute */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-full text-outline hover:text-on-surface transition cursor-pointer hidden md:flex"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Expand */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-full text-outline hover:text-primary transition cursor-pointer"
              title="Expand Fullscreen View"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Close Player */}
            <button
              onClick={closePlayer}
              className="p-2 rounded-full text-outline hover:text-rose-400 transition cursor-pointer"
              title="Dismiss Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
