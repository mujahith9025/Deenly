import type { Ayah, SurahDetail, SurahSummary, JuzDetail, JuzSummary, QuranSearchResult } from '../types/quran'
import { SURAH_METADATA, JUZ_METADATA, getGlobalAyahNumber } from './quranMetadata'
import { quranCache } from './quranCache'

// Primary CDN and failover URLs
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions'
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions'

// Standard Edition IDs in fawazahmed0/quran-api
export const EDITION_CODES: Record<string, string> = {
  ar: 'ara-quranacademy',              // High-quality Uthmani text with diacritics
  en: 'eng-ummmuhammad',              // Sahih International (Default)
  en_sahih: 'eng-ummmuhammad',        // Sahih International
  en_khattab: 'eng-mustafakhattaba',   // The Clear Quran (Dr. Mustafa Khattab)
  en_hilali: 'eng-muhammadtaqiudd',   // The Noble Quran (King Fahd Complex Madinah)
  en_haleem: 'eng-abdelhaleem',       // Oxford World's Classics (Prof. Abdel Haleem)
  ta: 'tam-abdulhameedbaqa',          // Abdul Hameed Baqavi (Default Tamil)
  ta_baqavi: 'tam-abdulhameedbaqa',   // Allama A.K. Abdul Hameed Baqavi
  ta_jantrust: 'tam-janturstfoundat', // Jan Trust Foundation (King Fahd Complex Madinah)
}

export function resolveEditionCode(key: string): string {
  if (EDITION_CODES[key]) return EDITION_CODES[key]
  if (key.startsWith('ta')) return EDITION_CODES.ta
  return EDITION_CODES.en
}

/**
 * Counts authentic Arabic letters in a given verse.
 * Decision on Diacritics: All vocalization marks/harakat (\p{M}), Quranic stop symbols (\p{S}),
 * tatweel (\u0640), punctuation (\p{P}), numbers (\p{N}), and whitespace (\p{Z}) are stripped.
 * The remaining characters are counted as authentic Arabic alphabet letters (consonants/vowels).
 */
export function countArabicLetters(arabicText: string): number {
  if (!arabicText) return 0
  const clean = arabicText.replace(/[\p{M}\p{P}\p{S}\p{Z}\p{N}\u0640]/gu, '')
  return Array.from(clean).length
}

async function fetchEditionChapter(edition: string, chapter: number): Promise<Array<{ chapter: number; verse: number; text: string }>> {
  const url1 = `${JSDELIVR_BASE}/${edition}/${chapter}.json`
  const url2 = `${GITHUB_RAW_BASE}/${edition}/${chapter}.json`

  try {
    const res = await fetch(url1)
    if (res.ok) {
      const data = await res.json()
      return data.chapter || []
    }
  } catch (err) {
    console.warn(`jsDelivr fetch failed for ${edition}/${chapter}, attempting GitHub raw fallback:`, err)
  }

  const fallbackRes = await fetch(url2)
  if (!fallbackRes.ok) {
    throw new Error(`Failed to fetch Quran chapter ${chapter} for edition ${edition} (HTTP ${fallbackRes.status})`)
  }
  const fallbackData = await fallbackRes.json()
  return fallbackData.chapter || []
}

/**
 * Approximate Juz and Page for an Ayah using standard Mushaf mapping
 */
function calculateAyahJuzAndPage(surahNumber: number, ayahNumber: number, surahMeta: SurahSummary) {
  let matchedJuz = surahMeta.startJuz
  for (const j of JUZ_METADATA) {
    if (
      (surahNumber > j.startSurah || (surahNumber === j.startSurah && ayahNumber >= j.startAyah)) &&
      (surahNumber < j.endSurah || (surahNumber === j.endSurah && ayahNumber <= j.endAyah))
    ) {
      matchedJuz = j.juzNumber
      break
    }
  }

  return {
    juz: matchedJuz,
    page: surahMeta.startPage,
  }
}

