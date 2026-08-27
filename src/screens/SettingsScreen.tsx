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
  Sparkles,
  Languages,
  BookOpen,
  Award,
  Volume2,
  Smartphone,
  Mic,
  Play,
  Pause
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { useReadingStore } from '../store/useReadingStore'
import { useQuranAudioStore } from '../store/useQuranAudioStore'
import { QARI_LIST, getQariById, type QariStyle } from '../lib/qariData'
import { syncService } from '../lib/syncService'
import { quranCache } from '../lib/quranCache'
import { QURAN_FONT_STYLES, getArabicFontFamily, getArabicFontMeta, type ArabicFontStyle } from '../lib/quranFonts'
import { 
  QURAN_TRANSLATIONS, 
  type EnglishTranslationKey, 
  type TamilTranslationKey,
  DEFAULT_ENGLISH_TRANSLATION,
  DEFAULT_TAMIL_TRANSLATION
} from '../lib/quranTranslations'
import { useI18nStore, type AppLanguage } from '../lib/i18n'
import { TAJWEED_RULES } from '../lib/tajweed'
import { TajweedArabicText } from '../components/TajweedArabicText'
import { MUSHAF_THEMES, type MushafThemeId } from '../lib/mushafThemes'
import { getArabicTransliteration } from '../lib/transliteration'

type SettingCategory = 
  | 'language'
  | 'theme' 
  | 'audio_qari'
  | 'translation' 
  | 'transliteration'
  | 'font' 
  | 'tajweed'
  | 'target' 
  | 'notifications' 
  | 'sync' 
  | 'about'

