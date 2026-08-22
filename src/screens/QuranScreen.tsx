import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Search, 
  ArrowLeft, 
  Play, 
  Pause, 
  Sparkles, 
  Share2, 
  Check, 
  Maximize2, 
  Loader2,
  Bookmark,
  Heart
} from 'lucide-react'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { quranApi } from '../lib/quranApi'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import { useBookmarkStore } from '../store/useBookmarkStore'
import { useFavoriteStore } from '../store/useFavoriteStore'
import { useQuranAudioStore } from '../store/useQuranAudioStore'
import { QuranChapterAudioPlayer } from '../components/QuranChapterAudioPlayer'
import type { SurahDetail, Ayah } from '../types/quran'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { 
  getTranslationMeta, 
  type EnglishTranslationKey, 
  type TamilTranslationKey,
  DEFAULT_ENGLISH_TRANSLATION,
  DEFAULT_TAMIL_TRANSLATION
} from '../lib/quranTranslations'

type FilterType = 'all' | 'meccan' | 'medinan'

export const QuranScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const storeFontSize = useReadingStore((state) => state.fontSize)
  const storeFontStyle = useReadingStore((state) => state.fontStyle)
  const storeEnglishTranslation = useReadingStore((state) => state.englishTranslation)
  const storeTamilTranslation = useReadingStore((state) => state.tamilTranslation)
  const fontSize = storeFontSize || user?.arabicFontSize || 28
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || storeFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const currentEnglishTranslation: EnglishTranslationKey = user?.englishTranslation || storeEnglishTranslation || DEFAULT_ENGLISH_TRANSLATION
  const currentTamilTranslation: TamilTranslationKey = user?.tamilTranslation || storeTamilTranslation || DEFAULT_TAMIL_TRANSLATION

  const setCurrentPosition = useReadingStore((state) => state.setCurrentPosition)
  const isQuranBookmarked = useBookmarkStore((state) => state.isQuranBookmarked)
  const toggleQuranBookmark = useBookmarkStore((state) => state.toggleQuranBookmark)
  const isQuranFavorite = useFavoriteStore((state) => state.isQuranFavorite)
  const toggleQuranFavorite = useFavoriteStore((state) => state.toggleQuranFavorite)

  // Quran Audio Store for Continuous Chapter Audio & Spotify-like background playback
  const audioStore = useQuranAudioStore()

  // URL State: Check if a specific Surah is selected in query string (e.g. ?surah=18)
  const surahParam = searchParams.get('surah')
  const ayahParam = searchParams.get('ayah')
  const initialSurah = surahParam ? parseInt(surahParam, 10) : null
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(initialSurah)

  // Explorer State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')

  // Chapter Verses State
  const [surahData, setSurahData] = useState<SurahDetail | null>(null)
  const [isLoadingVerses, setIsLoadingVerses] = useState(false)
  const [verseSearchInput, setVerseSearchInput] = useState('')
  const [activeHighlightAyah, setActiveHighlightAyah] = useState<number | null>(
    ayahParam ? parseInt(ayahParam, 10) : null
  )
  
  // Translation & Display
  const [translationLanguage, setTranslationLanguage] = useState<'en' | 'ta'>(
    user?.preferredTranslation === 'tamil' ? 'ta' : 'en'
  )
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null)

  // Sync selectedSurahNumber with searchParams
  useEffect(() => {
    if (surahParam) {
      const num = parseInt(surahParam, 10)
      if (num >= 1 && num <= 114) {
        setSelectedSurahNumber(num)
      }
    } else {
      setSelectedSurahNumber(null)
    }

    if (ayahParam) {
      const aNum = parseInt(ayahParam, 10)
      if (!isNaN(aNum)) {
        setActiveHighlightAyah(aNum)
        setVerseSearchInput(aNum.toString())
      }
    }
  }, [surahParam, ayahParam])

  // Load Chapter Verses when selectedSurahNumber changes
  useEffect(() => {
    if (!selectedSurahNumber) {
      setSurahData(null)
      return
    }

    let isMounted = true
    setIsLoadingVerses(true)

    quranApi
      .getSurah(selectedSurahNumber, ['en', 'ta', currentEnglishTranslation, currentTamilTranslation])
      .then((data) => {
        if (isMounted) {
          setSurahData(data)
          audioStore.setSurahData(data)
          setIsLoadingVerses(false)

          // If there is an active ayah to highlight, scroll to it after rendering
          if (activeHighlightAyah) {
            setTimeout(() => {
              const el = document.getElementById(`ayah-${activeHighlightAyah}`)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }, 300)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load Surah detail:', err)
        if (isMounted) {
          setIsLoadingVerses(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedSurahNumber, activeHighlightAyah, currentEnglishTranslation, currentTamilTranslation])

  // Filter Surahs list
  const filteredSurahs = SURAH_METADATA.filter((surah) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString() === searchQuery.trim()

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'meccan' && surah.revelationType === 'Meccan') ||
      (filterType === 'medinan' && surah.revelationType === 'Medinan')

    return matchesSearch && matchesFilter
  })

  // Navigation handlers
  const handleSelectSurah = (surahNumber: number) => {
    setSelectedSurahNumber(surahNumber)
    setActiveHighlightAyah(null)
    setVerseSearchInput('')
    setSearchParams({ surah: surahNumber.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToChapters = () => {
    setSelectedSurahNumber(null)
    setSurahData(null)
    setActiveHighlightAyah(null)
    setSearchParams({})
  }

  const handleOpenFocusedReader = (surahNum: number, ayahNum: number) => {
    setCurrentPosition(surahNum, ayahNum)
    navigate(`/reading?surah=${surahNum}&ayah=${ayahNum}`)
  }

  // Handle Jump to Verse in this chapter
  const handleVerseSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSurahMeta || !verseSearchInput.trim()) return

    const parsedNum = parseInt(verseSearchInput.trim(), 10)
    if (isNaN(parsedNum) || parsedNum < 1 || parsedNum > currentSurahMeta.numberOfAyahs) {
      alert(`Please enter a valid verse number between 1 and ${currentSurahMeta.numberOfAyahs}`)
      return
    }

    setActiveHighlightAyah(parsedNum)
    setSearchParams({ surah: currentSurahMeta.number.toString(), ayah: parsedNum.toString() })

    const el = document.getElementById(`ayah-${parsedNum}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Handle Audio Play/Pause for a specific verse
  const handleToggleAyahAudio = (ayah: Ayah) => {
    if (!selectedSurahNumber || !surahData) return

    const isThisAyahActive =
      audioStore.isPlaying &&
      audioStore.surahNumber === selectedSurahNumber &&
      audioStore.currentAyahNumberInSurah === ayah.verseNumberInSurah

    if (isThisAyahActive) {
      audioStore.togglePlay()
    } else {
      audioStore.playSingleAyah(selectedSurahNumber, ayah.verseNumberInSurah, surahData)
    }
  }

  // Copy Ayah to Clipboard
  const handleCopyAyah = (ayah: Ayah) => {
    const text = `${ayah.arabicText}\n\n"${ayah.translations[translationLanguage] || ayah.translations.en}"\n\n[Surah ${selectedSurahNumber}:${ayah.verseNumberInSurah}]`
    navigator.clipboard.writeText(text)
    setCopiedAyahId(ayah.verseNumberInSurah)
    setTimeout(() => setCopiedAyahId(null), 2000)
  }

  const currentSurahMeta = selectedSurahNumber
    ? SURAH_METADATA.find((s) => s.number === selectedSurahNumber)
    : null

  const isCurrentSurahContinuousPlaying =
    audioStore.isPlaying && audioStore.surahNumber === selectedSurahNumber

  return (
    <div className={`space-y-6 max-w-7xl mx-auto animate-fade-in ${audioStore.isPlayerVisible ? 'pb-44 sm:pb-36' : 'pb-24'}`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {selectedSurahNumber && (
              <button
                onClick={handleBackToChapters}
                className="p-2 rounded-full glass-card hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition cursor-pointer"
                title="Back to all Surahs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-h1 text-on-surface">
              {selectedSurahNumber && currentSurahMeta
                ? `${currentSurahMeta.number}. ${currentSurahMeta.name}`
                : 'Quran Explorer'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {selectedSurahNumber && currentSurahMeta
              ? `${currentSurahMeta.englishNameTranslation} • ${currentSurahMeta.numberOfAyahs} Verses • ${currentSurahMeta.revelationType}`
              : 'Read, explore, and listen to continuous full-chapter audio recitations.'}
          </p>
        </div>

        {/* Translation Language Toggle & Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setTranslationLanguage(translationLanguage === 'en' ? 'ta' : 'en')}
            className="px-3.5 py-1.5 rounded-full glass-card border border-outline-variant/40 text-xs font-bold text-primary hover:border-primary transition cursor-pointer shadow-sm flex items-center gap-1.5"
            title="Switch translation language (English / Tamil)"
          >
            <span>{translationLanguage === 'ta' ? 'தமிழ்' : 'EN'}</span>
            <span className="text-[10px] text-outline font-normal">
              ({translationLanguage === 'ta' ? getTranslationMeta(currentTamilTranslation).name : getTranslationMeta(currentEnglishTranslation).name})
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAPTERS DIRECTORY (WHEN NO SURAH SELECTED)                            */}
      {/* ========================================================================= */}
      {!selectedSurahNumber ? (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Search Surah by name, translation, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-card border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Revelation Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs shrink-0 self-start sm:self-auto">
              {(['all', 'meccan', 'medinan'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition cursor-pointer ${
                    filterType === ft
                      ? 'primary-gradient-btn text-white shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Surahs Grid (114 Chapters) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => handleSelectSurah(surah.number)}
                className="p-5 rounded-3xl glass-card border border-outline-variant/30 hover:border-primary/50 transition duration-200 cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Surah Number Box */}
                  <div className="w-11 h-11 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-bold text-sm text-primary group-hover:scale-105 transition-transform shrink-0">
                    {surah.number}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                        {surah.name}
                      </span>
                      <span className="text-[10px] text-outline font-normal px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 shrink-0">
                        {surah.revelationType}
                      </span>
                    </div>
                    <p className="text-xs text-outline truncate">{surah.englishNameTranslation}</p>
                    <p className="text-[10px] text-tertiary mt-0.5">{surah.numberOfAyahs} Verses</p>
                  </div>
                </div>

                {/* Arabic Calligraphy Name */}
                <div className="text-right shrink-0 pl-2">
                  <span
                    className="text-lg md:text-xl text-on-surface/90 font-bold group-hover:text-primary transition-colors"
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    {surah.arabicName}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredSurahs.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-outline mx-auto stroke-1" />
              <p className="text-sm font-semibold text-on-surface">No chapters found</p>
              <p className="text-xs text-outline">Try checking the spelling or resetting search filters.</p>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. CHAPTER VERSES STREAM (WHEN A SURAH IS SELECTED)                       */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Chapter Quick Action Header Card */}
          {currentSurahMeta && (
            <div className="p-5 sm:p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary font-label-caps">
                    Chapter {currentSurahMeta.number}
                  </span>
                  <span className="text-xs text-outline">•</span>
                  <span className="text-xs text-tertiary">{currentSurahMeta.revelationType}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-h2 text-on-surface flex items-baseline gap-2">
                  <span>{currentSurahMeta.name}</span>
                  <span className="text-primary font-bold" style={{ fontFamily: arabicFontFamily }} dir="rtl">
                    {currentSurahMeta.arabicName}
                  </span>
                </h2>
                <p className="text-xs text-outline">
                  {currentSurahMeta.englishNameTranslation} • Showing {currentSurahMeta.numberOfAyahs} verses in this chapter
                </p>
              </div>

              {/* 🌟 Audio Play Full Chapter & Jump Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Play Full Chapter Continuous Recitation Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCurrentSurahContinuousPlaying) {
                      audioStore.pause()
                    } else {
                      audioStore.playSurah(currentSurahMeta.number, 1)
                    }
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                    isCurrentSurahContinuousPlaying
                      ? 'bg-primary text-white ring-2 ring-primary/60 animate-pulse'
                      : 'primary-gradient-btn text-white hover:scale-105'
                  }`}
                  title="Listen to full continuous chapter audio recitation"
                >
                  {isCurrentSurahContinuousPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Recitation</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Play Full Surah</span>
                    </>
                  )}
                </button>

                {/* Jump To Verse Form */}
                <form onSubmit={handleVerseSearchSubmit} className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={currentSurahMeta.numberOfAyahs}
                    placeholder="Ayah #..."
                    value={verseSearchInput}
                    onChange={(e) => setVerseSearchInput(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-semibold transition cursor-pointer"
                  >
                    Jump
                  </button>
                  {activeHighlightAyah && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveHighlightAyah(null)
                        setVerseSearchInput('')
                      }}
                      className="px-2 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-outline hover:text-on-surface text-xs transition cursor-pointer"
                      title="Clear highlight"
                    >
                      ✕
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Chapter Verses Stream */}
          {isLoadingVerses ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm font-semibold text-on-surface">Loading Sacred Verses...</p>
              <p className="text-xs text-on-surface-variant">Connecting to authentic Uthmani text edition</p>
            </div>
          ) : surahData ? (
            <div className="space-y-6">
              {/* Bismillah Header (Except Surah 9 At-Tawbah) */}
              {selectedSurahNumber !== 9 && (
                <div className="text-center py-6 px-4 rounded-3xl bg-surface-container/50 border border-outline-variant/30 relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                  <p
                    className="text-2xl md:text-3xl text-primary-fixed-dim drop-shadow-sm"
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2 italic">
                    In the Name of Allah, the Most Gracious, the Most Merciful
                  </p>
                </div>
              )}

              {/* Verses List */}
              <div className="space-y-4">
                {surahData.ayahs.map((ayah) => {
                  const isHighlighted = activeHighlightAyah === ayah.verseNumberInSurah
                  const isCurrentlyReciting =
                    audioStore.isPlaying &&
                    audioStore.surahNumber === selectedSurahNumber &&
                    audioStore.currentAyahNumberInSurah === ayah.verseNumberInSurah

                  return (
                    <div
                      key={ayah.verseNumberInSurah}
                      id={`ayah-${ayah.verseNumberInSurah}`}
                      className={`p-5 md:p-6 rounded-3xl transition-all duration-300 border ${
                        isCurrentlyReciting
                          ? 'bg-primary/15 border-primary shadow-[0_0_30px_rgba(124,58,237,0.35)] ring-2 ring-primary/80 scale-[1.01]'
                          : isHighlighted
                          ? 'bg-primary-container/20 border-primary shadow-[0_0_30px_rgba(124,58,237,0.4)] ring-2 ring-primary/80 scale-[1.01]'
                          : 'glass-card border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
                      }`}
                    >
                      {/* Ayah Top Bar: Number badge, Hasanat, and Actions */}
                      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-outline-variant/20">
                        {/* Number Badge & Highlight Indicator */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition ${
                              isCurrentlyReciting
                                ? 'bg-primary text-white shadow-md'
                                : isHighlighted
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-surface-container-high text-primary border border-outline-variant/40'
                            }`}
                          >
                            {ayah.verseNumberInSurah}
                          </div>
                          <span className="text-xs text-outline hidden sm:inline">
                            Surah {selectedSurahNumber}:{ayah.verseNumberInSurah}
                          </span>
                        </div>

                        {/* Hasanat Points & Action Buttons */}
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/40 text-tertiary font-bold text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>+{ayah.hasanatValue} pts</span>
                          </span>

                          {/* 🌟 Play Single Verse Audio Button (Kept & Connected to Global Player) */}
                          <button
                            onClick={() => handleToggleAyahAudio(ayah)}
                            className={`p-2 rounded-full border transition cursor-pointer ${
                              isCurrentlyReciting
                                ? 'bg-primary text-white border-primary shadow-md animate-pulse'
                                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface'
                            }`}
                            title={isCurrentlyReciting ? 'Pause recitation' : 'Play verse recitation by Mishary Rashid Alafasy'}
                          >
                            {isCurrentlyReciting ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* 🌟 Favorite Ayah */}
                          <button
                            onClick={() => {
                              if (!selectedSurahNumber || !currentSurahMeta) return
                              toggleQuranFavorite({
                                surahNumber: selectedSurahNumber,
                                surahName: currentSurahMeta.name,
                                arabicName: currentSurahMeta.arabicName,
                                ayahNumber: ayah.verseNumberInSurah,
                                arabicText: ayah.arabicText,
                                translationText: ayah.translations[translationLanguage] || ayah.translations.en || '',
                              })
                            }}
                            className={`p-2 rounded-full border transition cursor-pointer ${
                              selectedSurahNumber && isQuranFavorite(selectedSurahNumber, ayah.verseNumberInSurah)
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-sm'
                                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-outline hover:text-rose-400'
                            }`}
                            title={selectedSurahNumber && isQuranFavorite(selectedSurahNumber, ayah.verseNumberInSurah) ? 'Remove from Favorites' : 'Add to Favorites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${selectedSurahNumber && isQuranFavorite(selectedSurahNumber, ayah.verseNumberInSurah) ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>

                          {/* 🌟 Bookmark Ayah */}
                          <button
                            onClick={() => {
                              if (!selectedSurahNumber || !currentSurahMeta) return
                              toggleQuranBookmark({
                                surahNumber: selectedSurahNumber,
                                surahName: currentSurahMeta.name,
                                arabicName: currentSurahMeta.arabicName,
                                ayahNumber: ayah.verseNumberInSurah,
                                arabicText: ayah.arabicText,
                                translationText: ayah.translations[translationLanguage] || ayah.translations.en || '',
                              })
                            }}
                            className={`p-2 rounded-full border transition cursor-pointer ${
                              selectedSurahNumber && isQuranBookmarked(selectedSurahNumber, ayah.verseNumberInSurah)
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm'
                                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-outline hover:text-amber-400'
                            }`}
                            title={selectedSurahNumber && isQuranBookmarked(selectedSurahNumber, ayah.verseNumberInSurah) ? 'Remove Bookmark' : 'Bookmark Ayah'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${selectedSurahNumber && isQuranBookmarked(selectedSurahNumber, ayah.verseNumberInSurah) ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>

                          {/* Copy Ayah */}
                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-outline hover:text-on-surface transition cursor-pointer"
                            title="Copy verse and translation"
                          >
                            {copiedAyahId === ayah.verseNumberInSurah ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Jump to Focused Mode */}
                          <button
                            onClick={() => handleOpenFocusedReader(selectedSurahNumber, ayah.verseNumberInSurah)}
                            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-primary hover:text-primary-fixed-dim transition cursor-pointer"
                            title="Recite this verse in Focused 1-Verse Mode"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arabic Verse Text (Uses Selected Font Style) */}
                      <div className="text-right py-2 select-text">
                        <p
                          className="text-right text-on-surface leading-[2.3] tracking-wide"
                          style={{ fontSize: `${fontSize}px`, fontFamily: arabicFontFamily }}
                          dir="rtl"
                        >
                          {ayah.arabicText}
                        </p>
                      </div>

                      {/* Translation Text */}
                      <div className="pt-4 border-t border-outline-variant/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-outline font-label-caps tracking-wider">
                            {translationLanguage === 'ta' 
                              ? `தமிழ் மொழிபெயர்ப்பு (${getTranslationMeta(currentTamilTranslation).name})`
                              : getTranslationMeta(currentEnglishTranslation).name}
                          </span>
                          <span className="text-[10px] text-primary font-medium">
                            {translationLanguage === 'ta'
                              ? getTranslationMeta(currentTamilTranslation).badge
                              : getTranslationMeta(currentEnglishTranslation).badge}
                          </span>
                        </div>
                        <p className="text-sm md:text-base text-on-surface leading-relaxed font-normal">
                          {translationLanguage === 'ta'
                            ? (ayah.translations[currentTamilTranslation] || ayah.translations['ta'] || ayah.translations['ta_baqavi'] || 'மொழிபெயர்ப்பு ஏற்றப்படுகிறது...')
                            : (ayah.translations[currentEnglishTranslation] || ayah.translations['en'] || ayah.translations['en_sahih'] || 'Translation loading...')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-outline">Unable to load Surah details.</p>
              <button
                onClick={handleBackToChapters}
                className="mt-3 px-4 py-2 rounded-full primary-gradient-btn text-white text-xs font-semibold cursor-pointer"
              >
                Return to All Chapters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCKED FULL CHAPTER CONTINUOUS FOOTER AUDIO PLAYER                     */}
      {/* ========================================================================= */}
      <QuranChapterAudioPlayer />
    </div>
  )
}
