import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Award, 
  ChevronRight, 
  Play, 
  Bookmark, 
  Calendar, 
  Check,
  BookMarked
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useReadingStore } from '../store/useReadingStore'
import { SURAH_METADATA } from '../lib/quranMetadata'
import { 
  calculateJuzProgress, 
  calculateKhatmProgress, 
  calculateOverallQuranProgress, 
  formatDurationHuman, 
  getLocalDateString 
} from '../lib/hasanatEngine'

type TimeframeFilter = 'today' | 'week' | 'all'

const DEFAULT_HABITS = [
  { id: 'fajr', name: 'Fajr Prayer', nameTa: 'ஃபஜ்ர் தொழுகை', time: '05:12 AM', category: 'prayer' },
  { id: 'adhkar_morning', name: 'Morning Adhkar', nameTa: 'காலை திக்ருகள்', time: '06:00 AM', category: 'dhikr' },
  { id: 'dhuhr', name: 'Dhuhr Prayer', nameTa: 'ளுஹர் தொழுகை', time: '12:30 PM', category: 'prayer' },
  { id: 'quran', name: 'Read Daily Quran', nameTa: 'தினசரி குர்ஆன் ஓதுதல்', time: 'Daily Target', category: 'quran' },
  { id: 'asr', name: 'Asr Prayer', nameTa: 'அஸர் தொழுகை', time: '03:45 PM', category: 'prayer' },
  { id: 'maghrib', name: 'Maghrib Prayer', nameTa: 'மஃரிப் தொழுகை', time: '06:15 PM', category: 'prayer' },
  { id: 'isha', name: 'Isha Prayer', nameTa: 'இஷா தொழுகை', time: '07:30 PM', category: 'prayer' },
  { id: 'adhkar_evening', name: 'Evening Adhkar', nameTa: 'மாலை திக்ருகள்', time: '08:00 PM', category: 'dhikr' },
]