function formatLastSynced(timestamp: string | null, isTamil?: boolean): string {
  if (!timestamp) return isTamil ? 'ஒருபோதும் ஒத்திசைக்கப்படவில்லை' : 'Never synced'
  const diffSecs = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (diffSecs < 10) return isTamil ? 'இப்போதுதான்' : 'Just now'
  if (diffSecs < 60) return isTamil ? `${diffSecs} வினாடிகளுக்கு முன்` : `${diffSecs} seconds ago`
  const mins = Math.floor(diffSecs / 60)
  if (mins < 60) return isTamil ? `${mins} நிமிடங்களுக்கு முன்` : `${mins} min${mins > 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  return isTamil ? `${hours} மணி நேரத்திற்கு முன்` : `${hours} hour${hours > 1 ? 's' : ''} ago`
}

export const SettingsScreen: React.FC = () => {
  const t = useI18nStore((state) => state.t)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const setAppLanguage = useI18nStore((state) => state.setAppLanguage)

  // Active selected tab (shared between desktop & mobile)
  const [selectedTab, setSelectedTab] = useState<SettingCategory>('language')
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
  const storeEnglishTranslation = useReadingStore((state) => state.englishTranslation)
  const storeTamilTranslation = useReadingStore((state) => state.tamilTranslation)
  const isTajweedEnabled = useReadingStore((state) => state.isTajweedEnabled)
  const setIsTajweedEnabled = useReadingStore((state) => state.setIsTajweedEnabled)
  const storeMushafTheme = useReadingStore((state) => state.mushafTheme)
  const setMushafTheme = useReadingStore((state) => state.setMushafTheme)
  const setFontSize = useReadingStore((state) => state.setFontSize)
  const setFontStyle = useReadingStore((state) => state.setFontStyle)
  const setEnglishTranslation = useReadingStore((state) => state.setEnglishTranslation)
  const setTamilTranslation = useReadingStore((state) => state.setTamilTranslation)
  const setTranslationLanguage = useReadingStore((state) => state.setTranslationLanguage)
  const storeShowTransliteration = useReadingStore((state) => state.showTransliteration)
  const storeTransliterationLang = useReadingStore((state) => state.transliterationLanguage)
  const setShowTransliteration = useReadingStore((state) => state.setShowTransliteration)
  const setTransliterationLanguage = useReadingStore((state) => state.setTransliterationLanguage)

  const deviceId = syncService.getDeviceId()

  const currentFontSize = user?.arabicFontSize || storeFontSize || 28
  const currentFontStyle: ArabicFontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const currentMushafTheme: MushafThemeId = user?.mushafTheme || storeMushafTheme || 'cosmic'
  const currentTranslation = user?.preferredTranslation || 'english'
  const currentEnglishTranslation: EnglishTranslationKey = user?.englishTranslation || storeEnglishTranslation || DEFAULT_ENGLISH_TRANSLATION
  const currentTamilTranslation: TamilTranslationKey = user?.tamilTranslation || storeTamilTranslation || DEFAULT_TAMIL_TRANSLATION
  const showTransliteration = user?.showTransliteration !== undefined ? user.showTransliteration : storeShowTransliteration
  const transliterationLang = user?.transliterationLanguage || storeTransliterationLang || (appLanguage === 'ta' ? 'ta' : 'en')
  const currentGoal = user?.dailyGoalVerses || 10
  const prayerAlerts = user?.prayerNotifications !== false
  const readingAlerts = user?.readingReminders !== false

  // 🎙️ Qari Audio Store Hooks
  const selectedQariId = useQuranAudioStore((state) => state.selectedQariId)
  const setQari = useQuranAudioStore((state) => state.setQari)
  const playbackRate = useQuranAudioStore((state) => state.playbackRate)
  const setPlaybackRate = useQuranAudioStore((state) => state.setPlaybackRate)
  const hifzRepeatCount = useQuranAudioStore((state) => state.hifzRepeatCount)
  const setHifzRepeatCount = useQuranAudioStore((state) => state.setHifzRepeatCount)

  const [settingsQariFilter, setSettingsQariFilter] = useState<'all' | QariStyle>('all')
  const [settingsPreviewQariId, setSettingsPreviewQariId] = useState<string | null>(null)
  const settingsPreviewAudioRef = React.useRef<HTMLAudioElement | null>(null)

  const handleAppLanguageChange = (lang: AppLanguage) => {
    setAppLanguage(lang)
    if (lang === 'ta') {
      setTranslationLanguage('ta')
      updateUserSettings({ appLanguage: lang, preferredTranslation: 'tamil' })
    } else {
      updateUserSettings({ appLanguage: lang })
    }
  }

  const handleTranslationChange = (lang: 'english' | 'tamil') => {
    updateUserSettings({ preferredTranslation: lang })
  }

  const handleEnglishTranslationChange = (key: EnglishTranslationKey) => {
    setEnglishTranslation(key)
    updateUserSettings({ englishTranslation: key })
  }

  const handleTamilTranslationChange = (key: TamilTranslationKey) => {
    setTamilTranslation(key)
    updateUserSettings({ tamilTranslation: key })
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

  // 0. App Language Section
  const renderLanguageSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
          {t('appLanguage')}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {t('appLanguageDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* English */}
        <div
          onClick={() => handleAppLanguageChange('en')}
          className={`p-5 sm:p-6 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
            appLanguage === 'en'
              ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-base shrink-0">
              EN
            </div>
            {appLanguage === 'en' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <div>
            <span className="text-base font-bold text-on-surface block">English (ஆங்கிலம்)</span>
            <span className="text-xs text-on-surface-variant block leading-relaxed mt-0.5">
              {t('languageEnglishSub')}
            </span>
          </div>
        </div>

        {/* Tamil */}
        <div
          onClick={() => handleAppLanguageChange('ta')}
          className={`p-5 sm:p-6 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
            appLanguage === 'ta'
              ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
              : 'glass-card border-outline-variant/30 hover:border-primary/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              தமிழ்
            </div>
            {appLanguage === 'ta' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <div>
            <span className="text-base font-bold text-on-surface block">தமிழ் (Tamil)</span>
            <span className="text-xs text-on-surface-variant block leading-relaxed mt-0.5">
              {t('languageTamilSub')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // 1. Theme Section
  const renderThemeSection = () => {
    const activeThemeMeta = MUSHAF_THEMES[currentMushafTheme] || MUSHAF_THEMES.cosmic
    const themeList = Object.values(MUSHAF_THEMES)

    return (
      <div className="space-y-8 animate-fade-in">
        {/* App Global Mode */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">{t('themeAppearance')}</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              {t('themeAppearanceDesc')}
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
                <span className="text-base font-bold text-on-surface block">{t('darkTheme')}</span>
                <span className="text-xs text-on-surface-variant">{t('darkThemeSub')}</span>
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
                <span className="text-base font-bold text-on-surface block">{t('lightTheme')}</span>
                <span className="text-xs text-on-surface-variant">{t('lightThemeSub')}</span>
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
                <span className="text-base font-bold text-on-surface block">{t('systemTheme')}</span>
                <span className="text-xs text-on-surface-variant">{t('systemThemeSub')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 2. Dedicated Mushaf Eye-Comfort Themes Section */}
        <div className="space-y-4 pt-6 border-t border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h3 className="text-lg sm:text-xl font-bold text-on-surface font-h1">
                {appLanguage === 'ta' ? 'முஸ்ஹஃப் கண்-சௌகரிய தீம்கள்' : 'Mushaf Eye-Comfort Reading Themes'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              {appLanguage === 'ta'
                ? 'ஓதும் திரையில் கண்களின் சோர்வைத் தவிர்க்கவும், பேட்டரியைச் சேமிக்கவும் பிரத்யேக வண்ணத் தட்டுகள்.'
                : 'Custom-calibrated reading palettes engineered for zero eye fatigue and AMOLED battery efficiency.'}
            </p>
          </div>

          {/* Theme Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {themeList.map((tItem) => {
              const isSelected = currentMushafTheme === tItem.id

              return (
                <div
                  key={tItem.id}
                  onClick={() => {
                    setMushafTheme(tItem.id)
                    updateUserSettings({ mushafTheme: tItem.id })
                  }}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 shadow-xl bg-surface-container-high/80'
                      : 'glass-card border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border"
                      style={{
                        backgroundColor: tItem.previewColors.bg,
                        borderColor: tItem.previewColors.border,
                      }}
                    >
                      <span>{tItem.icon}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Swatch dots */}
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border"
                        style={{
                          backgroundColor: tItem.previewColors.bg,
                          borderColor: tItem.previewColors.border,
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tItem.previewColors.card }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tItem.previewColors.accent }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tItem.previewColors.text }}
                        />
                      </div>

                      {isSelected && <Check className="w-5 h-5 text-primary ml-1" />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-on-surface">
                        {appLanguage === 'ta' ? tItem.nameTa : tItem.nameEn}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: tItem.previewColors.card,
                          color: tItem.previewColors.accent,
                          borderColor: tItem.previewColors.border,
                        }}
                      >
                        {appLanguage === 'ta' ? tItem.badgeTa : tItem.badgeEn}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                      {appLanguage === 'ta' ? tItem.descTa : tItem.descEn}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Interactive Preview Box */}
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-3">
            <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps block">
              {appLanguage === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட தீம் நேரடி முன்னோட்டம்' : 'Active Mushaf Theme Live Preview'}
            </span>

            <div
              className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${activeThemeMeta.classes.container}`}
              style={{ minHeight: '140px' }}
            >
              <div className={`p-5 rounded-2xl text-center space-y-2 ${activeThemeMeta.classes.card}`}>
                <p
                  className={`text-xl sm:text-2xl leading-[2.4] font-medium ${activeThemeMeta.classes.textArabic}`}
                  style={{ fontFamily: getArabicFontFamily(currentFontStyle) }}
                  dir="rtl"
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿١﴾
                </p>
                <p className={`text-xs sm:text-sm font-sans ${activeThemeMeta.classes.textTranslation}`}>
                  {appLanguage === 'ta'
                    ? 'அளவற்ற அருளாளனும், நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் பெயரால்...'
                    : 'In the Name of Allah, the Most Gracious, the Most Merciful.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 1.5 Qari Voice & Audio Engine Section
  const renderAudioQariSection = () => {
    const activeQari = getQariById(selectedQariId)
    const filteredQaris = QARI_LIST.filter(
      (q) => settingsQariFilter === 'all' || q.style === settingsQariFilter
    )

    const handlePreviewAudio = (qariId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (settingsPreviewQariId === qariId) {
        if (settingsPreviewAudioRef.current) {
          settingsPreviewAudioRef.current.pause()
          setSettingsPreviewQariId(null)
        }
        return
      }

      const q = getQariById(qariId)
      if (settingsPreviewAudioRef.current) {
        settingsPreviewAudioRef.current.pause()
      }
      const sampleUrl = `https://everyayah.com/data/${q.folderName}/001001.mp3`
      const audio = new Audio(sampleUrl)
      settingsPreviewAudioRef.current = audio
      setSettingsPreviewQariId(qariId)

      audio.play().catch(console.warn)
      audio.onended = () => setSettingsPreviewQariId(null)
      audio.onerror = () => setSettingsPreviewQariId(null)
    }

    return (
      <div className="space-y-7 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
            {appLanguage === 'ta' ? 'காரீ ஓதுபவர் & ஆடியோ இன்ஜின்' : 'Quran Reciter & Audio Engine'}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {appLanguage === 'ta'
              ? '13 அங்கீகரிக்கப்பட்ட உலகப் புகழ்பெற்ற காரீக்கள், ஓதும் வேகம் மற்றும் மனன சுழற்சி அமைப்புகள்.'
              : 'Choose your default authentic Qari, adjust playback speed (0.75x–2.0x), and set Hifz repeat loops.'}
          </p>
        </div>

        {/* 🌟 Active Qari Spotlight Card */}
        <div className="p-6 sm:p-7 rounded-3xl glass-card border border-primary/40 bg-surface-container-low/90 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-primary/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
                <span>{activeQari.flag}</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">
                    {appLanguage === 'ta' ? activeQari.nameTa : activeQari.nameEn}
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    {appLanguage === 'ta' ? activeQari.badgeTa : activeQari.badgeEn}
                  </span>
                </div>
                <p className="text-xs text-primary font-semibold">
                  {appLanguage === 'ta' ? activeQari.styleLabelTa : activeQari.styleLabelEn} • {activeQari.bitrate}
                </p>
                <p className="text-[11px] text-outline font-arabic" dir="rtl">{activeQari.nameAr}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => handlePreviewAudio(activeQari.id, e)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start sm:self-center shrink-0 ${
                settingsPreviewQariId === activeQari.id
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                  : 'primary-gradient-btn text-white shadow-md hover:scale-105'
              }`}
            >
              {settingsPreviewQariId === activeQari.id ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{appLanguage === 'ta' ? 'ஒலிக்கிறது...' : 'Playing Sample...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{appLanguage === 'ta' ? 'மாதிரி கேட்க' : 'Play Sample Audio'}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed pt-1 border-t border-outline-variant/20">
            {appLanguage === 'ta' ? activeQari.descriptionTa : activeQari.descriptionEn}
          </p>
        </div>

        {/* 🌟 13 World-Renowned Qaris Grid */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-primary" />
              <span>{appLanguage === 'ta' ? 'அனைத்து காரீக்கள்' : 'All World-Renowned Reciters'}</span>
            </span>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'all', label: appLanguage === 'ta' ? 'அனைத்தும் (13)' : 'All (13)' },
                { id: 'murattal', label: appLanguage === 'ta' ? 'முரத்தல்' : 'Murattal' },
                { id: 'haramain', label: appLanguage === 'ta' ? 'ஹரமைன்' : 'Makkah Imams' },
                { id: 'mujawwad', label: appLanguage === 'ta' ? 'முஜவ்வத்' : 'Mujawwad' },
                { id: 'teaching', label: appLanguage === 'ta' ? 'கற்றல்' : 'Teaching' },
                { id: 'emotional', label: appLanguage === 'ta' ? 'உணர்வு' : 'Emotional' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSettingsQariFilter(chip.id as any)}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition cursor-pointer border ${
                    settingsQariFilter === chip.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-container/70 border-outline-variant/30 text-outline hover:text-on-surface hover:border-primary/40'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredQaris.map((q) => {
              const isSelected = selectedQariId === q.id
              const isPreviewing = settingsPreviewQariId === q.id

              return (
                <div
                  key={q.id}
                  onClick={() => setQari(q.id)}
                  className={`p-4 sm:p-5 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
                      : 'glass-card border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                          <span>{q.flag}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-on-surface block">
                              {appLanguage === 'ta' ? q.nameTa : q.nameEn}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {appLanguage === 'ta' ? q.badgeTa : q.badgeEn}
                            </span>
                          </div>
                          <span className="text-xs text-outline font-medium block">
                            {q.country} • {q.bitrate}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {appLanguage === 'ta' ? q.descriptionTa : q.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="font-arabic text-xs text-outline" dir="rtl">{q.nameAr}</span>

                    <button
                      type="button"
                      onClick={(e) => handlePreviewAudio(q.id, e)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        isPreviewing
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                          : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface hover:border-primary/40'
                      }`}
                    >
                      {isPreviewing ? (
                        <>
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Previewing</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 🌟 Audio Controls: Playback Speed & Hifz Loop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Playback Speed Card */}
          <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps block">
                {appLanguage === 'ta' ? 'ஓதும் வேகம்' : 'Default Playback Speed'}
              </span>
              <span className="text-xs font-mono font-bold text-primary">{playbackRate}x</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackRate(spd)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer border text-center ${
                    playbackRate === spd
                      ? 'primary-gradient-btn text-white shadow-sm'
                      : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface hover:border-primary/40'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Hifz Repeat Preset Card */}
          <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps block">
                {appLanguage === 'ta' ? 'மனன சுழற்சி (Hifz Repeat)' : 'Hifz Memorization Repeats'}
              </span>
              <span className="text-xs font-bold text-primary">
                {hifzRepeatCount === Infinity ? '∞ Loop' : hifzRepeatCount === 1 ? '1x (Off)' : `${hifzRepeatCount}x`}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { val: 1, label: '1x' },
                { val: 3, label: '3x' },
                { val: 5, label: '5x' },
                { val: 10, label: '10x' },
                { val: Infinity, label: '∞' },
              ].map((rpt) => (
                <button
                  key={rpt.label}
                  type="button"
                  onClick={() => setHifzRepeatCount(rpt.val)}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border text-center ${
                    hifzRepeatCount === rpt.val
                      ? 'primary-gradient-btn text-white shadow-sm'
                      : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface hover:border-primary/40'
                  }`}
                >
                  {rpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Translation Section
  const renderTranslationSection = () => {
    const englishTranslations = QURAN_TRANSLATIONS.filter((t) => t.language === 'en')
    const tamilTranslations = QURAN_TRANSLATIONS.filter((t) => t.language === 'ta')

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">{t('quranTranslations')}</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {appLanguage === 'ta' 
              ? 'அங்கீகரிக்கப்பட்ட தமிழ் மொழிபெயர்ப்புப் பதிப்பை தேர்வு செய்யவும்.'
              : 'Choose your preferred authentic scholarly translations for English and Tamil. Changes save automatically.'}
          </p>
        </div>

        {/* 🌟 Primary Active Language Switcher (Only visible when App Language is English) */}
        {appLanguage === 'en' && (
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-md space-y-3">
            <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps block">
              Active Display Language
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* English */}
              <div
                onClick={() => handleTranslationChange('english')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  currentTranslation === 'english'
                    ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                    : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    EN
                  </div>
                  <div>
                    <span className="text-sm font-bold text-on-surface block">English Translations</span>
                    <span className="text-[11px] text-on-surface-variant">Default view in English</span>
                  </div>
                </div>
                {currentTranslation === 'english' && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
              </div>

              {/* Tamil */}
              <div
                onClick={() => handleTranslationChange('tamil')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  currentTranslation === 'tamil'
                    ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/40'
                    : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    தமிழ்
                  </div>
                  <div>
                    <span className="text-sm font-bold text-on-surface block">தமிழ் மொழிபெயர்ப்புகள்</span>
                    <span className="text-[11px] text-on-surface-variant">Default view in Tamil</span>
                  </div>
                </div>
                {currentTranslation === 'tamil' && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
              </div>
            </div>
          </div>
        )}

        {/* 🌟 English Translations List (Hidden when app language is Tamil) */}
        {appLanguage === 'en' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Official English Translations</span>
              </span>
              <span className="text-[11px] text-outline font-semibold">4 Recognized Editions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {englishTranslations.map((trans) => {
                const isSelected = currentEnglishTranslation === trans.id

                return (
                  <div
                    key={trans.id}
                    onClick={() => handleEnglishTranslationChange(trans.id as EnglishTranslationKey)}
                    className={`p-5 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
                        : 'glass-card border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-on-surface block">
                              {trans.name}
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                              {trans.badge}
                            </span>
                          </div>
                          <span className="text-xs text-outline font-medium block mt-0.5">
                            {trans.author}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {trans.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-outline">
                      <span className="truncate">{trans.publisher}</span>
                      {isSelected && <span className="text-primary font-bold">{t('activeEnglish')}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 🌟 Tamil Translations List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>அதிகாரப்பூர்வ தமிழ் மொழிபெயர்ப்புகள்</span>
            </span>
            <span className="text-[11px] text-outline font-semibold">2 அங்கீகரிக்கப்பட்ட பதிப்புகள்</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tamilTranslations.map((trans) => {
              const isSelected = currentTamilTranslation === trans.id

              return (
                <div
                  key={trans.id}
                  onClick={() => handleTamilTranslationChange(trans.id as TamilTranslationKey)}
                  className={`p-5 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
                      : 'glass-card border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-on-surface block">
                            {trans.name}
                          </span>
                          <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                            {trans.badge}
                          </span>
                        </div>
                        <span className="text-xs text-outline font-medium block mt-0.5">
                          {trans.author}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {trans.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-outline">
                    <span className="truncate">{trans.publisher}</span>
                    {isSelected && <span className="text-primary font-bold">Active Tamil</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // 2.5 Phonetic Transliteration (English & Tamil) Section
  const renderTransliterationSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
          {appLanguage === 'ta' ? 'குர்ஆன் ஒலிபெயர்ப்பு (Phonetic Transliteration)' : 'Phonetic Transliteration'}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {appLanguage === 'ta' 
            ? 'அரபு வசனங்களுக்குக் கீழே ஆங்கிலம் அல்லது தமிழ் மொழியில் துல்லியமான உச்சரிப்பு வழிகாட்டியை இயக்குங்கள்.'
            : 'Display pronunciation assistance beneath Quran verses in English (Latin) or pure Tamil (தமிழ் ஒலிபெயர்ப்பு).'}
        </p>
      </div>

      {/* Main Master Toggle Card */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{appLanguage === 'ta' ? 'ஒலிபெயர்ப்பைக் காட்டு' : 'Show Phonetic Transliteration'}</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {appLanguage === 'ta' 
                ? 'ஓதும் திரையில் ஒவ்வொரு வசனத்தின் கீழும் உச்சரிப்பு வரிகளை இயக்கு அல்லது மறை.'
                : 'Display pronunciation assistance line directly beneath each Ayah on the Quran Reading Screen.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextVal = !showTransliteration
              setShowTransliteration(nextVal)
              updateUserSettings({ showTransliteration: nextVal })
            }}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              showTransliteration ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                showTransliteration ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Language Selection Grid (English vs Tamil) */}
      {showTransliteration && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              <span>{appLanguage === 'ta' ? 'ஒலிபெயர்ப்பு மொழி தேர்வு' : 'Transliteration Script & Language'}</span>
            </span>
            <span className="text-[11px] text-outline font-semibold">2 Authentic Formats</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English (Latin) */}
            <div
              onClick={() => {
                setTransliterationLanguage('en')
                updateUserSettings({ transliterationLanguage: 'en' })
              }}
              className={`p-5 sm:p-6 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                transliterationLang === 'en'
                  ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
                  : 'glass-card border-outline-variant/30 hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-base shrink-0">
                  EN
                </div>
                {transliterationLang === 'en' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">
                  {appLanguage === 'ta' ? 'ஆங்கில ஒலிபெயர்ப்பு (English Latin)' : 'English Phonetic (Latin)'}
                </span>
                <span className="text-xs text-on-surface-variant block mt-1">
                  International standard transliteration using Latin letters with macrons.
                </span>
                <span className="text-xs font-mono text-secondary font-semibold block mt-2 p-2 rounded-xl bg-surface-container/60 border border-outline-variant/20">
                  "Bismillāhir-Raḥmānir-Raḥīm"
                </span>
              </div>
            </div>

            {/* Tamil */}
            <div
              onClick={() => {
                setTransliterationLanguage('ta')
                updateUserSettings({ transliterationLanguage: 'ta' })
              }}
              className={`p-5 sm:p-6 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                transliterationLang === 'ta'
                  ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
                  : 'glass-card border-outline-variant/30 hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  தமிழ்
                </div>
                {transliterationLang === 'ta' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-base font-bold text-on-surface block">
                  {appLanguage === 'ta' ? 'தமிழ் ஒலிபெயர்ப்பு (Tamil Phonetic)' : 'Tamil Phonetic (தமிழ்)'}
                </span>
                <span className="text-xs text-on-surface-variant block mt-1">
                  அரபு எழுத்துக்களின் தஜ்வீத் முறைப்படியான தூய தமிழ் ஒலிபெயர்ப்பு உச்சரிப்பு.
                </span>
                <span className="text-xs font-mono text-secondary font-semibold block mt-2 p-2 rounded-xl bg-surface-container/60 border border-outline-variant/20">
                  "பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்"
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-primary/30 shadow-md space-y-3 bg-surface-container-low/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps">
                {appLanguage === 'ta' ? 'நேரடி முன்னோட்டம் (அல்-ஃபாத்திஹா 1:1)' : 'Live Reading Preview (Al-Fatihah 1:1)'}
              </span>
              <span className="text-[11px] text-primary font-bold">
                {transliterationLang === 'ta' ? 'தமிழ் ஒலிபெயர்ப்பு செயலில் உள்ளது' : 'English Phonetic Active'}
              </span>
            </div>

            {/* Arabic Script */}
            <div
              className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 text-center select-none"
              dir="rtl"
              style={{ fontFamily: getArabicFontFamily(currentFontStyle) }}
            >
              <p className="text-2xl sm:text-3xl font-bold text-on-surface leading-loose">
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ﴿١﴾
              </p>
            </div>

            {/* Transliteration Preview */}
            <div className="p-3.5 rounded-2xl bg-surface-container/80 border border-outline-variant/20 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-outline font-label-caps block">
                {transliterationLang === 'ta' ? 'தமிழ் உச்சரிப்பு வடிவம்' : 'Pronunciation Preview'}
              </span>
              <p className="text-sm font-bold text-secondary italic">
                {getArabicTransliteration('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ', 1, 1, transliterationLang)}
              </p>
            </div>
          </div>
        </div>
      )}
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

  // Tajweed Color Rules Section
  const renderTajweedSection = () => {
    const distinctRules = [
      TAJWEED_RULES.m,
      TAJWEED_RULES.o,
      TAJWEED_RULES.p,
      TAJWEED_RULES.n,
      TAJWEED_RULES.g,
      TAJWEED_RULES.q,
      TAJWEED_RULES.f,
      TAJWEED_RULES.w,
      TAJWEED_RULES.a,
      TAJWEED_RULES.b,
      TAJWEED_RULES.h,
    ]

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
            {appLanguage === 'ta' ? 'தஜ்வீத் வண்ண விதிகள்' : 'Tajweed Color Rules'}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {appLanguage === 'ta'
              ? 'குர்ஆனை சரியான உச்சரிப்பு மற்றும் நீட்டல் விதிகளுடன் ஓத வண்ணக் குறியீடுகளைப் பயன்படுத்தவும்.'
              : 'Scholarly color-coding system to help you recite the Holy Quran with precise phonetic and prolongation rules.'}
          </p>
        </div>

        {/* Global Master Toggle Card */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-base font-bold text-on-surface block">
                {appLanguage === 'ta' ? 'தஜ்வீத் வண்ணக் குறியீடுகளை இயக்கு' : 'Enable Tajweed Color Codes'}
              </span>
              <p className="text-xs text-on-surface-variant">
                {appLanguage === 'ta'
                  ? 'இயக்கப்பட்டால், ஓதும் திரையிலும் குர்ஆன் ஆய்வுக் கூடத்திலும் அரபு எழுத்துகள் தஜ்வீத் விதிகளுக்கு ஏற்ப வண்ணமயமாகக் காட்டும்.'
                  : 'Highlights Madd, Ghunnah, Qalqalah, Ikhfa, Idgham, and Iqlab in distinct colors across all 114 Surahs.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !isTajweedEnabled
                setIsTajweedEnabled(nextVal)
                updateUserSettings({ tajweedRulesEnabled: nextVal })
              }}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                isTajweedEnabled ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  isTajweedEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Interactive Tajweed Preview */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-primary/30 shadow-md space-y-3 bg-surface-container-low/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-outline uppercase tracking-wider font-label-caps block">
              {appLanguage === 'ta' ? 'நேரடி முன்னோட்டம் (அல்-ஃபாத்திஹா)' : 'Live Interactive Preview (Al-Fatihah)'}
            </span>
            <span className="text-[11px] text-primary font-bold">
              {isTajweedEnabled ? (appLanguage === 'ta' ? 'வண்ணங்கள் செயலில் உள்ளன' : 'Colors Active') : (appLanguage === 'ta' ? 'இயல்பு நிலை' : 'Plain Text')}
            </span>
          </div>

          <div
            className="p-4 sm:p-6 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 text-center select-none"
            dir="rtl"
            style={{ fontFamily: getArabicFontFamily(currentFontStyle) }}
          >
            <p className="text-xl sm:text-2xl md:text-3xl leading-[2.5] font-medium text-on-surface">
              <TajweedArabicText
                rawTajweedText="بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ ﴿١﴾ [h:4[ٱ]لْحَمْدُ لِلَّهِ رَبِّ [h:5[ٱ]لْعَ[n[ـٰ]لَم[p[ِي]نَ ﴿٢﴾"
                fallbackText="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿١﴾ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ﴿٢﴾"
                isEnabled={isTajweedEnabled}
              />
            </p>
          </div>
          <p className="text-[11px] text-outline text-center">
            {appLanguage === 'ta' ? '💡 தஜ்வீத் விதியை அறிய வண்ண எழுத்தைத் தொடவும்' : '💡 Tap any colored word above to view its specific Tajweed rule & meaning'}
          </p>
        </div>

        {/* Tajweed Rules Comprehensive Legend Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps">
            {appLanguage === 'ta' ? 'தஜ்வீத் விதிகள் வழிகாட்டி & வண்ணங்கள்' : 'Color Rules & Phonetic Guide'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {distinctRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card border border-outline-variant/30 hover:border-outline-variant/60 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: rule.hexColor }}
                      />
                      <h4 className="text-xs sm:text-sm font-bold text-on-surface">
                        {appLanguage === 'ta' ? rule.nameTa : rule.nameEn}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {appLanguage === 'ta' ? rule.descriptionTa : rule.descriptionEn}
                  </p>
                </div>

                <div
                  className="self-end px-3 py-1 rounded-xl border border-outline-variant/30 bg-surface-container-low mt-2 text-right"
                  style={{ fontFamily: getArabicFontFamily(currentFontStyle) }}
                  dir="rtl"
                >
                  <span className="text-base font-bold" style={{ color: rule.hexColor }}>
                    {rule.example}
                  </span>
                </div>
              </div>
            ))}
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
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
          {appLanguage === 'ta' ? 'அறிவிப்புகள் & நினைவூட்டல்கள்' : 'Notifications & Reminders'}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {appLanguage === 'ta' 
            ? 'தினசரி குர்ஆன் ஓதும் பழக்கத்தையும் தொழுகை நேர விழிப்புணர்வையும் பேண நினைவூட்டல்களை அமைக்கவும்.' 
            : 'Configure spiritual reminders to maintain your daily Quran habit and prayer awareness.'}
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
        {/* Daily Reading Reminder */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-base font-bold text-on-surface block">
              {appLanguage === 'ta' ? 'தினசரி குர்ஆன் ஓதும் நினைவூட்டல்' : 'Daily Quran Recitation Alert'}
            </span>
            <span className="text-xs text-on-surface-variant block">
              {appLanguage === 'ta' 
                ? 'உங்கள் விருப்பமான வாசிப்பு நேரத்தில் மென்மையான நினைவூட்டல் அறிவிப்பைப் பெறுங்கள்' 
                : 'Receive a gentle reminder notification at your preferred reading time'}
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
            <span className="text-base font-bold text-on-surface block">
              {appLanguage === 'ta' ? 'தொழுகை நேர & பாங்கு எச்சரிக்கை' : 'Prayer & Adhan Awareness'}
            </span>
            <span className="text-xs text-on-surface-variant block">
              {appLanguage === 'ta' 
                ? 'உள்ளூர் தொழுகை நேரம் வரும்போது உடனடி அறிவிப்பைப் பெறுங்கள்' 
                : 'Notifications when local prayer time arrives'}
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
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
          {appLanguage === 'ta' ? 'கிளவுட் ஒத்திசைவு & நினைவகம்' : 'Cloud Sync & Storage'}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {appLanguage === 'ta' 
            ? 'நிகழ்நேர கிளவுட் ஒத்திசைவு, ஆஃப்லைன் சேமிப்பு மற்றும் சாதன விவரங்கள்.' 
            : 'Realtime cloud synchronization, local offline caching, and device telemetry.'}
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
                {syncStatus === 'synced' 
                  ? (appLanguage === 'ta' ? 'கிளவுடில் ஒத்திசைக்கப்பட்டது' : 'Cloud Synced') 
                  : syncStatus === 'syncing' 
                  ? (appLanguage === 'ta' ? 'ஒத்திசைக்கப்படுகிறது...' : 'Syncing Now...') 
                  : (appLanguage === 'ta' ? 'ஆஃப்லைன்' : 'Offline')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={syncStatus === 'syncing'}
              className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-primary transition cursor-pointer disabled:opacity-50"
              title={appLanguage === 'ta' ? 'இப்போதே ஒத்திசைக்க' : 'Trigger Sync Now'}
            >
              {syncStatus === 'syncing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-xs text-on-surface-variant space-y-1">
            <p>
              {appLanguage === 'ta' ? 'கடைசி காப்புப்பிரதி: ' : 'Last cloud backup: '}
              <strong className="text-on-surface">{formatLastSynced(lastSyncedAt, appLanguage === 'ta')}</strong>
            </p>
            <p>
              {appLanguage === 'ta' ? 'நிலுவையிலுள்ள பதிவுகள்: ' : 'Pending offline records: '}
              <strong className="text-on-surface">{pendingOfflineCount}</strong>
            </p>
          </div>
        </div>

        {/* Device ID Card */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2">
          <span className="text-xs font-bold text-outline uppercase tracking-wider block">
            {appLanguage === 'ta' ? 'பதிவு செய்யப்பட்ட சாதனம்' : 'Registered Device'}
          </span>
          <p className="font-mono text-xs text-on-surface bg-surface-container px-3 py-2 rounded-2xl border border-outline-variant/20 truncate">
            {deviceId}
          </p>
          <span className="text-[11px] text-on-surface-variant block">
            {appLanguage === 'ta' ? 'பல சாதன ஒத்திசைவுக்கான தனித்துவமான அடையாள எண்' : 'Unique hardware instance identifier for multi-device sync'}
          </span>
        </div>
      </div>

      {/* Clear Cache Card */}
      <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-sm font-bold text-on-surface block">
            {appLanguage === 'ta' ? 'ஆஃப்லைன் குர்ஆன் சேமிப்பு' : 'Offline Quran Storage'}
          </span>
          <span className="text-xs text-on-surface-variant block">
            {appLanguage === 'ta' 
              ? 'நினைவக இடத்தை விடுவிக்க பதிவிறக்கப்பட்ட ஆடியோ மற்றும் அத்தியாயங்களை நீக்கவும்' 
              : 'Clear locally stored audio recitations and IndexedDB Surah caches to free disk space'}
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
          <span>
            {cacheClearedSuccess 
              ? (appLanguage === 'ta' ? 'நினைவகம் நீக்கப்பட்டது!' : 'Cache Cleared!') 
              : (appLanguage === 'ta' ? 'நினைவகத்தை நீக்கு' : 'Clear Cache')}
          </span>
        </button>
      </div>
    </div>
  )

  // 7. About Section (Crisp & Modern)
  const renderAboutSection = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
          {appLanguage === 'ta' ? 'தீன்லி பற்றி & அங்கீகாரக் குறிப்புகள்' : 'About Deenly & Sources'}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 font-medium">
          {appLanguage === 'ta' 
            ? 'அங்கீகரிக்கப்பட்ட குர்ஆன் மூலங்கள், மொழிபெயர்ப்புகள் மற்றும் வழிகாட்டிகள்.' 
            : 'Verified Quranic scriptures, authentic Hadiths, translations, and credits.'}
        </p>
      </div>

      {/* 1. App Identity Card */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl primary-gradient-btn flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              د
            </div>
            <div>
              <h3 className="text-lg font-bold font-h2 text-on-surface flex items-center gap-2">
                <span>Deenly (دينلي)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/30 font-mono">v2.0.0</span>
              </h3>
              <p className="text-xs text-primary font-semibold">
                {appLanguage === 'ta' ? 'குர்ஆன் ஓதுதல் & ஆன்மீகப் பழக்கவழக்க கண்காணிப்பு' : 'Quran Reading, Tracking & Spiritual Habit Building PWA'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{appLanguage === 'ta' ? '100% இலவசம் & திறந்த மூலம்' : '100% Free & Open Source'}</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          {appLanguage === 'ta' 
            ? 'தினசரி குர்ஆன் ஓதுதலை எளிமையாகவும் தொடர்ச்சியாகவும் ஆக்க வடிவமைக்கப்பட்டது. ஓர் அரபு எழுத்துக்கு 10 நன்மைகள் (ஹஸனாத்) கணக்கீடு, தஜ்வீத் வண்ண வழிகாட்டல், ஷேக் மிஷாரி அல்-அஃபாஸியின் குரல் ஓதுதல் மற்றும் முழு ஆஃப்லைன் பயன்பாடு.' 
            : 'Engineered for consistent daily Quran recitation. Features Hadith-accurate Hasanat calculations (10 rewards/letter), scholarly translations, Tajweed color coding, Sheikh Mishary Alafasy audio recitations, and offline sync.'}
        </p>
      </div>

      {/* 2. Special Inspiration Credit: Quranly App */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-primary/15 border border-amber-500/40 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-inner shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block font-label-caps">
              {appLanguage === 'ta' ? 'முக்கிய உத்வேகம்' : 'Special Inspiration'}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-on-surface">
              Quranly App (Google Play & App Store)
            </h4>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          {appLanguage === 'ta'
            ? 'தீன்லி செயலியின் 1-வசன வாசிப்பு முறை, எழுத்து அடிப்படையிலான ஹஸனாத் கணக்கீடு மற்றும் தொடர் ஓதும் பழக்கவழக்கக் கட்டமைப்பு ஆகியவை "Quranly" செயலியின் நவீன தத்துவத்தால் ஈர்க்கப்பட்டு வடிவமைக்கப்பட்டது.'
            : 'Deenly draws architectural inspiration from the "Quranly" app. Single-verse focus reading, letter-count Hasanat rewards gamification (Tirmidhi 2910), and daily streaks served as the foundational inspiration for Deenly.'}
        </p>
      </div>

      {/* 3. Verified Scholarly Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        {/* Quran Text */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{appLanguage === 'ta' ? 'அரபு குர்ஆன் உஸ்மானி மூலம்' : 'Arabic Quran Text'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Official</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            King Fahd Glorious Quran Complex (Madinah, KSA) & Tanzil.net Unicode Text Engine.
          </p>
        </div>

        {/* English Translations */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>English Translations</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">4 Editions</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Sahih International, The Clear Quran (Dr. Mustafa Khattab), Hilali-Khan, & Abdel Haleem (Oxford).
          </p>
        </div>

        {/* Tamil Translations */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>{appLanguage === 'ta' ? 'தமிழ் மொழிபெயர்ப்புகள்' : 'Tamil Translations'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">2 Editions</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            மௌலானா ஏ.கே. அப்துல் ஹமீது பாகவி & ஜான் டிரஸ்ட் (மதீனா மன்னர் ஃபஹத் அச்சகம்).
          </p>
        </div>

        {/* Hadith Collections */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{appLanguage === 'ta' ? 'ஹதீஸ் நூல்கள்' : 'Hadith Collections'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">Kutub al-Sittah</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Sahih Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasai, Ibn Majah, 40 Nawawi & Hisnul Muslim via Sunnah.com API.
          </p>
        </div>

        {/* Audio Reciter */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{appLanguage === 'ta' ? 'ஆடியோ காரீ' : 'Audio Recitation'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold">128kbps HQ</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Sheikh Mishary bin Rashid Alafasy (EveryAyah.com & QuranCDN).
          </p>
        </div>

        {/* Fonts & Tech */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Typography & Tech</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-outline font-bold">PWA</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Amiri Quran, Scheherazade New, Lateef, Noto Naskh. Built with React 19, TypeScript, Tailwind CSS.
          </p>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[11px] text-outline text-center pt-1 border-t border-outline-variant/20">
        © {new Date().getFullYear()} Deenly. Released under the MIT License for the Muslim Ummah.
      </p>
    </div>
  )

  // Helper to render section by category
  const renderSection = (category: SettingCategory) => {
    switch (category) {
      case 'language':
        return renderLanguageSection()
      case 'theme':
        return renderThemeSection()
      case 'audio_qari':
        return renderAudioQariSection()
      case 'translation':
        return renderTranslationSection()
      case 'transliteration':
        return renderTransliterationSection()
      case 'font':
        return renderFontSection()
      case 'tajweed':
        return renderTajweedSection()
      case 'target':
        return renderTargetSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'sync':
        return renderSyncSection()
      case 'about':
        return renderAboutSection()
      default:
        return renderLanguageSection()
    }
  }

  const activeFontMeta = getArabicFontMeta(currentFontStyle)
  const activeQariInfo = getQariById(selectedQariId)

  // Array of categories for navigation (Crisp & Short Descriptions)
  const categories: Array<{ id: SettingCategory; label: string; icon: any; desc: string }> = [
    { 
      id: 'language', 
      label: t('appLanguage'), 
      icon: Languages, 
      desc: appLanguage === 'ta' ? 'தமிழ் (முழு செயலி)' : 'English' 
    },
    { 
      id: 'theme', 
      label: t('themeAppearance'), 
      icon: theme === 'dark' ? Moon : Sun, 
      desc: `${theme.charAt(0).toUpperCase() + theme.slice(1)} • ${appLanguage === 'ta' ? (MUSHAF_THEMES[currentMushafTheme]?.nameTa || 'முஸ்ஹஃப்') : (MUSHAF_THEMES[currentMushafTheme]?.nameEn || 'Mushaf')}` 
    },
    { 
      id: 'audio_qari', 
      label: appLanguage === 'ta' ? 'காரீ ஓதுபவர் & ஆடியோ' : 'Quran Reciter & Audio', 
      icon: Mic, 
      desc: `${activeQariInfo.flag} ${activeQariInfo.nameEn.split(' ').slice(-1)[0]} • ${playbackRate}x` 
    },
    { 
      id: 'translation', 
      label: t('quranTranslations'), 
      icon: Globe, 
      desc: appLanguage === 'ta' || currentTranslation === 'tamil' ? 'தமிழ் (பாகவி)' : 'English (Sahih)' 
    },
    { 
      id: 'transliteration', 
      label: t('phoneticTransliteration'), 
      icon: Volume2, 
      desc: showTransliteration 
        ? (transliterationLang === 'ta' ? 'தமிழ் உச்சரிப்பு' : 'English Phonetic') 
        : (appLanguage === 'ta' ? 'முடக்கப்பட்டுள்ளது' : 'Off') 
    },
    { 
      id: 'font', 
      label: t('arabicTypography'), 
      icon: Type, 
      desc: `${activeFontMeta.name} • ${currentFontSize}px` 
    },
    { 
      id: 'tajweed', 
      label: appLanguage === 'ta' ? 'தஜ்வீத் வண்ண விதிகள்' : 'Tajweed Color Rules', 
      icon: Sparkles, 
      desc: isTajweedEnabled ? (appLanguage === 'ta' ? 'செயலில் உள்ளது' : 'Active') : (appLanguage === 'ta' ? 'முடக்கப்பட்டுள்ளது' : 'Off') 
    },
    { 
      id: 'target', 
      label: t('dailyGoalSetting'), 
      icon: Target, 
      desc: `${currentGoal} ${appLanguage === 'ta' ? 'வசனங்கள்' : 'Ayahs'} / ${appLanguage === 'ta' ? 'நாள்' : 'Day'}` 
    },
    { 
      id: 'notifications', 
      label: appLanguage === 'ta' ? 'அறிவிப்புகள்' : 'Notifications & Adhan', 
      icon: Bell, 
      desc: readingAlerts ? (appLanguage === 'ta' ? 'இயக்கப்பட்டுள்ளது' : 'Enabled') : (appLanguage === 'ta' ? 'முடக்கப்பட்டுள்ளது' : 'Off') 
    },
    { 
      id: 'sync', 
      label: t('multiDeviceSync'), 
      icon: Cloud, 
      desc: syncStatus === 'synced' ? (appLanguage === 'ta' ? 'ஒத்திசைக்கப்பட்டது' : 'Synced') : (appLanguage === 'ta' ? 'ஆஃப்லைன்' : 'Offline') 
    },
    { 
      id: 'about', 
      label: t('aboutDeenly'), 
      icon: Info, 
      desc: appLanguage === 'ta' ? 'பதிப்பு 2.0 • மூலங்கள்' : 'Version 2.0 • Credits' 
    },
  ]

  return (
    <div className="w-full pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">{t('settingsTitle')}</h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
          {t('settingsSub')}
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
              <span>{t('back')}</span>
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
                    <span className="truncate">{appLanguage === 'ta' ? 'கணக்கை நிர்வகி' : 'Manage Account'}</span>
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
