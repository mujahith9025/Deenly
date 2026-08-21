/**
 * Unit Test Script for Deenly Hasanat & Reading Engine
 * 
 * Verifies pure mathematical logic for:
 * - Hasanat points calculation (10 points per Arabic letter)
 * - Juz-level progress bar and percentage tracking
 * - Khatm progress calculations
 * - Daily streak calculations
 * - Duration formatting
 */

import assert from 'node:assert'
import { 
  calculateVerseHasanat, 
  calculateJuzProgress, 
  calculateKhatmProgress, 
  formatTimer, 
  formatDurationHuman, 
  calculateDailyStreak 
} from '../src/lib/hasanatEngine'

function runUnitTests() {
  console.log('===============================================================')
  console.log('  🧪 DEENLY HASANAT & READING ENGINE UNIT TESTS                ')
  console.log('===============================================================\n')

  // Test 1: Verse Hasanat calculation
  console.log('▶ Test 1: Hasanat calculation (x10 per Arabic letter)...')
  assert.strictEqual(calculateVerseHasanat(0), 0)
  assert.strictEqual(calculateVerseHasanat(19), 190)
  assert.strictEqual(calculateVerseHasanat(77), 770) // Al-Baqarah 2:274 letter count
  console.log('  ✅ 77 letters -> 770 Hasanat points (Passed)\n')

  // Test 2: Juz progress calculations
  console.log('▶ Test 2: Juz progress calculations...')
  const juz1Start = calculateJuzProgress(1, 1)
  assert.strictEqual(juz1Start.juzNumber, 1)
  assert.strictEqual(juz1Start.versesCompletedInJuz, 1)
  console.log(`  ✅ Juz 1 Start (1:1): ${juz1Start.percent}% completed (1 of ${juz1Start.totalVersesInJuz} verses)`)

  const juz1End = calculateJuzProgress(2, 141)
  assert.strictEqual(juz1End.juzNumber, 1)
  assert.strictEqual(juz1End.percent, 100)
  console.log(`  ✅ Juz 1 End (2:141): ${juz1End.percent}% completed (${juz1End.versesCompletedInJuz}/${juz1End.totalVersesInJuz} verses)`)

  const juz2 = calculateJuzProgress(2, 200)
  assert.strictEqual(juz2.juzNumber, 2)
  assert.ok(juz2.percent > 50 && juz2.percent < 60)
  console.log(`  ✅ Juz 2 Mid (2:200): ${juz2.percent}% completed (${juz2.versesCompletedInJuz}/${juz2.totalVersesInJuz} verses)\n`)

  // Test 3: Khatm Progress
  console.log('▶ Test 3: Khatm progress calculation...')
  assert.strictEqual(calculateKhatmProgress(0), 0)
  assert.strictEqual(calculateKhatmProgress(604), 100)
  assert.strictEqual(calculateKhatmProgress(151), 25)
  console.log('  ✅ 151 pages out of 604 -> 25.0% Khatm (Passed)\n')

  // Test 4: Timer & Duration Formatting
  console.log('▶ Test 4: Duration & Timer formatting...')
  assert.strictEqual(formatTimer(0), '00:00')
  assert.strictEqual(formatTimer(65), '01:05')
  assert.strictEqual(formatTimer(600), '10:00')
  assert.strictEqual(formatDurationHuman(45), '45s')
  assert.strictEqual(formatDurationHuman(900), '15m')
  assert.strictEqual(formatDurationHuman(3660), '1h 1m')
  console.log('  ✅ Timer MM:SS and human formats verified (Passed)\n')

  // Test 5: Daily Streak Calculation
  console.log('▶ Test 5: Daily Streak calculations...')
  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const mockHistory = {
    [todayStr]: { verses: 10 },
    [yesterdayStr]: { verses: 20 },
  }
  const streakResult = calculateDailyStreak(mockHistory)
  assert.strictEqual(streakResult.isTodayCompleted, true)
  assert.strictEqual(streakResult.currentStreak, 2)
  console.log(`  ✅ Consecutive 2-day activity -> Streak: ${streakResult.currentStreak}, Today Completed: ${streakResult.isTodayCompleted} (Passed)\n`)

  console.log('===============================================================')
  console.log('  🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!                       ')
  console.log('===============================================================')
}

runUnitTests()
