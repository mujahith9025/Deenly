import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Type, 
  User, 
  LogOut, 
  Target, 
  Globe, 
  Loader2, 
  RefreshCw, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  WifiOff, 
  Smartphone, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  LogIn,
  Info,
  BookOpen,
  Database
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/useAuthStore'
import { syncService } from '../lib/syncService'
import { quranCache } from '../lib/quranCache'

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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetStatsModal, setShowResetStatsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false)

  const { user, signOut } = useAuth()
  const syncStatus = useAuthStore((state) => state.syncStatus)
  const lastSyncedAt = useAuthStore((state) => state.lastSyncedAt)
  const pendingOfflineCount = useAuthStore((state) => state.pendingOfflineCount)
  const syncNow = useAuthStore((state) => state.syncNow)
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings)
  const resetUserStatsToZero = useAuthStore((state) => state.resetUserStatsToZero)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)

  const navigate = useNavigate()
  const deviceId = syncService.getDeviceId()

  const handleResetStats = async () => {
    setIsResetting(true)
    try {
      await resetUserStatsToZero()
      setShowResetStatsModal(false)
    } finally {
      setIsResetting(false)
    }
  }

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

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await deleteAccount()
      setShowDeleteModal(false)
      navigate('/signup', { replace: true })
    } finally {
      setIsDeletingAccount(false)
    }
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">App Settings</h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
          Customize your translation language, Quran typography, daily goals, sync, and account.
        </p>
      </div>

      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. DEFAULT QURAN TRANSLATION                                              */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-2">
              <Globe className="w-4 h-4 text-secondary" />
              <span>Default Quran Translation</span>
            </h2>
            <span className="text-xs text-outline">Synced across reader</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English Option */}
            <div
              onClick={() => handleTranslationChange('english')}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                currentTranslation === 'english'
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : 'bg-surface-container/50 border-outline-variant/30 hover:border-primary/40'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">English</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-outline font-medium">Default</span>
                </div>
                <p className="text-xs text-on-surface-variant">Sahih International (Umm Muhammad)</p>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                currentTranslation === 'english' ? 'border-primary bg-primary text-white' : 'border-outline'
              }`}>
                {currentTranslation === 'english' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* Tamil Option */}
            <div
              onClick={() => handleTranslationChange('tamil')}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                currentTranslation === 'tamil'
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : 'bg-surface-container/50 border-outline-variant/30 hover:border-primary/40'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">தமிழ் (Tamil)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-tertiary font-medium">Tamil Nadu</span>
                </div>
                <p className="text-xs text-on-surface-variant">Abdul Hameed Baqavi (அப்துல் ஹமீது பாகவி)</p>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                currentTranslation === 'tamil' ? 'border-primary bg-primary text-white' : 'border-outline'
              }`}>
                {currentTranslation === 'tamil' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. ARABIC TYPOGRAPHY SCALE & FONT SIZE                                    */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <span>Arabic Typography Scale</span>
            </h2>
            <span className="font-mono text-xs font-bold text-primary">{currentFontSize}px</span>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="20"
              max="44"
              step="2"
              value={currentFontSize}
              onChange={handleFontSizeChange}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-outline font-mono">
              <span>Small (20px)</span>
              <span>Standard (28px)</span>
              <span>Large (44px)</span>
            </div>
          </div>

          {/* Live Arabic Preview Box */}
          <div className="p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30 text-center space-y-1">
            <p className="text-[10px] text-outline uppercase tracking-wider font-label-caps">Live Preview</p>
            <p
              className="font-noto-serif text-primary-fixed-dim select-none transition-all duration-150 py-2"
              style={{ fontSize: `${currentFontSize}px` }}
              dir="rtl"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-xs text-on-surface-variant font-sans">
              {currentTranslation === 'tamil'
                ? 'அளவற்ற அருளாளனும், நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் திருப்பெயரால்'
                : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DAILY VERSE RECITATION TARGET                                          */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-2">
              <Target className="w-4 h-4 text-tertiary" />
              <span>Daily Verse Target</span>
            </h2>
            <span className="text-xs text-tertiary font-bold">{currentGoal} Verses / Day</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-xs font-semibold text-on-surface">Target verses per calendar day</p>
              <p className="text-[11px] text-on-surface-variant">
                Reciting at least this many verses completes your daily streak flame.
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGoalStep(-5)}
                disabled={currentGoal <= 5}
                className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface font-bold text-base hover:border-primary disabled:opacity-40 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-mono text-base font-bold text-on-surface w-12 text-center">
                {currentGoal}
              </span>
              <button
                type="button"
                onClick={() => handleGoalStep(5)}
                disabled={currentGoal >= 100}
                className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface font-bold text-base hover:border-primary disabled:opacity-40 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-outline font-label-caps uppercase mr-1">Presets:</span>
            {[5, 10, 15, 20, 30, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleGoalPreset(preset)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  currentGoal === preset
                    ? 'bg-tertiary-container text-on-tertiary-container shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
                }`}
              >
                {preset} ayahs
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. NOTIFICATIONS & REMINDERS                                              */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notifications & Reminders</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-on-surface">Daily Prayer Athan Reminders</p>
                  <p className="text-[11px] text-on-surface-variant">Notifications for the 5 daily prayers</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prayerAlerts}
                onChange={handleTogglePrayerNotifications}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-tertiary" />
                <div>
                  <p className="text-xs font-semibold text-on-surface">Daily Quran Streak Protection</p>
                  <p className="text-[11px] text-on-surface-variant">Evening reminders to safeguard your daily streak</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={readingAlerts}
                onChange={handleToggleReadingReminders}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MULTI-DEVICE REALTIME SYNC & CLOUD ACCOUNT                             */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-5 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Account & Cloud Sync</span>
            </h2>

            {/* Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border">
              {syncStatus === 'synced' && (
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Live Synced</span>
                </span>
              )}
              {syncStatus === 'syncing' && (
                <span className="flex items-center gap-1.5 text-secondary bg-secondary/10 border-secondary/30 px-2 py-0.5 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </span>
              )}
              {syncStatus === 'offline' && (
                <span className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border-amber-500/30 px-2 py-0.5 rounded-full">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline ({pendingOfflineCount} queued)</span>
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-error bg-error-container/30 border-error/30 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Sync Error</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/40 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-on-surface-variant" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{user?.name || 'Muslim Seeker'}</p>
                <p className="text-xs text-on-surface-variant">{user?.email || 'No email associated'}</p>
                
                {/* Linked Provider Badge */}
                <div className="flex items-center gap-2 mt-1">
                  {user?.authProvider === 'google' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Google Linked</span>
                    </span>
                  ) : user?.isGuest ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                      <span>Guest Sandbox</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                      <span>Email & Password</span>
                    </span>
                  )}
                  <span className="text-[10px] text-outline">UID: {user?.uid?.substring(0, 10) || 'usr_demo'}...</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {user?.isGuest && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-full primary-gradient-btn text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md hover:scale-105"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncStatus === 'syncing'}
                className="px-3.5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetStatsModal(true)}
                disabled={isResetting}
                className="px-3.5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                title="Reset stats to 0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Stats</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-2 rounded-full bg-error-container/20 hover:bg-error-container/40 border border-error/30 text-error text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Delete Account & Stats"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-outline">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-secondary" />
              <span>Device ID: <span className="font-mono text-secondary">{deviceId}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-primary" />
              <span>Last Synced: <span className="text-on-surface">{formatLastSynced(lastSyncedAt)}</span></span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. ABOUT DEENLY & AUTHENTIC SOURCES                                       */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-fixed-dim uppercase tracking-wider font-label-caps flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>About Deenly</span>
            </h2>
            <span className="text-xs font-mono text-outline">v1.2.0 Production</span>
          </div>

          <div className="space-y-3 text-xs text-on-surface-variant">
            <p className="leading-relaxed">
              <strong className="text-on-surface">Deenly</strong> is an authentic Quran companion designed to make daily recitation intuitive, rewarding, and consistent with Hadith-accurate Hasanat points and multi-device cloud synchronization.
            </p>

            {/* Hadith Banner */}
            <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Prophetic Reward (10 Hasanat per letter)</span>
              </div>
              <p className="italic text-on-surface leading-relaxed text-[11px]">
                “Whoever recites a letter from the Book of Allah will be credited with a good deed, and a good deed gets a ten-fold reward. I do not say that Alif-Lam-Mim is one letter, but Alif is a letter, Lam is a letter and Mim is a letter.”
              </p>
              <span className="text-[10px] text-outline block">— Jami` at-Tirmidhi 2910 (Graded Hasan Sahih)</span>
            </div>

            {/* Sources & Offline Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/20 space-y-1">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" /> Authentic Quran Editions
                </span>
                <p className="text-[11px] text-outline">
                  Arabic: Fawaz Ahmed Uthmani Academy (`ara-quranacademy`). English: Sahih International. Tamil: Abdul Hameed Baqavi. Audio: Mishary Rashid Alafasy.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-secondary" /> Offline Quran Cache
                  </span>
                  <p className="text-[11px] text-outline">
                    Recited chapters are stored locally for fast offline access.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearOfflineCache}
                  disabled={isClearingCache}
                  className="mt-2 text-[10px] text-secondary hover:underline self-start font-medium cursor-pointer"
                >
                  {isClearingCache ? 'Clearing...' : cacheClearedSuccess ? '✓ Cache Cleared' : 'Clear Offline Cache'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Stats Confirmation Warning Modal */}
      {showResetStatsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl glass-card border border-amber-500/40 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-h2 text-on-surface">Reset Reading Stats to Zero?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This will reset all your accumulated Hasanat points, verses read, reading duration, and daily streak history back to zero. Your account will remain active, but previous progress cannot be recovered.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetStatsModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-semibold text-on-surface hover:border-primary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetStats}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-full bg-amber-500 text-black font-bold text-xs shadow-lg hover:bg-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Yes, Reset to 0</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl glass-card border border-error/40 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-error-container/30 border border-error text-error mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-h2 text-on-surface">Delete Account & Stats?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This action is irreversible. All of your accumulated Hasanat points, verses read, daily streaks, bookmarks, and offline reading queues will be permanently deleted and anonymized.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-semibold text-on-surface hover:border-primary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 rounded-full bg-error text-white text-xs font-bold shadow-lg hover:bg-error/90 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Yes, Delete Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
