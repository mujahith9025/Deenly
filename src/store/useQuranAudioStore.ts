import { create } from 'zustand'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { quranApi } from '../lib/quranApi'
import type { SurahDetail } from '../types/quran'

export type RepeatMode = 'none' | 'verse' | 'surah' | 'continuous'

interface QuranAudioState {
  // Playback state
  isPlaying: boolean
  isLoadingAudio: boolean
  surahNumber: number
  currentAyahIndex: number
  currentAyahNumberInSurah: number
  currentAyahGlobalNumber: number
  currentAyahText: string
  currentAyahArabicText: string
  currentTime: number
  duration: number
  playbackRate: number
  isMuted: boolean
  volume: number
  autoScroll: boolean
  repeatMode: RepeatMode
  isPlayerVisible: boolean
  isExpanded: boolean

  // Active Surah cache
  currentSurahData: SurahDetail | null
  
  // Actions
  playSurah: (surahNum: number, startAyahNumberInSurah?: number) => Promise<void>
  playSingleAyah: (surahNum: number, ayahNumberInSurah: number, surahData?: SurahDetail) => Promise<void>
  togglePlay: () => void
  pause: () => void
  resume: () => void
  seekTo: (seconds: number) => void
  seekRelative: (deltaSeconds: number) => void
  nextAyah: () => void
  previousAyah: () => void
  nextSurah: () => void
  previousSurah: () => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setAutoScroll: (autoScroll: boolean) => void
  setRepeatMode: (mode: RepeatMode) => void
  setIsExpanded: (expanded: boolean) => void
  closePlayer: () => void
  setSurahData: (data: SurahDetail) => void
}

// Single singleton HTML5 Audio element instance for smooth continuous playback & background persistence
let globalAudio: HTMLAudioElement | null = null

function getAudioElement(): HTMLAudioElement {
  if (!globalAudio && typeof window !== 'undefined') {
    globalAudio = new Audio()
    globalAudio.preload = 'auto'
  }
  return globalAudio!
}

// Helper to format 3-digit Surah/Ayah numbers for alternate audio sources
function padZero(num: number, size = 3): string {
  let s = num.toString()
  while (s.length < size) s = '0' + s
  return s
}

