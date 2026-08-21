/**
 * Spot-Check Verification Test for Quranic Arabic Letter Counts and Hasanat Calculations.
 *
 * Verifies Hadith rule: 10 Hasanat points per authentic Arabic letter.
 * Tests Surah Al-Fatihah (1:1-7), Ayat al-Kursi (2:255), Al-Baqarah (2:274),
 * Surah Al-Ikhlas (112:1-4), Surah Al-Falaq (113:1-5), and Surah An-Nas (114:1-6).
 */

import { quranApi } from '../src/lib/quranApi'
import { calculateVerseHasanat } from '../src/lib/hasanatEngine'

async function spotCheck() {
  console.log('===============================================================')
  console.log('  🔍 DEENLY HASANAT & LETTER COUNT SPOT-CHECK VERIFICATION     ')
  console.log('===============================================================')

  const testCases = [
    { surah: 1, ayah: 1, title: 'Al-Fatihah 1:1 (Basmalah)', expectedMinLetters: 19 },
    { surah: 1, ayah: 2, title: 'Al-Fatihah 1:2 (Alhamdulillah)', expectedMinLetters: 17 },
    { surah: 2, ayah: 255, title: 'Al-Baqarah 2:255 (Ayat al-Kursi)', expectedMinLetters: 170 },
    { surah: 2, ayah: 274, title: 'Al-Baqarah 2:274 (Charity by Night/Day)', expectedMinLetters: 75 },
    { surah: 112, ayah: 1, title: 'Al-Ikhlas 112:1 (Qul Huwa Allahu Ahad)', expectedMinLetters: 10 },
    { surah: 112, ayah: 2, title: 'Al-Ikhlas 112:2 (Allahu As-Samad)', expectedMinLetters: 8 },
    { surah: 113, ayah: 1, title: 'Al-Falaq 113:1 (Qul A\'udhu bi Rabbi al-Falaq)', expectedMinLetters: 14 },
    { surah: 114, ayah: 1, title: 'An-Nas 114:1 (Qul A\'udhu bi Rabbi an-Nas)', expectedMinLetters: 14 },
  ]

  let allPassed = true

  for (const tc of testCases) {
    try {
      const ayah = await quranApi.getAyah(tc.surah, tc.ayah)
      if (!ayah) {
        console.error(`❌ FAILED: Could not fetch ${tc.title}`)
        allPassed = false
        continue
      }

      const letterCount = ayah.arabicLetterCount
      const hasanat = calculateVerseHasanat(letterCount)
      const expectedHasanat = letterCount * 10

      const isCountValid = letterCount >= tc.expectedMinLetters
      const isHasanatValid = hasanat === expectedHasanat

      if (isCountValid && isHasanatValid) {
        console.log(`✅ [PASS] ${tc.title}`)
        console.log(`   Arabic:  "${ayah.arabicText}"`)
        console.log(`   Letters: ${letterCount} | Hasanat: ${hasanat} pts (10x)\n`)
      } else {
        console.error(`❌ [FAIL] ${tc.title}: Letter count ${letterCount} < ${tc.expectedMinLetters}`)
        allPassed = false
      }
    } catch (err) {
      console.error(`❌ ERROR in ${tc.title}:`, err)
      allPassed = false
    }
  }

  console.log('===============================================================')
  if (allPassed) {
    console.log('  🎉 ALL AYAH SPOT-CHECKS PASSED WITH 100% ACCURACY!          ')
  } else {
    console.error('  ⚠️ SOME SPOT-CHECKS FAILED. PLEASE REVIEW OUTPUT ABOVE.     ')
    process.exit(1)
  }
  console.log('===============================================================')
}

spotCheck()
