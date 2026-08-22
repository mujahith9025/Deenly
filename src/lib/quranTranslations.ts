export type EnglishTranslationKey = 'en_sahih' | 'en_khattab' | 'en_hilali' | 'en_haleem'
export type TamilTranslationKey = 'ta_baqavi' | 'ta_jantrust'
export type TranslationKey = EnglishTranslationKey | TamilTranslationKey

export interface QuranTranslationMeta {
  id: TranslationKey
  language: 'en' | 'ta'
  name: string
  author: string
  tamilName?: string
  editionCode: string
  publisher: string
  description: string
  badge: string
}

export const QURAN_TRANSLATIONS: QuranTranslationMeta[] = [
  // --- 🇬🇧 English Translations ---
  {
    id: 'en_sahih',
    language: 'en',
    name: 'Sahih International',
    author: 'Umm Muhammad, Aminah Assami, Amatullah Bantley',
    editionCode: 'eng-ummmuhammad',
    publisher: 'Dar Abul-Qasim (Saudi Arabia)',
    description: 'Strictly faithful and accurate word-for-word translation following traditional orthodox Sunni methodology.',
    badge: 'Default English • Accurate',
  },
  {
    id: 'en_khattab',
    language: 'en',
    name: 'The Clear Quran',
    author: 'Dr. Mustafa Khattab',
    editionCode: 'eng-mustafakhattaba',
    publisher: 'Al-Azhar University (Cairo) Approved',
    description: 'The #1 modern contemporary English translation worldwide. Eloquent, thematic, and exceptionally clear.',
    badge: 'Al-Azhar Approved • Modern & Fluent',
  },
  {
    id: 'en_hilali',
    language: 'en',
    name: 'The Noble Quran',
    author: 'Dr. Muhammad Taqi-ud-Din Al-Hilali & Dr. Muhammad Muhsin Khan',
    editionCode: 'eng-muhammadtaqiudd',
    publisher: 'King Fahd Glorious Quran Printing Complex (Madinah)',
    description: 'Official Saudi Madinah edition integrating authentic parenthetical explanations from Tafsir Ibn Kathir and Sahih Al-Bukhari.',
    badge: 'King Fahd Complex (Madinah)',
  },
  {
    id: 'en_haleem',
    language: 'en',
    name: 'Oxford World\'s Classics',
    author: 'Prof. M.A.S. Abdel Haleem',
    editionCode: 'eng-abdelhaleem',
    publisher: 'Oxford University Press',
    description: 'Masterfully structured contemporary literary standard English by Professor of Islamic Studies at SOAS, University of London.',
    badge: 'Oxford Classics • Literary Standard',
  },

  // --- 🇮🇳 / 🇱🇰 Tamil Translations (தமிழ்) ---
  {
    id: 'ta_baqavi',
    language: 'ta',
    name: 'அப்துல் ஹமீது பாகவி',
    author: 'Allama A.K. Abdul Hameed Baqavi',
    tamilName: 'மௌலானா ஏ.கே. அப்துல் ஹமீது பாகவி',
    editionCode: 'tam-abdulhameedbaqa',
    publisher: 'தவ்பா பப்ளிகேஷன்ஸ் (Baqaviyath)',
    description: 'முதலாவது மற்றும் வரலாற்று சிறப்புமிக்க தமிழ் மொழிபெயர்ப்பு (1929–1940s). மரபுசார்ந்த உலமாக்களால் போற்றப்படும் செம்மொழி நடை.',
    badge: 'Default Tamil • பாரம்பரிய செம்மொழி',
  },
  {
    id: 'ta_jantrust',
    language: 'ta',
    name: 'ஜான் டிரஸ்ட் (மதீனா பதிப்பு)',
    author: 'Jan Trust Foundation Scholars',
    tamilName: 'மதீனா கிங் ஃபஹத் திருக்குர்ஆன் அச்சகப் பதிப்பு (Jan Trust)',
    editionCode: 'tam-janturstfoundat',
    publisher: 'King Fahd Glorious Quran Printing Complex (Madinah, KSA)',
    description: 'சவூதி அரேபிய அரசு & மதீனா கிங் ஃபஹத் திருக்குர்ஆன் அச்சகத்தால் அதிகாரப்பூர்வமாக அச்சிடப்பட்டு வழங்கப்படும் ஒரே நேரடி தமிழ் மொழிபெயர்ப்பு.',
    badge: 'King Fahd Complex (Madinah) • அதிகாரப்பூர்வ பதிப்பு',
  },
]

export const DEFAULT_ENGLISH_TRANSLATION: EnglishTranslationKey = 'en_sahih'
export const DEFAULT_TAMIL_TRANSLATION: TamilTranslationKey = 'ta_baqavi'

export function getTranslationMeta(id?: string): QuranTranslationMeta {
  const found = QURAN_TRANSLATIONS.find((t) => t.id === id)
  if (found) return found
  return QURAN_TRANSLATIONS[0]
}

export function getStoredEnglishTranslation(): EnglishTranslationKey {
  if (typeof window === 'undefined') return DEFAULT_ENGLISH_TRANSLATION
  try {
    const saved = localStorage.getItem('deenly_english_translation')
    if (saved && (saved === 'en_sahih' || saved === 'en_khattab' || saved === 'en_hilali' || saved === 'en_haleem')) {
      return saved as EnglishTranslationKey
    }
  } catch {}
  return DEFAULT_ENGLISH_TRANSLATION
}

export function getStoredTamilTranslation(): TamilTranslationKey {
  if (typeof window === 'undefined') return DEFAULT_TAMIL_TRANSLATION
  try {
    const saved = localStorage.getItem('deenly_tamil_translation')
    if (saved && (saved === 'ta_baqavi' || saved === 'ta_jantrust')) {
      return saved as TamilTranslationKey
    }
  } catch {}
  return DEFAULT_TAMIL_TRANSLATION
}
