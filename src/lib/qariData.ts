// ============================================================================
// 🎙️ Deenly Multi-Qari Audio Engine Catalog & URL Resolver
// High-fidelity streams (128kbps–192kbps) via EveryAyah.com & QuranCDN
// ============================================================================

export type QariStyle = 'murattal' | 'mujawwad' | 'haramain' | 'teaching' | 'emotional'

export interface QariInfo {
  id: string
  nameEn: string
  nameTa: string
  nameAr: string
  style: QariStyle
  styleLabelEn: string
  styleLabelTa: string
  folderName: string
  bitrate: string
  country: string
  flag: string
  badgeEn?: string
  badgeTa?: string
  descriptionEn: string
  descriptionTa: string
  sampleSurah: number
  sampleAyah: number
}

export const DEFAULT_QARI_ID = 'alafasy'

export const QARI_LIST: QariInfo[] = [
  {
    id: 'alafasy',
    nameEn: 'Sheikh Mishary Rashid Alafasy',
    nameTa: 'ஷேக் மிஷாரி ரஷீத் அல்-அஃபாஸி',
    nameAr: 'مشاري بن راشد العفاسي',
    style: 'murattal',
    styleLabelEn: 'Murattal • Melodic & Clear',
    styleLabelTa: 'முரத்தல் • இனிமை & தெளிவு',
    folderName: 'Alafasy_128kbps',
    bitrate: '128kbps',
    country: 'Kuwait',
    flag: '🇰🇼',
    badgeEn: 'Default • Popular',
    badgeTa: 'வழக்கமானது • பிரபலம்',
    descriptionEn: 'Crystal-clear contemporary melodic recitation with precise Tajweed cadence. Beloved worldwide.',
    descriptionTa: 'துல்லியமான தஜ்வீத் உச்சரிப்புடன் கூடிய உலகப் புகழ்பெற்ற இனிமையான ஓதுதல்.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'abdulbasit_murattal',
    nameEn: 'Sheikh Abdul Basit Abdul Samad',
    nameTa: 'ஷேக் அப்துல் பாசித் அப்துஸ் ஸமத் (முரத்தல்)',
    nameAr: 'عبد الباسط عبد الصمد (مرتل)',
    style: 'murattal',
    styleLabelEn: 'Murattal • Classic Egyptian',
    styleLabelTa: 'முரத்தல் • பாரம்பரிய எகிப்து',
    folderName: 'Abdul_Basit_Murattal_192kbps',
    bitrate: '192kbps HQ',
    country: 'Egypt',
    flag: '🇪🇬',
    badgeEn: 'Legendary Master',
    badgeTa: 'வரலாற்றுப் புகழ் மாஸ்டர்',
    descriptionEn: 'The legendary Egyptian master reciter known for golden standard rhythm and unmatched breath control.',
    descriptionTa: 'தங்கத் தரம் வாய்ந்த தாளக் கட்டுப்பாடு கொண்ட வரலாற்றுச் சிறப்புமிக்க எகிப்திய காரீ.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'abdulbasit_mujawwad',
    nameEn: 'Sheikh Abdul Basit Abdul Samad (Mujawwad)',
    nameTa: 'ஷேக் அப்துல் பாசித் (முஜவ்வத்)',
    nameAr: 'عبد الباسط عبد الصمد (مجود)',
    style: 'mujawwad',
    styleLabelEn: 'Mujawwad • Classical Maqamat',
    styleLabelTa: 'முஜவ்வத் • ராக தாள நடை',
    folderName: 'Abdul_Basit_Mujawwad_128kbps',
    bitrate: '128kbps',
    country: 'Egypt',
    flag: '🇪🇬',
    badgeEn: 'Majestic Maqamat',
    badgeTa: 'கம்பீரமான ராகம்',
    descriptionEn: 'Slow, majestic, soul-stirring concert recitation with dramatic vocal range and deep contemplation.',
    descriptionTa: 'மெதுவான, கம்பீரமான மற்றும் ஆழ்ந்த சிந்தனைக்குரிய மாபெரும் ராக ஓதுதல் முறை.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'husary_murattal',
    nameEn: 'Sheikh Mahmoud Khalil Al-Husary',
    nameTa: 'ஷேக் மஹ்மூத் கலீல் அல்-ஹுஸரி',
    nameAr: 'محمود خليل الحصري',
    style: 'murattal',
    styleLabelEn: 'Murattal • Tajweed Benchmark',
    styleLabelTa: 'முரத்தல் • தஜ்வீத் வழிகாட்டி',
    folderName: 'Husary_128kbps',
    bitrate: '128kbps',
    country: 'Egypt',
    flag: '🇪🇬',
    badgeEn: 'Gold Standard Tajweed',
    badgeTa: 'தஜ்வீத் முதன்மை மாதிரி',
    descriptionEn: 'The undisputed global reference for flawless Tajweed articulation and measured pronunciation pace.',
    descriptionTa: 'குறைபாடற்ற தஜ்வீத் உச்சரிப்புக்கான சர்வதேச அளவுகோலாகக் கருதப்படும் முதன்மை காரீ.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'husary_muallim',
    nameEn: 'Sheikh Al-Husary (Muallim / Teaching)',
    nameTa: 'ஷேக் அல்-ஹுஸரி (கற்றல் முறை)',
    nameAr: 'محمود خليل الحصري (المعلم)',
    style: 'teaching',
    styleLabelEn: 'Teaching Style • Slow & Clear',
    styleLabelTa: 'கற்றல் முறை • மெதுவான உச்சரிப்பு',
    folderName: 'Husary_Muallim_128kbps',
    bitrate: '128kbps',
    country: 'Egypt',
    flag: '🇪🇬',
    badgeEn: 'Best for Memorization',
    badgeTa: 'மனனம் செய்ய சிறந்தது',
    descriptionEn: 'Deliberate, slow cadence engineered for learners, students of Tajweed, and Quran memorization (Hifz).',
    descriptionTa: 'புதிய கற்பவர்கள் மற்றும் மனனம் செய்வோருக்கான மெதுவான, தனித்துவமான உச்சரிப்பு நடை.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'minshawi_murattal',
    nameEn: 'Sheikh Mohamed Siddiq Al-Minshawi',
    nameTa: 'ஷேக் முஹம்மத் சித்தீக் அல்-மின்ஷாவி',
    nameAr: 'محمد صديق المنشاوي',
    style: 'murattal',
    styleLabelEn: 'Murattal • Reverent & Deep',
    styleLabelTa: 'முரத்தல் • பயபக்தி & நெகிழ்ச்சி',
    folderName: 'Minshawy_Murattal_128kbps',
    bitrate: '128kbps',
    country: 'Egypt',
    flag: '🇪🇬',
    badgeEn: 'Tearful Voice',
    badgeTa: 'உள்ளத்தை உருக்கும் குரல்',
    descriptionEn: 'Known as "The Crying Voice" for his deeply emotive, reverent, and spiritually moving delivery.',
    descriptionTa: 'உள்ளத்தை உருக வைக்கும் பயபக்தியான ஓதுதலால் உலகெங்கும் போற்றப்படும் காரீ.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'minshawi_mujawwad',
    nameEn: 'Sheikh Al-Minshawi (Mujawwad)',
    nameTa: 'ஷேக் அல்-மின்ஷாவி (முஜவ்வத்)',
    nameAr: 'محمد صديق المنشاوي (مجود)',
    style: 'mujawwad',
    styleLabelEn: 'Mujawwad • Classical Egyptian',
    styleLabelTa: 'முஜவ்வத் • செம்மொழி ராகம்',
    folderName: 'Minshawy_Mujawwad_192kbps',
    bitrate: '192kbps HQ',
    country: 'Egypt',
    flag: '🇪🇬',
    badgeEn: 'High Fidelity Classic',
    badgeTa: 'உயர்தர கிளாசிக்',
    descriptionEn: 'Full-spectrum classical Egyptian Mujawwad recitation filled with heartfelt pathos and spiritual depth.',
    descriptionTa: 'ஆழ்ந்த ஆன்மீக உணர்வுகள் நிறைந்த பாரம்பரிய எகிப்திய முஜவ்வத் ஓதுதல் முறை.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'sudais',
    nameEn: 'Sheikh Abdur-Rahman As-Sudais',
    nameTa: 'ஷேக் அப்துர் ரஹ்மான் அஸ்-ஸுதைஸ்',
    nameAr: 'عبد الرحمن السديس',
    style: 'haramain',
    styleLabelEn: 'Haramain • Makkah Taraweeh',
    styleLabelTa: 'ஹரமைன் • மக்கா தஹஜ்ஜுத்/தராஹீஹ்',
    folderName: 'Abdurrahmaan_As-Sudais_192kbps',
    bitrate: '192kbps HQ',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    badgeEn: 'Imam of Makkah',
    badgeTa: 'மக்கா இமாம்',
    descriptionEn: 'Head of Religious Affairs & Senior Imam of Masjid al-Haram in Makkah. Powerful, commanding Taraweeh tone.',
    descriptionTa: 'மக்கா மஸ்ஜிதுல் ஹராமின் தலைமை இமாம். கம்பீரமான மக்கா தராஹீஹ் ஓதுதல்.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'shuraym',
    nameEn: 'Sheikh Saud Al-Shuraim',
    nameTa: 'ஷேக் ஸஊத் அல்-ஷுரைம்',
    nameAr: 'سعود الشريم',
    style: 'haramain',
    styleLabelEn: 'Haramain • Fast Rhythmic',
    styleLabelTa: 'ஹரமைன் • வேகமான தாள நடை',
    folderName: 'Saood_ash-Shuraym_128kbps',
    bitrate: '128kbps',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    badgeEn: 'Former Imam of Makkah',
    badgeTa: 'முன்னாள் மக்கா இமாம்',
    descriptionEn: 'Former Imam of the Kaaba, celebrated for rapid, melodic rhythm and high emotional intensity.',
    descriptionTa: 'கஅபாவின் முன்னாள் இமாம். வேகமான மற்றும் இதமான தாள நடைக்கு பெயர் பெற்றவர்.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'maher',
    nameEn: 'Sheikh Maher Al-Muaiqly',
    nameTa: 'ஷேக் மாஹிர் அல்-முஐக்லீ',
    nameAr: 'ماهر المعيقلي',
    style: 'haramain',
    styleLabelEn: 'Haramain • Soothing & Gentle',
    styleLabelTa: 'ஹரமைன் • மென்மையான நய ஓதுதல்',
    folderName: 'MaherAlMuaiqly128kbps',
    bitrate: '128kbps',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    badgeEn: 'Imam of Makkah',
    badgeTa: 'மக்கா இமாம்',
    descriptionEn: 'Imam of Masjid al-Haram, globally cherished for gentle resonance, emotional depth, and serene cadence.',
    descriptionTa: 'மக்கா மஸ்ஜிதுல் ஹராமின் இமாம். மன அமைதி தரும் இதமான, நெகிழ்ச்சியான ஓதுதல்.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'shatri',
    nameEn: 'Sheikh Abu Bakr Al-Shatri',
    nameTa: 'ஷேக் அபூபக்ர் அல்-ஷாத்ரீ',
    nameAr: 'أبو بكر الشاطري',
    style: 'emotional',
    styleLabelEn: 'Soulful • Deep & Calm',
    styleLabelTa: 'ஆன்மீகம் • அமைதியான ஓதுதல்',
    folderName: 'Abu_Bakr_Ash-Shaatree_128kbps',
    bitrate: '128kbps',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    badgeEn: 'Calm & Heartfelt',
    badgeTa: 'அமைதி & இதமானது',
    descriptionEn: 'Deeply relaxing and resonant delivery that brings profound tranquility and peace of mind.',
    descriptionTa: 'மன அமைதியைத் தரும் ஆழமான, இதமான ஆன்மீக ஓதுதல் முறை.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'ghamadi',
    nameEn: 'Sheikh Saad Al-Ghamadi',
    nameTa: 'ஷேக் ஸஅத் அல்-காமதி',
    nameAr: 'سعد الغامدي',
    style: 'murattal',
    styleLabelEn: 'Murattal • Flowing Cadence',
    styleLabelTa: 'முரத்தல் • சீரான வேக நடை',
    folderName: 'Ghamadi_40kbps',
    bitrate: 'HQ Audio',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    badgeEn: 'Flowing & Fluent',
    badgeTa: 'சீரான ஓட்டம்',
    descriptionEn: 'Fast-paced, smooth and steady recitation ideal for daily continuous Quran listening.',
    descriptionTa: 'தினசரி தொடர் வாசிப்பிற்கு ஏற்ற சீரான, நேர்த்தியான ஓட்டமுடைய நடை.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
  {
    id: 'rifai',
    nameEn: 'Sheikh Hani Ar-Rifai',
    nameTa: 'ஷேக் ஹானி அர்-ரிஃபாயீ',
    nameAr: 'هاني الرفاعي',
    style: 'emotional',
    styleLabelEn: 'Emotional • Heart-touching',
    styleLabelTa: 'உணர்வுபூர்வம் • கண்ணீர் நடை',
    folderName: 'Hani_Rifai_192kbps',
    bitrate: '192kbps HQ',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    badgeEn: 'Soul Touching',
    badgeTa: 'நெஞ்சைத் தொடும் குரல்',
    descriptionEn: 'Exceptionally emotional recitation known for touching the hearts of listeners and inspiring sincere Du\'a.',
    descriptionTa: 'கேட்போரின் உள்ளங்களை நெகிழச் செய்து பிரார்த்தனை உணர்வைத் தூண்டும் உணர்வுபூர்வ ஓதுதல்.',
    sampleSurah: 1,
    sampleAyah: 1,
  },
]

/**
 * Helper to fetch Qari metadata by ID
 */
export function getQariById(qariId?: string): QariInfo {
  if (!qariId) return QARI_LIST[0]
  return QARI_LIST.find((q) => q.id === qariId) || QARI_LIST[0]
}

/**
 * Generate standard EveryAyah audio URL for any Surah and Ayah with a specific Qari
 * Format: https://everyayah.com/data/{folderName}/{pad3(surah)}{pad3(ayah)}.mp3
 */
export function getAyahAudioUrlByQari(
  qariId: string = DEFAULT_QARI_ID,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  const qari = getQariById(qariId)
  const s = String(surahNumber).padStart(3, '0')
  const a = String(ayahNumberInSurah).padStart(3, '0')
  return `https://everyayah.com/data/${qari.folderName}/${s}${a}.mp3`
}
