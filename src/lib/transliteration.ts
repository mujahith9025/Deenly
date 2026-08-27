/**
 * ==============================================================================
 * 📖 ARABIC PHONETIC TRANSLITERATION ENGINE (BILINGUAL: ENGLISH & TAMIL)
 * Converts Arabic Quranic scripture into accurate phonetic pronunciations.
 * Supports both Latin / English and pure Tamil (தமிழ் ஒலிபெயர்ப்பு).
 * ==============================================================================
 */

export type TransliterationLanguage = 'en' | 'ta'

// ==============================================================================
// 1. ENGLISH (LATIN) PHONETIC MAPPINGS & WELL-KNOWN SURAHS
// ==============================================================================
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
  // Harakat
  '\u064E': 'a',   // Fatha
  '\u064F': 'u',   // Damma
  '\u0650': 'i',   // Kasra
  '\u064B': 'an',  // Fathatan
  '\u064C': 'un',  // Dammatan
  '\u064D': 'in',  // Kasratan
  '\u0651': '',    // Shaddah (doubles previous)
  '\u0652': '',    // Sukun
  '\u06E1': '',    // Quranic Sukun
  '\u0670': 'ā',   // Dagger Alif
  '\u06E5': 'ū',   // Small Waw
  '\u06E6': 'ī',   // Small Ya
}

const COMMON_AYAH_ENGLISH: Record<string, string> = {
  '1:1': 'Bismillāhir-Raḥmānir-Raḥīm',
  '1:2': 'Al-ḥamdu lillāhi Rabbil-‘ālamīn',
  '1:3': 'Ar-Raḥmānir-Raḥīm',
  '1:4': 'Māliki Yawmid-Dīn',
  '1:5': 'Iyyāka na‘budu wa iyyāka nasta‘īn',
  '1:6': 'Ihdinaṣ-ṣirāṭal-mustaqīm',
  '1:7': 'Ṣirāṭalladhīna an‘amta ‘alayhim, ghayril-maghḍūbi ‘alayhim wa laḍ-ḍāllīn',
  '3:21': 'Inna alladhīna yakfurūna bi-āyātillāhi wa yaqtulūnan-nabiyyīna bighayri ḥaqqin wa yaqtulūnalladhīna ya\'murūna bil-qisṭi minan-nāsi fabashshirhum bi‘adhābin alīm',
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
  '2:255': 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dhal-ladhī yashfa‘u ‘indahū illā bi-idhnih, ya‘lamu mā bayna aydīhim wa mā khalfahum...',
  '36:1': 'Yā-Sīn',
  '36:2': 'Wal-Qur\'ānil-Ḥakīm',
  '67:1': 'Tabārakal-ladhī biyadihil-mulku wa Huwa ‘alā kulli shay\'in Qadīr',
}

