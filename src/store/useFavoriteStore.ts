import { create } from 'zustand'

export interface QuranFavorite {
  id: string // "quran_{surahNumber}_{ayahNumber}"
  type: 'quran'
  surahNumber: number
  surahName: string
  arabicName: string
  ayahNumber: number
  arabicText: string
  translationText: string
  timestamp: number
}

export interface HadithFavorite {
  id: string // "hadith_{bookId}_{hadithNumber}"
  type: 'hadith'
  bookId: string
  bookName: string
  chapterNumber: number
  chapterTitle: string
  hadithNumber: number
  arabicText: string
  translationText: string
  timestamp: number
}

export type FavoriteItem = QuranFavorite | HadithFavorite

interface FavoriteState {
  favorites: FavoriteItem[]
  isQuranFavorite: (surahNumber: number, ayahNumber: number) => boolean
  toggleQuranFavorite: (item: {
    surahNumber: number
    surahName: string
    arabicName: string
    ayahNumber: number
    arabicText: string
    translationText: string
  }) => boolean
  removeQuranFavorite: (surahNumber: number, ayahNumber: number) => void
  isHadithFavorite: (bookId: string, hadithNumber: number) => boolean
  toggleHadithFavorite: (item: {
    bookId: string
    bookName: string
    chapterNumber: number
    chapterTitle: string
    hadithNumber: number
    arabicText: string
    translationText: string
  }) => boolean
  removeHadithFavorite: (bookId: string, hadithNumber: number) => void
  removeFavoriteById: (id: string) => void
  clearAllFavorites: () => void
}

const STORAGE_KEY = 'deenly_favorites_v1'

function loadFavoritesFromStorage(): FavoriteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('Failed to load favorites from storage:', err)
    return []
  }
}

function saveFavoritesToStorage(items: FavoriteItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('Failed to save favorites to storage:', err)
  }
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: loadFavoritesFromStorage(),

  isQuranFavorite: (surahNumber, ayahNumber) => {
    const id = `quran_${surahNumber}_${ayahNumber}`
    return get().favorites.some((f) => f.id === id)
  },

  toggleQuranFavorite: (item) => {
    const id = `quran_${item.surahNumber}_${item.ayahNumber}`
    const exists = get().favorites.some((f) => f.id === id)

    let updated: FavoriteItem[]
    if (exists) {
      updated = get().favorites.filter((f) => f.id !== id)
    } else {
      const newFav: QuranFavorite = {
        ...item,
        id,
        type: 'quran',
        timestamp: Date.now(),
      }
      updated = [newFav, ...get().favorites]
    }

    set({ favorites: updated })
    saveFavoritesToStorage(updated)
    return !exists
  },

  removeQuranFavorite: (surahNumber, ayahNumber) => {
    const id = `quran_${surahNumber}_${ayahNumber}`
    const updated = get().favorites.filter((f) => f.id !== id)
    set({ favorites: updated })
    saveFavoritesToStorage(updated)
  },

  isHadithFavorite: (bookId, hadithNumber) => {
    const id = `hadith_${bookId}_${hadithNumber}`
    return get().favorites.some((f) => f.id === id)
  },

  toggleHadithFavorite: (item) => {
    const id = `hadith_${item.bookId}_${item.hadithNumber}`
    const exists = get().favorites.some((f) => f.id === id)

    let updated: FavoriteItem[]
    if (exists) {
      updated = get().favorites.filter((f) => f.id !== id)
    } else {
      const newFav: HadithFavorite = {
        ...item,
        id,
        type: 'hadith',
        timestamp: Date.now(),
      }
      updated = [newFav, ...get().favorites]
    }

    set({ favorites: updated })
    saveFavoritesToStorage(updated)
    return !exists
  },

  removeHadithFavorite: (bookId, hadithNumber) => {
    const id = `hadith_${bookId}_${hadithNumber}`
    const updated = get().favorites.filter((f) => f.id !== id)
    set({ favorites: updated })
    saveFavoritesToStorage(updated)
  },

  removeFavoriteById: (id) => {
    const updated = get().favorites.filter((f) => f.id !== id)
    set({ favorites: updated })
    saveFavoritesToStorage(updated)
  },

  clearAllFavorites: () => {
    set({ favorites: [] })
    saveFavoritesToStorage([])
  },
}))
