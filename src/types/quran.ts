export type TranslationLanguage = 'en' | 'ta' | 'ar'

export interface Ayah {
  number: number
  verseNumberInSurah: number
  surahNumber: number
  arabicText: string
  arabicLetterCount: number
  hasanatValue: number
  translations: Record<string, string> // e.g. { en: "...", ta: "..." }
  juz: number
  page: number
}

export interface SurahSummary {
  number: number
  name: string
  arabicName: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
  startPage: number
  startJuz: number
}

export interface SurahDetail extends SurahSummary {
  ayahs: Ayah[]
}

export interface JuzSummary {
  juzNumber: number
  name: string
  arabicName: string
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
  startPage: number
}

export interface JuzDetail {
  juzNumber: number
  ayahs: Ayah[]
  surahs: number[]
}

export interface QuranSearchResult {
  surahNumber: number
  ayahNumber: number
  surahName: string
  arabicText: string
  translationText: string
  language: string
  matchSnippet: string
}
