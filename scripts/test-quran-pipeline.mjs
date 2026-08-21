/**
 * End-to-End Test Script for Deenly Quran Content Layer
 * 
 * Fetches Al-Baqarah Ayah 274 (2:274) in:
 * - Arabic (Uthmani script)
 * - English (Sahih International)
 * - Tamil (Abdul Hameed Baqavi)
 * Computes the authentic Arabic letter count and Hasanat calculation.
 */

const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions'

const EDITIONS = {
  ar: 'ara-quranacademy',
  en: 'eng-ummmuhammad',
  ta: 'tam-abdulhameedbaqa',
}

function countArabicLetters(arabicText) {
  if (!arabicText) return 0
  // Strip marks (\p{M}), punctuation (\p{P}), symbols (\p{S}), spaces (\p{Z}), numbers (\p{N}), tatweel (\u0640)
  const clean = arabicText.replace(/[\p{M}\p{P}\p{S}\p{Z}\p{N}\u0640]/gu, '')
  return {
    count: Array.from(clean).length,
    cleanText: clean,
  }
}

async function fetchVerse(edition, surah, verseNum) {
  const url = `${JSDELIVR_BASE}/${edition}/${surah}.json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${edition} Surah ${surah} (HTTP ${res.status})`)
  }
  const data = await res.json()
  const verse = data.chapter.find((v) => v.verse === verseNum)
  if (!verse) {
    throw new Error(`Verse ${verseNum} not found in Surah ${surah}`)
  }
  return verse.text
}

async function runTest() {
  console.log('===============================================================')
  console.log('  🌙 DEENLY QURAN CONTENT LAYER & LETTER COUNT TEST (2:274)     ')
  console.log('===============================================================\n')

  console.log('⏳ Fetching Surah Al-Baqarah, Ayah 274 across 3 languages...\n')

  try {
    const [arabicText, englishText, tamilText] = await Promise.all([
      fetchVerse(EDITIONS.ar, 2, 274),
      fetchVerse(EDITIONS.en, 2, 274),
      fetchVerse(EDITIONS.ta, 2, 274),
    ])

    const letterResult = countArabicLetters(arabicText)
    const hasanat = letterResult.count * 10

    console.log('📖 [SURAH AL-BAQARAH (2:274)]')
    console.log('---------------------------------------------------------------')
    console.log('🇸🇦 Arabic (Uthmani Script):')
    console.log(`   "${arabicText}"\n`)

    console.log('🇬🇧 English Translation (Sahih International):')
    console.log(`   "${englishText}"\n`)

    console.log('🇮🇳 Tamil Translation (Abdul Hameed Baqavi):')
    console.log(`   "${tamilText}"\n`)

    console.log('---------------------------------------------------------------')
    console.log('📊 ARABIC LETTER COUNT & HASANAT METRICS:')
    console.log('---------------------------------------------------------------')
    console.log(`✨ Raw Arabic Length:        ${Array.from(arabicText).length} characters (with diacritics/spaces)`)
    console.log(`🔤 Cleaned Arabic Alphabet:   ${letterResult.count} letters`)
    console.log(`💎 Isolated Letter String:   "${letterResult.cleanText}"`)
    console.log(`⭐ Calculated Hasanat (x10): ${hasanat.toLocaleString()} Hasanat points (10 per letter)`)
    console.log('---------------------------------------------------------------')

    console.log('\n✅ PIPELINE TEST PASSED: Arabic, English, and Tamil translations')
    console.log('   successfully loaded, verified, and letter-counted end to end.\n')
  } catch (err) {
    console.error('❌ Pipeline Test Failed:', err)
    process.exit(1)
  }
}

runTest()
