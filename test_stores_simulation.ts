import { useTasbihStore } from './src/store/useTasbihStore'
import { useReadingStore } from './src/store/useReadingStore'
import { useBookmarkStore } from './src/store/useBookmarkStore'
import { useFavoriteStore } from './src/store/useFavoriteStore'
import { useAuthStore } from './src/store/useAuthStore'

let total = 0
let passed = 0
let failed = 0

function assert(condition: boolean, testName: string, detail?: string) {
  total++
  if (condition) {
    passed++
    console.log(`  ✅ [PASS] ${testName}`)
  } else {
    failed++
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`)
  }
}

console.log('\n======================================================')
console.log('🧪 RUNNING STORE STATE MUTATION & SIMULATION TEST SUITE')
console.log('======================================================\n')

// ---------------------------------------------------------------------------
// TEST 1: useTasbihStore - Goal Multiplier & Aggregate Calculation
// ---------------------------------------------------------------------------
console.log('📦 TEST 1: useTasbihStore Goal Multiplier & Aggregate Calculation')

const tasbih = useTasbihStore.getState()
tasbih.resetAllTasbihStatsToZero()

tasbih.setAllDhikrTargets(100)
const stateAfterTarget = useTasbihStore.getState()
assert(stateAfterTarget.target === 100, 'Tasbih target set to 100')

// Verify each preset received 100 target
const presets = stateAfterTarget.getAllDhikrs()
const allPresetsHave100 = presets.every((d) => (stateAfterTarget.dhikrTargets[d.id] || d.defaultTarget) === 100)
assert(allPresetsHave100, 'All 8 Dhikr presets have target updated to 100')

// Calculate aggregate goal
assert(stateAfterTarget.dailyGoal === 800, 'Aggregate daily goal is 800 (100 x 8 dhikrs)', `Got ${stateAfterTarget.dailyGoal}`)

// ---------------------------------------------------------------------------
// TEST 2: useTasbihStore - Mid-recitation pause retention
// ---------------------------------------------------------------------------
console.log('\n📦 TEST 2: useTasbihStore Mid-Recitation Pause Retention')

// Simulate tapping SubhanAllah 45 times
for (let i = 0; i < 45; i++) {
  useTasbihStore.getState().incrementCount()
}
const stateAt45 = useTasbihStore.getState()
assert(stateAt45.sessionCount === 45, 'Count incremented to 45', `Count is ${stateAt45.sessionCount}`)
assert(stateAt45.getTodayTotalCount() === 45, 'getTodayTotalCount reflects 45 counts')

// Switch to Alhamdulillah
useTasbihStore.getState().setActiveDhikrId('alhamdulillah')
const stateAlham = useTasbihStore.getState()
assert(stateAlham.activeDhikrId === 'alhamdulillah', 'Switched to Alhamdulillah')
assert(stateAlham.sessionCount === 0, 'Alhamdulillah count starts at 0')

// Increment Alhamdulillah 10 times
for (let i = 0; i < 10; i++) {
  useTasbihStore.getState().incrementCount()
}
assert(useTasbihStore.getState().sessionCount === 10, 'Alhamdulillah count is 10')
assert(useTasbihStore.getState().getTodayTotalCount() === 55, 'getTodayTotalCount reflects 55 (45 + 10)')

// Switch back to SubhanAllah -> Should resume from 45!
useTasbihStore.getState().setActiveDhikrId('subhanallah')
const stateSubhanResume = useTasbihStore.getState()
assert(stateSubhanResume.sessionCount === 45, 'SubhanAllah paused count preserved at 45 upon re-selecting', `Got ${stateSubhanResume.sessionCount}`)

// ---------------------------------------------------------------------------
// TEST 3: useTasbihStore - Custom Dhikr Creation & Deletion
// ---------------------------------------------------------------------------
console.log('\n📦 TEST 3: Custom Dhikr Creation & Removal')

useTasbihStore.getState().addCustomDhikr({
  id: 'custom_test_1',
  arabic: 'رَبِّ زِدْنِي عِلْمًا',
  transliteration: 'Rabbi Zidni Ilma',
  transliterationTa: 'ரப்பீ ஸித்னீ இல்மா',
  translationEn: 'My Lord, increase me in knowledge',
  translationTa: 'என் இறைவா! எனக்குக் கல்வியை அதிகப்படுத்துவாயாக',
  virtueEn: 'Quranic Dua for knowledge and wisdom',
  virtueTa: 'கல்வி மற்றும் ஞானத்திற்கான குர்ஆன் துஆ',
  reference: 'Quran 20:114',
  referenceTa: 'திருக்குர்ஆன் 20:114',
  defaultTarget: 100,
  category: 'custom',
})

const stateWithCustom = useTasbihStore.getState()
assert(stateWithCustom.customDhikrs.length === 1, 'Custom Dhikr successfully created')
const customDhikr = stateWithCustom.customDhikrs[0]
assert(customDhikr.id === 'custom_test_1', 'Custom Dhikr has valid unique ID')
assert(customDhikr.isCustom === true, 'Custom Dhikr has isCustom flag set to true')

// Test custom Dhikr deletion
useTasbihStore.getState().deleteCustomDhikr('custom_test_1')
const stateAfterDelete = useTasbihStore.getState()
assert(stateAfterDelete.customDhikrs.length === 0, 'Custom Dhikr successfully removed')

// ---------------------------------------------------------------------------
// TEST 4: useReadingStore - Session & Position State
// ---------------------------------------------------------------------------
console.log('\n📦 TEST 4: useReadingStore Session & Position State')

useReadingStore.getState().setCurrentPosition(2, 255)
const readingState = useReadingStore.getState()
assert(readingState.currentSurahNumber === 2, 'Current Surah set to 2')
assert(readingState.currentAyahNumber === 255, 'Current Ayah set to 255')

// Test font size boundaries
useReadingStore.getState().setFontSize(40)
assert(useReadingStore.getState().fontSize === 40, 'Font size updated to 40px')

// ---------------------------------------------------------------------------
// TEST 5: useBookmarkStore & useFavoriteStore
// ---------------------------------------------------------------------------
console.log('\n📦 TEST 5: Bookmarks and Favorites State')

useBookmarkStore.getState().toggleQuranBookmark({
  surahNumber: 2,
  ayahNumber: 255,
  surahName: 'Al-Baqarah',
  arabicName: 'البقرة',
  arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
  translationText: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
})

assert(useBookmarkStore.getState().isQuranBookmarked(2, 255) === true, 'Ayat al-Kursi is bookmarked')
useBookmarkStore.getState().removeQuranBookmark(2, 255)
assert(useBookmarkStore.getState().isQuranBookmarked(2, 255) === false, 'Ayat al-Kursi bookmark removed')

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================')
console.log(`🏁 STORE SIMULATION TEST RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`)
console.log('======================================================\n')

if (failed > 0) process.exit(1)
