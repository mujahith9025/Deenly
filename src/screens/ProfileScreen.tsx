import React, { useState } from 'react'
import { 
  User, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Award, 
  Bookmark, 
  Heart,
  Calendar,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  Trash2,
  RefreshCw,
  LogIn,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ScrollText,
  ArrowLeft,
  BarChart3,
  Target
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useAuth } from '../hooks/useAuth'
import { useReadingStore } from '../store/useReadingStore'
import { useBookmarkStore, type BookmarkItem } from '../store/useBookmarkStore'
import { useFavoriteStore, type FavoriteItem } from '../store/useFavoriteStore'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { useI18nStore } from '../lib/i18n'
import { SURAH_METADATA } from '../lib/quranMetadata'

type ProfileSubPage = 
  | null 
  | 'bookmarks' 
  | 'favorites'
  | 'milestones' 
  | 'stats' 
  | 'account'

type ItemFilter = 'all' | 'quran' | 'hadith'

export const ProfileScreen: React.FC = () => {
  const [activeSubPage, setActiveSubPage] = useState<ProfileSubPage>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showResetStatsModal, setShowResetStatsModal] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [bookmarkFilter, setBookmarkFilter] = useState<ItemFilter>('all')
  const [favoriteFilter, setFavoriteFilter] = useState<ItemFilter>('all')

  const appLanguage = useI18nStore((state) => state.appLanguage)
  const { user, signOut } = useAuth()
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const resetUserStatsToZero = useAuthStore((state) => state.resetUserStatsToZero)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const removeBookmarkById = useBookmarkStore((state) => state.removeBookmarkById)
  const favorites = useFavoriteStore((state) => state.favorites)
  const removeFavoriteById = useFavoriteStore((state) => state.removeFavoriteById)
  const navigate = useNavigate()

  const handleResetStats = async () => {
    setIsResetting(true)
    try {
      await resetUserStatsToZero()
      setShowResetStatsModal(false)
    } finally {
      setIsResetting(false)
    }
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

  const isTamil = appLanguage === 'ta'

  const badges = [
    { title: isTamil ? '7-நாள் தொடர்' : '7-Day Streak', desc: isTamil ? 'தொடர்ந்து 7 நாட்கள் ஓதுதல்' : 'Read Quran 7 days in a row', date: isTamil ? 'முடிந்தது' : 'Unlocked', icon: Flame, color: 'text-amber-400', progress: '100%' },
    { title: isTamil ? 'சூரா அல்-கஹ்ஃப்' : 'Surah Al-Kahf', desc: isTamil ? '4 வெள்ளிக்கிழமை ஓதுதல்' : 'Read Surah Al-Kahf 4 Fridays', date: isTamil ? 'முடிந்தது' : 'Unlocked', icon: Award, color: 'text-tertiary', progress: '100%' },
    { title: isTamil ? 'முதல் 100 வசனங்கள்' : 'First 100 Ayahs', desc: isTamil ? '100 வசனங்களை ஓதி முடித்தல்' : 'Read first 100 verses', date: isTamil ? 'முடிந்தது' : 'Unlocked', icon: BookOpen, color: 'text-primary', progress: '100%' },
    { title: isTamil ? 'கத்ம் சாதனையாளர்' : 'Khatam Explorer', desc: isTamil ? '10 முழு அத்தியாயங்கள்' : 'Recite through 10 full Surahs', date: isTamil ? 'முன்னேற்றம்' : 'In Progress', icon: Sparkles, color: 'text-emerald-400', progress: '60%' },
    { title: isTamil ? '30-நாள் சாதனை' : '30-Day Master', desc: isTamil ? '30-நாள் தொடர் ஓதும் பழக்கம்' : '30-day continuous recitation habit', date: isTamil ? 'முன்னேற்றம்' : 'In Progress', icon: Target, color: 'text-sky-400', progress: `${Math.min(100, Math.round(((user?.currentStreak || 0) / 30) * 100))}%` },
  ]

  // Filtered bookmarks
  const filteredBookmarks = bookmarks.filter((bm) => {
    if (bookmarkFilter === 'quran') return bm.type === 'quran'
    if (bookmarkFilter === 'hadith') return bm.type === 'hadith'
    return true
  })
  const bmQuranCount = bookmarks.filter((b) => b.type === 'quran').length
  const bmHadithCount = bookmarks.filter((b) => b.type === 'hadith').length

  const handleBookmarkClick = (bm: BookmarkItem) => {
    if (bm.type === 'quran') {
      navigate(`/reading?surah=${bm.surahNumber}&ayah=${bm.ayahNumber}`)
    } else {
      navigate(`/hadith?book=${bm.bookId}&chapter=${bm.chapterNumber}&hadith=${bm.hadithNumber}`)
    }
  }

  // Filtered favorites
  const filteredFavorites = favorites.filter((fav) => {
    if (favoriteFilter === 'quran') return fav.type === 'quran'
    if (favoriteFilter === 'hadith') return fav.type === 'hadith'
    return true
  })
  const favQuranCount = favorites.filter((f) => f.type === 'quran').length
  const favHadithCount = favorites.filter((f) => f.type === 'hadith').length

  const handleFavoriteClick = (fav: FavoriteItem) => {
    if (fav.type === 'quran') {
      navigate(`/reading?surah=${fav.surahNumber}&ayah=${fav.ayahNumber}`)
    } else {
      navigate(`/hadith?book=${fav.bookId}&chapter=${fav.chapterNumber}&hadith=${fav.hadithNumber}`)
    }
  }

  // =========================================================================
  // SUB-PAGE 1: SAVED BOOKMARKS (CRISP)
  // =========================================================================
  if (activeSubPage === 'bookmarks') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'சுயவிவரத்திற்குத் திரும்பு' : 'Back to Profile'}</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
              {isTamil ? 'சேமிக்கப்பட்ட புக்மார்க்குகள்' : 'Saved Bookmarks'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isTamil ? 'நீங்கள் சேமித்த திருக்குர்ஆன் வசனங்கள் மற்றும் நபிமொழிகள்.' : 'Quick access to your saved Quran verses and authentic Hadiths.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-surface-container p-1 rounded-full border border-outline-variant/30 text-xs self-start sm:self-auto shadow-sm">
            <button
              onClick={() => setBookmarkFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                bookmarkFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isTamil ? 'அனைத்தும்' : 'All'} ({bookmarks.length})
            </button>
            <button
              onClick={() => setBookmarkFilter('quran')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                bookmarkFilter === 'quran'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isTamil ? 'குர்ஆன்' : 'Quran'} ({bmQuranCount})
            </button>
            <button
              onClick={() => setBookmarkFilter('hadith')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                bookmarkFilter === 'hadith'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isTamil ? 'ஹதீஸ்' : 'Hadith'} ({bmHadithCount})
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-outline-variant/30 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">No Saved Bookmarks Yet</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                While reciting in the Quran or Hadith sections, tap the ribbon bookmark icon to save items for quick retrieval here.
              </p>
            </div>
            <Link
              to="/reading"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full primary-gradient-btn text-white text-xs font-bold shadow-md hover:scale-105 transition-transform"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Reciting Quran</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => handleBookmarkClick(bm)}
                className="p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition cursor-pointer space-y-2.5 group shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {bm.type === 'quran' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Quran</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <ScrollText className="w-3 h-3" />
                        <span>Hadith</span>
                      </span>
                    )}

                    <span className="text-xs sm:text-sm font-bold text-on-surface">
                      {bm.type === 'quran' 
                        ? (() => {
                            const meta = bm.surahNumber ? SURAH_METADATA.find((s) => s.number === bm.surahNumber) : null
                            const sName = appLanguage === 'ta' ? (meta?.nameTa || bm.surahName) : bm.surahName
                            return `${bm.surahNumber}. ${sName} [${appLanguage === 'ta' ? `வசனம் ${bm.ayahNumber}` : `Ayah ${bm.ayahNumber}`}]`
                          })()
                        : `${bm.bookName} • Hadith #${bm.hadithNumber}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-outline">
                      {new Date(bm.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBookmarkById(bm.id)
                      }}
                      className="p-1.5 rounded-full text-outline hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Arabic Snippet */}
                {bm.arabicText && (
                  <p 
                    className="text-sm sm:text-base text-primary-fixed-dim line-clamp-2 text-right" 
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    {bm.arabicText}
                  </p>
                )}

                {/* Translation Snippet */}
                {bm.translationText && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 italic">
                    "{bm.translationText}"
                  </p>
                )}

                <div className="flex items-center justify-end text-xs text-primary font-semibold group-hover:translate-x-0.5 transition-transform pt-1">
                  <span>Tap to view full text</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE 2: FAVORITE VERSES & HADITHS (CRISP)
  // =========================================================================
  if (activeSubPage === 'favorites') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'சுயவிவரத்திற்குத் திரும்பு' : 'Back to Profile'}</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
              {isTamil ? 'விருப்பமான வசனங்கள் & ஹதீஸ்கள்' : 'Favorite Verses & Hadiths'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isTamil ? 'நீங்கள் விரும்பிய புனித வசனங்கள் மற்றும் நபிமொழிகள்.' : 'Your cherished collection of inspiring Quranic verses and Hadiths.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-surface-container p-1 rounded-full border border-outline-variant/30 text-xs self-start sm:self-auto shadow-sm">
            <button
              onClick={() => setFavoriteFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                favoriteFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isTamil ? 'அனைத்தும்' : 'All'} ({favorites.length})
            </button>
            <button
              onClick={() => setFavoriteFilter('quran')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                favoriteFilter === 'quran'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isTamil ? 'குர்ஆன்' : 'Quran'} ({favQuranCount})
            </button>
            <button
              onClick={() => setFavoriteFilter('hadith')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                favoriteFilter === 'hadith'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isTamil ? 'ஹதீஸ்' : 'Hadith'} ({favHadithCount})
            </button>
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-outline-variant/30 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
              <Heart className="w-7 h-7 fill-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">
                {isTamil ? 'விருப்பங்கள் எதுவும் இல்லை' : 'No Favorites Saved Yet'}
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {isTamil ? 'குர்ஆன் அல்லது ஹதீஸில் உள்ள ❤️ இதய ஐகானைத் தட்டி இங்கே சேமிக்கவும்.' : 'Tap the Heart ❤️ icon on any Quran verse or Hadith to add it here.'}
              </p>
            </div>
            <Link
              to="/reading"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md hover:scale-105 transition-transform"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isTamil ? 'குர்ஆன் ஓதுக' : 'Explore & Recite Quran'}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFavorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => handleFavoriteClick(fav)}
                className="p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-rose-500/50 transition cursor-pointer space-y-2.5 group shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {fav.type === 'quran' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{isTamil ? 'குர்ஆன்' : 'Quran'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <ScrollText className="w-3 h-3" />
                        <span>{isTamil ? 'ஹதீஸ்' : 'Hadith'}</span>
                      </span>
                    )}

                    <span className="text-xs sm:text-sm font-bold text-on-surface">
                      {fav.type === 'quran' 
                        ? (() => {
                            const meta = fav.surahNumber ? SURAH_METADATA.find((s) => s.number === fav.surahNumber) : null
                            const sName = isTamil ? (meta?.nameTa || fav.surahName) : fav.surahName
                            return `${fav.surahNumber}. ${sName} [${isTamil ? `வசனம் ${fav.ayahNumber}` : `Ayah ${fav.ayahNumber}`}]`
                          })()
                        : `${fav.bookName} • Hadith #${fav.hadithNumber}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-outline">
                      {new Date(fav.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFavoriteById(fav.id)
                      }}
                      className="p-1.5 rounded-full text-outline hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Arabic Snippet */}
                {fav.arabicText && (
                  <p 
                    className="text-sm sm:text-base text-rose-300/90 line-clamp-2 text-right font-medium" 
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    {fav.arabicText}
                  </p>
                )}

                {/* Translation Snippet */}
                {fav.translationText && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 italic">
                    "{fav.translationText}"
                  </p>
                )}

                <div className="flex items-center justify-end text-xs text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform pt-1">
                  <span>{isTamil ? 'ஓதும் பக்கத்திற்குச் செல்க' : 'Tap to read'}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE 3: SPIRITUAL MILESTONES & BADGES (CRISP)
  // =========================================================================
  if (activeSubPage === 'milestones') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'சுயவிவரத்திற்குத் திரும்பு' : 'Back to Profile'}</span>
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
            {isTamil ? 'ஆன்மீக சாதனைகள் & பதக்கங்கள்' : 'Spiritual Milestones & Badges'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isTamil ? 'குர்ஆன் ஓதும் பயணத்தில் நீங்கள் வென்ற சாதனைகள்.' : 'Achievements unlocked along your sacred Quran recitation journey.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {badges.map((badge, idx) => {
            const Icon = badge.icon
            const isUnlocked = badge.progress === '100%'
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-3xl glass-card border transition-all duration-200 flex items-start gap-3.5 ${
                  isUnlocked 
                    ? 'border-outline-variant/30 hover:border-primary/40' 
                    : 'border-outline-variant/15 opacity-75'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUnlocked ? 'bg-surface-container-high border border-outline-variant/40' : 'bg-surface-container/40 border border-outline-variant/10'
                }`}>
                  <Icon className={`w-5 h-5 ${isUnlocked ? badge.color : 'text-outline'}`} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-on-surface truncate">{badge.title}</h3>
                    <span className="text-[10px] text-outline shrink-0 font-medium">{badge.date}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-tight">{badge.desc}</p>
                  <div className="pt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isUnlocked ? 'bg-primary' : 'bg-outline-variant'}`}
                        style={{ width: badge.progress }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-outline">{badge.progress}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE 4: RECITATION ANALYTICS (CRISP)
  // =========================================================================
  if (activeSubPage === 'stats') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'சுயவிவரத்திற்குத் திரும்பு' : 'Back to Profile'}</span>
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
            {isTamil ? 'ஓதுதல் புள்ளிவிவரங்கள்' : 'Recitation Analytics'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isTamil ? 'உங்கள் ஓதும் தொடர், படித்த வசனங்கள் மற்றும் ஹஸனாத் நன்மைகள்.' : 'Breakdown of your reading consistency, verses read, and accumulated Hasanat rewards.'}
          </p>
        </div>

        {/* 4 KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-3xl glass-card border border-outline-variant/30 text-center space-y-1">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto" />
            <p className="text-xl sm:text-2xl font-bold text-on-surface">{user?.currentStreak || 0}</p>
            <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'தொடர் (நாட்கள்)' : 'Streak (Days)'}</p>
          </div>
          <div className="p-4 rounded-3xl glass-card border border-outline-variant/30 text-center space-y-1">
            <BookOpen className="w-6 h-6 text-primary mx-auto" />
            <p className="text-xl sm:text-2xl font-bold text-on-surface">{user?.pages || 0}</p>
            <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'பக்கங்கள்' : 'Pages Read'}</p>
          </div>
          <div className="p-4 rounded-3xl glass-card border border-outline-variant/30 text-center space-y-1">
            <Award className="w-6 h-6 text-tertiary mx-auto" />
            <p className="text-xl sm:text-2xl font-bold text-tertiary">{user?.verses || 0}</p>
            <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'வசனங்கள்' : 'Ayahs Done'}</p>
          </div>
          <div className="p-4 rounded-3xl glass-card border border-outline-variant/30 text-center space-y-1">
            <Sparkles className="w-6 h-6 text-amber-300 mx-auto" />
            <p className="text-xl sm:text-2xl font-bold text-amber-300">{(user?.hasanat || 0).toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'ஹஸனாத் புள்ளிகள்' : 'Hasanat Pts'}</p>
          </div>
        </div>

        {/* Hasanat Calculation Formula Card */}
        <div className="p-5 rounded-3xl glass-card border border-primary/30 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{isTamil ? 'ஹஸனாத் கணக்கீட்டு முறை' : 'Hasanat Reward Formula'}</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isTamil 
              ? 'நபி (ஸல்) அவர்கள் கூறினார்கள்: "அல்லாஹ்வின் வேதத்திலிருந்து ஓர் எழுத்தை ஓதுபவருக்கு ஒரு நன்மை உண்டு. அந்த நன்மை பத்து மடங்காக்கப்படும்." (திர்மிதி 2910)' 
              : 'Prophet Muhammad ﷺ said: "Whoever recites a letter from the Book of Allah will have one good deed, and that deed will be multiplied tenfold." (Tirmidhi 2910)'}
          </p>
          <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs font-mono">
            <span className="text-outline">{isTamil ? 'எழுத்துக்கள் × 10' : 'Letter Count × 10'}</span>
            <span className="font-bold text-primary">= {isTamil ? 'ஹஸனாத் புள்ளிகள்' : 'Earned Hasanat Points'}</span>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // SUB-PAGE 5: ACCOUNT & SECURITY MANAGEMENT (CRISP)
  // =========================================================================
  if (activeSubPage === 'account') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'சுயவிவரத்திற்குத் திரும்பு' : 'Back to Profile'}</span>
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
            {isTamil ? 'கணக்கு & பாதுகாப்பு' : 'Account & Security'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isTamil ? 'உங்கள் சுயவிவரம் மற்றும் கிளவுட் ஒத்திசைவு அமைப்புகள்.' : 'Manage authentication, synced profile, and recitation data.'}
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/40 overflow-hidden flex items-center justify-center shrink-0">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-on-surface-variant" />
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-on-surface block">{user?.name || (isTamil ? 'முஸ்லிம் பயனர்' : 'Muslim Seeker')}</span>
              <span className="text-xs text-outline">{user?.email || (user?.isGuest ? (isTamil ? 'விருந்தினர் கணக்கு' : 'Guest User') : 'No email')}</span>
            </div>
          </div>

          {/* Guest Sign In CTA */}
          {user?.isGuest && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-primary block">
                  {isTamil ? 'சாதனங்களுக்கிடையே ஒத்திசைக்க' : 'Sync Across Devices'}
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  {isTamil ? 'Google மூலம் உள்நுழைந்து தரவை பாதுகாக்கவும்.' : 'Sign in with Google to backup your streaks & bookmarks.'}
                </p>
              </div>
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full primary-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isTamil ? 'Google உள்நுழைவு' : 'Sign In with Google'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Data & Reset Actions */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-outline uppercase tracking-wider px-2 font-label-caps">
            {isTamil ? 'தரவு & தனியுரிமை' : 'Data & Privacy'}
          </h2>
          <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden p-4 space-y-3 shadow-sm">
            {/* Reset Stats to Zero */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container/50 border border-outline-variant/20">
              <div>
                <span className="text-xs font-bold text-on-surface block">
                  {isTamil ? 'ஓதும் முன்னேற்றத்தை மீட்டமை' : 'Reset Recitation Progress'}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {isTamil ? 'தொடர் மற்றும் புள்ளிகளை 0 ஆக மாற்றும்' : 'Reset reading counters, streak, and Hasanat points to 0'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowResetStatsModal(true)}
                className="px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 hover:border-amber-500/50 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isTamil ? 'மீட்டமை' : 'Reset to Zero'}</span>
              </button>
            </div>

            {/* Log Out */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container/50 border border-outline-variant/20">
              <div>
                <span className="text-xs font-bold text-on-surface block">
                  {isTamil ? 'வெளியேறு' : 'Sign Out'}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {isTamil ? 'இந்த சாதனத்திலிருந்து அமர்வை முடிக்க' : 'Log out of your session on this device'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 hover:border-primary/50 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                <span>{isLoggingOut ? (isTamil ? 'வெளியேறுகிறது...' : 'Signing out...') : (isTamil ? 'வெளியேறு' : 'Sign Out')}</span>
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <div>
                <span className="text-xs font-bold text-rose-400 block">
                  {isTamil ? 'கணக்கை நீக்கு' : 'Delete Account'}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {isTamil ? 'சுயவிவரம் மற்றும் கிளவுட் பதிவுகளை நிரந்தரமாக நீக்க' : 'Permanently delete your profile and synced data'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isTamil ? 'கணக்கை நீக்கு' : 'Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reset Stats Confirmation Modal */}
        {showResetStatsModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-outline-variant/40 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold font-h2 text-on-surface">
                  {isTamil ? 'அனைத்து புள்ளிவிவரங்களையும் மீட்டமைக்கவா?' : 'Reset All Stats to Zero?'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTamil ? 'இது உங்கள் ஹஸனாத், வசனங்கள் மற்றும் தொடரை மீட்டமைக்கும்.' : 'This will reset your Hasanat points, verses, pages, and streaks to zero.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetStatsModal(false)}
                  disabled={isResetting}
                  className="flex-1 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition cursor-pointer"
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleResetStats}
                  disabled={isResetting}
                  className="flex-1 py-2.5 rounded-full bg-amber-500 text-gray-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-400 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isResetting ? (isTamil ? 'மீட்டமைக்கிறது...' : 'Resetting...') : (isTamil ? 'ஆம், மீட்டமை' : 'Yes, Reset Stats')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-rose-500/40 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold font-h2 text-rose-400">
                  {isTamil ? 'கணக்கை நிரந்தரமாக நீக்கவா?' : 'Permanently Delete Account?'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTamil ? 'உங்கள் புக்மார்க்குகள், தொடர் மற்றும் சாதனைகள் அனைத்தும் அழிக்கப்படும்.' : 'All your bookmarks, reading streaks, Hasanat, and progress will be permanently erased.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition cursor-pointer"
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-500 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isDeletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isDeletingAccount ? (isTamil ? 'நீக்குகிறது...' : 'Deleting...') : (isTamil ? 'ஆம், நீக்கு' : 'Delete Forever')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // MAIN PROFILE DIRECTORY MENU (CRISP & MODERN)
  // =========================================================================
  return (
    <div className="space-y-6 max-w-5xl w-full mx-auto pb-24 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">
          {isTamil ? 'ஆன்மீக சுயவிவரம்' : 'My Spiritual Profile'}
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
          {isTamil ? 'உங்கள் குர்ஆன் ஓதுதல் பயணம், புக்மார்க்குகள் மற்றும் சாதனைகள்.' : 'Your personal Quran reading journey, saved bookmarks, and spiritual progress.'}
        </p>
      </div>

      {/* User Hero Banner */}
      <div className="p-6 sm:p-7 rounded-3xl glass-card border border-outline-variant/30 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-md">
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-surface-container-high border-2 border-primary/50 overflow-hidden shrink-0 flex items-center justify-center shadow-xl">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-on-surface-variant" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-h1 text-on-surface">
              {user?.name || (isTamil ? 'முஸ்லிம் பயனர்' : 'Muslim Seeker')}
            </h2>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface self-center sm:self-auto transition shadow-sm"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>{isTamil ? 'அமைப்புகள்' : 'App Settings'}</span>
            </Link>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            {user?.email || (user?.isGuest ? (isTamil ? 'விருந்தினர் கணக்கு (ஒத்திசைக்கப்படவில்லை)' : 'Guest Mode (Unsynced)') : '')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2 text-xs">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {isTamil ? 'இணைந்தது' : 'Joined'} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'August 2026'}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/30 text-tertiary font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> {(user?.hasanat || 0).toLocaleString()} {isTamil ? 'நன்மைகள்' : 'Hasanat'}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Stats Quick Bar (Click to open Stats Sub-Page) */}
      <div 
        onClick={() => setActiveSubPage('stats')}
        className="grid grid-cols-3 gap-3 cursor-pointer group"
        title="View full recitation analytics"
      >
        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-outline-variant/30 group-hover:border-primary/40 transition text-center shadow-sm">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1" />
          <p className="text-lg sm:text-xl font-bold text-on-surface">{user?.currentStreak || 0} {isTamil ? 'நாட்கள்' : 'Days'}</p>
          <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'தொடர்' : 'Streak'}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-outline-variant/30 group-hover:border-primary/40 transition text-center shadow-sm">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg sm:text-xl font-bold text-on-surface">{user?.pages || 0}</p>
          <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'பக்கங்கள்' : 'Pages Read'}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-outline-variant/30 group-hover:border-primary/40 transition text-center shadow-sm">
          <Award className="w-5 h-5 text-tertiary mx-auto mb-1" />
          <p className="text-lg sm:text-xl font-bold text-tertiary">{user?.verses || 0}</p>
          <p className="text-[10px] sm:text-xs text-outline">{isTamil ? 'வசனங்கள்' : 'Ayahs'}</p>
        </div>
      </div>

      {/* 🌟 RESPONSIVE 2-COLUMN GRID ON DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* GROUP 1: SPIRITUAL REPOSITORY */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-outline uppercase tracking-wider px-2 font-label-caps">
            {isTamil ? 'ஆன்மீக சேகரிப்புகள்' : 'Spiritual Repository'}
          </h2>
          <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
            {/* 1. Saved Bookmarks */}
            <div
              onClick={() => setActiveSubPage('bookmarks')}
              className="p-4 sm:p-4.5 hover:bg-surface-container/60 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {isTamil ? 'சேமிக்கப்பட்ட புக்மார்க்குகள்' : 'Saved Bookmarks'}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {bookmarks.length > 0 
                      ? `${bookmarks.length} ${isTamil ? 'சேமிப்புகள்' : 'Saved Items'}`
                      : (isTamil ? 'சேமிப்புகள் எதுவும் இல்லை' : 'No bookmarks saved yet')
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bookmarks.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {bookmarks.length}
                  </span>
                )}
                <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition" />
              </div>
            </div>

            {/* 2. Favorite Verses & Hadiths */}
            <div
              onClick={() => setActiveSubPage('favorites')}
              className="p-4 sm:p-4.5 hover:bg-surface-container/60 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {isTamil ? 'விருப்பமான வசனங்கள் & ஹதீஸ்கள்' : 'Favorite Verses & Hadiths'}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {favorites.length > 0 
                      ? `${favorites.length} ${isTamil ? 'விருப்பங்கள்' : 'Cherished Items'}`
                      : (isTamil ? 'விருப்பங்கள் எதுவும் இல்லை' : 'No favorites saved yet')
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {favorites.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                    {favorites.length}
                  </span>
                )}
                <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-rose-400 transition" />
              </div>
            </div>

            {/* 3. Spiritual Milestones */}
            <div
              onClick={() => setActiveSubPage('milestones')}
              className="p-4 sm:p-4.5 hover:bg-surface-container/60 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-tertiary shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {isTamil ? 'ஆன்மீக சாதனைகள் & பதக்கங்கள்' : 'Spiritual Milestones & Badges'}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {badges.filter(b => b.progress === '100%').length}/5 {isTamil ? 'பதக்கங்கள் வெல்லப்பட்டுள்ளன' : 'Badges Unlocked'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition" />
            </div>

            {/* 4. Recitation Analytics */}
            <div
              onClick={() => setActiveSubPage('stats')}
              className="p-4 sm:p-4.5 hover:bg-surface-container/60 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {isTamil ? 'ஓதுதல் புள்ளிவிவரங்கள்' : 'Recitation Analytics'}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {user?.currentStreak || 0} {isTamil ? 'நாள் தொடர்' : 'day streak'} • {(user?.hasanat || 0).toLocaleString()} {isTamil ? 'நன்மைகள்' : 'Hasanat'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition" />
            </div>
          </div>
        </div>

        {/* GROUP 2: ACCOUNT & PREFERENCES */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-outline uppercase tracking-wider px-2 font-label-caps">
            {isTamil ? 'கணக்கு & விருப்பத்தேர்வுகள்' : 'Account & Preferences'}
          </h2>
          <div className="rounded-3xl glass-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
            {/* Account Management */}
            <div
              onClick={() => setActiveSubPage('account')}
              className="p-4 sm:p-4.5 hover:bg-surface-container/60 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {isTamil ? 'கணக்கு & பாதுகாப்பு' : 'Account & Security'}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {user?.isGuest ? (isTamil ? 'விருந்தினர் முறை' : 'Guest Mode') : (isTamil ? 'Google கணக்கு' : 'Google Authenticated')}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition" />
            </div>

            {/* Quick Link to Settings */}
            <Link
              to="/settings"
              className="p-4 sm:p-4.5 hover:bg-surface-container/60 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shrink-0 group-hover:scale-105 transition-transform">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {isTamil ? 'பயன்பாட்டு அமைப்புகள்' : 'App Settings'}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {isTamil ? 'தீம், எழுத்துருக்கள், மொழிபெயர்ப்பு & இலக்குகள்' : 'Theme, fonts, translations & goals'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
