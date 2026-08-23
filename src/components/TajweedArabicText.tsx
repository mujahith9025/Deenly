import React, { useState } from 'react'
import { tokenizeTajweedText, TAJWEED_RULES, type TajweedToken } from '../lib/tajweed'
import { useI18nStore } from '../lib/i18n'

interface TajweedArabicTextProps {
  rawTajweedText?: string
  fallbackText: string
  isEnabled?: boolean
  className?: string
  style?: React.CSSProperties
  showTooltips?: boolean
}

export const TajweedArabicText: React.FC<TajweedArabicTextProps> = ({
  rawTajweedText,
  fallbackText,
  isEnabled = true,
  className = '',
  style = {},
  showTooltips = true,
}) => {
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const [activeTooltip, setActiveTooltip] = useState<{
    ruleCode: string
    content: string
    x: number
    y: number
  } | null>(null)

  if (!isEnabled || !rawTajweedText) {
    return (
      <span className={className} style={style} dir="rtl">
        {fallbackText}
      </span>
    )
  }

  const tokens = tokenizeTajweedText(rawTajweedText)

  // Recursive token renderer for nested tags
  const renderToken = (token: TajweedToken, index: number): React.ReactNode => {
    if (token.type === 'text') {
      return <span key={`txt-${index}`}>{token.content}</span>
    }

    const rule = token.rule ? TAJWEED_RULES[token.rule.toLowerCase()] : null

    if (!rule) {
      return <span key={`taj-${index}`}>{token.content}</span>
    }

    // Check if inner content contains sub-tags
    if (token.content.includes('[')) {
      const subTokens = tokenizeTajweedText(token.content)
      return (
        <span
          key={`taj-nested-${index}`}
          className={`inline transition-colors duration-150 font-bold ${rule.color}`}
          style={{ color: rule.hexColor }}
          title={`${isTamil ? rule.nameTa : rule.nameEn}`}
        >
          {subTokens.map((st, si) => renderToken(st, si))}
        </span>
      )
    }

    return (
      <span
        key={`taj-${index}`}
        className={`inline transition-all duration-150 font-semibold cursor-help hover:opacity-90 rounded px-0.5`}
        style={{
          color: rule.hexColor,
          backgroundColor: activeTooltip?.ruleCode === token.rule ? rule.bgHexColor : undefined,
        }}
        onClick={(e) => {
          if (!showTooltips) return
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          setActiveTooltip((prev) =>
            prev?.ruleCode === token.rule
              ? null
              : {
                  ruleCode: token.rule || 'm',
                  content: token.content,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 8,
                }
          )
        }}
        title={`${isTamil ? rule.nameTa : rule.nameEn} — ${isTamil ? rule.descriptionTa : rule.descriptionEn}`}
      >
        {token.content}
      </span>
    )
  }

  return (
    <span className={`relative inline ${className}`} style={style} dir="rtl">
      {tokens.map((token, i) => renderToken(token, i))}

      {/* Floating Micro-Popover on Tap */}
      {activeTooltip && (
        <span
          className="fixed z-50 px-3 py-1.5 rounded-xl bg-surface-container-highest/95 border border-primary/40 text-on-surface shadow-2xl text-xs sm:text-sm font-sans flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-full pointer-events-none backdrop-blur-md animate-fade-in"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y}px`,
            maxWidth: '240px',
          }}
          dir="ltr"
        >
          <span className="font-bold text-xs" style={{ color: TAJWEED_RULES[activeTooltip.ruleCode]?.hexColor }}>
            {isTamil
              ? TAJWEED_RULES[activeTooltip.ruleCode]?.nameTa
              : TAJWEED_RULES[activeTooltip.ruleCode]?.nameEn}
          </span>
          <span className="text-[10px] sm:text-xs text-outline text-center">
            {isTamil
              ? TAJWEED_RULES[activeTooltip.ruleCode]?.descriptionTa
              : TAJWEED_RULES[activeTooltip.ruleCode]?.descriptionEn}
          </span>
        </span>
      )}
    </span>
  )
}