// 🌟 Daily Rotating Quran Verses (with Arabic, English, and Authentic Tamil Translations)
const DAILY_VERSES = [
  {
    surahNum: 94,
    ayahNum: 5,
    surahName: 'Ash-Sharh',
    surahNameTa: 'அஷ்-ஷர்ஹ்',
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا • إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translationEn: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    translationTa: 'நிச்சயமாக சிரமத்துடன் எளிமை இருக்கிறது. நிச்சயமாக சிரமத்துடன் எளிமை இருக்கிறது.',
  },
  {
    surahNum: 2,
    ayahNum: 152,
    surahName: 'Al-Baqarah',
    surahNameTa: 'அல்-பகரா',
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    translationEn: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    translationTa: 'ஆகவே, என்னை நீங்கள் நினையுங்கள்; நானும் உங்களை நினைப்பேன். எனக்கு நன்றி செலுத்துங்கள்; எனக்கு மாறு செய்யாதீர்கள்.',
  },
  {
    surahNum: 13,
    ayahNum: 28,
    surahName: 'Ar-Ra\'d',
    surahNameTa: 'அர்-ரஃது',
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translationEn: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    translationTa: 'அறிந்து கொள்க! அல்லாஹ்வின் நினைவால் தான் இதயங்கள் அமைதி பெறுகின்றன.',
  },
  {
    surahNum: 65,
    ayahNum: 3,
    surahName: 'At-Talaq',
    surahNameTa: 'அத்-தலாக்',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ',
    translationEn: 'And whoever relies upon Allah - then He is sufficient for him.',
    translationTa: 'எவர் அல்லாஹ்வின் மீது நம்பிக்கை வைக்கிறாரோ அவருக்கு அவன் போதுமானவன்.',
  },
  {
    surahNum: 3,
    ayahNum: 139,
    surahName: 'Ali \'Imran',
    surahNameTa: 'ஆல இம்ரான்',
    arabic: 'وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    translationEn: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.',
    translationTa: 'நீங்கள் மனம் தளர வேண்டாம்; கவலையும் படாதீர்கள்; நீங்கள் உண்மையான நம்பிக்கையாளர்களாக இருந்தால் நீங்களே மேலோங்குவீர்கள்.',
  },
  {
    surahNum: 6,
    ayahNum: 54,
    surahName: 'Al-An\'am',
    surahNameTa: 'அல்-அன்ஆம்',
    arabic: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ ٱلرَّحْمَةَ',
    translationEn: 'Your Lord has decreed upon Himself mercy.',
    translationTa: 'உங்கள் இறைவன் தன் மீது கிருபையைக் கடமையாக்கிக் கொண்டான்.',
  },
  {
    surahNum: 2,
    ayahNum: 186,
    surahName: 'Al-Baqarah',
    surahNameTa: 'அல்-பகரா',
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ',
    translationEn: 'And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    translationTa: 'என்னுடைய அடியார்கள் என்னைப்பற்றி உங்களிடம் கேட்டால், நிச்சயமாக நான் மிக சமீபமாகவே இருக்கின்றேன். என்னை அழைத்தால் நான் அவர்களுக்குப் பதிலளிக்கிறேன்.',
  },
  {
    surahNum: 2,
    ayahNum: 286,
    surahName: 'Al-Baqarah',
    surahNameTa: 'அல்-பகரா',
    arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translationEn: 'Allah does not burden a soul beyond that it can bear.',
    translationTa: 'அல்லாஹ் எந்த ஓர் ஆத்மாவையும் அதன் சக்திக்கு மீறிச் சிரமப்படுத்துவதில்லை.',
  },
  {
    surahNum: 39,
    ayahNum: 53,
    surahName: 'Az-Zumar',
    surahNameTa: 'அஸ்-ஸுமர்',
    arabic: 'قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا',
    translationEn: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins."',
    translationTa: 'தங்களுக்குத் தாமே அநீதி இழைத்துக் கொண்ட என் அடியார்களே! அல்லாஹ்வின் அருளில் நீங்கள் நம்பிக்கை இழக்காதீர்கள்; நிச்சயமாக அல்லாஹ் பாவங்கள் அனைத்தையும் மன்னிக்கிறான்.',
  },
  {
    surahNum: 15,
    ayahNum: 98,
    surahName: 'Al-Hijr',
    surahNameTa: 'அல்-ஹிஜ்ர்',
    arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ ٱلسَّـٰجِدِينَ • وَٱعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ ٱلْيَقِينُ',
    translationEn: 'So exalt [Allah] with praise of your Lord and be of those who prostrate. And worship your Lord until there comes to you the certainty.',
    translationTa: 'ஆகவே, உமது இறைவனைப் புகழ்ந்து துதிப்பீராக! சிரம் பணிவோரில் ஒருவராக இருப்பீராக! உறுதியான மரணம் வரும் வரை உங்கள் இறைவனை வணங்குங்கள்.',
  }
]