// ==============================================================================
// 2. TAMIL (தமிழ்) PHONETIC MAPPINGS & WELL-KNOWN SURAHS
// ==============================================================================
const COMMON_AYAH_TAMIL: Record<string, string> = {
  '1:1': 'பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்',
  '1:2': 'அல்ஹம்து லில்லாஹி ரப்பில் ஆலமீன்',
  '1:3': 'அர்-ரஹ்மானிர் ரஹீம்',
  '1:4': 'மாலிகி யவ்மித்தீன்',
  '1:5': 'இய்யாக நஃபுது வஇய்யாக நஸ்தஈன்',
  '1:6': 'இஹ்தினஸ் ஸிராத்தல் முஸ்தகீம்',
  '1:7': 'ஸிராத்தல்லதீன அன்அம்த அலைஹிம், கைரில் மக்ளூபி அலைஹிம் வலல்லால்லீன்',
  '3:21': 'இன்னல்லதீன யக்ஃபுரூன பிஆயாத்தில்லாஹி வயக்துலூனன் நபிய்யீன பிகைரி ஹக்கின் வயக்துலூனல்லதீன யஃமுரூன பில்கிஸ்த்தி மினன்னாஸி ஃபபஷ்ஷிர்ஹும் பிஅதாபின் அலீம்',
  '112:1': 'குல் ஹுவல்லாஹு அஹத்',
  '112:2': 'அல்லாஹுஸ் ஸமத்',
  '112:3': 'லம் யலித் வலம் யூலத்',
  '112:4': 'வலம் யகுல்லஹூ குஃபுவன் அஹத்',
  '113:1': 'குல் அஊது பிரப்பில் ஃபலாக்',
  '113:2': 'மின் ஷர்ரி மா கலக்',
  '113:3': 'வமின் ஷர்ரி காஸிகின் இதா வகப்',
  '113:4': 'வமின் ஷர்ரின் நஃப்பாஸாத்தி ஃபில் உகத்',
  '113:5': 'வமின் ஷர்ரி ஹாஸிதின் இதா ஹஸத்',
  '114:1': 'குல் அஊது பிரப்பின் நாஸ்',
  '114:2': 'மிலிக்கின் நாஸ்',
  '114:3': 'இலாஹின் நாஸ்',
  '114:4': 'மின் ஷர்ரில் வஸ்வாஸில் கன்னாஸ்',
  '114:5': 'அல்லதீ யுவஸ்விஸு ஃபீ ஸுதூரின் நாஸ்',
  '114:6': 'மினல் ஜின்னத்தி வன்னாஸ்',
  '2:255': 'அல்லாஹு லா இலாஹ இல்லா ஹுவல் ஹய்யுல் கய்யூம், லா தஃகுதுஹூ ஸினதுவ்-வலா நவ்ம், லஹூ மா ஃபிஸ் ஸமாவாத்தி வமா ஃபில் அர்ள், மன் தல்லதீ யஷ்ஃபஉ இந்தஹூ இல்லா பிஇத்னிஹ்...',
  '36:1': 'யா-ஸீன்',
  '36:2': 'வல் குர்ஆனில் ஹகீம்',
  '67:1': 'தபாரகல்லதீ பியதிஹில் முல்க்கு வஹுவ அலா குல்லி ஷையின் கதீர்',
}

interface TamilConsonantData {
  pulli: string
  a: string
  aa: string
  i: string
  ee: string
  u: string
  oo: string
}

