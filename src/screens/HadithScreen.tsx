import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  BookOpen, 
  Search, 
  ArrowLeft, 
  Share2, 
  Check, 
  Loader2, 
  ChevronRight, 
  ShieldCheck, 
  Bookmark
} from 'lucide-react'
import { hadithApi, type HadithChapter, type HadithItem } from '../lib/hadithApi'
import { HADITH_BOOKS, type HadithBook } from '../lib/hadithData'
import { useAuthStore } from '../store/useAuthStore'
import { useBookmarkStore } from '../store/useBookmarkStore'
import { useReadingStore } from '../store/useReadingStore'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { useI18nStore } from '../lib/i18n'

type ViewMode = 'books' | 'chapters' | 'hadiths'
type LanguageMode = 'english' | 'tamil' | 'dual'

export const HadithScreen: React.FC = () => {
  const [searchParams] = useSearchParams()
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const user = useAuthStore((state) => state.user)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)
  const defaultLang: LanguageMode = user?.preferredTranslation === 'tamil' || appLanguage === 'ta' ? 'tamil' : 'english'

  // Unified Bookmark Store
  const isHadithBookmarked = useBookmarkStore((state) => state.isHadithBookmarked)
  const toggleHadithBookmark = useBookmarkStore((state) => state.toggleHadithBookmark)

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('books')
  const [selectedBook, setSelectedBook] = useState<HadithBook>(HADITH_BOOKS[0])
  const [selectedChapter, setSelectedChapter] = useState<HadithChapter | null>(null)

  // Data state
  const [chapters, setChapters] = useState<HadithChapter[]>([])
  const [hadiths, setHadiths] = useState<HadithItem[]>([])
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [isLoadingHadiths, setIsLoadingHadiths] = useState(false)

  // Filter & Search
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [chapterSearchQuery, setChapterSearchQuery] = useState('')
  const [hadithJumpQuery, setHadithJumpQuery] = useState('')
  const [highlightedHadithNumber, setHighlightedHadithNumber] = useState<number | null>(null)

  // Display options
  const [languageMode, setLanguageMode] = useState<LanguageMode>(defaultLang)
  const effectiveLanguageMode: LanguageMode = appLanguage === 'ta' ? 'tamil' : languageMode
  const [copiedHadithId, setCopiedHadithId] = useState<number | null>(null)

  const storeFontSize = useReadingStore((state) => state.fontSize)
  const arabicFontSize = storeFontSize || user?.arabicFontSize || 28
  const hadithRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Deep linking from bookmarks or search params
  useEffect(() => {
    const bookParam = searchParams.get('book')
    const chapterParam = searchParams.get('chapter')
    const hadithParam = searchParams.get('hadith')

    if (bookParam) {
      const foundBook = HADITH_BOOKS.find((b) => b.id === bookParam) || HADITH_BOOKS[0]
      setSelectedBook(foundBook)

      hadithApi.getChapters(foundBook.id).then((chapterList) => {
        setChapters(chapterList)

        if (chapterParam) {
          const chapNum = parseInt(chapterParam, 10)
          const foundChap = chapterList.find((c) => c.chapterNumber === chapNum) || chapterList[0]
          if (foundChap) {
            setSelectedChapter(foundChap)
            setViewMode('hadiths')
            setIsLoadingHadiths(true)

            hadithApi.getChapterHadiths(foundBook.id, foundChap.chapterNumber).then((hList) => {
              setHadiths(hList)
              setIsLoadingHadiths(false)

              if (hadithParam) {
                const hNum = parseInt(hadithParam, 10)
                setHighlightedHadithNumber(hNum)
                setHadithJumpQuery(hNum.toString())
                setTimeout(() => {
                  const targetEl = hadithRefs.current.get(hNum)
                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }, 400)
              }
            })
            return
          }
        }
        setViewMode('chapters')
      })
    }
  }, [searchParams])

  // Handle Book Selection
  const handleSelectBook = async (book: HadithBook) => {
    setSelectedBook(book)
    setSelectedChapter(null)
    setViewMode('chapters')
    setIsLoadingChapters(true)
    setChapterSearchQuery('')

    try {
      const chapterList = await hadithApi.getChapters(book.id)
      setChapters(chapterList)
    } finally {
      setIsLoadingChapters(false)
    }
  }

  // Handle Chapter Selection
  const handleSelectChapter = async (chapter: HadithChapter) => {
    setSelectedChapter(chapter)
    setViewMode('hadiths')
    setIsLoadingHadiths(true)
    setHadithJumpQuery('')
    setHighlightedHadithNumber(null)

    try {
      const list = await hadithApi.getChapterHadiths(selectedBook.id, chapter.chapterNumber)
      setHadiths(list)
    } finally {
      setIsLoadingHadiths(false)
    }
  }

  // Filtered Books
  const filteredBooks = useMemo(() => {
    if (!bookSearchQuery.trim()) return HADITH_BOOKS
    const q = bookSearchQuery.toLowerCase()
    return HADITH_BOOKS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.arabicName.includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    )
  }, [bookSearchQuery])

  // Filtered Chapters (Supports Chapter Title, Arabic Title, Chapter Number, or Hadith Number in Interval)
  const filteredChapters = useMemo(() => {
    if (!chapterSearchQuery.trim()) return chapters
    const q = chapterSearchQuery.toLowerCase().trim()
    const numQ = parseInt(q, 10)

    return chapters.filter((c) => {
      // 1. Match Chapter number
      if (c.chapterNumber.toString() === q) return true
      // 2. Match English or Arabic title
      if (c.title.toLowerCase().includes(q)) return true
      if (c.arabicTitle && c.arabicTitle.includes(q)) return true
      // 3. Match Hadith number within chapter interval
      if (!isNaN(numQ) && c.firstHadith != null && c.lastHadith != null) {
        if (numQ >= c.firstHadith && numQ <= c.lastHadith) return true
      }
      return false
    })
  }, [chapters, chapterSearchQuery])

  // Jump to specific Hadith within chapter
  const handleJumpToHadith = (e: React.FormEvent) => {
    e.preventDefault()
    const targetNum = parseInt(hadithJumpQuery.trim(), 10)
    if (isNaN(targetNum)) return

    const targetEl = hadithRefs.current.get(targetNum)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedHadithNumber(targetNum)
      setTimeout(() => setHighlightedHadithNumber(null), 4000)
    }
  }

  // Copy Hadith Text
  const handleCopyHadith = (h: HadithItem) => {
    let translation = ''
    if (languageMode === 'tamil' && h.tamilText) {
      translation = h.tamilText
    } else if (languageMode === 'dual' && h.tamilText) {
      translation = `[English]: ${h.englishText}\n\n[தமிழ்]: ${h.tamilText}`
    } else {
      translation = h.englishText
    }

    const text = `[${selectedBook.name} - Hadith #${h.hadithNumber}]\n\n${h.arabicText}\n\n"${translation}"\n\n— Via Deenly Islamic Companion`
    navigator.clipboard.writeText(text)
    setCopiedHadithId(h.hadithNumber)
    setTimeout(() => setCopiedHadithId(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* ========================================================================= */}
      {/* SCREEN LEVEL 1: THE 6 MAJOR BOOKS (KUTUB AL-SITTAH) DIRECTORY             */}
      {/* ========================================================================= */}
      {viewMode === 'books' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl cosmic-gradient border border-outline-variant/30 relative overflow-hidden shadow-xl">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-wider font-label-caps uppercase">
                  {appLanguage === 'ta' ? 'அல்-குதுப் அல்-சித்தா' : 'Kutub al-Sittah'}
                </span>
                <span className="text-xs text-tertiary font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {appLanguage === 'ta' ? 'நம்பகமான நபிமொழித் தொகுப்புகள்' : 'Authentic Collections'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-h1 text-on-surface">
                {appLanguage === 'ta' ? 'ஆறு முக்கிய நபிமொழி நூல்கள்' : 'The Six Major Books of Hadith'}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                {appLanguage === 'ta' 
                  ? 'நபி (ஸல்) அவர்களின் சொல், செயல் மற்றும் அங்கீகாரங்களை அரபு மூலம் மற்றும் தமிழ் மொழிபெயர்ப்புடன் வாசியுங்கள்.' 
                  : 'Explore the verified words, actions, and approvals of the Prophet Muhammad (ﷺ) with authentic Arabic text and English & Tamil translations.'}
              </p>
            </div>

            {/* Quick Arabic Calligraphy */}
            <div className="text-right shrink-0 opacity-85 hidden md:block">
              <p className="font-noto-serif text-2xl lg:text-3xl text-primary-fixed-dim" dir="rtl">
                كُتُبُ السِّتَّةِ النَّبَوِيَّة
              </p>
              <p className="text-[11px] text-outline mt-1 font-medium">Sahih Bukhari, Muslim, Tirmidhi & Sunan</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder={appLanguage === 'ta' ? 'நபிமொழி நூல்கள், ஆசிரியர்கள் அல்லது தலைப்புகளைத் தேடுக...' : 'Search Hadith books, authors, or topics...'}
              value={bookSearchQuery}
              onChange={(e) => setBookSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition shadow-sm"
            />
          </div>

          {/* 6 Major Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleSelectBook(book)}
                className="p-6 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4 shadow-md hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
              >
                {/* Decorative Top Pill & Arabic Title */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface-container-high text-primary border border-outline-variant/30 font-bold uppercase tracking-wider font-label-caps">
                      {appLanguage === 'ta' ? (book.gradeTa ? book.gradeTa.split(' ')[0] : book.grade.split(' ')[0]) : book.grade.split(' ')[0]}
                    </span>
                    <h2 className="text-lg font-bold text-on-surface group-hover:text-primary transition mt-2 font-h2">
                      {appLanguage === 'ta' ? (book.nameTa || book.name) : book.name}
                    </h2>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      {appLanguage === 'ta' ? (book.authorTa || book.author) : book.author}
                    </p>
                  </div>

                  <span className="font-noto-serif text-lg text-primary-fixed-dim shrink-0 opacity-80" dir="rtl">
                    {book.arabicName}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-outline line-clamp-2 leading-relaxed">
                  {appLanguage === 'ta' ? (book.descriptionTa || book.description) : book.description}
                </p>

                {/* Footer Badges & Action */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-mono">
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container text-outline">
                      {book.totalChapters} {appLanguage === 'ta' ? 'அத்தியாயங்கள்' : 'Ch.'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container text-tertiary font-bold">
                      {book.totalHadiths.toLocaleString()} {appLanguage === 'ta' ? 'ஹதீஸ்கள்' : 'Hadiths'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>{appLanguage === 'ta' ? 'வாசிக்க' : 'Read'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN LEVEL 2: CHAPTERS INDEX OF THE SELECTED BOOK                       */}
      {/* ========================================================================= */}
      {viewMode === 'chapters' && (
        <div className="space-y-6 animate-fade-in">
          {/* Breadcrumb & Book Header */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setViewMode('books')}
              className="inline-flex items-center gap-2 text-xs font-bold text-outline hover:text-primary transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{appLanguage === 'ta' ? 'அனைத்து நபிமொழி நூல்களுக்கும் திரும்புக' : 'Back to All Hadith Books'}</span>
            </button>

            <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase font-label-caps">
                    {appLanguage === 'ta' ? (selectedBook.gradeTa || selectedBook.grade) : selectedBook.grade}
                  </span>
                  <span className="text-xs text-outline">{selectedBook.authorDeath}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-h1 text-on-surface mt-1">
                  {appLanguage === 'ta' ? (selectedBook.nameTa || selectedBook.name) : selectedBook.name}
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {appLanguage === 'ta' ? (selectedBook.descriptionTa || selectedBook.description) : selectedBook.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-noto-serif text-2xl text-primary-fixed-dim" dir="rtl">
                  {selectedBook.arabicName}
                </span>
                <p className="text-xs text-tertiary font-bold font-mono mt-1">
                  {chapters.length || selectedBook.totalChapters} {appLanguage === 'ta' ? 'அத்தியாயங்கள்' : 'Chapters'} • {selectedBook.totalHadiths.toLocaleString()} {appLanguage === 'ta' ? 'ஹதீஸ்கள்' : 'Hadiths'}
                </p>
              </div>
            </div>
          </div>

          {/* Chapter Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder={appLanguage === 'ta' ? `${selectedBook.nameTa || selectedBook.name} அத்தியாயங்களைத் தேடுக...` : `Search chapters in ${selectedBook.name} (e.g. Revelation, Belief, Prayer)...`}
              value={chapterSearchQuery}
              onChange={(e) => setChapterSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition shadow-sm"
            />
          </div>

          {/* Chapters Grid */}
          {isLoadingChapters ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-on-surface-variant">
                {appLanguage === 'ta' ? `${selectedBook.nameTa || selectedBook.name} அத்தியாயங்கள் ஏற்றப்படுகின்றன...` : `Loading chapters of ${selectedBook.name}...`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredChapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch)}
                  className="p-4 sm:p-5 rounded-2xl bg-surface-container/70 border border-outline-variant/30 hover:border-primary/60 hover:bg-surface-container transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-xs font-mono font-bold text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition">
                      {ch.chapterNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition truncate">
                        {ch.title}
                      </h3>
                      {ch.arabicTitle && (
                        <p className="font-noto-serif text-xs text-primary-fixed-dim/80 truncate" dir="rtl">
                          {ch.arabicTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {ch.firstHadith != null && ch.lastHadith != null ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/25 text-primary font-mono font-bold group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                          {appLanguage === 'ta'
                            ? ch.firstHadith === ch.lastHadith
                              ? `ஹதீஸ் #${ch.firstHadith}`
                              : `ஹதீஸ் ${ch.firstHadith} – ${ch.lastHadith}`
                            : ch.firstHadith === ch.lastHadith
                              ? `Hadith #${ch.firstHadith}`
                              : `Hadiths ${ch.firstHadith} – ${ch.lastHadith}`}
                        </span>
                        {ch.hadithCount && ch.hadithCount > 1 && (
                          <span className="text-[10px] text-outline mt-0.5 font-mono hidden sm:inline">
                            {ch.hadithCount} {appLanguage === 'ta' ? 'நபிமொழிகள்' : 'traditions'}
                          </span>
                        )}
                      </div>
                    ) : ch.hadithCount ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-xl bg-surface-container-high text-outline font-mono font-bold">
                        {ch.hadithCount} {appLanguage === 'ta' ? 'ஹதீஸ்கள்' : 'hadiths'}
                      </span>
                    ) : null}
                    <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN LEVEL 3: CHAPTER HADITHS STREAM (ARABIC + ENGLISH + TAMIL)         */}
      {/* ========================================================================= */}
      {viewMode === 'hadiths' && selectedChapter && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Breadcrumb & Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
            <button
              type="button"
              onClick={() => setViewMode('chapters')}
              className="inline-flex items-center gap-2 text-xs font-bold text-outline hover:text-primary transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {appLanguage === 'ta' 
                  ? `${selectedBook.nameTa || selectedBook.name} அத்தியாயங்களுக்குத் திரும்புக` 
                  : `Back to ${selectedBook.name} Chapters`}
              </span>
            </button>

            {/* Translation Language Selector */}
            {appLanguage === 'en' ? (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container border border-outline-variant/30 self-start sm:self-auto shadow-sm">
                <button
                  type="button"
                  onClick={() => setLanguageMode('english')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    languageMode === 'english'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode('tamil')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    languageMode === 'tamil'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode('dual')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    languageMode === 'dual'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Dual (EN + தமிழ்)
                </button>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary shadow-sm">
                தமிழ் மொழிபெயர்ப்பு
              </div>
            )}
          </div>

          {/* Chapter Header Banner */}
          <div className="p-6 rounded-3xl cosmic-gradient border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-bold uppercase font-label-caps">
                  {appLanguage === 'ta' 
                    ? `${selectedBook.nameTa || selectedBook.name} • அத்தியாயம் ${selectedChapter.chapterNumber}` 
                    : `${selectedBook.name} • Chapter ${selectedChapter.chapterNumber}`}
                </span>
                {selectedChapter.firstHadith != null && selectedChapter.lastHadith != null && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono font-bold">
                    {appLanguage === 'ta'
                      ? selectedChapter.firstHadith === selectedChapter.lastHadith
                        ? `ஹதீஸ் #${selectedChapter.firstHadith}`
                        : `ஹதீஸ் ${selectedChapter.firstHadith} – ${selectedChapter.lastHadith}`
                      : selectedChapter.firstHadith === selectedChapter.lastHadith
                        ? `Hadith #${selectedChapter.firstHadith}`
                        : `Hadiths ${selectedChapter.firstHadith} – ${selectedChapter.lastHadith}`}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-h2 text-on-surface mt-1">
                {selectedChapter.title}
              </h2>
              {selectedChapter.arabicTitle && (
                <p className="font-noto-serif text-sm text-primary-fixed-dim" dir="rtl">
                  {selectedChapter.arabicTitle}
                </p>
              )}
              <p className="text-xs text-outline">
                {appLanguage === 'ta' 
                  ? `இந்த அத்தியாயத்தில் உள்ள ${hadiths.length || selectedChapter.hadithCount || 0} நபிமொழிகள்` 
                  : `Showing ${hadiths.length || selectedChapter.hadithCount || 0} traditions in this chapter`}
              </p>
            </div>

            {/* Jump To Hadith Form */}
            <form onSubmit={handleJumpToHadith} className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={selectedChapter.firstHadith || 1}
                max={selectedChapter.lastHadith || selectedBook.totalHadiths}
                placeholder={
                  selectedChapter.firstHadith != null && selectedChapter.lastHadith != null
                    ? appLanguage === 'ta'
                      ? `ஹதீஸ் (${selectedChapter.firstHadith}-${selectedChapter.lastHadith})...`
                      : `Hadith (${selectedChapter.firstHadith}-${selectedChapter.lastHadith})...`
                    : appLanguage === 'ta'
                    ? 'ஹதீஸ் எண்...'
                    : 'Hadith #...'
                }
                value={hadithJumpQuery}
                onChange={(e) => setHadithJumpQuery(e.target.value)}
                className="w-36 sm:w-44 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl primary-gradient-btn text-white text-xs font-semibold shadow-sm hover:scale-105 transition cursor-pointer"
              >
                {appLanguage === 'ta' ? 'செல்க' : 'Jump'}
              </button>
            </form>
          </div>

          {/* Hadiths Stream */}
          {isLoadingHadiths ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-on-surface-variant">
                {appLanguage === 'ta' ? 'புனித நபிமொழிகள் ஏற்றப்படுகின்றன...' : 'Loading sacred traditions...'}
              </p>
            </div>
          ) : hadiths.length === 0 ? (
            <div className="p-12 text-center space-y-2 rounded-3xl bg-surface-container/40 border border-outline-variant/20">
              <BookOpen className="w-8 h-8 text-outline mx-auto" />
              <p className="text-sm font-semibold text-on-surface">
                {appLanguage === 'ta' ? 'இந்த அத்தியாயத்தில் ஹதீஸ்கள் எதுவும் கிடைக்கவில்லை' : 'No Hadiths found for this chapter'}
              </p>
              <p className="text-xs text-outline">
                {appLanguage === 'ta' ? 'தயவுசெய்து மற்றொரு அத்தியாயத்தைத் தேர்ந்தெடுக்கவும் அல்லது இணைப்பைச் சரிபார்க்கவும்.' : 'Please select another chapter or check connection.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {hadiths.map((h, idx) => {
                const isHighlighted = highlightedHadithNumber === h.hadithNumber

                return (
                  <div
                    key={h.hadithNumber || idx}
                    ref={(el) => {
                      if (el) hadithRefs.current.set(h.hadithNumber, el)
                    }}
                    className={`p-6 sm:p-8 rounded-3xl glass-card border transition-all duration-300 space-y-5 shadow-lg ${
                      isHighlighted
                        ? 'border-primary ring-2 ring-primary/40 bg-surface-container-high/90 scale-[1.01]'
                        : 'border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    {/* Top Metadata Strip */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-mono font-bold">
                          {appLanguage === 'ta' ? `ஹதீஸ் எண் #${h.hadithNumber}` : `Hadith #${h.hadithNumber}`}
                        </span>

                        <span className="text-[11px] text-outline font-mono">
                          {appLanguage === 'ta' ? `நூல் ${h.referenceBook}, ஹதீஸ் ${h.referenceHadith}` : `Book ${h.referenceBook}, Hadith ${h.referenceHadith}`}
                        </span>

                        {h.grades && h.grades.length > 0 && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase font-label-caps">
                            {h.grades[0].grade}
                          </span>
                        )}
                      </div>

                        {/* Action Tools: Bookmark & Copy */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              toggleHadithBookmark({
                                bookId: selectedBook.id,
                                bookName: selectedBook.name,
                                chapterNumber: selectedChapter?.chapterNumber || 1,
                                chapterTitle: selectedChapter?.title || 'General',
                                hadithNumber: h.hadithNumber,
                                arabicText: h.arabicText,
                                translationText: effectiveLanguageMode === 'tamil' ? (h.tamilText || h.englishText || '') : (h.englishText || h.tamilText || ''),
                              })
                            }}
                            className={`p-2 rounded-full border transition cursor-pointer ${
                              isHadithBookmarked(selectedBook.id, h.hadithNumber)
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-outline hover:text-on-surface'
                            }`}
                            title={isHadithBookmarked(selectedBook.id, h.hadithNumber) ? (appLanguage === 'ta' ? 'புக்மார்க்கை நீக்குக' : 'Remove Bookmark') : (appLanguage === 'ta' ? 'புக்மார்க் செய்க' : 'Bookmark Hadith')}
                          >
                            <Bookmark className={`w-4 h-4 ${isHadithBookmarked(selectedBook.id, h.hadithNumber) ? 'fill-amber-400' : ''}`} />
                          </button>

                        <button
                          type="button"
                          onClick={() => handleCopyHadith(h)}
                          className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer"
                          title={appLanguage === 'ta' ? 'ஹதீஸை நகலெடுக்க' : 'Copy Hadith'}
                        >
                          {copiedHadithId === h.hadithNumber ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 🌟 ARABIC SCRIPT HIGHLIGHTED WITH ILLUMINATED CARD CONTAINER */}
                    <div className="p-5 sm:p-7 rounded-2xl glass-card border border-primary/30 bg-surface-container-low/80 shadow-md space-y-1 text-right">
                      <p
                        className="text-on-surface leading-[2.3] sm:leading-[2.5] tracking-wide select-text drop-shadow-sm font-medium"
                        style={{ fontSize: `${arabicFontSize}px`, fontFamily: arabicFontFamily }}
                        dir="rtl"
                      >
                        {h.arabicText}
                      </p>
                    </div>

                    {/* 🌟 TRANSLATION CONTAINER (ENGLISH / TAMIL / DUAL) */}
                    <div className="space-y-4 pt-1">
                      {/* English Translation */}
                      {(effectiveLanguageMode === 'english' || effectiveLanguageMode === 'dual' || !h.tamilText) && (
                        <div className="space-y-1">
                          {effectiveLanguageMode === 'dual' && (
                            <span className="text-[10px] uppercase font-bold text-outline font-label-caps tracking-wider block">
                              English Translation (Sahih International / Darussalam)
                            </span>
                          )}
                          <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                            {h.englishText}
                          </p>
                        </div>
                      )}

                      {/* Tamil Translation */}
                      {(effectiveLanguageMode === 'tamil' || effectiveLanguageMode === 'dual') && h.tamilText && (
                        <div className="space-y-1 pt-1 border-t border-outline-variant/10">
                          {effectiveLanguageMode === 'dual' && (
                            <span className="text-[10px] uppercase font-bold text-tertiary font-label-caps tracking-wider block">
                              தமிழ் மொழிபெயர்ப்பு (Tamil Translation)
                            </span>
                          )}
                          <p className="font-sans text-sm sm:text-base text-on-surface leading-relaxed font-normal">
                            {h.tamilText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
