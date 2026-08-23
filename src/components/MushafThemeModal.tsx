import React from 'react'
import { X, Check, Eye } from 'lucide-react'
import { MUSHAF_THEMES, type MushafThemeId } from '../lib/mushafThemes'
import { useI18nStore } from '../lib/i18n'

interface MushafThemeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: MushafThemeId
  onSelectTheme: (themeId: MushafThemeId) => void
}

export const MushafThemeModal: React.FC<MushafThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'

  if (!isOpen) return null

  const themeList = Object.values(MUSHAF_THEMES)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] bg-surface rounded-3xl border border-outline-variant/30 shadow-2xl flex flex-col overflow-hidden text-on-surface">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex items-center justify-between gap-3 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-on-surface">
                {isTamil ? 'முஸ்ஹஃப் கண்-சௌகரிய தீம்கள்' : 'Mushaf Eye-Comfort Themes'}
              </h2>
              <p className="text-xs text-outline">
                {isTamil
                  ? 'கண்களுக்கு இதமான வண்ணத் தட்டுகளைத் தேர்வு செய்யவும்'
                  : 'Calibrated palettes designed for fatigue-free Quran recitation'}
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

        {/* Themes Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {themeList.map((t) => {
            const isSelected = currentTheme === t.id

            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id)
                }}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 shadow-lg bg-surface-container-high/80'
                    : 'glass-card border-outline-variant/30 hover:border-primary/40'
                }`}
              >
                {/* Left: Icon, Name & Description */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner border"
                    style={{
                      backgroundColor: t.previewColors.bg,
                      borderColor: t.previewColors.border,
                    }}
                  >
                    <span>{t.icon}</span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-on-surface">
                        {isTamil ? t.nameTa : t.nameEn}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: t.previewColors.card,
                          color: t.previewColors.accent,
                          borderColor: t.previewColors.border,
                        }}
                      >
                        {isTamil ? t.badgeTa : t.badgeEn}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {isTamil ? t.descTa : t.descEn}
                    </p>
                  </div>
                </div>

                {/* Right: Color Swatches & Selected Checkmark */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {/* Swatches Mini Capsule */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shadow-inner"
                    style={{
                      backgroundColor: t.previewColors.bg,
                      borderColor: t.previewColors.border,
                    }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: t.previewColors.card }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: t.previewColors.accent }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: t.previewColors.text }}
                    />
                  </div>

                  {/* Checkmark */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border border-outline-variant/30 text-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-outline">
            {isTamil ? 'ஓதும் திரையில் உடனடியாகப் பிரதிபலிக்கும்' : 'Applies instantly to your Quran reader'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition cursor-pointer"
          >
            {isTamil ? 'முடிந்தது' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