// Get high-reliability CDN audio url for a given global ayah number / surah-ayah
function getAyahAudioUrl(globalAyahNumber: number, surahNumber: number, ayahNumberInSurah: number): string {
  // Primary CDN: Islamic Network (Mishary Rashid Alafasy 128kbps)
  if (globalAyahNumber > 0) {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`
  }
  // Secondary fallback: EveryAyah CDN
  return `https://everyayah.com/data/Alafasy_128kbps/${padZero(surahNumber)}${padZero(ayahNumberInSurah)}.mp3`
}

export const useQuranAudioStore = create<QuranAudioState>((set, get) => {
  // Attach audio lifecycle listeners
  if (typeof window !== 'undefined') {
    const audio = getAudioElement()

    audio.ontimeupdate = () => {
      set({ 
        currentTime: audio.currentTime || 0,
        duration: audio.duration || 0 
      })

      // Update MediaSession playback position for OS lockscreen / Bluetooth
      if ('mediaSession' in navigator && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(audio.currentTime, audio.duration)
          })
        } catch {}
      }
    }

    audio.onloadedmetadata = () => {
      set({ duration: audio.duration || 0, isLoadingAudio: false })
    }

    audio.onwaiting = () => {
      set({ isLoadingAudio: true })
    }

    audio.onplaying = () => {
      set({ isPlaying: true, isLoadingAudio: false })
    }

    audio.onpause = () => {
      set({ isPlaying: false })
    }

    audio.onended = () => {
      const state = get()
      const { repeatMode } = state

      if (repeatMode === 'verse') {
        audio.currentTime = 0
        audio.play().catch(console.warn)
        return
      }

      // Continuous playback: Advance to next Ayah or next Surah
      state.nextAyah()
    }

    audio.onerror = (e) => {
      console.warn('Audio playback error encountered:', e)
      set({ isLoadingAudio: false, isPlaying: false })
    }
  }

  // Update Media Session Lockscreen Metadata
  const updateMediaSession = (surahNum: number, ayahNumInSurah: number) => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

    const surahMeta = SURAH_METADATA.find(s => s.number === surahNum) || SURAH_METADATA[0]
    
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Surah ${surahMeta.name} (${surahMeta.arabicName}) — Ayah ${ayahNumInSurah}/${surahMeta.numberOfAyahs}`,
        artist: 'Sheikh Mishary Rashid Alafasy',
        album: `Holy Quran • ${surahMeta.englishNameTranslation} (${surahMeta.revelationType})`,
        artwork: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ]
      })

      // Background Lockscreen Action Handlers (Spotify-like experience)
      navigator.mediaSession.setActionHandler('play', () => get().resume())
      navigator.mediaSession.setActionHandler('pause', () => get().pause())
      navigator.mediaSession.setActionHandler('previoustrack', () => get().previousAyah())
      navigator.mediaSession.setActionHandler('nexttrack', () => get().nextAyah())
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        get().seekRelative(-(details.seekOffset || 10))
      })
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        get().seekRelative(details.seekOffset || 10)
      })
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) get().seekTo(details.seekTime)
      })
    } catch (err) {
      console.warn('Failed to configure MediaSession:', err)
    }
  }

  // Internal helper to start playing a specific Ayah within current loaded Surah
  const playAyahInternal = async (surahData: SurahDetail, index: number) => {
    const audio = getAudioElement()
    const ayahs = surahData.ayahs
    if (!ayahs || ayahs.length === 0) return

    const safeIndex = Math.max(0, Math.min(ayahs.length - 1, index))
    const ayah = ayahs[safeIndex]
    const audioUrl = getAyahAudioUrl(ayah.number, surahData.number, ayah.verseNumberInSurah)

    set({
      surahNumber: surahData.number,
      currentAyahIndex: safeIndex,
      currentAyahNumberInSurah: ayah.verseNumberInSurah,
      currentAyahGlobalNumber: ayah.number,
      currentAyahArabicText: ayah.arabicText,
      currentAyahText: ayah.translations.en || '',
      currentSurahData: surahData,
      isLoadingAudio: true,
      isPlayerVisible: true,
    })

    updateMediaSession(surahData.number, ayah.verseNumberInSurah)

    // Smoothly scroll to the reciting Ayah on screen if autoscroll is enabled
    if (get().autoScroll && typeof document !== 'undefined') {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${ayah.verseNumberInSurah}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }

    try {
      audio.src = audioUrl
      audio.playbackRate = get().playbackRate
      audio.muted = get().isMuted
      audio.volume = get().volume
      await audio.play()
      set({ isPlaying: true, isLoadingAudio: false })
    } catch (err) {
      console.warn('Audio play execution interrupted or failed:', err)
      set({ isPlaying: false, isLoadingAudio: false })
    }
  }

  return {
    isPlaying: false,
    isLoadingAudio: false,
    surahNumber: 1,
    currentAyahIndex: 0,
    currentAyahNumberInSurah: 1,
    currentAyahGlobalNumber: 1,
    currentAyahText: '',
    currentAyahArabicText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    isMuted: false,
    volume: 1.0,
    autoScroll: true,
    repeatMode: 'continuous',
    isPlayerVisible: false,
    isExpanded: false,
    currentSurahData: null,

    setSurahData: (data: SurahDetail) => {
      set({ currentSurahData: data })
    },

    playSurah: async (surahNum: number, startAyahNumberInSurah = 1) => {
      let data = get().currentSurahData
      if (!data || data.number !== surahNum) {
        set({ isLoadingAudio: true, isPlayerVisible: true })
        try {
          data = await quranApi.getSurah(surahNum, ['en', 'ta'])
          set({ currentSurahData: data })
        } catch (err) {
          console.error('Failed to load Surah data for continuous audio:', err)
          set({ isLoadingAudio: false })
          return
        }
      }

      const ayahIndex = Math.max(0, startAyahNumberInSurah - 1)
      await playAyahInternal(data, ayahIndex)
    },

    playSingleAyah: async (surahNum: number, ayahNumberInSurah: number, surahData?: SurahDetail) => {
      let data = surahData || get().currentSurahData
      if (!data || data.number !== surahNum) {
        set({ isLoadingAudio: true, isPlayerVisible: true })
        try {
          data = await quranApi.getSurah(surahNum, ['en', 'ta'])
          set({ currentSurahData: data })
        } catch (err) {
          console.error('Failed to load Surah for ayah audio:', err)
          set({ isLoadingAudio: false })
          return
        }
      }

      const ayahIndex = Math.max(0, ayahNumberInSurah - 1)
      await playAyahInternal(data, ayahIndex)
    },

    togglePlay: () => {
      const audio = getAudioElement()
      if (get().isPlaying) {
        audio.pause()
      } else {
        if (!audio.src) {
          get().playSurah(get().surahNumber, get().currentAyahNumberInSurah)
        } else {
          audio.play().catch(console.warn)
        }
      }
    },

    pause: () => {
      const audio = getAudioElement()
      audio.pause()
    },

    resume: () => {
      const audio = getAudioElement()
      audio.play().catch(console.warn)
    },

    seekTo: (seconds: number) => {
      const audio = getAudioElement()
      if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration, seconds))
        set({ currentTime: audio.currentTime })
      }
    },

    seekRelative: (deltaSeconds: number) => {
      const audio = getAudioElement()
      const newTime = Math.max(0, (audio.currentTime || 0) + deltaSeconds)
      if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, newTime)
      } else {
        audio.currentTime = newTime
      }
      set({ currentTime: audio.currentTime })
    },

    nextAyah: async () => {
      const state = get()
      const surahData = state.currentSurahData
      if (!surahData) return

      const nextIndex = state.currentAyahIndex + 1
      if (nextIndex < surahData.ayahs.length) {
        // Play next verse in same Surah
        await playAyahInternal(surahData, nextIndex)
      } else {
        // Surah complete!
        if (state.repeatMode === 'surah') {
          // Loop current surah from beginning
          await playAyahInternal(surahData, 0)
        } else if (state.repeatMode === 'continuous') {
          // Advance to next chapter automatically (Spotify-style continuous playback)
          const nextSurahNum = state.surahNumber < 114 ? state.surahNumber + 1 : 1
          await state.playSurah(nextSurahNum, 1)
        } else {
          // Stop playback at end of chapter
          set({ isPlaying: false, currentTime: 0 })
        }
      }
    },

    previousAyah: async () => {
      const state = get()
      const audio = getAudioElement()

      // If more than 3 seconds in, restart current verse
      if (audio.currentTime > 3) {
        audio.currentTime = 0
        return
      }

      const surahData = state.currentSurahData
      if (!surahData) return

      const prevIndex = state.currentAyahIndex - 1
      if (prevIndex >= 0) {
        await playAyahInternal(surahData, prevIndex)
      } else {
        // Go to last verse of previous Surah
        if (state.surahNumber > 1) {
          const prevSurahNum = state.surahNumber - 1
          try {
            const prevData = await quranApi.getSurah(prevSurahNum, ['en', 'ta'])
            set({ currentSurahData: prevData })
            await playAyahInternal(prevData, prevData.ayahs.length - 1)
          } catch {
            await playAyahInternal(surahData, 0)
          }
        } else {
          await playAyahInternal(surahData, 0)
        }
      }
    },

    nextSurah: async () => {
      const state = get()
      const nextSurahNum = state.surahNumber < 114 ? state.surahNumber + 1 : 1
      await state.playSurah(nextSurahNum, 1)
    },

    previousSurah: async () => {
      const state = get()
      const prevSurahNum = state.surahNumber > 1 ? state.surahNumber - 1 : 114
      await state.playSurah(prevSurahNum, 1)
    },

    setPlaybackRate: (rate: number) => {
      const audio = getAudioElement()
      audio.playbackRate = rate
      set({ playbackRate: rate })
    },

    setVolume: (volume: number) => {
      const audio = getAudioElement()
      audio.volume = volume
      set({ volume, isMuted: volume === 0 })
    },

    toggleMute: () => {
      const audio = getAudioElement()
      const nextMuted = !get().isMuted
      audio.muted = nextMuted
      set({ isMuted: nextMuted })
    },

    setAutoScroll: (autoScroll: boolean) => {
      set({ autoScroll })
    },

    setRepeatMode: (repeatMode: RepeatMode) => {
      set({ repeatMode })
    },

    setIsExpanded: (isExpanded: boolean) => {
      set({ isExpanded })
    },

    closePlayer: () => {
      const audio = getAudioElement()
      audio.pause()
      set({ isPlaying: false, isPlayerVisible: false, isExpanded: false })
    },
  }
})