const TAMIL_CONSONANT_TABLE: Record<string, TamilConsonantData> = {
  'ب': { pulli: 'ப்', a: 'ப', aa: 'பா', i: 'பி', ee: 'பீ', u: 'பு', oo: 'பூ' },
  'ت': { pulli: 'த்', a: 'த', aa: 'தா', i: 'தி', ee: 'தீ', u: 'து', oo: 'தூ' },
  'ث': { pulli: 'ஸ்', a: 'ஸ', aa: 'ஸா', i: 'ஸி', ee: 'ஸீ', u: 'ஸு', oo: 'ஸூ' },
  'ج': { pulli: 'ஜ்', a: 'ஜ', aa: 'ஜா', i: 'ஜி', ee: 'ஜீ', u: 'ஜு', oo: 'ஜூ' },
  'ح': { pulli: 'ஹ்', a: 'ஹ', aa: 'ஹா', i: 'ஹி', ee: 'ஹீ', u: 'ஹு', oo: 'ஹூ' },
  'خ': { pulli: 'க்ஃ', a: 'க', aa: 'கா', i: 'கி', ee: 'கீ', u: 'கு', oo: 'கூ' },
  'د': { pulli: 'த்', a: 'த', aa: 'தா', i: 'தி', ee: 'தீ', u: 'து', oo: 'தூ' },
  'ذ': { pulli: 'த்', a: 'த', aa: 'தா', i: 'தி', ee: 'தீ', u: 'து', oo: 'தூ' },
  'ر': { pulli: 'ர்', a: 'ர', aa: 'ரா', i: 'ரி', ee: 'ரீ', u: 'ரு', oo: 'ரூ' },
  'ز': { pulli: 'ஜ்', a: 'ஜ', aa: 'ஜா', i: 'ஜி', ee: 'ஜீ', u: 'ஜு', oo: 'ஜூ' },
  'س': { pulli: 'ஸ்', a: 'ஸ', aa: 'ஸா', i: 'ஸி', ee: 'ஸீ', u: 'ஸு', oo: 'ஸூ' },
  'ش': { pulli: 'ஷ்', a: 'ஷ', aa: 'ஷா', i: 'ஷி', ee: 'ஷீ', u: 'ஷு', oo: 'ஷூ' },
  'ص': { pulli: 'ஸ்', a: 'ஸ', aa: 'ஸா', i: 'ஸி', ee: 'ஸீ', u: 'ஸு', oo: 'ஸூ' },
  'ض': { pulli: 'ள்', a: 'ள', aa: 'ளா', i: 'ளி', ee: 'ளீ', u: 'ளு', oo: 'ளூ' },
  'ط': { pulli: 'த்', a: 'த', aa: 'தா', i: 'தி', ee: 'தீ', u: 'து', oo: 'தூ' },
  'ظ': { pulli: 'ழ்', a: 'ழ', aa: 'ழா', i: 'ழி', ee: 'ழீ', u: 'ழு', oo: 'ழூ' },
  'ع': { pulli: 'ஃ', a: 'அ', aa: 'ஆ', i: 'இ', ee: 'ஈ', u: 'உ', oo: 'ஊ' },
  'غ': { pulli: 'க்ஃ', a: 'க', aa: 'கா', i: 'கி', ee: 'கீ', u: 'கு', oo: 'கூ' },
  'ف': { pulli: 'ஃப்', a: 'ஃப', aa: 'ஃபா', i: 'ஃபி', ee: 'ஃபீ', u: 'ஃபு', oo: 'ஃபூ' },
  'ق': { pulli: 'க்', a: 'க', aa: 'கா', i: 'கி', ee: 'கீ', u: 'கு', oo: 'கூ' },
  'ك': { pulli: 'க்', a: 'க', aa: 'கா', i: 'கி', ee: 'கீ', u: 'கு', oo: 'கூ' },
  'ل': { pulli: 'ல்', a: 'ல', aa: 'லா', i: 'லி', ee: 'லீ', u: 'லு', oo: 'லூ' },
  'م': { pulli: 'ம்', a: 'ம', aa: 'மா', i: 'மி', ee: 'மீ', u: 'மு', oo: 'மூ' },
  'ن': { pulli: 'ன்', a: 'ந', aa: 'நா', i: 'நி', ee: 'நீ', u: 'நு', oo: 'நூ' },
  'ه': { pulli: 'ஹ்', a: 'ஹ', aa: 'ஹா', i: 'ஹி', ee: 'ஹீ', u: 'ஹு', oo: 'ஹூ' },
  'ة': { pulli: 'த்', a: 'த', aa: 'தா', i: 'தி', ee: 'தீ', u: 'து', oo: 'தூ' },
  'و': { pulli: 'வ்', a: 'வ', aa: 'வா', i: 'வி', ee: 'வீ', u: 'வு', oo: 'வூ' },
  'ي': { pulli: 'ய்', a: 'ய', aa: 'யா', i: 'யி', ee: 'யீ', u: 'யு', oo: 'யூ' },
  'ى': { pulli: 'ய்', a: 'ா', aa: 'ா', i: 'ி', ee: 'ீ', u: 'ு', oo: 'ூ' },
  'ء': { pulli: 'ஃ', a: 'அ', aa: 'ஆ', i: 'இ', ee: 'ஈ', u: 'உ', oo: 'ஊ' },
  'أ': { pulli: 'ஃ', a: 'அ', aa: 'ஆ', i: 'இ', ee: 'ஈ', u: 'உ', oo: 'ஊ' },
  'إ': { pulli: 'ஃ', a: 'இ', aa: 'ஈ', i: 'இ', ee: 'ஈ', u: 'உ', oo: 'ஊ' },
  'آ': { pulli: 'ஃ', a: 'ஆ', aa: 'ஆ', i: 'இ', ee: 'ஈ', u: 'உ', oo: 'ஊ' },
  'ٱ': { pulli: '', a: 'அ', aa: 'ஆ', i: 'இ', ee: 'ஈ', u: 'உ', oo: 'ஊ' },
}

/**
 * Algorithmic Tamil Phonetic Transliteration
 */
