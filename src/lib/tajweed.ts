/**
 * ==============================================================================
 * 🌙 DEENLY TAJWEED COLOR RULES ENGINE & TOKENIZER
 * Provides authentic, scholarly color-coded Tajweed parsing for Quranic Arabic.
 * Supported across Focused Reader, Quran Explorer, and Settings.
 * ==============================================================================
 */

export interface TajweedRuleInfo {
  code: string
  nameEn: string
  nameTa: string
  color: string
  hexColor: string
  bgHexColor: string
  descriptionEn: string
  descriptionTa: string
  example: string
  category: 'madd' | 'ghunnah' | 'qalqalah' | 'ikhfa' | 'idgham' | 'iqlab' | 'silent'
}

export const TAJWEED_RULES: Record<string, TajweedRuleInfo> = {
  m: {
    code: 'm',
    nameEn: 'Obligatory Prolongation (Madd Lazim - 6 Harakat)',
    nameTa: 'கட்டாய நீட்டல் (மத் லாஸிம் - 6 அசைவுகள்)',
    color: 'text-red-500',
    hexColor: '#ef4444',
    bgHexColor: 'rgba(239, 68, 68, 0.15)',
    descriptionEn: 'Prolong the vowel sound for 6 beats (counts). Occurs when a Madd letter is followed by a permanent Sukun or Shaddah.',
    descriptionTa: '6 அசைவுகள் வரை நீட்டி ஓத வேண்டும். மத் எழுத்தை தொடர்ந்து நிலையான சுக்கூன் அல்லது ஷத்தா வரும்போது நிகழும்.',
    example: 'الضَّالِّينَ • الحَاقَّةُ',
    category: 'madd',
  },
  o: {
    code: 'o',
    nameEn: 'Mandatory Connected Prolongation (Madd Muttasil - 4-5 Harakat)',
    nameTa: 'இணைந்த கட்டாய நீட்டல் (மத் முத்தஸில - 4-5 அசைவுகள்)',
    color: 'text-rose-500',
    hexColor: '#f43f5e',
    bgHexColor: 'rgba(244, 63, 94, 0.15)',
    descriptionEn: 'Prolong the vowel for 4 or 5 beats. Occurs when a Madd letter is followed by a Hamzah in the same single word.',
    descriptionTa: '4 அல்லது 5 அசைவுகள் நீட்ட வேண்டும். ஒரே சொல்லில் மத் எழுத்தை தொடர்ந்து ஹம்ஸா வரும்போது நிகழும்.',
    example: 'جَاءَ • السَّمَاءِ',
    category: 'madd',
  },
  p: {
    code: 'p',
    nameEn: 'Permissible Prolongation (Madd Ja\'iz / Munfasil / Arid - 2, 4, 6 Harakat)',
    nameTa: 'அனுமதிக்கப்பட்ட நீட்டல் (மத் ஜாஇஸ் / முன்பஸில - 2, 4, 6 அசைவுகள்)',
    color: 'text-amber-500',
    hexColor: '#f59e0b',
    bgHexColor: 'rgba(245, 158, 11, 0.15)',
    descriptionEn: 'Prolong for 2, 4, or 6 beats when pausing at the end of a verse or when Hamzah is in the following word.',
    descriptionTa: 'வசன முடிவில் நிறுத்தும்போது அல்லது அடுத்த சொல்லில் ஹம்ஸா வரும்போது 2, 4 அல்லது 6 அசைவுகள் நீட்டலாம்.',
    example: 'نَسْتَعِينُ • يَا أَيُّهَا',
    category: 'madd',
  },
  n: {
    code: 'n',
    nameEn: 'Natural Prolongation (Madd Tabee\'i - 2 Harakat)',
    nameTa: 'இயற்கை நீட்டல் (மத் தபீஈ - 2 அசைவுகள்)',
    color: 'text-amber-400',
    hexColor: '#fbbf24',
    bgHexColor: 'rgba(251, 191, 36, 0.12)',
    descriptionEn: 'Standard natural elongation for 2 beats for Alif, Waw, or Yaa without subsequent Hamzah or Sukun.',
    descriptionTa: 'அலிஃப், வாவ், யா எழுத்துகளுக்கான இயல்பான 2 அசைவு நீட்டல்.',
    example: 'قَالَ • يَقُولُ • قِيلَ',
    category: 'madd',
  },
  q: {
    code: 'q',
    nameEn: 'Qalqalah (Echoing / Bouncing Sound: ق, ط, ب, ج, د)',
    nameTa: 'கல்கலா (அதிர்வொலி எழுத்துகள்: காஃப், தா, பா, ஜீம், தால்)',
    color: 'text-sky-400',
    hexColor: '#38bdf8',
    bgHexColor: 'rgba(56, 189, 248, 0.15)',
    descriptionEn: 'Produce a vibrant echoing bounce when reciting the 5 Qalqalah letters (ق, ط, ب, ج, د) with a Sukun or at a stop.',
    descriptionTa: 'சுக்கூன் பெற்ற அல்லது நிறுத்தப்படும் (ق, ط, ب, ج, د) எழுத்துகளை அதிர்வுடன் எதிரொலித்து ஓத வேண்டும்.',
    example: 'قُلْ هُوَ اللَّهُ أَحَدٌ • الْفَلَقِ',
    category: 'qalqalah',
  },
  g: {
    code: 'g',
    nameEn: 'Ghunnah (Nasalization / 2 Harakat: نّ, مّ)',
    nameTa: 'குன்னா (மூக்கொலி - 2 அசைவுகள்: நூன், மீம் ஷத்தா)',
    color: 'text-emerald-400',
    hexColor: '#34d399',
    bgHexColor: 'rgba(52, 211, 153, 0.15)',
    descriptionEn: 'Produce a clear nasal hum from the nasal cavity for 2 beats on Noon or Meem with Shaddah (نّ / مّ).',
    descriptionTa: 'ஷத்தா பெற்ற நூன் (نّ) அல்லது மீம் (مّ) எழுத்துகளில் மூக்கிலிருந்து 2 அசைவுகள் இனிய மூக்கொலி எழுப்ப வேண்டும்.',
    example: 'إِنَّ • مِمَّا • النَّاسِ',
    category: 'ghunnah',
  },
  f: {
    code: 'f',
    nameEn: 'Ikhfa (Nasal Concealment / Hiding)',
    nameTa: 'இக்ஃபா (மறைத்து மூக்கொலியுடன் ஓதுதல்)',
    color: 'text-teal-400',
    hexColor: '#2dd4bf',
    bgHexColor: 'rgba(45, 212, 191, 0.15)',
    descriptionEn: 'Conceal Noon Sakinah or Tanween with a light nasal sound before any of the 15 Ikhfa letters (ت, ث, ج, د, ذ, ز, س, ش, ص, ض, ط, ظ, ف, ق, ك).',
    descriptionTa: '15 இக்ஃபா எழுத்துகளுக்கு முன் நூன் சுக்கூன் அல்லது தன்வீன் வரும்போது மூக்கொலியுடன் மறைத்து ஓதுதல்.',
    example: 'مِن قَبْلُ • أَنفُسَهُمْ',
    category: 'ikhfa',
  },
  i: {
    code: 'i',
    nameEn: 'Ikhfa (Nasal Concealment / Hiding)',
    nameTa: 'இக்ஃபா (மறைத்து மூக்கொலியுடன் ஓதுதல்)',
    color: 'text-teal-400',
    hexColor: '#2dd4bf',
    bgHexColor: 'rgba(45, 212, 191, 0.15)',
    descriptionEn: 'Conceal Noon Sakinah or Tanween with a light nasal sound before any of the 15 Ikhfa letters.',
    descriptionTa: '15 இக்ஃபா எழுத்துகளுக்கு முன் நூன் சுக்கூன் அல்லது தன்வீன் வரும்போது மூக்கொலியுடன் மறைத்து ஓதுதல்.',
    example: 'مِن دُونِ • رِزْقًا قَالُوا',
    category: 'ikhfa',
  },
  w: {
    code: 'w',
    nameEn: 'Idgham with Ghunnah (Merging with Nasalization)',
    nameTa: 'இத்காம் குன்னா (மூக்கொலியுடன் இணைத்து ஓதுதல்: ي, ن, م, و)',
    color: 'text-violet-400',
    hexColor: '#a78bfa',
    bgHexColor: 'rgba(167, 139, 250, 0.15)',
    descriptionEn: 'Merge Noon Sakinah or Tanween completely with nasalization into (ي, ن, م, و).',
    descriptionTa: 'நூன் சுக்கூன் அல்லது தன்வீனை (ي, ن, م, و) எழுத்துகளுடன் மூக்கொலியுடன் இணைத்து ஓதுதல்.',
    example: 'مَن يَقُولُ • هُدًى وَرَحْمَةٌ',
    category: 'idgham',
  },
  u: {
    code: 'u',
    nameEn: 'Idgham with Ghunnah (Merging with Nasalization)',
    nameTa: 'இத்காம் குன்னா (மூக்கொலியுடன் இணைத்து ஓதுதல்)',
    color: 'text-violet-400',
    hexColor: '#a78bfa',
    bgHexColor: 'rgba(167, 139, 250, 0.15)',
    descriptionEn: 'Merge Noon Sakinah or Tanween completely with nasalization into (ي, ن, م, و).',
    descriptionTa: 'நூன் சுக்கூன் அல்லது தன்வீனை மூக்கொலியுடன் இணைத்து ஓதுதல்.',
    example: 'مَن يَقُولُ • هُدًى وَرَحْمَةٌ',
    category: 'idgham',
  },
  a: {
    code: 'a',
    nameEn: 'Idgham without Ghunnah (Complete Merging: ل, ر)',
    nameTa: 'இத்காம் பிலா குன்னா (மூக்கொலி இல்லாத இணைத்தல்: லாம், ரா)',
    color: 'text-slate-400',
    hexColor: '#94a3b8',
    bgHexColor: 'rgba(148, 163, 184, 0.15)',
    descriptionEn: 'Merge Noon Sakinah or Tanween into Lam (ل) or Raa (ر) without any nasal sound.',
    descriptionTa: 'லாம் (ل) அல்லது ரா (ر) எழுத்துகளுக்கு முன் நூன் சுக்கூன் அல்லது தன்வீன் வரும்போது மூக்கொலி இல்லாமல் முழுமையாக இணைத்து ஓதுதல்.',
    example: 'مِن رَّبِّهِمْ • هُدًى لِّلْمُتَّقِينَ',
    category: 'idgham',
  },
  d: {
    code: 'd',
    nameEn: 'Idgham without Ghunnah (Complete Merging: ل, ر)',
    nameTa: 'இத்காம் பிலா குன்னா (மூக்கொலி இல்லாத இணைத்தல்: லாம், ரா)',
    color: 'text-slate-400',
    hexColor: '#94a3b8',
    bgHexColor: 'rgba(148, 163, 184, 0.15)',
    descriptionEn: 'Merge Noon Sakinah or Tanween into Lam (ل) or Raa (ر) without any nasal sound.',
    descriptionTa: 'லாம் (ل) அல்லது ரா (ر) எழுத்துகளுக்கு முன் நூன் சுக்கூன் அல்லது தன்வீன் வரும்போது மூக்கொலி இல்லாமல் முழுமையாக இணைத்து ஓதுதல்.',
    example: 'مِن رَّبِّهِمْ',
    category: 'idgham',
  },
  b: {
    code: 'b',
    nameEn: 'Iqlab (Conversion of Noon/Tanween to Meem before Baa)',
    nameTa: 'இக்லாப் (பா எழுத்துக்கு முன் நூன் சுக்கூனை மீமாக மாற்றுதல்)',
    color: 'text-pink-400',
    hexColor: '#f472b6',
    bgHexColor: 'rgba(244, 114, 182, 0.15)',
    descriptionEn: 'Convert Noon Sakinah or Tanween into a light Meem (م) with 2-count Ghunnah when followed by Baa (ب).',
    descriptionTa: 'பா (ب) எழுத்துக்கு முன் நூன் சுக்கூன் அல்லது தன்வீன் வரும்போது அதை மீமாக (م) மாற்றி 2 அசைவு மூக்கொலியுடன் ஓதுதல்.',
    example: 'مِنۢ بَعْدِ • عَلِيمٌۢ بِذَاتِ',
    category: 'iqlab',
  },
  h: {
    code: 'h',
    nameEn: 'Hamzatul Wasl (Connecting Hamzah - Silent when continuous)',
    nameTa: 'ஹம்ஸதுல் வஸ்ல் (தொடர்ந்து ஓதும்போது உச்சரிக்கப்படாத ஹம்ஸா)',
    color: 'text-slate-400/70',
    hexColor: '#94a3b8',
    bgHexColor: 'transparent',
    descriptionEn: 'Pronounced when beginning speech, but skipped silently when reading in continuous connection.',
    descriptionTa: 'ஆரம்பத்தில் ஓதும்போது உச்சரிக்கப்படும், ஆனால் தொடர்ந்து ஓதும்போது உச்சரிக்காமல் விடப்படும் ஹம்ஸா.',
    example: 'بِسْمِ ٱللَّهِ • وَٱسْتَغْفِرْهُ',
    category: 'silent',
  },
  l: {
    code: 'l',
    nameEn: 'Lam Shamsiyyah (Assimilated Silent Lam)',
    nameTa: 'லாம் ஷம்ஸிய்யா (உச்சரிக்கப்படாத லாம்)',
    color: 'text-slate-400/70',
    hexColor: '#94a3b8',
    bgHexColor: 'transparent',
    descriptionEn: 'Lam in the definite article (ال) is silent when followed by a solar letter with Shaddah.',
    descriptionTa: 'ஷம்ஸிய்யா எழுத்துகளுக்கு முன் வரும் அல் (ال) இல் உள்ள லாம் உச்சரிக்கப்படாமல் அடுத்த எழுத்துடன் இணையும்.',
    example: 'ٱلرَّحْمَـٰنِ • ٱلصَّلَوٰةَ',
    category: 'silent',
  },
  s: {
    code: 's',
    nameEn: 'Silent / Unpronounced Letter',
    nameTa: 'உச்சரிக்கப்படாத அமைதியான எழுத்து',
    color: 'text-slate-400/60',
    hexColor: '#94a3b8',
    bgHexColor: 'transparent',
    descriptionEn: 'An orthographic letter that is written in the Mushaf script but not pronounced phonetically.',
    descriptionTa: 'முஸ்ஹஃபில் எழுதப்பட்டிருக்கும் ஆனால் ஓதும்போது உச்சரிக்கப்படாத எழுத்து.',
    example: 'قَالُوا۟ • مِائَةَ',
    category: 'silent',
  },
}

