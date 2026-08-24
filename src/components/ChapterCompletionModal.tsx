import React, { useEffect, useState } from 'react'
import { 
  Sparkles, 
  Flame, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Share2, 
  X, 
  Check
} from 'lucide-react'
import { triggerGoldenConfetti, triggerStarBurst, triggerSideCannons } from '../lib/confetti'
import { formatDurationHuman, type JuzProgressResult } from '../lib/hasanatEngine'
import { useI18nStore } from '../lib/i18n'
import { useAuthStore } from '../store/useAuthStore'
import { SURAH_METADATA } from '../lib/quranMetadata'

interface ChapterCompletionModalProps {
  isOpen: boolean
  surahNumber: number
  surahName: string
  surahNameTa?: string
  arabicName: string
  totalAyahs: number
  sessionHasanat: number
  sessionDurationSeconds: number
  juzProgress: JuzProgressResult
  onContinueNextChapter: () => void
  onFinishSession: () => void
  onClose: () => void
}

export const ChapterCompletionModal: React.FC<ChapterCompletionModalProps> = ({
  isOpen,
  surahNumber,
  surahName,
  surahNameTa,
  arabicName,
  totalAyahs,
  sessionHasanat,
  sessionDurationSeconds,
  juzProgress,
  onContinueNextChapter,
  onFinishSession,
  onClose,
}) => {
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const user = useAuthStore((state) => state.user)
  const [copiedShare, setCopiedShare] = useState(false)

  // Fire Golden Confetti & Starburst upon modal opening
  useEffect(() => {
    if (isOpen) {
      triggerGoldenConfetti()
      setTimeout(() => triggerStarBurst(0.5, 0.4), 300)
      setTimeout(() => triggerSideCannons(), 700)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isLastQuranSurah = surahNumber >= 114
  const nextSurahNum = surahNumber + 1
  const nextSurahMeta = SURAH_METADATA.find((s) => s.number === nextSurahNum)

  const handleShareMilestone = () => {
    const text = isTamil
      ? `🎉 அல்ஹம்துலில்லாஹ்! நான் Deenly செயலியில் அத்தியாயம் ${surahNumber}: ${surahNameTa || surahName} (${arabicName}) முழுமையாக ஓதி முடித்தேன்!\n🌟 ஈட்டிய நன்மைகள்: +${sessionHasanat.toLocaleString()} ஹஸனாத் புள்ளிகள்\n⏱️ ஓதிய நேரம்: ${formatDurationHuman(sessionDurationSeconds)}\n📖 வசனங்கள்: ${totalAyahs} வசனங்கள்\n\nநீங்களும் இணையுங்கள்: https://deenly-three.vercel.app`
      : `🎉 Alhamdulillah! I just completed Surah ${surahNumber}: ${surahName} (${arabicName}) on Deenly!\n🌟 Hasanat Earned: +${sessionHasanat.toLocaleString()} Rewards\n⏱️ Time Spent: ${formatDurationHuman(sessionDurationSeconds)}\n📖 Verses Recited: ${totalAyahs} Ayahs\n\nStart your journey: https://deenly-three.vercel.app`

    navigator.clipboard.writeText(text)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-amber-500/50 bg-surface-container-high/95 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.6)] ring-2 ring-amber-500/20 text-on-surface text-center space-y-5 animate-spring-up overflow-hidden">
        
        {/* Ambient Top Glow Halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-amber-400/25 via-primary/20 to-emerald-400/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Icon Top-Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer z-10"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Golden Animated Medallion & Rosette */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center pt-2">
          {/* Rotating Glowing Star Halo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-emerald-400/30 to-purple-500/30 rounded-full animate-[spin_12s_linear_infinite] blur-md" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-xl border-2 border-amber-300 font-extrabold transform hover:scale-105 transition-transform">
            <span className="text-3xl filter drop-shadow">✨</span>
          </div>

          <span className="absolute -bottom-1 px-3 py-0.5 rounded-full bg-slate-900 border border-amber-400 text-amber-400 font-bold text-[10px] uppercase tracking-widest shadow-md">
            {isTamil ? 'அத்தியாயம் நிறைவு' : 'Khatam Surah'}
          </span>
        </div>

        {/* 2. Surah Calligraphy & Titles */}
        <div className="space-y-1 pt-1">
          <p className="text-2xl sm:text-3xl font-bold font-arabic text-primary drop-shadow-sm" dir="rtl">
            {arabicName}
          </p>
          <h3 className="text-lg sm:text-xl font-extrabold font-h1 text-on-surface">
            {isTamil 
              ? `அத்தியாயம் ${surahNumber}: ${surahNameTa || surahName} நிறைவடைந்தது!` 
              : `Surah ${surahNumber}: ${surahName} Completed!`}
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">
            {isTamil 
              ? `${totalAyahs} வசனங்களை நீங்கள் முழுமையாக ஓதி முடித்துள்ளீர்கள். மாஷா அல்லாஹ்!` 
              : `You have successfully recited all ${totalAyahs} Ayahs. MashaAllah!`}
          </p>
        </div>

        {/* 3. Recitation Summary Metrics Matrix */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/30 text-left">
          {/* Hasanat Points Earned */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline flex items-center gap-1 font-label-caps">
              <Sparkles className="w-3 h-3 text-tertiary" />
              <span>{isTamil ? 'ஹஸனாத்' : 'Hasanat'}</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-tertiary">
              +{sessionHasanat.toLocaleString()}
            </p>
          </div>

          {/* Time Spent */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline flex items-center gap-1 font-label-caps">
              <Clock className="w-3 h-3 text-primary" />
              <span>{isTamil ? 'நேரம்' : 'Duration'}</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-on-surface">
              {formatDurationHuman(sessionDurationSeconds)}
            </p>
          </div>

          {/* Streak Active */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline flex items-center gap-1 font-label-caps">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{isTamil ? 'தொடர்' : 'Streak'}</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-amber-400">
              {user?.currentStreak || 1} {isTamil ? 'நாட்கள்' : 'Days'}
            </p>
          </div>
        </div>

        {/* 4. Juz Milestone Line */}
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-between text-xs text-on-surface font-semibold">
          <span className="flex items-center gap-1.5 text-primary">
            <BookOpen className="w-4 h-4" />
            <span>{isTamil ? `ஜுஸ் ${juzProgress.juzNumber} நிலை` : `Juz ${juzProgress.juzNumber} Progress`}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-[11px]">
            {juzProgress.percent.toFixed(1)}% {isTamil ? 'நிறைவு' : 'Completed'}
          </span>
        </div>

        {/* 5. Authentic Prophetic Du'a upon completing good deeds */}
        <div className="p-3 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-primary" dir="rtl">
            الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ
          </p>
          <p className="text-[10px] text-on-surface-variant italic">
            {isTamil 
              ? '"எந்த ஓர் இறைவனின் அருளால் நற்செயல்கள் முழுமையடைகின்றனவோ அந்த அல்லாஹ்வுக்கே புகழனைத்தும்."' 
              : '"All praise is for Allah, by whose favor all good deeds are accomplished."'}
          </p>
        </div>

        {/* 6. Action Control Buttons */}
        <div className="space-y-2 pt-1">
          {!isLastQuranSurah ? (
            <button
              onClick={onContinueNextChapter}
              className="w-full py-3.5 px-5 rounded-2xl primary-gradient-btn text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>
                {isTamil 
                  ? `அடுத்த அத்தியாயத்திற்குச் செல்க (${nextSurahNum}. ${nextSurahMeta?.nameTa || nextSurahMeta?.name})` 
                  : `Advance to Surah ${nextSurahNum}: ${nextSurahMeta?.name}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
              👑 {isTamil ? 'முழு புனித திருக்குர்ஆன் கத்ம் முடிந்தது!' : 'Full Holy Quran Khatam Completed!'}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Share Milestone */}
            <button
              onClick={handleShareMilestone}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isTamil ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  <span>{isTamil ? 'பகிர்' : 'Share Milestone'}</span>
                </>
              )}
            </button>

            {/* Finish & View Dashboard */}
            <button
              onClick={onFinishSession}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
              <span>{isTamil ? 'ஓதி முடித்தேன் (முகப்பு)' : "I'm Done (Dashboard)"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
