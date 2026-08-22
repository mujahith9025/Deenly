import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
  Check,
  User as UserIcon,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { useReadingStore } from '../store/useReadingStore'
import { syncService } from '../lib/syncService'
import { quranCache } from '../lib/quranCache'
import { QURAN_FONT_STYLES, getArabicFontFamily, getArabicFontMeta, type ArabicFontStyle } from '../lib/quranFonts'

type SettingCategory = 
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
  // Active selected tab (shared between desktop & mobile)
  const [selectedTab, setSelectedTab] = useState<SettingCategory>('theme')
  // Mobile drilldown open state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

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

  const storeFontSize = useReadingStore((state) => state.fontSize)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const setFontSize = useReadingStore((state) => state.setFontSize)
  const setFontStyle = useReadingStore((state) => state.setFontStyle)

  const deviceId = syncService.getDeviceId()

  const currentFontSize = user?.arabicFontSize || storeFontSize || 28
  const currentFontStyle: ArabicFontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const currentTranslation = user?.preferredTranslation || 'english'
  const currentGoal = user?.dailyGoalVerses || 10
  const prayerAlerts = user?.prayerNotifications !== false
  const readingAlerts = user?.readingReminders !== false

  const handleTranslationChange = (lang: 'english' | 'tamil') => {
    updateUserSettings({ preferredTranslation: lang })
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10)
    setFontSize(size)
    updateUserSettings({ arabicFontSize: size })
  }

  const handleFontStyleChange = (style: ArabicFontStyle) => {
    setFontStyle(style)
    updateUserSettings({ arabicFontStyle: style })
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
  // MODULAR SECTION RENDERERS
  // =========================================================================

  // 1. Theme Section
  const renderThemeSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">Theme & Appearance</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Choose your preferred visual mode for sacred recitation and day/night reading comfort.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Cosmic Dark */}
        <div
          onClick={() => setTheme('dark')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
            theme === 'dark'
              ? 'bg-primary/15 border-primary shadow-lg ring-1 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary">
              <Moon className="w-6 h-6" />
            </div>
            {theme === 'dark' && <Check className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <span className="text-base font-bold text-on-surface block">Cosmic Dark</span>
            <span className="text-xs text-on-surface-variant">Deep OLED night recitation mode</span>
          </div>
        </div>

        {/* Pristine Light */}
        <div
          onClick={() => setTheme('light')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
            theme === 'light'
              ? 'bg-primary/15 border-primary shadow-lg ring-1 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sun className="w-6 h-6" />
            </div>
            {theme === 'light' && <Check className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <span className="text-base font-bold text-on-surface block">Pristine Light</span>
            <span className="text-xs text-on-surface-variant">Clean and crisp daylight reading</span>
          </div>
        </div>

        {/* System Default */}
        <div
          onClick={() => setTheme('system')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
            theme === 'system'
              ? 'bg-primary/15 border-primary shadow-lg ring-1 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface-variant">
              <Laptop className="w-6 h-6" />
            </div>
            {theme === 'system' && <Check className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <span className="text-base font-bold text-on-surface block">System Default</span>
            <span className="text-xs text-on-surface-variant">Syncs automatically with your OS</span>
          </div>
        </div>
      </div>
    </div>
  )

  // 2. Translation Section
  const renderTranslationSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">Quran Translation</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Select your primary translation for Quran verses and authentic Hadiths.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* English */}
        <div
          onClick={() => handleTranslationChange('english')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex items-start justify-between ${
            currentTranslation === 'english'
              ? 'bg-primary/15 border-primary shadow-lg ring-1 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              EN
            </div>
            <div className="space-y-1">
              <span className="text-base font-bold text-on-surface block">English (Sahih International)</span>
              <span className="text-xs text-on-surface-variant block leading-relaxed">
                Standard contemporary English translation by Umm Muhammad. Highly acclaimed for accuracy.
              </span>
            </div>
          </div>
          {currentTranslation === 'english' && <Check className="w-5 h-5 text-primary shrink-0 ml-2" />}
        </div>

        {/* Tamil */}
        <div
          onClick={() => handleTranslationChange('tamil')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex items-start justify-between ${
            currentTranslation === 'tamil'
              ? 'bg-primary/15 border-primary shadow-lg ring-1 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              தமிழ்
            </div>
            <div className="space-y-1">
              <span className="text-base font-bold text-on-surface block">தமிழ் (அப்துல் ஹமீது பாகவி)</span>
              <span className="text-xs text-on-surface-variant block leading-relaxed">
                Classic authentic Tamil translation by Allama Baqavi / Jan Trust Foundation.
              </span>
            </div>
          </div>
          {currentTranslation === 'tamil' && <Check className="w-5 h-5 text-primary shrink-0 ml-2" />}
        </div>
      </div>
    </div>
  )

  // 3. Font Size & Arabic Font Styles Section
  const renderFontSection = () => {
    const activeMeta = getArabicFontMeta(currentFontStyle)
    const activeFontFamily = getArabicFontFamily(currentFontStyle)

    return (
      <div className="space-y-7 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">Arabic Typography & Styles</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Choose your preferred authentic Quran font style and adjust text sizing up to 54px.
          </p>
        </div>

        {/* 🌟 Live Bismillah & Ayah Preview Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/85 shadow-xl space-y-3 text-center transition-all duration-200">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider font-label-caps bg-primary/15 px-3 py-1 rounded-full border border-primary/30 inline-block">
              {activeMeta.name} • {currentFontSize}px
            </span>
          </div>

          <p
            className="text-on-surface text-center leading-[2.2] transition-all duration-200 pt-1"
            style={{ fontSize: `${currentFontSize}px`, fontFamily: activeFontFamily }}
            dir="rtl"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p
            className="text-on-surface text-center leading-[2.2] transition-all duration-200 opacity-90"
            style={{ fontSize: `${Math.max(16, currentFontSize - 6)}px`, fontFamily: activeFontFamily }}
            dir="rtl"
          >
            ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
          </p>
          <p className="text-xs text-on-surface-variant italic pt-1">
            "In the Name of Allah, the Most Compassionate, the Most Merciful • All praise is to Allah, Lord of all worlds"
          </p>
        </div>

        {/* 🌟 Official Arabic Quran Font Styles Picker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Official Quran Font Styles</span>
            </span>
            <span className="text-[11px] text-outline font-semibold">5 Authentic Traditions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {QURAN_FONT_STYLES.map((style) => {
              const isSelected = currentFontStyle === style.id

              return (
                <div
                  key={style.id}
                  onClick={() => handleFontStyleChange(style.id)}
                  className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-primary/15 border-primary shadow-lg ring-1 ring-primary/40'
                      : 'glass-card border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-primary block">
                        {style.name}
                      </span>
                      <span className="text-[10px] text-outline px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 inline-block font-semibold">
                        {style.region}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sample Text Rendered in that Exact Font */}
                  <div className="p-3 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 text-center">
                    <p
                      className="text-on-surface text-lg sm:text-xl text-center leading-relaxed"
                      style={{ fontFamily: style.fontFamily }}
                      dir="rtl"
                    >
                      {style.sampleText}
                    </p>
                  </div>

                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {style.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 🌟 Controls Card: Font Scaling (18px - 54px) */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-on-surface block">Font Scaling</span>
              <span className="text-xs text-on-surface-variant">Selected: <strong className="text-primary">{currentFontSize}px</strong></span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const size = Math.max(18, currentFontSize - 2)
                  setFontSize(size)
                  updateUserSettings({ arabicFontSize: size })
                }}
                className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold hover:border-primary transition cursor-pointer text-lg flex items-center justify-center"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  const size = Math.min(54, currentFontSize + 2)
                  setFontSize(size)
                  updateUserSettings({ arabicFontSize: size })
                }}
                className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold hover:border-primary transition cursor-pointer text-lg flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="18"
              max="54"
              step="2"
              value={currentFontSize}
              onChange={handleFontSizeChange}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-outline">
              <span>18px (Compact)</span>
              <span>28px (Standard)</span>
              <span>54px (Max / 54px)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider block">Quick Presets</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Compact', size: 22 },
                { label: 'Standard', size: 28 },
                { label: 'Large', size: 38 },
                { label: 'Max', size: 54 },
              ].map((p) => (
                <button
                  key={p.size}
                  type="button"
                  onClick={() => {
                    setFontSize(p.size)
                    updateUserSettings({ arabicFontSize: p.size })
                  }}
                  className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition cursor-pointer border text-center ${
                    currentFontSize === p.size
                      ? 'primary-gradient-btn text-white shadow-md'
                      : 'bg-surface-container/60 border-outline-variant/30 text-on-surface hover:border-primary/40'
                  }`}
                >
                  <span className="block">{p.size}px</span>
                  <span className="text-[10px] opacity-75 block font-normal">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. Daily Target Section
  const renderTargetSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">Daily Recitation Target</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Set a daily verse milestone to build consistency and keep your spiritual streak alive.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-outline-variant/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-outline uppercase tracking-wider block">Current Target</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-bold text-tertiary">{currentGoal}</span>
              <span className="text-sm font-semibold text-on-surface-variant">Ayahs / Day</span>
            </div>
            <p className="text-xs text-outline mt-1">~{currentGoal * 100} Estimated Hasanat points daily</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleGoalStep(-5)}
              className="w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold hover:border-primary transition cursor-pointer text-lg flex items-center justify-center"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleGoalStep(5)}
              className="w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold hover:border-primary transition cursor-pointer text-lg flex items-center justify-center"
            >
              +5
            </button>
          </div>
        </div>

        {/* Quick Goal Presets */}
        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
          <span className="text-xs font-bold text-outline uppercase tracking-wider block">Recommended Goals</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { val: 5, label: '5 Ayahs', sub: 'Light Habit' },
              { val: 10, label: '10 Ayahs', sub: 'Standard' },
              { val: 20, label: '20 Ayahs', sub: 'Dedicated' },
              { val: 50, label: '50 Ayahs', sub: '1/2 Juz Pace' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => handleGoalPreset(preset.val)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  currentGoal === preset.val
                    ? 'bg-tertiary-container/30 border-tertiary text-tertiary shadow-sm'
                    : 'bg-surface-container/60 border-outline-variant/30 text-on-surface hover:border-primary/40'
                }`}
              >
                <span className="text-sm font-bold block">{preset.label}</span>
                <span className="text-[10px] text-outline block">{preset.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // 5. Notifications Section
  const renderNotificationsSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">Notifications & Reminders</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Configure spiritual reminders to maintain your daily Quran habit and prayer awareness.
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
        {/* Daily Reading Reminder */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-base font-bold text-on-surface block">Daily Quran Recitation Alert</span>
            <span className="text-xs text-on-surface-variant block">
              Receive a gentle reminder notification at your preferred reading time
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleReadingReminders}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              readingAlerts ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                readingAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Prayer Time Notifications */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-base font-bold text-on-surface block">Prayer & Adhan Awareness</span>
            <span className="text-xs text-on-surface-variant block">
              Notifications when local prayer time arrives
            </span>
          </div>
          <button
            type="button"
            onClick={handleTogglePrayerNotifications}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              prayerAlerts ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                prayerAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )

  // 6. Sync Section
  const renderSyncSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">Cloud Sync & Storage</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Realtime cloud synchronization, local offline caching, and device telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sync Status Card */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-400' :
                syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' :
                'bg-rose-400'
              }`} />
              <span className="text-sm font-bold text-on-surface capitalize">
                {syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing Now...' : 'Offline'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={syncStatus === 'syncing'}
              className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-primary transition cursor-pointer disabled:opacity-50"
              title="Trigger Sync Now"
            >
              {syncStatus === 'syncing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-xs text-on-surface-variant space-y-1">
            <p>Last cloud backup: <strong className="text-on-surface">{formatLastSynced(lastSyncedAt)}</strong></p>
            <p>Pending offline records: <strong className="text-on-surface">{pendingOfflineCount}</strong></p>
          </div>
        </div>

        {/* Device ID Card */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2">
          <span className="text-xs font-bold text-outline uppercase tracking-wider block">Registered Device</span>
          <p className="font-mono text-xs text-on-surface bg-surface-container px-3 py-2 rounded-2xl border border-outline-variant/20 truncate">
            {deviceId}
          </p>
          <span className="text-[11px] text-on-surface-variant block">Unique hardware instance identifier for multi-device sync</span>
        </div>
      </div>

      {/* Clear Cache Card */}
      <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-sm font-bold text-on-surface block">Offline Quran Storage</span>
          <span className="text-xs text-on-surface-variant block">
            Clear locally stored audio recitations and IndexedDB Surah caches to free disk space
          </span>
        </div>
        <button
          type="button"
          onClick={handleClearOfflineCache}
          disabled={isClearingCache}
          className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isClearingCache ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : cacheClearedSuccess ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Trash2 className="w-4 h-4 text-rose-400" />
          )}
          <span>{cacheClearedSuccess ? 'Cache Cleared!' : 'Clear Cache'}</span>
        </button>
      </div>
    </div>
  )

  // 7. About Section
  const renderAboutSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">About Deenly</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Spiritual reflection platform, verified data sources, and open-source attributions.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-outline-variant/30 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl primary-gradient-btn flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            د
          </div>
          <div>
            <h3 className="text-lg font-bold font-h2 text-on-surface">Deenly (دينلي)</h3>
            <p className="text-xs text-primary font-semibold">Version 2.0.0 • Progressive Web Application</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Deenly is designed to make daily Quran recitation effortless and consistent. With precision Hasanat calculations (10 rewards per Arabic letter), multilingual translations (English & Tamil), audio recitations by Sheikh Mishary Rashid Alafasy, and offline PWA support.
        </p>

        <div className="space-y-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <p><strong>Arabic Quran Text:</strong> King Fahd Glorious Quran Printing Complex & Tanzil.net</p>
          <p><strong>English Translation:</strong> Sahih International (Umm Muhammad)</p>
          <p><strong>Tamil Translation:</strong> Abdul Hameed Baqavi / Jan Trust Foundation</p>
          <p><strong>Reciter Audio:</strong> Sheikh Mishary Rashid Alafasy</p>
        </div>
      </div>
    </div>
  )

  // Helper to render section by category
  const renderSection = (category: SettingCategory) => {
    switch (category) {
      case 'theme':
        return renderThemeSection()
      case 'translation':
        return renderTranslationSection()
      case 'font':
        return renderFontSection()
      case 'target':
        return renderTargetSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'sync':
        return renderSyncSection()
      case 'about':
        return renderAboutSection()
      default:
        return renderThemeSection()
    }
  }

  const activeFontMeta = getArabicFontMeta(currentFontStyle)

  // Array of categories for navigation
  const categories: Array<{ id: SettingCategory; label: string; icon: any; desc: string }> = [
    { id: 'theme', label: 'Theme & Appearance', icon: theme === 'dark' ? Moon : Sun, desc: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode` },
    { id: 'translation', label: 'Quran Translation', icon: Globe, desc: currentTranslation === 'tamil' ? 'தமிழ் (பாகவி)' : 'English (Sahih)' },
    { id: 'font', label: 'Arabic Typography & Styles', icon: Type, desc: `${activeFontMeta.name} • ${currentFontSize}px` },
    { id: 'target', label: 'Daily Verse Target', icon: Target, desc: `${currentGoal} Ayahs / Day` },
    { id: 'notifications', label: 'Notifications & Adhan', icon: Bell, desc: readingAlerts ? 'Alerts Active' : 'Disabled' },
    { id: 'sync', label: 'Cloud Sync & Storage', icon: Cloud, desc: syncStatus === 'synced' ? 'Synced' : 'Offline' },
    { id: 'about', label: 'About Deenly', icon: Info, desc: 'Version 2.0 • Data Sources' },
  ]

  return (
    <div className="w-full pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">App Settings</h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
          Customize your recitation theme, Arabic font styles, translations, and daily targets.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW: EITHER DIRECTORY LIST OR FOCUSED SUBPAGE                  */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-4">
        {isMobileDetailOpen ? (
          /* Mobile Sub-page with Back Button */
          <div className="space-y-6">
            <button
              onClick={() => setIsMobileDetailOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Settings</span>
            </button>

            {renderSection(selectedTab)}
          </div>
        ) : (
          /* Mobile Directory List */
          <div className="space-y-4">
            {/* Profile Shortcut Card */}
            <Link
              to="/profile"
              className="p-4 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition flex items-center justify-between shadow-sm group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-sm font-bold text-on-surface block truncate">
                    {user?.name || 'Muslim Seeker'}
                  </span>
                  <span className="text-xs text-outline flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">Manage Account</span>
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition shrink-0" />
            </Link>

            {/* Mobile Category List */}
            <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedTab(cat.id)
                      setIsMobileDetailOpen(true)
                    }}
                    className="p-4 hover:bg-surface-container/60 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-sm font-bold text-on-surface block truncate">
                          {cat.label}
                        </span>
                        <span className="text-xs text-outline truncate block">
                          {cat.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW: 2-COLUMN MASTER-DETAIL CONTROL CENTER                     */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4 sticky top-6">
          {/* Profile Shortcut Card */}
          <Link
            to="/profile"
            className="p-4 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition flex items-center justify-between shadow-sm group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-on-surface block truncate">
                  {user?.name || 'Muslim Seeker'}
                </span>
                <span className="text-xs text-outline flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">Manage Account</span>
                </span>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition shrink-0" />
          </Link>

          {/* Desktop Categories Menu */}
          <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedTab === cat.id

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedTab(cat.id)}
                  className={`p-4 transition cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-primary/15 border-l-4 border-l-primary'
                      : 'hover:bg-surface-container/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-surface-container-high border border-outline-variant/40 text-primary'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <span className={`text-sm font-bold block truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-outline truncate block">
                        {cat.desc}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4.5 h-4.5 shrink-0 transition ${
                    isSelected ? 'text-primary' : 'text-outline group-hover:text-primary'
                  }`} />
                </div>
              )
            })}
          </div>

          <p className="text-[11px] text-outline text-center pt-2">
            Deenly • Islamic Recitation Companion • v2.0
          </p>
        </div>

        {/* Right Column: Active Category Content */}
        <div className="lg:col-span-8 xl:col-span-8">
          <div className="p-6 xl:p-8 rounded-3xl glass-card border border-outline-variant/30 shadow-md min-h-[560px]">
            {renderSection(selectedTab)}
          </div>
        </div>

      </div>
    </div>
  )
}
