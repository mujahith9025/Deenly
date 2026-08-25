import React, { useState, useMemo } from 'react'
import { 
  Sparkles, 
  Compass, 
  Check, 
  Copy, 
  Star, 
  Search, 
  Shield, 
  Info,
  BarChart3
} from 'lucide-react'
import { DigitalTasbihEngine } from '../components/DigitalTasbihEngine'
import { DhikrAnalyticsView } from '../components/DhikrAnalyticsView'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { ASMAUL_HUSNA, type AsmaulHusnaItem } from '../lib/asmaulHusnaData'
import { HISNUL_MUSLIM_DUAS, HISNUL_MUSLIM_CATEGORIES } from '../lib/hisnulMuslimData'

type ExploreTab = 'dhikr' | 'analytics' | 'hisnul_muslim' | 'asmaul_husna'

export const ExploreScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const isTamilTranslation = appLanguage === 'ta' || user?.preferredTranslation === 'tamil'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const [activeTab, setActiveTab] = useState<ExploreTab>('dhikr')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Hisnul Muslim State
  const [hisnulCategory, setHisnulCategory] = useState<string>('all')
  const [hisnulSearch, setHisnulSearch] = useState<string>('')

  // 99 Names State
  const [asmaulSearch, setAsmaulSearch] = useState<string>('')

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
      const matchCat = hisnulCategory === 'all' || dua.chapterId === hisnulCategory
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

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* 🌟 1. EXPLORE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-primary/15 via-surface-container to-surface-container-high border border-primary/25 relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold font-label-caps border border-primary/30 shadow-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>{isTamil ? 'இஸ்லாமிய பொக்கிஷங்கள்' : 'Islamic Explorer'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline">
            {isTamil ? 'ஆன்மீகக் கருவிகள், திக்ர் அரங்கம் & ஹிஸ்னுல் முஸ்லிம்' : 'Spiritual Sanctuary, Dhikr Studio & Hisnul Muslim'}
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {isTamil 
              ? 'டிஜிட்டல் தஸ்பீஹ் திக்ர் அரங்கம், நாட்களின் பகுப்பாய்வு, ஆதாரப்பூர்வமான ஹிஸ்னுல் முஸ்லிம் துஆக்கள் மற்றும் அல்லாஹ்வின் 99 திருநாமங்களை முழுமையாக ஆராயுங்கள்.' 
              : 'Discover the Interactive Dhikr & Digital Tasbih Studio, progression analytics, authentic Hisnul Muslim supplications, and all 99 Beautiful Names of Allah.'
            }
          </p>
        </div>

        {/* Ambient Decorative Background Orb */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* 🌟 2. EXPLORE 4 CORE HEADINGS / NAVIGATION TABS */}
      <div className="flex items-center gap-3 border-b border-outline-variant/25 pb-3 overflow-x-auto scrollbar-none">
        {[
          { 
            id: 'dhikr', 
            labelEn: 'Dhikr & Digital Tasbih', 
            labelTa: 'திக்ர் & தஸ்பீஹ் அரங்கம்', 
            descEn: 'Tactile counter, goals & virtues',
            descTa: 'எண்ணிக்கை & நற்பலன்கள்',
            icon: Sparkles 
          },
          { 
            id: 'analytics', 
            labelEn: 'Dhikr Analytics & Trends', 
            labelTa: 'திக்ர் பகுப்பாய்வு & வரைபடம்', 
            descEn: 'Daily progress, streaks & charts',
            descTa: 'நாட்கள் வரைபடம் & சாதனைகள்',
            icon: BarChart3 
          },
          { 
            id: 'hisnul_muslim', 
            labelEn: 'Hisnul Muslim', 
            labelTa: 'ஹிஸ்னுல் முஸ்லிம்', 
            descEn: 'Authentic daily supplications',
            descTa: 'முஸ்லிமின் கவச துஆக்கள்',
            icon: Shield 
          },
          { 
            id: 'asmaul_husna', 
            labelEn: '99 Names of Allah', 
            labelTa: '99 திருநாமங்கள்', 
            descEn: 'All 99 Divine Attributes',
            descTa: 'அல்லாஹ்வின் அழகிய பெயர்கள்',
            icon: Star 
          },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ExploreTab)}
              className={`px-4 py-3 rounded-2xl text-left transition cursor-pointer border flex items-center gap-3 shrink-0 ${
                isActive
                  ? 'bg-primary text-on-primary border-primary shadow-md'
                  : 'bg-surface-container/60 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-high text-primary'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold whitespace-nowrap">
                  {isTamil ? tab.labelTa : tab.labelEn}
                </p>
                <p className={`text-[10px] truncate ${isActive ? 'text-on-primary/80' : 'text-outline'}`}>
                  {isTamil ? tab.descTa : tab.descEn}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. 📿 OPTION 1: DHIKR & DIGITAL TASBIH STUDIO (FULL DETAILED DESCRIPTION)  */}
      {/* ========================================================================= */}
      {activeTab === 'dhikr' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface-container/70 border border-primary/20 flex items-center gap-3">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isTamil 
                ? 'திக்ர் அரங்கம்: நபிகளார் கற்றுத்தந்த சுன்னத் திக்ருகளை ஓதி, உங்கள் தினசரி இலக்குகளை அமைத்து, தஸ்பீஹ் எண்ணிக்கையைச் சேமித்துக் கொள்ளுங்கள்.' 
                : 'Interactive Dhikr Studio: Recite authentic Sunnah remembrances, customize your daily Dhikr targets, and track your recitation metrics in real-time.'
              }
            </p>
          </div>

          {/* Full Interactive Digital Tasbih Engine */}
          <DigitalTasbihEngine onOpenAnalytics={() => setActiveTab('analytics')} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 📊 OPTION 2: DHIKR ANALYTICS, CHARTS & DAILY HISTORY                    */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <DhikrAnalyticsView />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 🛡️ OPTION 3: HISNUL MUSLIM (AUTHENTIC FORTRESS OF THE MUSLIM ACCESS)     */}
      {/* ========================================================================= */}
      {activeTab === 'hisnul_muslim' && (
        <div className="space-y-6">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-md">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>{isTamil ? 'ஹிஸ்னுல் முஸ்லிம் — முஸ்லிமின் கவசம்' : 'Hisnul Muslim — Fortress of the Muslim'}</span>
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                {isTamil 
                  ? 'ஷேக் ஸயீத் பின் அலி அல்-கஹ்தானி தொகுத்த குர்ஆன் மற்றும் சுன்னாவிலிருந்து பெறப்பட்ட ஆதாரப்பூர்வமான துஆக்கள்.' 
                  : 'Authentic daily invocations from the Quran and Sunnah compiled by Shaykh Sa\'id bin Ali bin Wahf Al-Qahtani.'
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

      {/* ========================================================================= */}
      {/* 4. 🌟 OPTION 4: ALL 99 NAMES OF ALLAH (COMPLETE ASMAUL HUSNA GALLERY)       */}
      {/* ========================================================================= */}
      {activeTab === 'asmaul_husna' && (
        <div className="space-y-6">
          
          {/* Header Banner with Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-md">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>{isTamil ? 'அல்லாஹ்வின் 99 அழகிய திருநாமங்கள் (அஸ்மாஉல் ஹுஸ்னா)' : 'The 99 Beautiful Names of Allah (Asmaul Husna)'}</span>
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                {isTamil 
                  ? 'நபி ﷺ கூறினார்கள்: "அல்லாஹ்விற்கு 99 திருப்பெயர்கள் உள்ளன; அவற்றை அறிந்துகொள்பவர் சொர்க்கத்தில் நுழைவார்." (ஸஹீஹ் புகாரி 2736)' 
                  : 'The Prophet ﷺ said: "Allah has ninety-nine names; whoever comprehends and memorizes them will enter Paradise." (Sahih al-Bukhari 2736)'
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
              {isTamil ? 'காட்டப்படும் திருநாமங்கள்' : 'Showing Divine Names'}: <strong className="text-on-surface">{filteredAsmaulHusna.length}</strong> / 99
            </span>
            <span>
              {isTamil ? 'அனைத்து 99 திருநாமங்களும் உள்ளடக்கப்பட்டுள்ளன' : 'Complete 1 to 99 Collection'}
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
