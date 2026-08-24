import { HADITH_BOOKS, DEFAULT_BOOK_SECTIONS, type HadithBook } from './hadithData'

export interface HadithChapter {
  id: string
  chapterNumber: number
  title: string
  arabicTitle?: string
  hadithCount?: number
  firstHadith?: number
  lastHadith?: number
}

export interface HadithItem {
  hadithNumber: number
  arabicNumber: number
  bookId: string
  chapterNumber: number
  referenceBook: number
  referenceHadith: number
  arabicText: string
  englishText: string
  tamilText: string
  grades: { name: string; grade: string }[]
}

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'
const CACHE_PREFIX = 'deenly_hadith_v1_'

// In-memory runtime cache for lightning-fast navigation
const memoryCache = new Map<string, unknown>()

export const hadithApi = {
  getBooks(): HadithBook[] {
    return HADITH_BOOKS
  },

  getBookById(bookId: string): HadithBook | undefined {
    return HADITH_BOOKS.find((b) => b.id === bookId) || HADITH_BOOKS[0]
  },

  async getChapters(bookId: string): Promise<HadithChapter[]> {
    const cacheKey = `chapters_${bookId}`
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey) as HadithChapter[]
    }

    try {
      const local = localStorage.getItem(CACHE_PREFIX + cacheKey)
      if (local) {
        const parsed = JSON.parse(local)
        memoryCache.set(cacheKey, parsed)
        return parsed
      }
    } catch {
      // ignore storage parse error
    }

    try {
      const res = await fetch(`${CDN_BASE}/info.json`)
      if (res.ok) {
        const data = await res.json()
        const bookData = data[bookId]?.metadata
        if (bookData && bookData.sections) {
          const chapters: HadithChapter[] = Object.entries(bookData.sections)
            .filter(([num, title]) => num !== '0' && (title as string).trim().length > 0)
            .map(([num, title]) => {
              const cNum = parseInt(num, 10)
              const detail = bookData.section_details?.[num]
              const rawFirst = detail?.hadithnumber_first ?? detail?.arabicnumber_first
              const rawLast = detail?.hadithnumber_last ?? detail?.arabicnumber_last
              const first = rawFirst != null ? Math.floor(Number(rawFirst)) : undefined
              const last = rawLast != null ? Math.floor(Number(rawLast)) : undefined
              const count = first != null && last != null && last >= first ? last - first + 1 : undefined

              return {
                id: `${bookId}_${cNum}`,
                chapterNumber: cNum,
                title: (title as string).replace(/\(.*\)/, '').trim() || (title as string),
                arabicTitle: (title as string).match(/\((.*?)\)/)?.[1] || '',
                firstHadith: first,
                lastHadith: last,
                hadithCount: count,
              }
            })

          memoryCache.set(cacheKey, chapters)
          try {
            localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(chapters))
          } catch {
            // ignore
          }
          return chapters
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote hadith chapters info, using defaults', e)
    }

    // Fallback to local default sections
    const defaultSections = DEFAULT_BOOK_SECTIONS[bookId] || DEFAULT_BOOK_SECTIONS.bukhari
    const fallbackChapters: HadithChapter[] = Object.entries(defaultSections).map(([num, title]) => {
      const cNum = parseInt(num, 10)
      return {
        id: `${bookId}_${cNum}`,
        chapterNumber: cNum,
        title: title.replace(/\(.*\)/, '').trim(),
        arabicTitle: title.match(/\((.*?)\)/)?.[1] || '',
      }
    })

    memoryCache.set(cacheKey, fallbackChapters)
    return fallbackChapters
  },

  async getChapterHadiths(bookId: string, chapterNumber: number): Promise<HadithItem[]> {
    const cacheKey = `hadiths_${bookId}_${chapterNumber}`
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey) as HadithItem[]
    }

    try {
      const local = localStorage.getItem(CACHE_PREFIX + cacheKey)
      if (local) {
        const parsed = JSON.parse(local)
        memoryCache.set(cacheKey, parsed)
        return parsed
      }
    } catch {
      // ignore
    }

    // Fetch English, Arabic, and Tamil translations in parallel
    const [araRes, engRes, tamRes] = await Promise.allSettled([
      fetch(`${CDN_BASE}/editions/ara-${bookId}/sections/${chapterNumber}.json`),
      fetch(`${CDN_BASE}/editions/eng-${bookId}/sections/${chapterNumber}.json`),
      fetch(`${CDN_BASE}/editions/tam-${bookId}/sections/${chapterNumber}.json`),
    ])

    const araData = araRes.status === 'fulfilled' && araRes.value.ok ? await araRes.value.json() : null
    const engData = engRes.status === 'fulfilled' && engRes.value.ok ? await engRes.value.json() : null
    const tamData = tamRes.status === 'fulfilled' && tamRes.value.ok ? await tamRes.value.json() : null

    // Base hadiths list from English or Arabic
    const baseHadiths = engData?.hadiths || araData?.hadiths || tamData?.hadiths || []

    const merged: HadithItem[] = baseHadiths.map((h: { hadithnumber: number; arabicnumber?: number; reference?: { book?: number; hadith?: number }; text?: string; grades?: { name: string; grade: string }[] }, idx: number) => {
      const hadithNum = h.hadithnumber || idx + 1
      const araItem = araData?.hadiths?.find((item: { hadithnumber: number }) => item.hadithnumber === hadithNum) || araData?.hadiths?.[idx]
      const engItem = engData?.hadiths?.find((item: { hadithnumber: number }) => item.hadithnumber === hadithNum) || engData?.hadiths?.[idx]
      const tamItem = tamData?.hadiths?.find((item: { hadithnumber: number }) => item.hadithnumber === hadithNum) || tamData?.hadiths?.[idx]

      return {
        hadithNumber: hadithNum,
        arabicNumber: h.arabicnumber || hadithNum,
        bookId,
        chapterNumber,
        referenceBook: h.reference?.book || chapterNumber,
        referenceHadith: h.reference?.hadith || idx + 1,
        arabicText: araItem?.text || 'نص الحديث باللغة العربية',
        englishText: engItem?.text || 'English translation loading...',
        tamilText: tamItem?.text || '',
        grades: h.grades || [],
      }
    })

    if (merged.length > 0) {
      memoryCache.set(cacheKey, merged)
      try {
        localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(merged))
      } catch {
        // storage quota exceeded
      }
    }

    return merged
  },
}
