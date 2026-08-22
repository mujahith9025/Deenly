import { create } from 'zustand'

export interface QuranBookmark {
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

export interface HadithBookmark {
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

export type BookmarkItem = QuranBookmark | HadithBookmark

interface BookmarkState {
  bookmarks: BookmarkItem[]
  isQuranBookmarked: (surahNumber: number, ayahNumber: number) => boolean
  toggleQuranBookmark: (item: {
    surahNumber: number
    surahName: string
    arabicName: string
    ayahNumber: number
    arabicText: string
    translationText: string
  }) => boolean
  removeQuranBookmark: (surahNumber: number, ayahNumber: number) => void
  isHadithBookmarked: (bookId: string, hadithNumber: number) => boolean
  toggleHadithBookmark: (item: {
    bookId: string
    bookName: string
    chapterNumber: number
    chapterTitle: string
    hadithNumber: number
    arabicText: string
    translationText: string
  }) => boolean
  removeHadithBookmark: (bookId: string, hadithNumber: number) => void
  removeBookmarkById: (id: string) => void
  clearAllBookmarks: () => void
}

const STORAGE_KEY = 'deenly_unified_bookmarks_v1'

function loadBookmarksFromStorage(): BookmarkItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('Failed to load bookmarks from storage:', err)
    return []
  }
}

function saveBookmarksToStorage(items: BookmarkItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('Failed to save bookmarks to storage:', err)
  }
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: loadBookmarksFromStorage(),

  isQuranBookmarked: (surahNumber, ayahNumber) => {
    const id = `quran_${surahNumber}_${ayahNumber}`
    return get().bookmarks.some((b) => b.id === id)
  },

  toggleQuranBookmark: (item) => {
    const id = `quran_${item.surahNumber}_${item.ayahNumber}`
    const exists = get().bookmarks.some((b) => b.id === id)

    let updated: BookmarkItem[]
    if (exists) {
      updated = get().bookmarks.filter((b) => b.id !== id)
    } else {
      const newBm: QuranBookmark = {
        ...item,
        id,
        type: 'quran',
        timestamp: Date.now(),
      }
      updated = [newBm, ...get().bookmarks]
    }

    set({ bookmarks: updated })
    saveBookmarksToStorage(updated)
    return !exists
  },

  removeQuranBookmark: (surahNumber, ayahNumber) => {
    const id = `quran_${surahNumber}_${ayahNumber}`
    const updated = get().bookmarks.filter((b) => b.id !== id)
    set({ bookmarks: updated })
    saveBookmarksToStorage(updated)
  },

  isHadithBookmarked: (bookId, hadithNumber) => {
    const id = `hadith_${bookId}_${hadithNumber}`
    return get().bookmarks.some((b) => b.id === id)
  },

  toggleHadithBookmark: (item) => {
    const id = `hadith_${item.bookId}_${item.hadithNumber}`
    const exists = get().bookmarks.some((b) => b.id === id)

    let updated: BookmarkItem[]
    if (exists) {
      updated = get().bookmarks.filter((b) => b.id !== id)
    } else {
      const newBm: HadithBookmark = {
        ...item,
        id,
        type: 'hadith',
        timestamp: Date.now(),
      }
      updated = [newBm, ...get().bookmarks]
    }

    set({ bookmarks: updated })
    saveBookmarksToStorage(updated)
    return !exists
  },

  removeHadithBookmark: (bookId, hadithNumber) => {
    const id = `hadith_${bookId}_${hadithNumber}`
    const updated = get().bookmarks.filter((b) => b.id !== id)
    set({ bookmarks: updated })
    saveBookmarksToStorage(updated)
  },

  removeBookmarkById: (id) => {
    const updated = get().bookmarks.filter((b) => b.id !== id)
    set({ bookmarks: updated })
    saveBookmarksToStorage(updated)
  },

  clearAllBookmarks: () => {
    set({ bookmarks: [] })
    saveBookmarksToStorage([])
  },
}))