// 🌟 Daily Rotating Hadiths (with Arabic, English, and Authentic Tamil Translations)
const DAILY_HADITHS = [
  {
    reference: 'Sahih al-Bukhari 1',
    referenceTa: 'ஸஹீஹ் புகாரி 1',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translationEn: 'Actions are judged by intentions, and every person will get the reward according to what he intended.',
    translationTa: 'செயல்கள் அனைத்தும் எண்ணங்களைப் பொருத்தே அமைகின்றன. ஒவ்வொரு மனிதருக்கும் அவர் எண்ணியதே கிடைக்கிறது.',
  },
  {
    reference: 'Sahih al-Bukhari 5027',
    referenceTa: 'ஸஹீஹ் புகாரி 5027',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translationEn: 'The best among you are those who learn the Quran and teach it to others.',
    translationTa: 'உங்களில் சிறந்தவர் குர்ஆனைக் கற்று, பிறருக்கும் கற்றுக் கொடுப்பவரே ஆவார்.',
  },
  {
    reference: 'Sunan at-Tirmidhi 2910',
    referenceTa: 'திர்மிதி 2910',
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    translationEn: 'Whoever recites a single letter from the Book of Allah will receive ten rewards for it.',
    translationTa: 'அல்லாஹ்வின் வேதத்திலிருந்து ஓர் எழுத்தை ஓதுகிறவருக்கு ஒரு நன்மை உண்டு; அந்த ஒரு நன்மை பத்து நன்மைகளாகப் பெருகும்.',
  },
  {
    reference: 'Sahih Muslim 223',
    referenceTa: 'ஸஹீஹ் முஸ்லிம் 223',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
    translationEn: 'Cleanliness is half of faith, and "Al-hamdulillah" (praise be to Allah) fills the Scale of good deeds.',
    translationTa: 'சுத்தம் ஈமானின் பாதியாகும்; "அல்ஹம்துலில்லாஹ்" நன்மைகளின் தராசை நிரப்பும்.',
  },
  {
    reference: 'Jami` at-Tirmidhi 1956',
    referenceTa: 'திர்மிதி 1956',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    translationEn: 'Smiling in the face of your brother is charity for you.',
    translationTa: 'உன் சகோதரனின் முகத்தைப் பார்த்து நீ புன்னகைப்பதும் உனக்கு ஒரு தர்மமாகும்.',
  },
  {
    reference: 'Sahih al-Bukhari 6407',
    referenceTa: 'ஸஹீஹ் புகாரி 6407',
    arabic: 'كَلِمَتَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ، خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translationEn: 'Two phrases are beloved to the Most Merciful, light on the tongue, heavy on the Scale: "Subhan Allahi wa bihamdihi, Subhan Allahil Azeem".',
    translationTa: 'இரண்டு வாக்கியங்கள் நாவிற்கு எளிதானவை, தராசில் கனமானவை, கருணையாளன் அல்லாஹ்விற்குப் பிரியமானவை: "ஸுப்ஹானல்லாஹி வபிஹம்திஹி, ஸுப்ஹானல்லாஹில் அழீம்".',
  },
  {
    reference: 'Sahih Muslim 2699',
    referenceTa: 'ஸஹீஹ் முஸ்லிம் 2699',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translationEn: 'Whoever travels on a path in search of knowledge, Allah will make easy for him the path to Paradise.',
    translationTa: 'எவர் கல்வியைத் தேடி ஒரு வழியில் செல்கிறாரோ, அவருக்கு அல்லாஹ் சொர்க்கத்தின் பாதையை எளிதாக்குகிறான்.',
  },
  {
    reference: 'Sahih al-Bukhari 13',
    referenceTa: 'ஸஹீஹ் புகாரி 13',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translationEn: 'None of you has complete faith until he loves for his brother what he loves for himself.',
    translationTa: 'தமக்கு விரும்புவதையே தம் சகோதரனுக்கும் விரும்பாத வரை உங்களில் எவரும் முழுமையான இறைநம்பிக்கையாளராக முடியாது.',
  },
  {
    reference: 'Sahih Muslim 782',
    referenceTa: 'ஸஹீஹ் முஸ்லிம் 782',
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translationEn: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
    translationTa: 'நற்செயல்களில் அல்லாஹ்விற்கு மிகவும் விருப்பமானது, குறைவாக இருந்தாலும் தொடர்ந்து செய்யப்படுவதேயாகும்.',
  },
  {
    reference: 'Jami` at-Tirmidhi 1987',
    referenceTa: 'திர்மிதி 1987',
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    translationEn: 'Fear Allah wherever you are, follow up a bad deed with a good one to wipe it out, and behave with good character towards people.',
    translationTa: 'நீங்கள் எங்கிருந்தாலும் அல்லாஹ்வை அஞ்சுங்கள்; ஒரு தவறு நேர்ந்துவிட்டால் தொடர்ந்து ஒரு நன்மை செய்யுங்கள்; மனிதர்களிடம் நற்குணத்துடன் பழகுங்கள்.',
  }
]

