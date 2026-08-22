import React, { useState } from 'react'
import { 
  Bell, 
  Type, 
  Target, 
  Globe, 
  Loader2, 
  RefreshCw, 
  Cloud, 
  Trash2, 
  Info, 
  Moon, 
  Sun, 
  Laptop, 
  ChevronRight, 
  ArrowLeft, 
  Check 
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { syncService } from '../lib/syncService'
import { quranCache } from '../lib/quranCache'

type SettingSubPage = 
  | null 
  | 'theme' 
  | 'translation' 
  | 'font' 
  | 'target' 
  | 'notifications' 
  | 'sync' 
  | 'about'

function formatLastSynced(timestamp: string | null): string {
  if (!timestamp) return 'Never synced'
  const diffSecs = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (diffSecs < 10) return 'Just now'
  if (diffSecs < 60) return `${diffSecs} seconds ago`
  const mins = Math.floor(diffSecs / 60)
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  return `${hours} hour${hours > 1 ? 's' : ''} ago`
}

export const SettingsScreen: React.FC = () => {
  const [activeSubPage, setActiveSubPage] = useState<SettingSubPage>(null)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false)

  const { user } = useAuth()
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  const syncStatus = useAuthStore((state) => state.syncStatus)
  const lastSyncedAt = useAuthStore((state) => state.lastSyncedAt)
  const pendingOfflineCount = useAuthStore((state) => state.pendingOfflineCount)
  const syncNow = useAuthStore((state) => state.syncNow)
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings)

  const deviceId = syncService.getDeviceId()

  const currentFontSize = user?.arabicFontSize || 28
  const currentTranslation = user?.preferredTranslation || 'english'
  const currentGoal = user?.dailyGoalVerses || 10
  const prayerAlerts = user?.prayerNotifications !== false
  const readingAlerts = user?.readingReminders !== false

  const handleTranslationChange = (lang: 'english' | 'tamil') => {
    updateUserSettings({ preferredTranslation: lang })
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10)
    updateUserSettings({ arabicFontSize: size })
  }

  const handleGoalStep = (delta: number) => {
    const newGoal = Math.max(1, Math.min(100, currentGoal + delta))
    updateUserSettings({ dailyGoalVerses: newGoal })
  }

  const handleGoalPreset = (val: number) => {
    updateUserSettings({ dailyGoalVerses: val })
  }

  const handleTogglePrayerNotifications = () => {
    updateUserSettings({ prayerNotifications: !prayerAlerts })
  }

  const handleToggleReadingReminders = () => {
    updateUserSettings({ readingReminders: !readingAlerts })
  }

  const handleSyncNow = async () => {
    await syncNow()
  }

  const handleClearOfflineCache = async () => {
    setIsClearingCache(true)
    try {
      await quranCache.clearCache()
      setCacheClearedSuccess(true)
      setTimeout(() => setCacheClearedSuccess(false), 2500)
    } finally {
      setIsClearingCache(false)
    }
  }

  // =========================================================================
  // SUB-PAGE: 1. THEME & APPEARANCE
  // =========================================================================
  if (activeSubPage === 'theme') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">Theme & Appearance</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Choose your preferred color theme for reading and navigation.
          </p>
        </div>

        <div className="space-y-3">
          {/* Cosmic Dark */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                : 'glass-card border-outline-variant/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">Cosmic Dark</span>
                <span className="text-xs text-on-surface-variant">Deep OLED night recitation mode</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-5 h-5 text-primary" />}
          </div>

          {/* Pristine Light */}
          <div
            onClick={() => setTheme('light')}
            className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
              theme === 'light'
                ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                : 'glass-card border-outline-variant/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">Pristine Light</span>
                <span className="text-xs text-on-surface-variant">Clean and crisp daylight reading</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-5 h-5 text-primary" />}
          </div>

          {/* Device System Default */}
          <div
            onClick={() => setTheme('system')}
            className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
              theme === 'system'
                ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                : 'glass-card border-outline-variant/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shrink-0">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">System Default</span>
                <span className="text-xs text-on-surface-variant">Syncs automatically with your OS theme</span>
              </div>
            </div>
            {theme === 'system' && <Check className="w-5 h-5 text-primary" />}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE: 2. QURAN TRANSLATION
  // =========================================================================
  if (activeSubPage === 'translation') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">Quran Translation</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Select your preferred translation for Quran verses and Hadiths.
          </p>
        </div>

        <div className="space-y-3">
          {/* English */}
          <div
            onClick={() => handleTranslationChange('english')}
            className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
              currentTranslation === 'english'
                ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                : 'glass-card border-outline-variant/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                EN
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">English (Sahih International)</span>
                <span className="text-xs text-on-surface-variant">Standard clear contemporary English rendering</span>
              </div>
            </div>
            {currentTranslation === 'english' && <Check className="w-5 h-5 text-primary" />}
          </div>

          {/* Tamil */}
          <div
            onClick={() => handleTranslationChange('tamil')}
            className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
              currentTranslation === 'tamil'
                ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                : 'glass-card border-outline-variant/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                தமிழ்
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">தமிழ் (ஜான் டிரஸ்ட் / பாகவி)</span>
                <span className="text-xs text-on-surface-variant">அங்கீகரிக்கப்பட்ட நேரடி தமிழ் மொழிபெயர்ப்பு</span>
              </div>
            </div>
            {currentTranslation === 'tamil' && <Check className="w-5 h-5 text-primary" />}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE: 3. ARABIC FONT SIZE & TYPOGRAPHY
  // =========================================================================
  if (activeSubPage === 'font') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">Arabic Typography & Size</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Adjust the Arabic script size to match your eyesight and screen comfortably.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-6 shadow-md">
          {/* Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Font Size</span>
              <span className="text-sm font-mono font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                {currentFontSize}px
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="44"
              step="2"
              value={currentFontSize}
              onChange={handleFontSizeChange}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-outline">
              <span>20px (Compact)</span>
              <span>28px (Standard)</span>
              <span>44px (Large)</span>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-surface-container/70 border border-outline-variant/40 space-y-3 text-center">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider">Live Preview</span>
            <p
              className="font-noto-serif text-on-surface leading-loose"
              style={{ fontSize: `${currentFontSize}px` }}
              dir="rtl"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-xs text-on-surface-variant italic">
              "In the name of Allah, the Entirely Merciful, the Especially Merciful."
            </p>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE: 4. DAILY VERSE TARGET
  // =========================================================================
  if (activeSubPage === 'target') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">Daily Verse Target</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Set your daily Quran recitation commitment to build a consistent habit.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                {currentGoal} <span className="text-sm font-normal text-on-surface-variant">Ayahs / day</span>
              </span>
              <p className="text-xs text-outline mt-0.5">
                ≈ {Math.max(1, Math.round(currentGoal / 15))} pages per day
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGoalStep(-5)}
                className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold hover:border-primary transition cursor-pointer text-lg"
              >
                -
              </button>
              <button
                onClick={() => handleGoalStep(5)}
                className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold hover:border-primary transition cursor-pointer text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider block">Quick Presets</span>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  onClick={() => handleGoalPreset(val)}
                  className={`py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                    currentGoal === val
                      ? 'primary-gradient-btn text-white shadow-md'
                      : 'bg-surface-container/60 border-outline-variant/30 text-on-surface hover:border-primary/40'
                  }`}
                >
                  {val} Ayahs
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE: 5. NOTIFICATIONS & REMINDERS
  // =========================================================================
  if (activeSubPage === 'notifications') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">Notifications & Reminders</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Stay on track with daily Quran reading notifications and prayer alerts.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-5 shadow-md">
          {/* Daily Quran Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-on-surface block">Daily Quran Reminders</span>
              <span className="text-xs text-on-surface-variant">Gentle notification to fulfill your daily goal</span>
            </div>
            <button
              onClick={handleToggleReadingReminders}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                readingAlerts ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  readingAlerts ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-outline-variant/20" />

          {/* Prayer Time Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-on-surface block">Prayer Time Alerts</span>
              <span className="text-xs text-on-surface-variant">Notifications for Fajr, Dhuhr, Asr, Maghrib, and Isha</span>
            </div>
            <button
              onClick={handleTogglePrayerNotifications}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                prayerAlerts ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  prayerAlerts ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE: 6. CLOUD SYNC & OFFLINE STORAGE
  // =========================================================================
  if (activeSubPage === 'sync') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">Cloud Sync & Storage</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage your offline cache and device synchronization.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-5 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-on-surface block">Sync Status</span>
              <span className="text-xs text-on-surface-variant">Last synced: {formatLastSynced(lastSyncedAt)}</span>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={syncStatus === 'syncing'}
              className="px-4 py-2 rounded-full primary-gradient-btn text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          <div className="h-px bg-outline-variant/20" />

          {/* Clear Offline Cache */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-on-surface block">Quran Offline Cache</span>
              <span className="text-xs text-on-surface-variant">Clear cached Surahs and audio clips</span>
            </div>
            <button
              onClick={handleClearOfflineCache}
              disabled={isClearingCache}
              className="px-4 py-2 rounded-full bg-surface-container border border-outline-variant/30 hover:border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
            >
              {isClearingCache ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{cacheClearedSuccess ? 'Cache Cleared!' : 'Clear Cache'}</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 text-[11px] text-outline">
            <span>Device ID: <span className="font-mono text-on-surface">{deviceId}</span></span>
            {pendingOfflineCount > 0 && <span className="block mt-0.5 text-amber-400">({pendingOfflineCount} actions pending upload)</span>}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE: 7. INSTRUCTIONS & ABOUT DEENLY
  // =========================================================================
  if (activeSubPage === 'about') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold font-h1 text-on-surface">About Deenly</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Open-source Islamic companion app and recitation engine.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md text-xs text-on-surface-variant leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold">
              📖
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Deenly v2.0</p>
              <p className="text-[11px] text-outline">Holy Quran & Kutub al-Sittah Hadith Companion</p>
            </div>
          </div>

          <p>
            Deenly is designed to make daily Quran recitation effortless and consistent. With precision Hasanat calculations (10 rewards per Arabic letter), multilingual translations (English & Tamil), audio recitations by Sheikh Mishary Rashid Alafasy, and offline PWA support.
          </p>
          <p>
            All texts are sourced from verified public Islamic repositories and authentic open-source datasets.
          </p>
        </div>
      </div>
    )
  }

  // =========================================================================
  // MAIN SETTINGS MENU (DRILL-DOWN DIRECTORY)
  // =========================================================================
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">Settings</h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
          Select a category below to customize your app preferences.
        </p>
      </div>

      <div className="space-y-3">
        {/* 1. Theme & Appearance */}
        <div
          onClick={() => setActiveSubPage('theme')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">Theme & Appearance</span>
              <span className="text-xs text-outline capitalize">{theme} Mode</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>

        {/* 2. Quran Translation */}
        <div
          onClick={() => setActiveSubPage('translation')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">Quran Translation</span>
              <span className="text-xs text-outline">
                {currentTranslation === 'tamil' ? 'தமிழ் (பாகவி)' : 'English (Sahih International)'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>

        {/* 3. Arabic Font Size & Typography */}
        <div
          onClick={() => setActiveSubPage('font')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">Arabic Font Size & Script</span>
              <span className="text-xs text-outline">{currentFontSize}px Arabic Script</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>

        {/* 4. Daily Verse Target */}
        <div
          onClick={() => setActiveSubPage('target')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-tertiary shrink-0 group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">Daily Verse Target</span>
              <span className="text-xs text-outline">{currentGoal} Ayahs / Day</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>

        {/* 5. Notifications & Reminders */}
        <div
          onClick={() => setActiveSubPage('notifications')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">Notifications & Reminders</span>
              <span className="text-xs text-outline">
                {readingAlerts ? 'Reminders Active' : 'Disabled'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>

        {/* 6. Cloud Sync & Offline Storage */}
        <div
          onClick={() => setActiveSubPage('sync')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-secondary shrink-0 group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">Cloud Sync & Storage</span>
              <span className="text-xs text-outline">Device ID & Offline Quran Cache</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>

        {/* 7. About Deenly */}
        <div
          onClick={() => setActiveSubPage('about')}
          className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-outline shrink-0 group-hover:scale-105 transition-transform">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-on-surface block">About Deenly</span>
              <span className="text-xs text-outline">Version 2.0 • Instructions & Sources</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition" />
        </div>
      </div>
    </div>
  )
}