export interface TajweedToken {
  type: 'text' | 'tajweed'
  rule?: string
  content: string
}

/**
 * Tokenize a raw Quran Tajweed annotated string into structured tokens.
 * Handles patterns like: `[h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ`
 */
export function tokenizeTajweedText(rawText: string): TajweedToken[] {
  if (!rawText) return []
  const tokens: TajweedToken[] = []
  let i = 0

  while (i < rawText.length) {
    if (rawText[i] === '[' && i + 1 < rawText.length && /[a-z]/i.test(rawText[i + 1])) {
      const tagMatch = rawText.slice(i).match(/^\[([a-z])(?::\d+)?\[/)
      if (tagMatch) {
        const ruleCode = tagMatch[1]
        const textStart = i + tagMatch[0].length
        let depth = 1
        let j = textStart

        while (j < rawText.length && depth > 0) {
          if (rawText[j] === '[') depth++
          else if (rawText[j] === ']') depth--
          j++
        }

        const innerContent = rawText.slice(textStart, j - 1)
        tokens.push({
          type: 'tajweed',
          rule: ruleCode,
          content: innerContent,
        })
        i = j
        continue
      }
    }

    // Normal text chunk
    const nextTag = rawText.indexOf('[', i)
    if (nextTag === -1) {
      tokens.push({ type: 'text', content: rawText.slice(i) })
      break
    } else {
      if (nextTag > i) {
        tokens.push({ type: 'text', content: rawText.slice(i, nextTag) })
      }
      i = nextTag
    }
  }

  return tokens
}

// In-Memory Cache for fetched Tajweed Chapters
const tajweedChapterCache: Record<number, Record<number, string>> = {}

/**
 * Fetches the annotated Tajweed text for a Surah from AlQuran Cloud CDN with local fallback.
 */
export async function fetchSurahTajweedText(surahNumber: number): Promise<Record<number, string>> {
  if (tajweedChapterCache[surahNumber]) {
    return tajweedChapterCache[surahNumber]
  }

  // 1. Check localStorage Cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`deenly_tajweed_surah_${surahNumber}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        tajweedChapterCache[surahNumber] = parsed
        return parsed
      }
    } catch {}
  }

  // 2. Fetch from AlQuran Cloud Tajweed Edition
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-tajweed`)
    if (res.ok) {
      const json = await res.json()
      if (json?.data?.ayahs && Array.isArray(json.data.ayahs)) {
        const mapping: Record<number, string> = {}
        for (const a of json.data.ayahs) {
          mapping[a.numberInSurah] = a.text
        }
        tajweedChapterCache[surahNumber] = mapping
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`deenly_tajweed_surah_${surahNumber}`, JSON.stringify(mapping))
          } catch {}
        }
        return mapping
      }
    }
  } catch (err) {
    console.warn(`Tajweed API fetch failed for Surah ${surahNumber}:`, err)
  }

  return {}
}

export function getStoredTajweedPreference(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const saved = localStorage.getItem('deenly_tajweed_enabled')
    return saved !== null ? saved === 'true' : true
  } catch {
    return true
  }
}

export function setStoredTajweedPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('deenly_tajweed_enabled', enabled ? 'true' : 'false')
  } catch {}
}
