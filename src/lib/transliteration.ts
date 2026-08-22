/**
 * Arabic Phonetic Transliteration Engine
 * Converts Arabic text with or without diacritics into readable Latin/English phonetic pronunciation.
 */

const ARABIC_TO_LATIN_MAP: Record<string, string> = {
  'ء': "'",
  'آ': 'Ā',
  'أ': 'A',
  'ؤ': 'U',
  'إ': 'I',
  'ئ': 'I',
  'ا': 'a',
  'ب': 'b',
  'ة': 'h',
  'ت': 't',
  'ث': 'th',
  'ج': 'j',
  'ح': 'ḥ',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'dh',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'sh',
  'ص': 'ṣ',
  'ض': 'ḍ',
  'ط': 'ṭ',
  'ظ': 'ẓ',
  'ع': "'a",
  'غ': 'gh',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ى': 'ā',
  'ي': 'y',
  'ٱ': 'a',
  'لله': 'llāh',
  // Harakat
  '\u064E': 'a', // Fatha
  '\u064F': 'u', // Damma
  '\u0650': 'i', // Kasra
  '\u064B': 'an', // Fathatan
  '\u064C': 'un', // Dammatan
  '\u064D': 'in', // Kasratan
  '\u0651': '', // Shaddah (doubles previous)
  '\u0652': '', // Sukun
  '\u0670': 'ā', // Dagger Alif
  '\u06E5': 'ū', // Small Waw
  '\u06E6': 'ī', // Small Ya
}

// Well-known Surah / Ayah common transliterations for 100% precision
const COMMON_AYAH_TRANSLITERATIONS: Record<string, string> = {
  '1:1': 'Bismillāhir-Raḥmānir-Raḥīm',
  '1:2': 'Al-ḥamdu lillāhi Rabbil-‘ālamīn',
  '1:3': 'Ar-Raḥmānir-Raḥīm',
  '1:4': 'Māliki Yawmid-Dīn',
  '1:5': 'Iyyāka na‘budu wa iyyāka nasta‘īn',
  '1:6': 'Ihdinaṣ-ṣirāṭal-mustaqīm',
  '1:7': 'Ṣirāṭalladhīna an‘amta ‘alayhim, ghayril-maghḍūbi ‘alayhim wa laḍ-ḍāllīn',
  '112:1': 'Qul Huwallāhu Aḥad',
  '112:2': 'Allāhuṣ-Ṣamad',
  '112:3': 'Lam yalid wa lam yūlad',
  '112:4': 'Wa lam yakun lahū kufuwan aḥad',
  '113:1': 'Qul a‘ūdhu bi Rabbil-falaq',
  '113:2': 'Min sharri mā khalaq',
  '113:3': 'Wa min sharri ghāsiqin idhā waqab',
  '113:4': 'Wa min sharrin-naffāthāti fil-‘uqad',
  '113:5': 'Wa min sharri ḥāsidin idhā ḥasad',
  '114:1': 'Qul a‘ūdhu bi Rabbin-nās',
  '114:2': 'Malikin-nās',
  '114:3': 'Ilāhin-nās',
  '114:4': 'Min sharril-waswāsil-khannās',
  '114:5': 'Alladhī yuwaswisu fī ṣudūrin-nās',
  '114:6': 'Minal-jinnati wan-nās',
  '2:255': 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
}

export function getArabicTransliteration(arabicText: string, surahNumber?: number, ayahNumber?: number): string {
  if (surahNumber && ayahNumber) {
    const key = `${surahNumber}:${ayahNumber}`
    if (COMMON_AYAH_TRANSLITERATIONS[key]) {
      return COMMON_AYAH_TRANSLITERATIONS[key]
    }
  }

  if (!arabicText) return ''

  // Algorithmic phonetic transliteration
  let result = ''
  const chars = Array.from(arabicText)

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]

    if (char === ' ') {
      result += ' '
      continue
    }

    if (char === '\u0651' && i > 0) {
      // Shaddah: double the previous letter
      const prevChar = chars[i - 1]
      const prevTrans = ARABIC_TO_LATIN_MAP[prevChar] || ''
      if (prevTrans && prevTrans.length === 1) {
        result += prevTrans
      }
      continue
    }

    if (ARABIC_TO_LATIN_MAP[char] !== undefined) {
      result += ARABIC_TO_LATIN_MAP[char]
    } else if (/[\p{L}]/u.test(char)) {
      result += char
    }
  }

  // Capitalize first letter and clean up formatting
  const cleaned = result
    .replace(/\s+/g, ' ')
    .replace(/\b(llah|allah)\b/gi, 'Allāh')
    .trim()

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}