export const quranApi = {
  getAllSurahs(): SurahSummary[] {
    return SURAH_METADATA
  },

  getAllJuz(): JuzSummary[] {
    return JUZ_METADATA
  },

  getSurahMetadata(surahNumber: number): SurahSummary | undefined {
    return SURAH_METADATA.find((s) => s.number === surahNumber)
  },

  countLetters(text: string): number {
    return countArabicLetters(text)
  },

  async getSurah(surahNumber: number, languages: string[] = ['en', 'ta']): Promise<SurahDetail> {
    const meta = this.getSurahMetadata(surahNumber)
    if (!meta) {
      throw new Error(`Invalid Surah number: ${surahNumber}. Must be between 1 and 114.`)
    }

    // 1. Check local cache
    const cached = await quranCache.getSurah(surahNumber)
    const missingLanguages = languages.filter(
      (lang) => !cached || !cached.ayahs[0]?.translations?.[lang]
    )

    if (cached && missingLanguages.length === 0) {
      return cached
    }

    // 2. Fetch Arabic text if not already cached
    let arVerses: Array<{ chapter: number; verse: number; text: string }> = []
    if (!cached) {
      arVerses = await fetchEditionChapter(EDITION_CODES.ar, surahNumber)
    }

    // 3. Fetch missing translation editions in parallel
    const translationPromises = missingLanguages.map(async (lang) => {
      const edition = resolveEditionCode(lang)
      const verses = await fetchEditionChapter(edition, surahNumber)
      return { lang, verses }
    })

    const translationResults = await Promise.all(translationPromises)

    // Helper to assign translation with fallback aliases
    const applyTranslations = (target: Record<string, string>, verseNumber: number, idx: number) => {
      for (const tr of translationResults) {
        const matched = tr.verses.find((v) => v.verse === verseNumber) || tr.verses[idx]
        if (matched) {
          target[tr.lang] = matched.text
          if (tr.lang.startsWith('en')) {
            target['en'] = matched.text
          } else if (tr.lang.startsWith('ta')) {
            target['ta'] = matched.text
          }
        }
      }
    }

    // 4. Construct / Update Ayah objects
    let ayahs: Ayah[] = []
    if (cached) {
      ayahs = cached.ayahs.map((ayah, idx) => {
        const updatedTranslations = { ...ayah.translations }
        applyTranslations(updatedTranslations, ayah.verseNumberInSurah, idx)
        return {
          ...ayah,
          translations: updatedTranslations,
        }
      })
    } else {
      ayahs = arVerses.map((arVerse, idx) => {
        const verseNum = arVerse.verse || idx + 1
        const letterCount = countArabicLetters(arVerse.text)
        const translations: Record<string, string> = {}
        applyTranslations(translations, verseNum, idx)

        const { juz, page } = calculateAyahJuzAndPage(surahNumber, verseNum, meta)

        return {
          number: getGlobalAyahNumber(surahNumber, verseNum), // Accurate global verse number (1 to 6236)
          verseNumberInSurah: verseNum,
          surahNumber,
          arabicText: arVerse.text,
          arabicLetterCount: letterCount,
          hasanatValue: letterCount * 10,
          translations,
          juz,
          page,
        }
      })
    }

    const surahDetail: SurahDetail = {
      ...meta,
      ayahs,
    }

    // 5. Save in cache
    await quranCache.saveSurah(surahDetail)
    return surahDetail
  },

  async getAyah(surahNumber: number, ayahNumber: number, languages: string[] = ['en', 'ta']): Promise<Ayah> {
    const surah = await this.getSurah(surahNumber, languages)
    const ayah = surah.ayahs.find((a) => a.verseNumberInSurah === ayahNumber)
    if (!ayah) {
      throw new Error(`Ayah ${ayahNumber} not found in Surah ${surahNumber} (${surah.name})`)
    }
    return ayah
  },

  async getJuz(juzNumber: number, languages: string[] = ['en', 'ta']): Promise<JuzDetail> {
    const juzMeta = JUZ_METADATA.find((j) => j.juzNumber === juzNumber)
    if (!juzMeta) {
      throw new Error(`Invalid Juz number: ${juzNumber}. Must be between 1 and 30.`)
    }

    const surahNumbers: number[] = []
    for (let s = juzMeta.startSurah; s <= juzMeta.endSurah; s++) {
      surahNumbers.push(s)
    }

    const surahDetails = await Promise.all(surahNumbers.map((s) => this.getSurah(s, languages)))
    const ayahs: Ayah[] = []

    for (const s of surahDetails) {
      for (const a of s.ayahs) {
        const isAfterStart = s.number > juzMeta.startSurah || (s.number === juzMeta.startSurah && a.verseNumberInSurah >= juzMeta.startAyah)
        const isBeforeEnd = s.number < juzMeta.endSurah || (s.number === juzMeta.endSurah && a.verseNumberInSurah <= juzMeta.endAyah)
        if (isAfterStart && isBeforeEnd) {
          ayahs.push(a)
        }
      }
    }

    return {
      juzNumber,
      ayahs,
      surahs: surahNumbers,
    }
  },

  async search(query: string, language: 'ar' | 'en' | 'ta' = 'en'): Promise<QuranSearchResult[]> {
    const cleanQuery = query.trim().toLowerCase()
    if (!cleanQuery) return []

    // 1. Check if query matches Surah names or translation meta
    const results: QuranSearchResult[] = []
    for (const s of SURAH_METADATA) {
      const matchInArabic = s.arabicName.includes(cleanQuery)
      const matchInEnglish = s.englishName.toLowerCase().includes(cleanQuery) || s.englishNameTranslation.toLowerCase().includes(cleanQuery)
      const matchInTamil = (s.nameTa && s.nameTa.toLowerCase().includes(cleanQuery)) || (s.englishNameTranslationTa && s.englishNameTranslationTa.toLowerCase().includes(cleanQuery))
      const matchInName = s.name.toLowerCase().includes(cleanQuery)

      if (
        (language === 'ar' && matchInArabic) ||
        (language === 'ta' && (matchInTamil || matchInName || matchInEnglish)) ||
        (language === 'en' && (matchInEnglish || matchInName)) ||
        matchInName ||
        matchInTamil ||
        matchInArabic
      ) {
        const isTa = language === 'ta'
        const displayName = isTa ? (s.nameTa || s.name) : s.name
        const displayTrans = isTa ? (s.englishNameTranslationTa || s.englishNameTranslation) : s.englishNameTranslation
        results.push({
          surahNumber: s.number,
          ayahNumber: 1,
          surahName: `${s.number}. ${displayName} (${displayTrans})`,
          arabicText: s.arabicName,
          translationText: displayTrans,
          language,
          matchSnippet: isTa 
            ? `அத்தியாயம் ${displayName}: ${displayTrans} (${s.numberOfAyahs} வசனங்கள், ${s.revelationType === 'Meccan' ? 'மக்கீ' : 'மதனீ'})`
            : `Surah ${s.name}: ${s.englishNameTranslation} (${s.numberOfAyahs} Ayahs, ${s.revelationType})`,
        })
      }
    }

    return results
  },
}
