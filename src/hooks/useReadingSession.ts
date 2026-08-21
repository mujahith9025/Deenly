import { useReadingStore } from '../store/useReadingStore'

export function useReadingSession() {
  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)
  const currentJuzNumber = useReadingStore((state) => state.currentJuzNumber)
  const currentPageNumber = useReadingStore((state) => state.currentPageNumber)
  const fontSize = useReadingStore((state) => state.fontSize)
  const isPlayingAudio = useReadingStore((state) => state.isPlayingAudio)
  const isAudioMuted = useReadingStore((state) => state.isAudioMuted)
  const setCurrentPosition = useReadingStore((state) => state.setCurrentPosition)
  const setFontSize = useReadingStore((state) => state.setFontSize)
  const setIsPlayingAudio = useReadingStore((state) => state.setIsPlayingAudio)
  const toggleAudioMute = useReadingStore((state) => state.toggleAudioMute)
  const resetSession = useReadingStore((state) => state.resetSession)

  return {
    currentSurahNumber,
    currentAyahNumber,
    currentJuzNumber,
    currentPageNumber,
    fontSize,
    isPlayingAudio,
    isAudioMuted,
    setCurrentPosition,
    setFontSize,
    setIsPlayingAudio,
    toggleAudioMute,
    resetSession,
  }
}
