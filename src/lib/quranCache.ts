import type { SurahDetail } from '../types/quran'

const DB_NAME = 'deenly_quran_cache'
const DB_VERSION = 1
const STORE_SURAHS = 'surahs'

// In-memory runtime cache for hot access
const memoryCache = new Map<number, SurahDetail>()

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null)
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(STORE_SURAHS)) {
            db.createObjectStore(STORE_SURAHS, { keyPath: 'number' })
          }
        }

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          console.warn('IndexedDB failed to open, using memory cache only:', request.error)
          resolve(null)
        }
      } catch (err) {
        console.warn('IndexedDB initialization error:', err)
        resolve(null)
      }
    })
  }

  return dbPromise
}

export const quranCache = {
  async getSurah(surahNumber: number): Promise<SurahDetail | null> {
    // 1. Check in-memory cache
    if (memoryCache.has(surahNumber)) {
      return memoryCache.get(surahNumber)!
    }

    // 2. Check IndexedDB
    try {
      const db = await openDatabase()
      if (!db) return null

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SURAHS, 'readonly')
        const store = tx.objectStore(STORE_SURAHS)
        const req = store.get(surahNumber)

        req.onsuccess = () => {
          const result = req.result as SurahDetail | undefined
          if (result) {
            memoryCache.set(surahNumber, result)
            resolve(result)
          } else {
            resolve(null)
          }
        }

        req.onerror = () => {
          resolve(null)
        }
      })
    } catch (err) {
      console.warn('Cache lookup error:', err)
      return null
    }
  },

  async saveSurah(surah: SurahDetail): Promise<void> {
    // 1. Save in memory cache
    memoryCache.set(surah.number, surah)

    // 2. Save in IndexedDB
    try {
      const db = await openDatabase()
      if (!db) return

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_SURAHS, 'readwrite')
        const store = tx.objectStore(STORE_SURAHS)
        const req = store.put(surah)

        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.warn('Failed to save surah in IndexedDB:', err)
    }
  },

  async clearCache(): Promise<void> {
    memoryCache.clear()
    try {
      const db = await openDatabase()
      if (!db) return

      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_SURAHS, 'readwrite')
        const store = tx.objectStore(STORE_SURAHS)
        const req = store.clear()
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
      })
    } catch (err) {
      console.warn('Error clearing Quran cache:', err)
    }
  },
}
