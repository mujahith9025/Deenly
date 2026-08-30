import React, { useState, useMemo, Suspense, lazy } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  Check, 
  Copy, 
  Star, 
  Search, 
  Shield, 
  BarChart3,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTasbihStore } from '../store/useTasbihStore'
import { useI18nStore } from '../lib/i18n'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { ASMAUL_HUSNA, type AsmaulHusnaItem } from '../lib/asmaulHusnaData'
import { HISNUL_MUSLIM_DUAS, HISNUL_MUSLIM_CATEGORIES } from '../lib/hisnulMuslimData'
import { DHIKR_PRESETS } from '../lib/dhikrData'
import { RouteLoadingFallback } from '../components/RouteLoadingFallback'

const DigitalTasbihEngine = lazy(() =>
  import('../components/DigitalTasbihEngine').then((m) => ({ default: m.DigitalTasbihEngine }))
)
const DhikrAnalyticsView = lazy(() =>
  import('../components/DhikrAnalyticsView').then((m) => ({ default: m.DhikrAnalyticsView }))
)

export type ExploreCategoryKey = 'dhikr' | 'hisnul_muslim' | 'asmaul_husna'

export const ExploreScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentCategory = (searchParams.get('cat') as ExploreCategoryKey) || null
  const [tasbihTab, setTasbihTab] = useState<'counter' | 'analytics'>('counter')

  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'

  const user = useAuthStore((state) => state.user)
  const isTamilTranslation = appLanguage === 'ta' || user?.preferredTranslation === 'tamil'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  // Tasbih store data for quick summary counters
  const {
    todayDhikrCounts,
    lifetimeDhikrCounts,
    dailyGoal,
    currentStreak,
    getCompletedDhikrsCount,
  } = useTasbihStore()

  const todayTotal = useMemo(() => {
    return Object.values(todayDhikrCounts).reduce((a, b) => a + b, 0)
  }, [todayDhikrCounts])

  const totalLifetime = useMemo(() => {
    return Object.values(lifetimeDhikrCounts).reduce((a, b) => a + b, 0)
  }, [lifetimeDhikrCounts])

  const completedDhikrsCount = getCompletedDhikrsCount()
  const totalPresetsCount = DHIKR_PRESETS.length

  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Hisnul Muslim State
  const [hisnulCategory, setHisnulCategory] = useState<string>('all')
  const [hisnulSearch, setHisnulSearch] = useState<string>('')

  // 99 Names State
  const [asmaulSearch, setAsmaulSearch] = useState<string>('')

  // Category navigation handlers
  const handleSelectCategory = (catKey: ExploreCategoryKey, defaultTab: 'counter' | 'analytics' = 'counter') => {
    if (catKey === 'dhikr') {
      setTasbihTab(defaultTab)
    }
    setSearchParams({ cat: catKey })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Copy helper
  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Filtered Hisnul Muslim Duas
  const filteredHisnulDuas = useMemo(() => {
    return HISNUL_MUSLIM_DUAS.filter((dua) => {
      const matchCat =
        hisnulCategory === 'all' || dua.chapterId === hisnulCategory
      if (!matchCat) return false

      if (!hisnulSearch.trim()) return true
      const q = hisnulSearch.toLowerCase()
      return (
        dua.chapterTitleEn.toLowerCase().includes(q) ||
        dua.chapterTitleTa.toLowerCase().includes(q) ||
        dua.occasionEn.toLowerCase().includes(q) ||
        dua.occasionTa.toLowerCase().includes(q) ||
        dua.transliteration.toLowerCase().includes(q) ||
        dua.translationEn.toLowerCase().includes(q) ||
        dua.translationTa.toLowerCase().includes(q)
      )
    })
  }, [hisnulCategory, hisnulSearch])

  // Filtered 99 Names
  const filteredAsmaulHusna = useMemo(() => {
    if (!asmaulSearch.trim()) return ASMAUL_HUSNA
    const q = asmaulSearch.toLowerCase()
    return ASMAUL_HUSNA.filter((item) => {
      return (
        item.number.toString().includes(q) ||
        item.transliteration.toLowerCase().includes(q) ||
        item.nameTa.toLowerCase().includes(q) ||
        item.meaningEn.toLowerCase().includes(q) ||
        item.meaningTa.toLowerCase().includes(q) ||
        item.quranRef.toLowerCase().includes(q)
      )
    })
  }, [asmaulSearch])

  // Category Configuration (3 Core Islamic Treasures)
  const CATEGORIES = [
    {
      key: 'dhikr' as ExploreCategoryKey,
      titleEn: 'Tasbih & Dhikr',
      titleTa: 'தஸ்பீஹ் & திக்ர்',
      arabicScript: 'سُبْحَانَ ٱللَّهِ • الحَمْدُ لِلَّهِ • إِحْصَاءُ الذِّكْرِ',
      descEn: 'Touch counter dial, Sunnah presets, 7/14/30-day streak & habit charts.',
      descTa: 'தொடு உணர்வு தஸ்பீஹ், சுன்னத் திக்ருகள், தொடர் பழக்க வரைபடங்கள் & சாதனைகள்.',
      icon: Sparkles,
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      statPill: `🔥 ${currentStreak}d • ${todayTotal}/${dailyGoal}`,
      badge: totalLifetime > 0 ? `${totalLifetime.toLocaleString()} ${isTamil ? 'ஓதப்பட்டது' : 'Total'}` : `${completedDhikrsCount}/${totalPresetsCount} ${isTamil ? 'இலக்குகள்' : 'Goals Met'}`,
      btnText: isTamil ? 'அரங்கம் & வரைபடம்' : 'Open Studio & Charts',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    {
      key: 'hisnul_muslim' as ExploreCategoryKey,
      titleEn: 'Hisnul Muslim (Daily Duas)',
      titleTa: 'ஹிஸ்னுல் முஸ்லிம் (கவச துஆக்கள்)',
      arabicScript: 'حِصْنُ الْمُسْلِمِ مِنَ الْأَذْகாரِ',
      descEn: '132 authentic daily supplications from the Quran & Sunnah.',
      descTa: 'குர்ஆன் மற்றும் சுன்னாவிலிருந்து பெறப்பட்ட 132 ஆதாரப்பூர்வ சுன்னத் துஆக்கள்.',
      icon: Shield,
      gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      statPill: `${HISNUL_MUSLIM_DUAS.length} ${isTamil ? 'துஆக்கள்' : 'Duas'}`,
      badge: isTamil ? 'ஆதாரம்: ஸஹீஹ்' : 'Sahih Verified',
      btnText: isTamil ? 'துஆக்களைப் பார்க்க' : 'Explore Duas',
    },
    {
      key: 'asmaul_husna' as ExploreCategoryKey,
      titleEn: '99 Names of Allah',
      titleTa: 'அல்லாஹ்வின் 99 திருநாமங்கள்',
      arabicScript: 'أَسْمَاءُ اللَّهِ الْحُسْنَىٰ',
      descEn: '99 Divine Names, meanings & Quranic citations.',
      descTa: 'அல்லாஹ்வின் 99 அழகிய திருநாமங்களும் தமிழ்ப் பொருள்களும்.',
      icon: Star,
      gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      statPill: `1 - 99 ${isTamil ? 'பெயர்கள்' : 'Divine Names'}`,
      badge: '100% Complete',
      btnText: isTamil ? 'திருநாமங்களைக் காண்க' : 'View 99 Names',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* ========================================================================= */}
      {/* 🌟 UNIFIED TOP HEADER WITH MULTI-LEVEL BACK NAVIGATION                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {currentCategory ? (
              <button
                onClick={() => {
                  setSearchParams({})
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="p-2 rounded-full glass-card hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition cursor-pointer"
                title={isTamil ? 'அரங்கத்தின் முகப்பிற்குத் திரும்பு' : 'Back to Explore Categories'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full glass-card hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition cursor-pointer"
                title={isTamil ? 'முகப்புக்குத் திரும்பு' : 'Back to Dashboard'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-h1 text-on-surface">
              {currentCategory === 'dhikr'
                ? (isTamil ? 'தஸ்பீஹ் & திக்ர் அரங்கம்' : 'Tasbih & Dhikr Studio')
                : currentCategory === 'hisnul_muslim'
                ? (isTamil ? 'ஹிஸ்னுல் முஸ்லிம் (கவச துஆக்கள்)' : 'Hisnul Muslim (Daily Duas)')
                : currentCategory === 'asmaul_husna'
                ? (isTamil ? 'அல்லாஹ்வின் 99 அழகிய திருநாமங்கள்' : '99 Names of Allah')
                : (isTamil ? 'இஸ்லாமிய அரங்கம்' : 'Spiritual Explorer')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 font-medium">
            {currentCategory === 'dhikr'
              ? (isTamil ? 'தொடு உணர்வு தஸ்பீஹ், சுன்னத் திக்ருகள் & தொடர் வரைபடங்கள்.' : 'Digital touch counter, Sunnah presets & habit charts.')
              : currentCategory === 'hisnul_muslim'
              ? (isTamil ? 'குர்ஆன் மற்றும் சுன்னாவிலிருந்து பெறப்பட்ட 132 ஆதாரப்பூர்வ துஆக்கள்.' : '132 authentic supplications from the Quran & Sunnah.')
              : currentCategory === 'asmaul_husna'
              ? (isTamil ? 'அல்லாஹ்வின் 99 திருநாமங்கள், பொருள்கள் மற்றும் ஆதாரங்கள்.' : '99 Divine Names, meanings & Quranic citations.')
              : (isTamil ? 'தினசரி திக்ருகள், ஆதாரப்பூர்வ துஆக்கள் மற்றும் 99 திருநாமங்கள்.' : 'Daily Dhikr, Authentic Duas & 99 Divine Names of Allah.')}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 MAIN EXPLORE CATEGORY DIRECTORY                                       */}
      {/* ========================================================================= */}
      {!currentCategory && (
        <div className="space-y-4 animate-fade-in">
          {/* 🌟 RECTANGULAR CARDS RESPONSIVE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.key}
                  onClick={() => handleSelectCategory(cat.key)}
                  className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-3.5 shadow-md hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                >
                  {/* Decorative Top Pill & Arabic Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${cat.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0 mt-0.5`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary border border-outline-variant/30 font-bold uppercase tracking-wider font-label-caps">
                          {cat.statPill}
                        </span>
                        <h2 className="text-lg font-bold text-on-surface group-hover:text-primary transition mt-1.5 font-h2">
                          {isTamil ? cat.titleTa : cat.titleEn}
                        </h2>
                      </div>
                    </div>

                    <span 
                      className="font-arabic text-sm text-primary-fixed-dim shrink-0 opacity-80"
                      style={{ fontFamily: arabicFontFamily }}
                      dir="rtl"
                    >
                      {cat.arabicScript.split('•')[0].trim()}
                    </span>
                  </div>

                  {/* Footer Badges & Action */}
                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="text-xs text-outline font-semibold">
                      {cat.badge}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      <span>{cat.btnText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 4. CATEGORY DETAIL VIEWS (WHEN A CATEGORY IS CLICKED)                  */}
      {/* ========================================================================= */}

      {/* 📿 UNIFIED CATEGORY 1: DIGITAL TASBIH STUDIO & DHIKR ANALYTICS */}
      {currentCategory === 'dhikr' && (
        <div className="space-y-6">
          {/* Sub-Navigation Segmented Controller: Counter vs Analytics */}
          <div className="flex items-center justify-center">
            <div className="p-1.5 rounded-2xl bg-surface-container border border-outline-variant/30 inline-flex items-center gap-1.5 shadow-sm">
              <button
                onClick={() => setTasbihTab('counter')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  tasbihTab === 'counter'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isTamil ? 'தஸ்பீஹ் அரங்கம்' : 'Tasbih Counter'}</span>
              </button>

              <button
                onClick={() => setTasbihTab('analytics')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  tasbihTab === 'analytics'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{isTamil ? 'பகுப்பாய்வு & வரைபடம்' : 'Analytics & Habits'}</span>
              </button>
            </div>
          </div>

          <Suspense fallback={<RouteLoadingFallback />}>
            {tasbihTab === 'counter' ? (
              <DigitalTasbihEngine onOpenAnalytics={() => setTasbihTab('analytics')} />
            ) : (
              <div className="space-y-6">
                <DhikrAnalyticsView />
              </div>
            )}
          </Suspense>
        </div>
      )}

      {/* 🛡️ CATEGORY 3: HISNUL MUSLIM (FORTRESS OF THE MUSLIM) */}
      {currentCategory === 'hisnul_muslim' && (
        <div className="space-y-6">
          
          {/* Search & Header Bar (Crisp Header) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-md">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>{isTamil ? 'ஹிஸ்னுல் முஸ்லிம் (கவச துஆக்கள்)' : 'Hisnul Muslim (Daily Duas)'}</span>
              </h2>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {isTamil 
                  ? 'குர்ஆன் மற்றும் சுன்னாவிலிருந்து பெறப்பட்ட ஆதாரப்பூர்வமான தினசரி துஆக்கள்.' 
                  : 'Authentic daily supplications from the Quran & Sunnah.'
                }
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hisnulSearch}
                onChange={(e) => setHisnulSearch(e.target.value)}
                placeholder={isTamil ? 'துஆக்களைத் தேடுக...' : 'Search supplications...'}
                className="w-full pl-9.5 pr-4 py-2 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {HISNUL_MUSLIM_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setHisnulCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  hisnulCategory === cat.id
                    ? 'bg-secondary text-on-secondary border-secondary shadow-sm font-bold'
                    : 'bg-surface-container/70 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                }`}
              >
                {isTamil ? cat.titleTa : cat.titleEn}
              </button>
            ))}
          </div>

          {/* Supplications Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHisnulDuas.map((dua) => (
              <div
                key={dua.id}
                className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  
                  {/* Card Header with Category & Copy Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps block">
                        {isTamil ? dua.chapterTitleTa : dua.chapterTitleEn}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-on-surface">
                        {isTamil ? dua.occasionTa : dua.occasionEn}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dua.repeatCount && dua.repeatCount > 1 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold border border-primary/20">
                          {dua.repeatCount}x
                        </span>
                      )}

                      <button
                        onClick={() => handleCopy(dua.id, `${dua.arabic}\n\n${dua.translationEn}\n\n[${dua.reference}]`)}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition cursor-pointer border border-outline-variant/20"
                        title="Copy Arabic & Translation"
                      >
                        {copiedId === dua.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Script */}
                  <p 
                    className="text-xl sm:text-2xl text-on-surface text-right leading-relaxed pt-2 select-none"
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>

                  {/* Transliteration */}
                  <p className="text-xs text-secondary font-medium leading-relaxed">
                    {dua.transliteration}
                  </p>

                  {/* Translation */}
                  <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
                    "{isTamilTranslation ? dua.translationTa : dua.translationEn}"
                  </p>
                </div>

                {/* Reference Source */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-outline font-semibold">
                  <span>{isTamil ? 'ஆதாரம்' : 'Reference'}:</span>
                  <span className="text-on-surface-variant font-bold">{isTamil ? dua.referenceTa : dua.reference}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredHisnulDuas.length === 0 && (
            <div className="p-8 rounded-3xl glass-card border border-outline-variant/30 text-center space-y-2">
              <p className="text-sm font-semibold text-on-surface">
                {isTamil ? 'துஆக்கள் எதுவும் கிடைக்கவில்லை' : 'No supplications matched your search'}
              </p>
              <p className="text-xs text-outline">
                {isTamil ? 'வேறு வார்த்தைகளைத் தேடவும் அல்லது வகையை மாற்றவும்' : 'Try adjusting your search terms or category filter'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* 🌟 CATEGORY 4: 99 NAMES OF ALLAH (ASMAUL HUSNA) */}
      {currentCategory === 'asmaul_husna' && (
        <div className="space-y-6">
          
          {/* Header Banner with Search (Crisp Header) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-md">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>{isTamil ? 'அல்லாஹ்வின் 99 அழகிய திருநாமங்கள்' : 'The 99 Beautiful Names of Allah'}</span>
              </h2>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {isTamil 
                  ? '"அவற்றை அறிந்துகொள்பவர் சொர்க்கத்தில் நுழைவார்." (ஸஹீஹ் புகாரி 2736)' 
                  : '"Whoever memorizes and comprehends them will enter Paradise." (Bukhari 2736)'
                }
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={asmaulSearch}
                onChange={(e) => setAsmaulSearch(e.target.value)}
                placeholder={isTamil ? 'பெயர் அல்லது எண் மூலம் தேடுக...' : 'Search by name, meaning or #...'}
                className="w-full pl-9.5 pr-4 py-2 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Counter Status */}
          <div className="flex items-center justify-between text-xs text-outline font-semibold px-2">
            <span>
              {isTamil ? 'காட்டப்படும் திருநாமங்கள்' : 'Showing Names'}: <strong className="text-on-surface">{filteredAsmaulHusna.length}</strong> / 99
            </span>
            <span>
              {isTamil ? 'அனைத்து 99 திருநாமங்களும்' : 'Complete 1 to 99 Collection'}
            </span>
          </div>

          {/* 99 Names Full Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
            {filteredAsmaulHusna.map((item: AsmaulHusnaItem) => (
              <div
                key={item.number}
                className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-3 shadow-sm hover:border-primary/50 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-primary flex items-center justify-center shadow-2xs">
                      {item.number}
                    </span>
                    <span className="text-[10px] font-semibold text-outline px-2 py-0.5 rounded-full bg-surface-container">
                      {item.quranRef}
                    </span>
                  </div>

                  {/* Arabic Calligraphy */}
                  <p 
                    className="text-2xl sm:text-3xl font-black text-on-surface text-center py-2 group-hover:text-primary transition-colors"
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    {item.arabic}
                  </p>

                  {/* Transliteration & Tamil Name */}
                  <div className="text-center space-y-0.5">
                    <p className="text-sm font-bold text-on-surface">
                      {item.transliteration}
                    </p>
                    <p className="text-xs font-semibold text-secondary">
                      {item.nameTa}
                    </p>
                  </div>
                </div>

                {/* Meaning / Description in English & Tamil */}
                <div className="pt-2.5 border-t border-outline-variant/20 text-center space-y-1">
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    "{isTamilTranslation ? item.meaningTa : item.meaningEn}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredAsmaulHusna.length === 0 && (
            <div className="p-8 rounded-3xl glass-card border border-outline-variant/30 text-center space-y-2">
              <p className="text-sm font-semibold text-on-surface">
                {isTamil ? 'திருநாமங்கள் எதுவும் கிடைக்கவில்லை' : 'No divine names matched your search'}
              </p>
              <p className="text-xs text-outline">
                {isTamil ? 'வேறு வார்த்தைகளை உள்ளிடவும்' : 'Try searching for an English/Tamil transliteration or number (1-99)'}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
