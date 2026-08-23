import React from 'react'
import { X, Sparkles, BookOpen } from 'lucide-react'
import { TAJWEED_RULES, type TajweedRuleInfo } from '../lib/tajweed'
import { useI18nStore } from '../lib/i18n'
import { getArabicFontFamily } from '../lib/quranFonts'
import { useReadingStore } from '../store/useReadingStore'

interface TajweedLegendModalProps {
  isOpen: boolean
  onClose: () => void
  isEnabled: boolean
  onToggleEnabled: (enabled: boolean) => void
}

export const TajweedLegendModal: React.FC<TajweedLegendModalProps> = ({
  isOpen,
  onClose,
  isEnabled,
  onToggleEnabled,
}) => {
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const fontStyle = useReadingStore((state) => state.fontStyle)
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  if (!isOpen) return null

  // Deduplicate rules by code family
  const distinctRules: TajweedRuleInfo[] = [
    TAJWEED_RULES.m, // Madd Lazim
    TAJWEED_RULES.o, // Madd Muttasil
    TAJWEED_RULES.p, // Madd Ja'iz
    TAJWEED_RULES.n, // Madd Tabee'i
    TAJWEED_RULES.g, // Ghunnah
    TAJWEED_RULES.q, // Qalqalah
    TAJWEED_RULES.f, // Ikhfa
    TAJWEED_RULES.w, // Idgham with Ghunnah
    TAJWEED_RULES.a, // Idgham without Ghunnah
    TAJWEED_RULES.b, // Iqlab
    TAJWEED_RULES.h, // Hamzatul Wasl / Silent
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-surface rounded-3xl border border-outline-variant/30 shadow-2xl flex flex-col overflow-hidden text-on-surface">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex items-center justify-between gap-3 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-on-surface">
                {isTamil ? 'தஜ்வீத் வண்ண விதிகள்' : 'Tajweed Color Rules'}
              </h2>
              <p className="text-xs text-outline">
                {isTamil
                  ? 'புனித குர்ஆனை துல்லியமாக ஓதுவதற்கான வழிகாட்டி'
                  : 'Scholarly phonetic guide for authentic Quranic recitation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toggle Bar */}
        <div className="px-4 sm:px-6 py-3 bg-surface-container-high/60 border-b border-outline-variant/20 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-on-surface">
              {isTamil ? 'தஜ்வீத் வண்ணக் குறியீடுகளை இயக்கு' : 'Enable Tajweed Color Codes'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Scrollable Rules List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 divide-y divide-outline-variant/10">
          {distinctRules.map((rule, idx) => (
            <div key={idx} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1 sm:max-w-md">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: rule.hexColor }}
                  />
                  <h3 className="text-xs sm:text-sm font-bold text-on-surface">
                    {isTamil ? rule.nameTa : rule.nameEn}
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pl-5.5">
                  {isTamil ? rule.descriptionTa : rule.descriptionEn}
                </p>
              </div>

              {/* Sample Arabic Word */}
              <div 
                className="self-start sm:self-center px-3.5 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-low shrink-0 shadow-sm"
                style={{ fontFamily: arabicFontFamily }}
                dir="rtl"
              >
                <span 
                  className="text-base sm:text-lg font-bold"
                  style={{ color: rule.hexColor }}
                >
                  {rule.example}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-outline">
            {isTamil ? 'அனைத்து 114 அத்தியாயங்களிலும் பொருந்தும்' : 'Applied across all 114 Surahs'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition cursor-pointer"
          >
            {isTamil ? 'புரிந்தது' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  )
}