function arabicToTamilPhonetic(arabic: string): string {
  if (!arabic) return ''
  
  // Clean Quranic symbols and pause marks
  const text = arabic
    .replace(/[\u06D6-\u06ED\u0610-\u061A]/g, '')
    .replace(/\u0640/g, '')

  const chars = Array.from(text)
  let out = ''

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (c === ' ') {
      out += ' '
      continue
    }

    const cData = TAMIL_CONSONANT_TABLE[c]
    if (!cData) continue

    let hasShaddah = false
    let harakah: 'a' | 'u' | 'i' | 'an' | 'un' | 'in' | 'sukun' | 'dagger' | null = null
    let j = i + 1

    while (j < chars.length) {
      const next = chars[j]
      if (next === '\u0651') { hasShaddah = true; j++; }
      else if (next === '\u064E') { harakah = 'a'; j++; }
      else if (next === '\u064F') { harakah = 'u'; j++; }
      else if (next === '\u0650') { harakah = 'i'; j++; }
      else if (next === '\u064B') { harakah = 'an'; j++; }
      else if (next === '\u064C') { harakah = 'un'; j++; }
      else if (next === '\u064D') { harakah = 'in'; j++; }
      else if (next === '\u0652' || next === '\u06E1') { harakah = 'sukun'; j++; }
      else if (next === '\u0670') { harakah = 'dagger'; j++; }
      else break
    }

    // Lookahead for long vowel
    let isLong = false
    if (j < chars.length) {
      const lookahead = chars[j]
      if (harakah === 'a' && (lookahead === 'ا' || lookahead === 'ى' || lookahead === '\u0670')) {
        isLong = true
        if (lookahead === 'ا' || lookahead === 'ى') j++
      } else if (harakah === 'u' && (lookahead === 'و' || lookahead === '\u06E5')) {
        isLong = true
        if (lookahead === 'و') j++
      } else if (harakah === 'i' && (lookahead === 'ي' || lookahead === '\u06E6' || lookahead === 'ۧ')) {
        isLong = true
        if (lookahead === 'ي') j++
      }
    }

    if (harakah === 'dagger') isLong = true

    let syllable = ''
    if (hasShaddah) {
      syllable += cData.pulli
    }

    if (harakah === 'sukun') {
      syllable += cData.pulli
    } else if (harakah === 'an') {
      syllable += (isLong ? cData.aa : cData.a) + 'ன்'
    } else if (harakah === 'un') {
      syllable += cData.u + 'ன்'
    } else if (harakah === 'in') {
      syllable += cData.i + 'ன்'
    } else if (harakah === 'u') {
      syllable += isLong ? cData.oo : cData.u
    } else if (harakah === 'i') {
      syllable += isLong ? cData.ee : cData.i
    } else if (harakah === 'a' || harakah === 'dagger') {
      syllable += isLong ? cData.aa : cData.a
    } else {
      syllable += cData.a
    }

    out += syllable
    i = j - 1
  }

  // Refine common suffixes & transitions in Tamil
  return out
    .replace(/\s+/g, ' ')
    .replace(/அலல்லஹி|அலல்லாஹி/g, 'அல்லாஹ்')
    .replace(/அலர்ரஹமாநி/g, 'அர்-ரஹ்மானி')
    .replace(/அலர்ரஹீமி/g, 'அர்-ரஹீமி')
    .trim()
}

/**
 * Algorithmic English Phonetic Transliteration
 */
function arabicToEnglishPhonetic(arabicText: string): string {
  if (!arabicText) return ''
  let result = ''
  const chars = Array.from(arabicText)

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]

    if (char === ' ') {
      result += ' '
      continue
    }

    if (char === '\u0651' && i > 0) {
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

  const cleaned = result
    .replace(/\s+/g, ' ')
    .replace(/\b(llah|allah)\b/gi, 'Allāh')
    .trim()

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Main Bilingual Transliteration Function
 */
export function getArabicTransliteration(
  arabicText: string,
  surahNumber?: number,
  ayahNumber?: number,
  language: TransliterationLanguage = 'en'
): string {
  if (language === 'ta') {
    return getArabicTamilTransliteration(arabicText, surahNumber, ayahNumber)
  }
  return getArabicEnglishTransliteration(arabicText, surahNumber, ayahNumber)
}

export function getArabicTamilTransliteration(
  arabicText: string,
  surahNumber?: number,
  ayahNumber?: number
): string {
  if (surahNumber && ayahNumber) {
    const key = `${surahNumber}:${ayahNumber}`
    if (COMMON_AYAH_TAMIL[key]) {
      return COMMON_AYAH_TAMIL[key]
    }
  }

  if (!arabicText) return ''
  return arabicToTamilPhonetic(arabicText)
}

export function getArabicEnglishTransliteration(
  arabicText: string,
  surahNumber?: number,
  ayahNumber?: number
): string {
  if (surahNumber && ayahNumber) {
    const key = `${surahNumber}:${ayahNumber}`
    if (COMMON_AYAH_ENGLISH[key]) {
      return COMMON_AYAH_ENGLISH[key]
    }
  }

  if (!arabicText) return ''
  return arabicToEnglishPhonetic(arabicText)
}