export const DashboardScreen: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('today')

  const user = useAuthStore((state) => state.user)
  const dailyHistory = useAuthStore((state) => state.dailyHistory)
  const currentSurahNumber = useReadingStore((state) => state.currentSurahNumber)
  const currentAyahNumber = useReadingStore((state) => state.currentAyahNumber)

  // Language translation preference (English / Tamil)
  const isTamil = user?.preferredTranslation === 'tamil'

  const todayStr = getLocalDateString(new Date())
  const habitStorageKey = `deenly_habits_${user?.id || 'guest'}_${todayStr}`

  // Daily Habits State
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(habitStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(habitStorageKey)
      setCompletedHabitIds(stored ? JSON.parse(stored) : [])
    } catch {
      setCompletedHabitIds([])
    }
  }, [habitStorageKey])

  const toggleHabit = (id: string) => {
    setCompletedHabitIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(habitStorageKey, JSON.stringify(next))
      } catch (err) {
        console.warn('Failed to save habits to localStorage:', err)
      }
      return next
    })
  }

  const habits = DEFAULT_HABITS.map((h) => ({
    ...h,
    completed: completedHabitIds.includes(h.id),
  }))

  // 1. Goal Calculations
  const dailyGoalVerses = user?.dailyGoalVerses || 10
  const todayLog = dailyHistory[todayStr] || {
    hasanat: 0,
    verses: 0,
    timeSeconds: 0,
    pages: 0,
    lastSurah: 1,
    lastAyah: 1,
  }

  const todayVerses = todayLog.verses || 0
  const isDailyGoalMet = todayVerses >= dailyGoalVerses

  // 2. Week Metrics Aggregation (Rolling 7 days)
  let weekHasanat = 0
  let weekVerses = 0
  let weekTimeSeconds = 0
  let weekPages = 0
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const entry = dailyHistory[key]
    if (entry) {
      weekHasanat += entry.hasanat || 0
      weekVerses += entry.verses || 0
      weekTimeSeconds += entry.timeSeconds || 0
      weekPages += entry.pages || 0
    }
  }

  // 3. Selected Timeframe Metrics
  const displayStats = {
    hasanat:
      timeframe === 'today'
        ? todayLog.hasanat
        : timeframe === 'week'
        ? weekHasanat
        : user?.hasanat || 0,
    verses:
      timeframe === 'today'
        ? todayLog.verses
        : timeframe === 'week'
        ? weekVerses
        : user?.verses || 0,
    time:
      timeframe === 'today'
        ? todayLog.timeSeconds
        : timeframe === 'week'
        ? weekTimeSeconds
        : user?.time || 0,
    pages:
      timeframe === 'today'
        ? todayLog.pages
        : timeframe === 'week'
        ? weekPages
        : user?.pages || 0,
  }

  // 4. Weekly Streak Circles (Monday - Sunday of Current Week with Missed Red Outline)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
    const curr = new Date()
    const dayOfWeek = curr.getDay() // 0 = Sun, 1 = Mon ...
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = Mon ... 6 = Sun
    const diff = index - adjustedDay

    const targetDate = new Date()
    targetDate.setDate(curr.getDate() + diff)
    const dateKey = targetDate.toISOString().split('T')[0]
    const rec = dailyHistory[dateKey]
    const versesReadOnDay = rec ? rec.verses : 0
    const isGoalMetOnDay = versesReadOnDay >= dailyGoalVerses || versesReadOnDay > 0
    const isToday = index === adjustedDay
    const isPast = index < adjustedDay
    const isMissed = isPast && !isGoalMetOnDay

    return {
      day: dayName,
      completed: isGoalMetOnDay,
      verses: versesReadOnDay,
      isToday,
      isPast,
      isMissed,
      dayNum: targetDate.getDate(),
    }
  })

  // 5. Sequential Position Calculations
  const lastSurah = user?.lastReadSurah || currentSurahNumber || 1
  const lastAyah = user?.lastReadAyah || currentAyahNumber || 1
  const currentSurahMeta = SURAH_METADATA.find((s) => s.number === lastSurah) || SURAH_METADATA[0]
  const juzProgress = calculateJuzProgress(lastSurah, lastAyah)
  const khatmPercent = calculateKhatmProgress(user?.pages || 0)
  const overallQuranProgress = calculateOverallQuranProgress(lastSurah, lastAyah)

  // 🌟 AUTOMATIC DAILY ROTATION AT MIDNIGHT (DAY OF YEAR DETERMINISTIC INDEX)
  const todayDate = new Date()
  const startOfYear = new Date(todayDate.getFullYear(), 0, 0)
  const diffTime = todayDate.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  const dailyVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length]
  const dailyHadith = DAILY_HADITHS[dayOfYear % DAILY_HADITHS.length]

  const isStartingFresh = lastSurah === 1 && lastAyah === 1

  // Helper to render consistency circle
  const renderCircle = (wd: typeof weekDays[0], i: number) => {
    let circleClass = 'bg-surface-container-highest text-outline'
    let text = wd.dayNum.toString()

    if (wd.completed) {
      circleClass = 'primary-gradient-btn text-white shadow-md'
      text = '✓'
    } else if (wd.isToday) {
      circleClass = 'border-2 border-primary text-primary bg-primary/10 shadow-sm'
    } else if (wd.isMissed) {
      circleClass = 'border-2 border-rose-500 text-rose-400 bg-rose-500/10 shadow-sm'
    }

    return (
      <div key={i} className="flex flex-col items-center gap-1">
        <span className={`text-[10px] font-medium ${wd.isMissed ? 'text-rose-400 font-semibold' : 'text-outline'}`}>
          {wd.day}
        </span>
        <div
          title={
            wd.completed
              ? `Goal achieved (${wd.verses} verses)`
              : wd.isMissed
              ? `Missed on ${wd.day}`
              : wd.isToday
              ? `Today: ${wd.verses}/${dailyGoalVerses} verses`
              : `Upcoming`
          }
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${circleClass}`}
        >
          {text}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto pb-24 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. TOP GREETING HEADER                                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-h1 text-on-surface">
            Assalamu Alaikum, {user?.name?.split(' ')[0] || 'Guest'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {isTamil 
              ? '"நற்செயல்களில் அல்லாஹ்விற்கு மிகவும் விருப்பமானது, குறைவாக இருந்தாலும் தொடர்ந்து செய்யப்படுவதேயாகும்."'
              : '"The most beloved deeds to Allah are those done regularly, even if small."'
            }
          </p>
        </div>

        {/* Date Pill on Desktop */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full glass-card border border-outline-variant/30 text-on-surface-variant self-start">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 📱 MOBILE HERO: WEEKLY CONSISTENCY CIRCLES (TOP) + COMBINED GOAL/JOURNEY */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-4">
        {/* Mobile 7-Day Circular Indicator with Missed Red Outline */}
        <div className="p-4 rounded-3xl glass-card border border-outline-variant/30 shadow-md">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((wd, i) => renderCircle(wd, i))}
          </div>
        </div>

        {/* Mobile Combined Goal + Journey Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] p-6 text-white shadow-xl relative overflow-hidden border border-white/20 space-y-4">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          {/* Top: Goal + Arabic Title */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-label-caps block">
                {isTamil ? 'இலக்கு • தினசரி வசனங்கள்' : 'Goal • Per Day Verses'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {todayVerses} <span className="text-sm font-normal text-white/80">/ {dailyGoalVerses}</span>
                </span>
                <span className="text-xs font-semibold text-white/90">{isTamil ? 'வசனங்கள்' : 'Ayahs'}</span>
              </div>
            </div>

            <span className="font-noto-serif text-3xl text-white/95 shrink-0 font-bold">
              {currentSurahMeta.arabicName}
            </span>
          </div>

          {/* Middle: Surah Name & Progress Slider */}
          <div className="space-y-2 relative z-10 pt-1">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
              <span>
                {currentSurahMeta.number}. {currentSurahMeta.name} | {lastAyah}/{currentSurahMeta.numberOfAyahs}
              </span>
              <span className="text-xs font-medium text-white/80">{currentSurahMeta.englishNameTranslation}</span>
            </div>

            <div className="relative w-full py-1">
              <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(2, overallQuranProgress.percent)}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.95)] border-2 border-[#6d28d9] pointer-events-none transition-all duration-500"
                style={{ left: `calc(${Math.min(97, Math.max(2, overallQuranProgress.percent))}% - 8px)` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-white/95">
              <span>Juz {juzProgress.juzNumber} of 30</span>
              <span>{overallQuranProgress.percent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="relative z-10 pt-1">
            <Link
              to={`/reading?surah=${lastSurah}&ayah=${lastAyah}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-white text-[#6d28d9] hover:bg-white/95 active:scale-[0.99] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#6d28d9]" />
              <span>
                {isStartingFresh 
                  ? (isTamil ? 'அத்தியாயம் 1 இலிருந்து தொடங்கவும்' : 'Start Reading from Chapter 1')
                  : (isTamil ? 'தொடர்ந்து ஓதுக' : 'Continue Reading')
                }
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 🖥️ DESKTOP HERO: EXACT 2-COLUMN SPLIT (100% PRESERVED)                  */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT HERO CARD: CONTINUE RECITATION */}
        <div className="lg:col-span-7 xl:col-span-7 rounded-3xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-white/20 flex flex-col justify-between space-y-5">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          {/* Top Row: Session Tag & Surah Arabic Calligraphy */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-label-caps bg-white/15 px-3 py-1 rounded-full border border-white/20 inline-block">
                {isStartingFresh ? 'Start Quran Journey' : 'Current Reading Session'}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentSurahMeta.number}. {currentSurahMeta.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Ayah {lastAyah} of {currentSurahMeta.numberOfAyahs} • {currentSurahMeta.englishNameTranslation}
              </p>
            </div>

            <span className="font-noto-serif text-3xl sm:text-4xl text-white/90 shrink-0 font-bold">
              {currentSurahMeta.arabicName}
            </span>
          </div>

          {/* Middle Row: Progress Slider with Juz Marker */}
          <div className="space-y-2 relative z-10 pt-1">
            <div className="relative w-full py-1">
              <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(2, overallQuranProgress.percent)}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.95)] border-2 border-[#6d28d9] pointer-events-none transition-all duration-500"
                style={{ left: `calc(${Math.min(97, Math.max(2, overallQuranProgress.percent))}% - 8px)` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-white/95">
              <span>Juz {juzProgress.juzNumber} of 30</span>
              <span title={`${overallQuranProgress.cumulativeVerses} of 6,236 verses completed`}>
                {overallQuranProgress.percent.toFixed(1)}% Whole Quran
              </span>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="relative z-10 pt-1">
            <Link
              to={`/reading?surah=${lastSurah}&ayah=${lastAyah}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-white text-[#6d28d9] hover:bg-white/95 active:scale-[0.99] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#6d28d9]" />
              <span>{isStartingFresh ? 'Start Reading from Chapter 1' : 'Continue Reading'}</span>
            </Link>
          </div>
        </div>

        {/* RIGHT HERO CARD: WEEKLY CONSISTENCY & DAILY GOAL */}
        <div className="lg:col-span-5 xl:col-span-5 p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-xl flex flex-col justify-between space-y-5">
          
          {/* Top Row: Daily Goal Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label-caps block">
                Daily Recitation Target
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {todayVerses} <span className="text-base sm:text-lg font-normal text-on-surface-variant">/ {dailyGoalVerses}</span>
                </span>
                <span className="text-xs font-semibold text-tertiary">Ayahs</span>
              </div>
            </div>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md shrink-0 ${
              isDailyGoalMet
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-primary/15 text-primary border border-primary/30'
            }`}>
              {isDailyGoalMet ? <Check className="w-6 h-6" /> : `${Math.round((todayVerses / dailyGoalVerses) * 100)}%`}
            </div>
          </div>

          {/* 7-Day Consistency Weekdays Row */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider block font-label-caps">
              Weekly Consistency
            </span>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((wd, i) => renderCircle(wd, i))}
            </div>
          </div>

          {/* Motivation Snippet Card */}
          <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>Current streak: <strong className="text-on-surface">{user?.currentStreak || 0} days</strong></span>
            </span>
            <Link to="/settings" className="text-primary font-bold hover:underline text-[11px]">
              Edit Goal →
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SPIRITUAL METRICS COMMAND BAR (4 GLASS METRIC CARDS)                    */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-outline uppercase tracking-wider font-label-caps">
            {isTamil ? 'ஆன்மீக அளவீடுகள்' : 'Spiritual Metrics'}
          </h2>

          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center bg-surface-container/80 p-1 rounded-full border border-outline-variant/30 text-xs">
            {(['today', 'week', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer capitalize ${
                  timeframe === tf
                    ? 'primary-gradient-btn text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tf === 'all' ? (isTamil ? 'முழுவதும்' : 'Lifetime') : tf === 'week' ? (isTamil ? 'வாரம்' : 'Week') : (isTamil ? 'இன்று' : 'Today')}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Streak Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">
                {isTamil ? 'தொடர் நாட்கள்' : 'Streak'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface">
              {user?.currentStreak || 0} <span className="text-xs font-normal text-on-surface-variant">{isTamil ? 'நாட்கள்' : 'days'}</span>
            </p>
            <p className="text-[11px] text-tertiary mt-1 truncate">
              {user?.currentStreak ? `${isTamil ? 'சிறந்த சாதனை' : 'Best'}: ${user?.bestStreak || 0} ${isTamil ? 'நாட்கள்' : 'days'}` : (isTamil ? 'தொடர்ந்து ஓதுங்கள்' : 'Read daily to build streak')}
            </p>
          </div>

          {/* 2. Verses Recited Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">
                {isTamil ? 'ஓதிய வசனங்கள்' : 'Verses Recited'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface">
              {displayStats.verses.toLocaleString()} <span className="text-xs font-normal text-on-surface-variant">{isTamil ? 'வசனம்' : 'ayahs'}</span>
            </p>
            <p className="text-[11px] text-primary-fixed-dim mt-1 truncate">
              {displayStats.pages} {isTamil ? 'பக்கங்கள்' : 'pages'} ({timeframe})
            </p>
          </div>

          {/* 3. Hasanat Points Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">
                {isTamil ? 'ஈட்டிய நன்மைகள்' : 'Hasanat Earned'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-tertiary/15 border border-tertiary/30 flex items-center justify-center text-tertiary">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-tertiary">
              {displayStats.hasanat.toLocaleString()} <span className="text-xs font-normal text-tertiary/70">{isTamil ? 'புள்ளிகள்' : 'pts'}</span>
            </p>
            <p className="text-[11px] text-outline mt-1 truncate">{isTamil ? 'ஓர் எழுத்திற்கு 10 நன்மைகள்' : '10 rewards per Arabic letter'}</p>
          </div>

          {/* 4. Reading Duration Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider font-label-caps">
                {isTamil ? 'ஓதிய நேரம்' : 'Reading Time'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface">
              {formatDurationHuman(displayStats.time)}
            </p>
            <p className="text-[11px] text-secondary mt-1 truncate">
              Juz {juzProgress.juzNumber} ({juzProgress.percent}%)
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 🌟 INSPIRATIONS: VERSE OF THE DAY & HADITH OF THE DAY (BELOW METRICS)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* 📖 VERSE OF THE DAY */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-label-caps">
                <Bookmark className="w-4 h-4" />
                <span>{isTamil ? 'தினசரி திருவசனம்' : 'Verse of the Day'}</span>
              </div>
              <span className="text-[11px] font-semibold text-outline">
                {isTamil ? dailyVerse.surahNameTa : dailyVerse.surahName} {dailyVerse.surahNum}:{dailyVerse.ayahNum}
              </span>
            </div>

            {/* Arabic Script */}
            <p className="font-noto-serif text-lg sm:text-xl text-on-surface text-right leading-relaxed pt-1" dir="rtl">
              {dailyVerse.arabic}
            </p>

            {/* Dynamic Translation (Tamil / English) */}
            <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
              "{isTamil ? dailyVerse.translationTa : dailyVerse.translationEn}"
            </p>
          </div>

          {/* Action Link to Reader */}
          <div className="pt-2">
            <Link
              to={`/reading?surah=${dailyVerse.surahNum}&ayah=${dailyVerse.ayahNum}`}
              className="w-full py-2.5 px-4 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-primary text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{isTamil ? 'முழு அத்தியாயத்தில் ஓதுக' : 'Read in Context'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 📜 HADITH OF THE DAY */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-wider font-label-caps">
                <BookMarked className="w-4 h-4" />
                <span>{isTamil ? 'தினசரி நபிமொழி' : 'Hadith of the Day'}</span>
              </div>
              <span className="text-[11px] font-semibold text-outline">
                {isTamil ? dailyHadith.referenceTa : dailyHadith.reference}
              </span>
            </div>

            {/* Arabic Script */}
            <p className="font-noto-serif text-lg sm:text-xl text-on-surface text-right leading-relaxed pt-1" dir="rtl">
              {dailyHadith.arabic}
            </p>

            {/* Dynamic Translation (Tamil / English) */}
            <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
              "{isTamil ? dailyHadith.translationTa : dailyHadith.translationEn}"
            </p>
          </div>

          {/* Action Link to Hadiths */}
          <div className="pt-2">
            <Link
              to="/hadith"
              className="w-full py-2.5 px-4 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{isTamil ? 'நபிமொழி நூல்களை ஆராய்க' : 'Explore Hadith Collection'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. LOWER SECTION: DAILY ISLAMIC HABITS & KHATM PROGRESS TRACKER           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DAILY ISLAMIC HABITS CHECKLIST (8 COLUMNS ON DESKTOP) */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tertiary" />
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider font-label-caps">
                {isTamil ? 'தினசரி நற்செயல்கள்' : 'Daily Islamic Habits'}
              </h3>
            </div>
            <span className="text-xs text-tertiary font-bold px-2.5 py-0.5 rounded-full bg-tertiary/15">
              {habits.filter((h) => h.completed).length}/{habits.length} {isTamil ? 'நிறைவு' : 'Done'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`p-3 rounded-2xl flex items-center justify-between border cursor-pointer transition ${
                  habit.completed
                    ? 'bg-surface-container-highest/60 border-tertiary/30 text-on-surface'
                    : 'bg-surface-container/60 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {habit.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-tertiary shrink-0" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-outline shrink-0" />
                  )}
                  <div className="truncate">
                    <p className={`text-xs font-semibold truncate ${habit.completed ? 'line-through opacity-70' : 'text-on-surface'}`}>
                      {isTamil ? habit.nameTa : habit.name}
                    </p>
                    <p className="text-[10px] text-outline truncate">{habit.time}</p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-outline border border-outline-variant/30 shrink-0 ml-2">
                  {habit.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KHATM JOURNEY (4 COLUMNS ON DESKTOP) */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-secondary" />
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider font-label-caps">
                {isTamil ? 'குர்ஆன் கத்ம் பயணம்' : 'Khatm Journey'}
              </h3>
            </div>
            <span className="text-xs font-bold text-secondary">{khatmPercent}%</span>
          </div>

          <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(khatmPercent, (user?.pages || 0) > 0 ? 2 : 0)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>{user?.pages || 0} {isTamil ? '/ 604 பக்கங்கள்' : 'of 604 pages'}</span>
            <span className="text-outline">{isTamil ? 'முழு குர்ஆன்' : '604 total'}</span>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
            {isTamil 
              ? 'தினமும் தொடர்ந்து ஓதி புனித குர்ஆனை முழுமையாக நிறைவு செய்யும் ஆன்மீகப் பயணம்.'
              : 'Recite consistently each day to accomplish the sacred milestone of completing the Holy Quran.'
            }
          </p>
        </div>

      </div>

    </div>
  )
}
