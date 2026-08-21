import React, { useState, useEffect, useRef } from 'react'
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
  Loader2
} from 'lucide-react'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { quranApi } from '../lib/quranApi'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import type { SurahDetail, Ayah } from '../types/quran'

type FilterType = 'all' | 'meccan' | 'medinan'

export const QuranScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setCurrentPosition = useReadingStore((state) => state.setCurrentPosition)

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
  
  // Audio & Display
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null)
  const [translationLanguage, setTranslationLanguage] = useState<'en' | 'ta'>(
    user?.preferredTranslation === 'tamil' ? 'ta' : 'en'
  )
  const fontSize = user?.arabicFontSize || 28
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

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
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
      setPlayingAyahIndex(null)
    }

    quranApi
      .getSurah(selectedSurahNumber, ['en', 'ta'])
      .then((data) => {
        if (isMounted) {
          setSurahData(data)
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
  }, [selectedSurahNumber, activeHighlightAyah])

  // Filter Surahs list
  const filteredSurahs = SURAH_METADATA.filter((surah) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.arabicName.includes(searchQuery) ||
      surah.number.toString() === searchQuery.trim()

    if (!matchesSearch) return false

    if (filterType === 'meccan') return surah.revelationType === 'Meccan'
    if (filterType === 'medinan') return surah.revelationType === 'Medinan'

    return true
  })

  // Handle Surah Select
  const handleSelectSurah = (surahNum: number) => {
    setSelectedSurahNumber(surahNum)
    setSearchParams({ surah: surahNum.toString() })
    setVerseSearchInput('')
    setActiveHighlightAyah(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Back to All Chapters
  const handleBackToChapters = () => {
    setSelectedSurahNumber(null)
    setSearchParams({})
    setVerseSearchInput('')
    setActiveHighlightAyah(null)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    }
  }

  // Handle Verse Search & Jump
  const handleVerseSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verseSearchInput.trim() || !currentSurahMeta) return

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
  const handleToggleAyahAudio = (ayah: Ayah, index: number) => {
    if (playingAyahIndex === index && isPlayingAudio) {
      audioRef.current?.pause()
      setIsPlayingAudio(false)
      return
    }

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
    } else {
      audioRef.current.src = audioUrl
    }

    audioRef.current.onended = () => {
      setIsPlayingAudio(false)
      setPlayingAyahIndex(null)
    }

    audioRef.current.play()
    setIsPlayingAudio(true)
    setPlayingAyahIndex(index)
  }

  // Copy Ayah to Clipboard
  const handleCopyAyah = (ayah: Ayah) => {
    const text = `${ayah.arabicText}\n\n"${ayah.translations[translationLanguage] || ayah.translations.en}"\n\n[Surah ${selectedSurahNumber}:${ayah.verseNumberInSurah}]`
    navigator.clipboard.writeText(text)
    setCopiedAyahId(ayah.verseNumberInSurah)
    setTimeout(() => setCopiedAyahId(null), 2000)
  }

  // Launch Focused 1-Verse Reader
  const handleOpenFocusedReader = (surahNum: number, ayahNum: number = 1) => {
    setCurrentPosition(surahNum, ayahNum)
    navigate(`/reading?surah=${surahNum}&ayah=${ayahNum}`)
  }

  const currentSurahMeta = selectedSurahNumber
    ? SURAH_METADATA.find((s) => s.number === selectedSurahNumber)
    : null

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================================= */}
      {/* VIEW 1: ALL 114 CHAPTERS OVERVIEW (SURAH DIRECTORY)                       */}
      {/* ========================================================================= */}
      {!selectedSurahNumber ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-label-caps">
                <BookOpen className="w-4 h-4" />
                <span>Quran</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface mt-1">
                Quran
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
                Browse all 114 Surahs, search verses, or recite with audio recitation.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs">
                <span className="font-bold text-primary">114</span>
                <span className="text-on-surface-variant">Surahs</span>
                <span className="text-outline">•</span>
                <span className="font-bold text-tertiary">6,236</span>
                <span className="text-on-surface-variant">Ayahs</span>
                <span className="text-outline">•</span>
                <span className="font-bold text-secondary">30</span>
                <span className="text-on-surface-variant">Juz</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Surah name, number (e.g. 18, Kahf, Cow)..."
                  className="w-full bg-surface-container/80 border border-outline-variant/40 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-surface-container/60 p-1 rounded-2xl border border-outline-variant/30 overflow-x-auto shrink-0">
                {(
                  [
                    { id: 'all', label: 'All (114)' },
                    { id: 'meccan', label: 'Meccan (86)' },
                    { id: 'medinan', label: 'Medinan (28)' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                      filterType === tab.id
                        ? 'bg-primary-container text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 114 Surahs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => handleSelectSurah(surah.number)}
                className="p-4 rounded-2xl glass-card border border-outline-variant/30 hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:scale-[1.01] hover:shadow-lg flex items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Surah Number Icon Badge */}
                  <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-bold text-xs text-on-surface group-hover:border-primary group-hover:text-primary transition shrink-0 shadow-sm">
                    {surah.number}
                  </div>

                  {/* Name & Details */}
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition truncate">
                      {surah.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {surah.englishNameTranslation}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-outline">
                      <span className={`px-1.5 py-0.5 rounded-md border ${
                        surah.revelationType === 'Meccan'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}>
                        {surah.revelationType}
                      </span>
                      <span>{surah.numberOfAyahs} Ayahs</span>
                    </div>
                  </div>
                </div>

                {/* Arabic Script */}
                <div className="text-right shrink-0">
                  <span className="font-noto-serif text-lg md:text-xl font-bold text-primary-fixed-dim group-hover:text-primary transition block">
                    {surah.arabicName}
                  </span>
                  <span className="text-[10px] text-outline mt-0.5 block">
                    Juz {surah.startJuz}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredSurahs.length === 0 && (
            <div className="text-center py-12 glass-card rounded-3xl border border-outline-variant/30 p-6 space-y-3">
              <Search className="w-8 h-8 text-outline mx-auto" />
              <p className="text-sm font-semibold text-on-surface">No chapters found</p>
              <p className="text-xs text-on-surface-variant">Try searching by Surah name or number.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-full primary-gradient-btn text-white text-xs font-semibold transition mt-2 cursor-pointer"
              >
                View All 114 Chapters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* ========================================================================= */
        /* VIEW 2: WHOLE CHAPTER / ALL VERSES WITH JUMP TO VERSE OPTION              */
        /* ========================================================================= */
        <div className="space-y-6 animate-fade-in">
          {/* Top Sticky Header with Back Button and Quick Controls */}
          <div className="sticky top-16 z-30 glass-nav border-b border-outline-variant/30 -mx-4 md:-mx-6 px-4 md:px-6 py-3.5 flex items-center justify-between gap-3 shadow-md backdrop-blur-xl">
            {/* Back Button */}
            <button
              onClick={handleBackToChapters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-bold hover:border-primary transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Chapters</span>
            </button>

            {/* Action Buttons: Language toggle & Focused Mode */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => setTranslationLanguage(translationLanguage === 'en' ? 'ta' : 'en')}
                className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold text-primary hover:border-primary transition cursor-pointer"
                title="Toggle translation between English and Tamil"
              >
                {translationLanguage === 'ta' ? 'தமிழ்' : 'English'}
              </button>

              {/* Enter Focused 1-Verse Mode */}
              {selectedSurahNumber && (
                <button
                  onClick={() => handleOpenFocusedReader(selectedSurahNumber, activeHighlightAyah || 1)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full primary-gradient-btn text-white text-xs font-semibold shadow-md hover:scale-105 transition cursor-pointer"
                  title="Read 1 verse at a time with Hasanat points"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Focus Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* Chapter Header Banner with Jump To Verse Form (Identical to Hadith Jump) */}
          {currentSurahMeta && (
            <div className="p-6 rounded-3xl cosmic-gradient border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-bold uppercase font-label-caps">
                    Surah {currentSurahMeta.number} • {currentSurahMeta.revelationType}
                  </span>
                  <span className="text-xs text-outline font-mono">Juz {currentSurahMeta.startJuz}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-h2 text-on-surface mt-1 flex items-center gap-2.5">
                  <span>{currentSurahMeta.name}</span>
                  <span className="font-noto-serif text-primary-fixed-dim text-lg sm:text-xl">({currentSurahMeta.arabicName})</span>
                </h2>
                <p className="text-xs text-outline">
                  {currentSurahMeta.englishNameTranslation} • Showing {currentSurahMeta.numberOfAyahs} verses in this chapter
                </p>
              </div>

              {/* Jump To Verse Form */}
              <form onSubmit={handleVerseSearchSubmit} className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={currentSurahMeta.numberOfAyahs}
                  placeholder="Verse #..."
                  value={verseSearchInput}
                  onChange={(e) => setVerseSearchInput(e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl primary-gradient-btn text-white text-xs font-semibold shadow-sm hover:scale-105 transition cursor-pointer"
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
                    className="px-2.5 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-outline hover:text-on-surface text-xs transition cursor-pointer"
                    title="Clear highlight"
                  >
                    ✕
                  </button>
                )}
              </form>
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
                  <p className="font-noto-serif text-2xl md:text-3xl text-primary-fixed-dim drop-shadow-sm">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2 italic">
                    In the Name of Allah, the Most Gracious, the Most Merciful
                  </p>
                </div>
              )}

              {/* Verses List */}
              <div className="space-y-4">
                {surahData.ayahs.map((ayah, index) => {
                  const isHighlighted = activeHighlightAyah === ayah.verseNumberInSurah
                  const isCurrentlyPlaying = playingAyahIndex === index && isPlayingAudio

                  return (
                    <div
                      key={ayah.verseNumberInSurah}
                      id={`ayah-${ayah.verseNumberInSurah}`}
                      className={`p-5 md:p-6 rounded-3xl transition-all duration-300 border ${
                        isHighlighted
                          ? 'bg-primary-container/20 border-primary shadow-[0_0_30px_rgba(124,58,237,0.4)] ring-2 ring-primary/80 scale-[1.01]'
                          : 'glass-card border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
                      }`}
                    >
                      {/* Ayah Top Bar: Number badge, Hasanat, and Actions */}
                      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-outline-variant/20">
                        {/* Number Badge & Highlight Indicator */}
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                            isHighlighted
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'bg-surface-container-high border-outline-variant/40 text-on-surface'
                          }`}>
                            {ayah.verseNumberInSurah}
                          </div>
                          <span className="text-xs text-outline font-medium">
                            {currentSurahMeta?.name} : {ayah.verseNumberInSurah}
                          </span>
                          {isHighlighted && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-bold animate-pulse">
                              Active Verse
                            </span>
                          )}
                        </div>

                        {/* Right Tools: Hasanat badge & Audio button & Focus Reader link */}
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/40 text-tertiary font-bold text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>+{ayah.hasanatValue} pts</span>
                          </span>

                          {/* Play Verse Audio */}
                          <button
                            onClick={() => handleToggleAyahAudio(ayah, index)}
                            className={`p-2 rounded-full border transition cursor-pointer ${
                              isCurrentlyPlaying
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface'
                            }`}
                            title="Play verse recitation by Mishary Rashid Alafasy"
                          >
                            {isCurrentlyPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
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

                      {/* Arabic Verse Text */}
                      <div className="text-right py-2 select-text">
                        <p
                          className="font-noto-serif text-right text-on-surface leading-[2.2] tracking-wide"
                          style={{ fontSize: `${fontSize}px` }}
                          dir="rtl"
                        >
                          {ayah.arabicText}
                        </p>
                      </div>

                      {/* Translation Text */}
                      <div className="pt-4 border-t border-outline-variant/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-outline font-label-caps tracking-wider">
                          {translationLanguage === 'ta' ? 'தமிழ் மொழிபெயர்ப்பு (பாகவி)' : 'Sahih International'}
                        </span>
                        <p className="text-sm md:text-base text-on-surface leading-relaxed font-normal">
                          {ayah.translations[translationLanguage] ||
                            ayah.translations.en ||
                            'Translation loading...'}
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
    </div>
  )
}
