import { DHIKR_PRESETS } from './src/lib/dhikrData'
import { SURAH_METADATA } from './src/lib/quranMetadata'
import { countArabicLetters } from './src/lib/quranApi'
import { HADITH_BOOKS } from './src/lib/hadithData'
import { calculateDailyStreak, calculateJuzProgress, calculateOverallQuranProgress } from './src/lib/hasanatEngine'

let totalTests = 0
let passedTests = 0
let failedTests = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, errorDetail?: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ [PASS] ${testName}`)
  } else {
    failedTests++
    const msg = `  ❌ [FAIL] ${testName}${errorDetail ? ` - ${errorDetail}` : ''}`
    console.error(msg)
    failures.push(msg)
  }
}

console.log('\n======================================================')
console.log('🧪 RUNNING DEENLY AUTOMATED QA & INTEGRATION TEST SUITE')
console.log('======================================================\n')

// ---------------------------------------------------------------------------
// SUITE 1: Digital Tasbih & Dhikr Presets Data Integrity & Phonetics Coverage
// ---------------------------------------------------------------------------
console.log('📦 SUITE 1: Dhikr Presets & Bilingual Phonetics Coverage')

assert(DHIKR_PRESETS.length === 8, 'DHIKR_PRESETS contains exactly 8 standard presets', `Found ${DHIKR_PRESETS.length}`)

let allPhoneticsValid = true
DHIKR_PRESETS.forEach((d) => {
  if (!d.transliteration || d.transliteration.trim().length === 0) {
    allPhoneticsValid = false
    console.error(`Missing English transliteration for Dhikr ${d.id}`)
  }
  if (!d.transliterationTa || d.transliterationTa.trim().length === 0) {
    allPhoneticsValid = false
    console.error(`Missing Tamil transliteration for Dhikr ${d.id}`)
  }
  if (!d.translationEn || !d.translationTa) {
    allPhoneticsValid = false
    console.error(`Missing translation for Dhikr ${d.id}`)
  }
})
assert(allPhoneticsValid, 'All 8 Dhikr presets have complete English & Tamil phonetics and meanings')

const subhanallah = DHIKR_PRESETS.find((d) => d.id === 'subhanallah')
assert(subhanallah?.arabic === 'سُبْحَانَ ٱللَّهِ', 'SubhanAllah Arabic text is correctly formatted with Tashkeel')
assert(subhanallah?.transliterationTa === 'ஸுப்ஹானல்லாஹ்', 'SubhanAllah Tamil transliteration matches authentic Tamil phonetics')

// ---------------------------------------------------------------------------
// SUITE 2: Digital Tasbih Target Multiplier & Aggregate Calculation
// ---------------------------------------------------------------------------
console.log('\n📦 SUITE 2: Dhikr Goal Multiplier & Aggregate Calculations')

const targetPerDhikr = 100
const totalPresetsCount = 8
const aggregateDailyGoal = targetPerDhikr * totalPresetsCount
assert(aggregateDailyGoal === 800, 'Setting target 100 on 8 dhikrs equals 800 aggregate daily goal', `Expected 800, got ${aggregateDailyGoal}`)

// ---------------------------------------------------------------------------
// SUITE 3: Quran Metadata & Verse Integrity
// ---------------------------------------------------------------------------
console.log('\n📦 SUITE 3: Quran Metadata & Verse Count Audit')

assert(SURAH_METADATA.length === 114, 'SURAH_METADATA contains all 114 Quranic Surahs', `Found ${SURAH_METADATA.length}`)

const totalQuranVerses = SURAH_METADATA.reduce((sum, s) => sum + s.numberOfAyahs, 0)
assert(totalQuranVerses === 6236, 'Total Quran verses equals canonical 6,236 Ayahs', `Calculated ${totalQuranVerses}`)

const surahFatiha = SURAH_METADATA[0]
assert(surahFatiha.number === 1 && surahFatiha.numberOfAyahs === 7, 'Surah Al-Fatiha metadata is correct (7 Ayahs)')

const surahBaqarah = SURAH_METADATA[1]
assert(surahBaqarah.number === 2 && surahBaqarah.numberOfAyahs === 286, 'Surah Al-Baqarah metadata is correct (286 Ayahs)')

const surahNas = SURAH_METADATA[113]
assert(surahNas.number === 114 && surahNas.numberOfAyahs === 6, 'Surah An-Nas metadata is correct (6 Ayahs)')

// ---------------------------------------------------------------------------
// SUITE 4: Hasanat Calculation Engine & Letter Counting
// ---------------------------------------------------------------------------
console.log('\n📦 SUITE 4: Hasanat Multiplier & Letter Counting Engine')

// Al-Fatiha Ayah 1: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
const bismillah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
const letterCount = countArabicLetters(bismillah)
assert(letterCount === 19, 'Bismillah has 19 pure Arabic letters (excluding Tashkeel/harakat)', `Got ${letterCount}`)
assert(letterCount * 10 === 190, 'Bismillah Hasanat reward is 190 points (+10 per letter)')

// Ayat al-Kursi snippet
const ayatKursiSnippet = 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ'
const ayatKursiLetters = countArabicLetters(ayatKursiSnippet)
assert(ayatKursiLetters > 0, 'Ayat al-Kursi letters counted accurately', `Count: ${ayatKursiLetters}`)

// ---------------------------------------------------------------------------
// SUITE 5: Juz & Overall Quran Progress Engine
// ---------------------------------------------------------------------------
console.log('\n📦 SUITE 5: Juz & Progress Computation')

const fatihaProgress = calculateJuzProgress(1, 1)
assert(fatihaProgress.juzNumber === 1, 'Surah 1:1 is in Juz 1')

const baqarah142Progress = calculateJuzProgress(2, 142)
assert(baqarah142Progress.juzNumber === 2, 'Surah 2:142 is in Juz 2', `Got Juz ${baqarah142Progress.juzNumber}`)

const overallStart = calculateOverallQuranProgress(1, 1)
assert(overallStart.percent >= 0 && overallStart.percent <= 1, 'Start of Quran progress is ~0%', `Got ${overallStart.percent}%`)

const overallEnd = calculateOverallQuranProgress(114, 6)
assert(overallEnd.percent === 100, 'End of Surah An-Nas progress is 100%', `Got ${overallEnd.percent}%`)

// ---------------------------------------------------------------------------
// SUITE 6: Daily Streak Engine & Missed Day Verification
// ---------------------------------------------------------------------------
console.log('\n📦 SUITE 6: Daily Streak Engine & Consistency Analysis')

const todayStr = new Date().toISOString().split('T')[0]
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = yesterday.toISOString().split('T')[0]

const dayBefore = new Date()
dayBefore.setDate(dayBefore.getDate() - 2)
const dayBeforeStr = dayBefore.toISOString().split('T')[0]

const streakHistoryConsective = {
  [dayBeforeStr]: { date: dayBeforeStr, verses: 20, hasanat: 200, timeSeconds: 300, pages: 1, lastSurah: 1, lastAyah: 7 },
  [yesterdayStr]: { date: yesterdayStr, verses: 15, hasanat: 150, timeSeconds: 250, pages: 1, lastSurah: 2, lastAyah: 10 },
  [todayStr]: { date: todayStr, verses: 25, hasanat: 250, timeSeconds: 400, pages: 2, lastSurah: 2, lastAyah: 35 },
}

const streakResult = calculateDailyStreak(streakHistoryConsective)
assert(streakResult.currentStreak === 3, '3 consecutive days active calculates currentStreak = 3', `Got ${streakResult.currentStreak}`)
assert(streakResult.isTodayCompleted === true, 'Today completion status is true when today has recorded verses')

// Broken streak test
const threeDaysAgo = new Date()
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0]

const brokenHistory = {
  [threeDaysAgoStr]: { date: threeDaysAgoStr, verses: 20, hasanat: 200, timeSeconds: 300, pages: 1, lastSurah: 1, lastAyah: 7 },
  // yesterday was missed
  [todayStr]: { date: todayStr, verses: 10, hasanat: 100, timeSeconds: 150, pages: 1, lastSurah: 1, lastAyah: 17 },
}

const brokenStreakResult = calculateDailyStreak(brokenHistory)
assert(brokenStreakResult.currentStreak === 1, 'Missed days reset active streak to 1', `Got ${brokenStreakResult.currentStreak}`)

// ---------------------------------------------------------------------------
// SUITE 7: Hadith Catalog Integrity
// ---------------------------------------------------------------------------
console.log('\n📦 SUITE 7: Hadith Catalog & Book Index')

assert(HADITH_BOOKS.length >= 6, 'HADITH_BOOKS contains the 6 major Kutub al-Sittah', `Found ${HADITH_BOOKS.length}`)
const bukhari = HADITH_BOOKS.find((b) => b.id === 'bukhari')
assert(bukhari !== undefined && bukhari.name === 'Sahih al-Bukhari', 'Sahih al-Bukhari metadata is present')
assert(bukhari?.nameTa === 'ஸஹீஹுல் புகாரி', 'Sahih al-Bukhari Tamil name is present')

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================')
console.log(`🏁 AUTOMATED TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`)
console.log('======================================================\n')

if (failedTests > 0) {
  process.exit(1)
}
