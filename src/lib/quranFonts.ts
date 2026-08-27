export type ArabicFontStyle = 
  | 'madani'   // KFGQPC Uthmanic Script HAFS (Official King Fahd Complex / Quranly Master Calligraphy)
  | 'indopak'  // Lateef (South Asian / Indo-Pak Tajweed Style)
  | 'ottoman'  // Scheherazade New (Ottoman / Turkish Diyanet Style)
  | 'noto'     // Noto Naskh Arabic (Clean Modern Digital Naskh)
  | 'kufi'     // Noto Kufi Arabic (Classical Early Geometric Kufic)

export interface ArabicFontMeta {
  id: ArabicFontStyle
  name: string
  arabicName: string
  region: string
  sampleText: string
  description: string
  fontFamily: string
  previewClass: string
}

export const QURAN_FONT_STYLES: ArabicFontMeta[] = [
  {
    id: 'madani',
    name: 'Uthmanic Hafs (Quranly Style)',
    arabicName: 'مصحف المدينة النبوية (رواية حفص)',
    region: 'Madinah / Quranly App Standard',
    sampleText: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
    description: 'The exact high-definition master calligraphy of Uthman Taha from the King Fahd Complex and Quranly app with authentic ligatures, waslas, small ya, and stop signs.',
    fontFamily: "'KFGQPC Uthmanic Script HAFS', 'KFGQPC Uthman Taha Naskh', 'Amiri Quran', 'Amiri', 'Noto Naskh Arabic', serif",
    previewClass: 'font-quran-madani'
  },
  {
    id: 'indopak',
    name: 'Indo-Pak Traditional',
    arabicName: 'خط شبه القارة الهندية',
    region: 'India, Pakistan, Bangladesh',
    sampleText: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    description: 'Prominent, bold Tajweed markings and elevated diacritics designed for non-Arabic speakers across the Subcontinent.',
    fontFamily: "'Lateef', 'Scheherazade New', 'Amiri', serif",
    previewClass: 'font-quran-indopak'
  },
  {
    id: 'ottoman',
    name: 'Ottoman / Turkish Naskh',
    arabicName: 'الخط العثماني التركي',
    region: 'Turkey & Balkans (Diyanet)',
    sampleText: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ',
    description: 'Mastered by Hafiz Osman with delicate ligatures, aesthetic balance, and page-aligned verse rhythm.',
    fontFamily: "'Scheherazade New', 'Amiri', serif",
    previewClass: 'font-quran-ottoman'
  },
  {
    id: 'noto',
    name: 'Modern Digital Naskh',
    arabicName: 'النسخ الحديث الرقمي',
    region: 'Modern UI & Mobile Standard',
    sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    description: 'Ultra-crisp, high-definition typography optimized for modern OLED screens and effortless long-session reading.',
    fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
    previewClass: 'font-quran-noto'
  },
  {
    id: 'kufi',
    name: 'Classical Early Kufic',
    arabicName: 'الخط الكوفي المصحفي',
    region: 'Historic Manuscript Style',
    sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    description: 'Geometric, angular historical manuscript script inspired by early 7th-century Topkapi and Tashkent Quran codices.',
    fontFamily: "'Noto Kufi Arabic', 'Amiri', sans-serif",
    previewClass: 'font-quran-kufi'
  }
]

export const DEFAULT_ARABIC_FONT: ArabicFontStyle = 'madani'

export function getArabicFontFamily(style?: ArabicFontStyle | string | null): string {
  if (!style) return QURAN_FONT_STYLES[0].fontFamily
  const found = QURAN_FONT_STYLES.find(f => f.id === style)
  return found ? found.fontFamily : QURAN_FONT_STYLES[0].fontFamily
}

export function getArabicFontMeta(style?: ArabicFontStyle | string | null): ArabicFontMeta {
  if (!style) return QURAN_FONT_STYLES[0]
  const found = QURAN_FONT_STYLES.find(f => f.id === style)
  return found || QURAN_FONT_STYLES[0]
}
