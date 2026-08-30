/**
 * ==============================================================================
 * 🔔 DEENLY NOTIFICATION & SPIRITUAL REMINDER ENGINE
 * Handles native mobile/browser push notifications, scheduled Verse of the Day,
 * staggered Hadith of the Day, and morning/evening Quran recitation reminders.
 * ==============================================================================
 */

export interface NotificationScheduleConfig {
  enabled: boolean
  // 1. Morning Verse of the Day
  verseOfTheDayEnabled: boolean
  verseTime: string // e.g. "07:00"
  // 2. Morning Hadith of the Day (staggered, e.g. 15 minutes after Verse)
  hadithOfTheDayEnabled: boolean
  hadithTime: string // e.g. "07:15"
  // 3. Morning Quran Recitation Reminder
  morningQuranReminderEnabled: boolean
  morningQuranTime: string // e.g. "08:30"
  // 4. Evening Quran Recitation Reminder
  eveningQuranReminderEnabled: boolean
  eveningQuranTime: string // e.g. "18:30"
  // 5. Prayer Time Awareness
  prayerAwarenessEnabled: boolean
}

const NOTIFICATION_CONFIG_KEY = 'deenly_notification_config_v2'
const NOTIFICATION_SENT_LOG_KEY = 'deenly_notification_sent_log'

export const DEFAULT_NOTIFICATION_CONFIG: NotificationScheduleConfig = {
  enabled: false,
  verseOfTheDayEnabled: true,
  verseTime: '07:00',
  hadithOfTheDayEnabled: true,
  hadithTime: '07:15',
  morningQuranReminderEnabled: true,
  morningQuranTime: '08:30',
  eveningQuranReminderEnabled: true,
  eveningQuranTime: '18:30',
  prayerAwarenessEnabled: true,
}

// 1. Storage Helpers
export function loadNotificationConfig(): NotificationScheduleConfig {
  try {
    const raw = localStorage.getItem(NOTIFICATION_CONFIG_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_CONFIG
    return { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_NOTIFICATION_CONFIG
  }
}

export function saveNotificationConfig(config: NotificationScheduleConfig): void {
  try {
    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('Failed to save notification config:', err)
  }
}

interface SentLog {
  [dateStr: string]: {
    verse?: boolean
    hadith?: boolean
    morningQuran?: boolean
    eveningQuran?: boolean
  }
}

function loadSentLog(): SentLog {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SENT_LOG_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function markNotificationSent(type: 'verse' | 'hadith' | 'morningQuran' | 'eveningQuran', dateStr: string): void {
  try {
    const log = loadSentLog()
    if (!log[dateStr]) log[dateStr] = {}
    log[dateStr][type] = true
    localStorage.setItem(NOTIFICATION_SENT_LOG_KEY, JSON.stringify(log))
  } catch (err) {
    console.error('Failed to update notification sent log:', err)
  }
}

function isNotificationSent(type: 'verse' | 'hadith' | 'morningQuran' | 'eveningQuran', dateStr: string): boolean {
  const log = loadSentLog()
  return Boolean(log[dateStr]?.[type])
}

// 2. Permission Management
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

// 3. Dispatch Native Notification (via Service Worker if active, with fallback)
export async function sendNativeNotification(
  title: string,
  body: string,
  tag?: string,
  urlPath?: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission()
    if (!granted) return false
  }

  const iconUrl = '/icons/icon-192x192.png'
  const badgeUrl = '/icons/icon-192x192.png'

  try {
    // Attempt Service Worker showNotification first for reliable mobile background delivery
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: iconUrl,
          badge: badgeUrl,
          tag: tag || 'deenly_notification',
          data: { url: urlPath || '/' },
          vibrate: [200, 100, 200],
        } as NotificationOptions)
        return true
      }
    }

    // Fallback to standard Window Notification
    new Notification(title, {
      body,
      icon: iconUrl,
      badge: badgeUrl,
      tag: tag || 'deenly_notification',
    })
    return true
  } catch (err) {
    console.error('Error dispatching native notification:', err)
    return false
  }
}

// 4. Content Formatters for Daily Reminders
export function getVerseNotificationContent(isTamil: boolean): { title: string; body: string } {
  if (isTamil) {
    return {
      title: '📖 இன்றைய திருக்குர்ஆன் வசனம்',
      body: '«நிச்சயமாக சிரமத்துடன் எளிமை இருக்கிறது» — சூரா அல்-இன்ஷிராஹ் (94:5-6)',
    }
  }
  return {
    title: '📖 Verse of the Day',
    body: '"Indeed, with hardship comes ease." — Surah Al-Inshirah (94:5-6)',
  }
}

