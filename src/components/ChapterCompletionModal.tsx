import React, { useEffect } from 'react'
import { 
  ArrowRight, 
  CheckCircle2, 
  X 
} from 'lucide-react'
import { triggerGoldenConfetti, triggerStarBurst, triggerSideCannons } from '../lib/confetti'
import { useI18nStore } from '../lib/i18n'
import { SURAH_METADATA } from '../lib/quranMetadata'

interface ChapterCompletionModalProps {
  isOpen: boolean
  surahNumber: number
  surahName: string
  surahNameTa?: string
  arabicName: string
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
  onContinueNextChapter,
  onFinishSession,
  onClose,
}) => {
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'

  // Fire Golden Confetti & Starburst upon chapter completion
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sleek Minimal Celebratory Dialog Card */}
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl glass-card border border-amber-500/50 bg-surface-container-high/95 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.6)] ring-2 ring-amber-500/20 text-on-surface text-center space-y-6 animate-spring-up overflow-hidden">
        
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

        {/* 1. Golden Animated Medallion & Cheers */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center pt-2">
          {/* Rotating Glowing Star Halo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-emerald-400/30 to-purple-500/30 rounded-full animate-[spin_12s_linear_infinite] blur-md" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-xl border-2 border-amber-300 font-extrabold transform hover:scale-105 transition-transform">
            <span className="text-3xl filter drop-shadow">✨</span>
          </div>

          <span className="absolute -bottom-1 px-3 py-0.5 rounded-full bg-slate-900 border border-amber-400 text-amber-400 font-bold text-[10px] uppercase tracking-widest shadow-md">
            {isTamil ? 'அத்தியாயம் நிறைவு' : 'Chapter Completed'}
          </span>
        </div>

        {/* 2. Chapter Calligraphy & Completed Cheer Title */}
        <div className="space-y-1.5 pt-1">
          <p className="text-3xl sm:text-4xl font-bold font-arabic text-primary drop-shadow-sm" dir="rtl">
            {arabicName}
          </p>
          <h3 className="text-xl sm:text-2xl font-extrabold font-h1 text-on-surface">
            {isTamil 
              ? `அத்தியாயம் ${surahNumber}: ${surahNameTa || surahName} நிறைவடைந்தது! 🎉` 
              : `Chapter ${surahNumber}: ${surahName} Completed! 🎉`}
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            {isTamil 
              ? 'மாஷா அல்லாஹ்! அல்ஹம்துலில்லாஹ்.' 
              : 'MashaAllah! Alhamdulillah.'}
          </p>
        </div>

        {/* 3. Action Control Buttons */}
        <div className="space-y-2.5 pt-2">
          {!isLastQuranSurah ? (
            <button
              onClick={onContinueNextChapter}
              className="w-full py-3.5 px-5 rounded-2xl primary-gradient-btn text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>
                {isTamil 
                  ? `அடுத்த அத்தியாயம் (${nextSurahNum}. ${nextSurahMeta?.nameTa || nextSurahMeta?.name})` 
                  : `Continue to Chapter ${nextSurahNum}: ${nextSurahMeta?.name}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
              👑 {isTamil ? 'முழு புனித திருக்குர்ஆன் கத்ம் முடிந்தது!' : 'Full Holy Quran Khatam Completed!'}
            </div>
          )}

          <button
            onClick={onFinishSession}
            className="w-full py-3 px-4 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs sm:text-sm font-bold text-on-surface flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-tertiary" />
            <span>{isTamil ? 'ஓதி முடித்தேன் (முகப்பு)' : "I'm Done (Dashboard)"}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