export function getHadithNotificationContent(isTamil: boolean): { title: string; body: string } {
  if (isTamil) {
    return {
      title: '✨ இன்றைய ஆதாரப்பூர்வ நபிமொழி',
      body: '«செயல்கள் அனைத்தும் எண்ணங்களைப் பொருத்தே அமைகின்றன» — ஸஹீஹ் அல்-புகாரி (1)',
    }
  }
  return {
    title: '✨ Hadith of the Day',
    body: '"Actions are judged by intentions, and every person gets what they intended." — Sahih al-Bukhari 1',
  }
}

export function getMorningQuranReminderContent(isTamil: boolean): { title: string; body: string } {
  if (isTamil) {
    return {
      title: '🌅 காலை குர்ஆன் ஓதும் நேரம்',
      body: 'உங்கள் காலைப் பொழுதை அல்லாஹ்வின் வேதத்தோடு தொடங்குங்கள். ஒவ்வொரு எழுத்துக்கும் 10 நன்மைகள்!',
    }
  }
  return {
    title: '🌅 Morning Quran Recitation',
    body: 'Start your morning with the Holy Quran — every letter brings 10 Hasanat rewards.',
  }
}

export function getEveningQuranReminderContent(isTamil: boolean): { title: string; body: string } {
  if (isTamil) {
    return {
      title: '🌇 மாலை குர்ஆன் நினைவூட்டல்',
      body: 'இன்றைய நாளின் குர்ஆன் இலக்கை நிறைவு செய்து உங்கள் உள்ளத்திற்கு அமைதியைத் தேடுங்கள்.',
    }
  }
  return {
    title: '🌇 Evening Quran Reflection',
    body: 'Complete your daily Quran recitation goal and bring serenity to your evening.',
  }
}

// 5. Test Notification Triggers
export async function triggerTestVerseNotification(isTamil: boolean): Promise<boolean> {
  const content = getVerseNotificationContent(isTamil)
  return sendNativeNotification(content.title, content.body, 'deenly_test_verse', '/dashboard')
}

export async function triggerTestHadithNotification(isTamil: boolean): Promise<boolean> {
  const content = getHadithNotificationContent(isTamil)
  return sendNativeNotification(content.title, content.body, 'deenly_test_hadith', '/dashboard')
}

export async function triggerTestMorningReminder(isTamil: boolean): Promise<boolean> {
  const content = getMorningQuranReminderContent(isTamil)
  return sendNativeNotification(content.title, content.body, 'deenly_test_morning', '/reading')
}

export async function triggerTestEveningReminder(isTamil: boolean): Promise<boolean> {
  const content = getEveningQuranReminderContent(isTamil)
  return sendNativeNotification(content.title, content.body, 'deenly_test_evening', '/reading')
}

// 6. Background Scheduler Routine (Checks every 30s when app is running)
let schedulerIntervalId: number | null = null

export function initNotificationScheduler(isTamil: boolean): void {
  if (typeof window === 'undefined') return

  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId)
  }

  const checkAndDispatch = () => {
    const config = loadNotificationConfig()
    if (!config.enabled) return
    if (Notification.permission !== 'granted') return

    const now = new Date()
    const currentHH = String(now.getHours()).padStart(2, '0')
    const currentMM = String(now.getMinutes()).padStart(2, '0')
    const currentHHMM = `${currentHH}:${currentMM}`
    const todayDateStr = now.toISOString().split('T')[0]

    // 1. Check Verse of the Day
    if (config.verseOfTheDayEnabled && currentHHMM === config.verseTime && !isNotificationSent('verse', todayDateStr)) {
      const verse = getVerseNotificationContent(isTamil)
      sendNativeNotification(verse.title, verse.body, 'daily_verse', '/dashboard')
      markNotificationSent('verse', todayDateStr)
    }

    // 2. Check Hadith of the Day (Staggered morning)
    if (config.hadithOfTheDayEnabled && currentHHMM === config.hadithTime && !isNotificationSent('hadith', todayDateStr)) {
      const hadith = getHadithNotificationContent(isTamil)
      sendNativeNotification(hadith.title, hadith.body, 'daily_hadith', '/dashboard')
      markNotificationSent('hadith', todayDateStr)
    }

    // 3. Check Morning Quran Reminder
    if (config.morningQuranReminderEnabled && currentHHMM === config.morningQuranTime && !isNotificationSent('morningQuran', todayDateStr)) {
      const morning = getMorningQuranReminderContent(isTamil)
      sendNativeNotification(morning.title, morning.body, 'morning_quran', '/reading')
      markNotificationSent('morningQuran', todayDateStr)
    }

    // 4. Check Evening Quran Reminder
    if (config.eveningQuranReminderEnabled && currentHHMM === config.eveningQuranTime && !isNotificationSent('eveningQuran', todayDateStr)) {
      const evening = getEveningQuranReminderContent(isTamil)
      sendNativeNotification(evening.title, evening.body, 'evening_quran', '/reading')
      markNotificationSent('eveningQuran', todayDateStr)
    }
  }

  // Initial check on mount
  checkAndDispatch()

  // Run every 30 seconds
  schedulerIntervalId = window.setInterval(checkAndDispatch, 30000)
}
