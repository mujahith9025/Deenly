/**
 * ==============================================================================
 * 🌙 DEENLY MUSHAF EYE-COMFORT THEMES
 * Specially calibrated color palettes for fatigue-free Quran reading across all lighting conditions.
 * Supports: Midnight OLED (0% battery drain), Warm Sepia (Zero Blue Light), Royal Emerald, Cosmic, and Soft Light.
 * ==============================================================================
 */

export type MushafThemeId = 'cosmic' | 'oled' | 'sepia' | 'emerald' | 'light'

export interface MushafThemeMeta {
  id: MushafThemeId
  nameEn: string
  nameTa: string
  descEn: string
  descTa: string
  badgeEn: string
  badgeTa: string
  icon: string
  previewColors: {
    bg: string
    card: string
    text: string
    accent: string
    border: string
  }
  // CSS class bundles for components
  classes: {
    container: string
    card: string
    cardBorder: string
    header: string
    footer: string
    textArabic: string
    textTranslation: string
    textMuted: string
    accentPill: string
    buttonSecondary: string
    buttonPrimary: string
  }
}

export const MUSHAF_THEMES: Record<MushafThemeId, MushafThemeMeta> = {
  cosmic: {
    id: 'cosmic',
    nameEn: 'Deenly Classic (Default)',
    nameTa: 'டீன்லி இயல்பு வடிவம்',
    descEn: 'Original Deenly interface with cosmic glassmorphism and glowing accents.',
    descTa: 'அசல் டீன்லி கண்ணாடித் திரை மற்றும் ஒளிரும் வண்ண வடிவமைப்பு.',
    badgeEn: 'Default Original',
    badgeTa: 'அசல் இயல்பு வடிவம்',
    icon: '✨',
    previewColors: {
      bg: '#0f0d23',
      card: 'rgba(29, 24, 60, 0.85)',
      text: '#ffffff',
      accent: '#a855f7',
      border: 'rgba(168, 85, 247, 0.4)',
    },
    classes: {
      container: 'bg-transparent text-on-surface',
      card: 'glass-card border border-primary/40 bg-surface-container-low/85 shadow-xl ring-1 ring-primary/20 hover:border-primary/70',
      cardBorder: 'border-primary/40',
      header: 'glass-card border border-outline-variant/30 shadow-md bg-surface/95 backdrop-blur-lg text-on-surface',
      footer: 'glass-card border border-outline-variant/30 shadow-md bg-surface/95 backdrop-blur-lg text-on-surface',
      textArabic: 'text-on-surface drop-shadow-sm',
      textTranslation: 'text-on-surface-variant',
      textMuted: 'text-outline',
      accentPill: 'bg-surface-container-high/90 border border-outline-variant/40 text-on-surface',
      buttonSecondary: 'bg-surface-container-high border border-outline-variant/40 text-on-surface hover:border-primary',
      buttonPrimary: 'bg-white text-gray-900 shadow-xl hover:bg-gray-100',
    },
  },
  oled: {
    id: 'oled',
    nameEn: 'Midnight OLED',
    nameTa: 'நள்ளிரவு OLED கருமை',
    descEn: '100% pure black for zero AMOLED power drain and maximum night focus.',
    descTa: 'AMOLED திரைகளுக்கான 100% தூய கருப்பு, பேட்டரி சேமிப்பு மற்றும் இரவு வாசிப்புக்கு சிறந்தது.',
    badgeEn: 'AMOLED Zero Drain',
    badgeTa: 'OLED பேட்டரி சேமிப்பு',
    icon: '🌙',
    previewColors: {
      bg: '#000000',
      card: '#0a0a0a',
      text: '#f8fafc',
      accent: '#fbbf24',
      border: '#27272a',
    },
    classes: {
      container: 'bg-black text-zinc-100',
      card: 'bg-zinc-950 border border-zinc-800 shadow-none ring-1 ring-zinc-800/80',
      cardBorder: 'border-zinc-800',
      header: 'bg-black/95 border-zinc-900 text-zinc-100',
      footer: 'bg-black/95 border-zinc-900 text-zinc-100',
      textArabic: 'text-zinc-50 drop-shadow-none',
      textTranslation: 'text-zinc-300',
      textMuted: 'text-zinc-500',
      accentPill: 'bg-zinc-900 border-zinc-700 text-amber-400',
      buttonSecondary: 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700',
      buttonPrimary: 'bg-zinc-100 text-black hover:bg-white',
    },
  },
  sepia: {
    id: 'sepia',
    nameEn: 'Warm Sepia Parchment',
    nameTa: 'செபியா காகித நிறம்',
    descEn: 'Warm paper ivory tones filtering harsh blue light for effortless prolonged reading.',
    descTa: 'நீல ஒளியைக் குறைக்கும் மென்மையான காகித நிறம், கண்களுக்கு மிகுந்த இதமளிக்கும்.',
    badgeEn: 'Zero Eye Strain',
    badgeTa: 'கண் சோர்வின்றி ஓதுக',
    icon: '📜',
    previewColors: {
      bg: '#fbf0d9',
      card: '#f4e3be',
      text: '#2d1806',
      accent: '#854d0e',
      border: '#dfc79b',
    },
    classes: {
      container: 'bg-[#fbf0d9] text-[#2d1806]',
      card: 'bg-[#f4e3be]/95 border border-[#dfc79b] shadow-md ring-1 ring-[#dfc79b]/60',
      cardBorder: 'border-[#dfc79b]',
      header: 'bg-[#f6e7c7]/95 border-[#dfc79b] text-[#2d1806]',
      footer: 'bg-[#f6e7c7]/95 border-[#dfc79b] text-[#2d1806]',
      textArabic: 'text-[#241304]',
      textTranslation: 'text-[#543b22]',
      textMuted: 'text-[#7d6145]',
      accentPill: 'bg-[#edd8ad] border-[#dfc79b] text-[#713f12]',
      buttonSecondary: 'bg-[#eedbb4] border-[#d8be90] text-[#3d240f] hover:border-[#854d0e]',
      buttonPrimary: 'bg-[#3d240f] text-[#fef9ee] hover:bg-[#2d1806]',
    },
  },
  emerald: {
    id: 'emerald',
    nameEn: 'Classic Royal Emerald',
    nameTa: 'பாரம்பரிய மரகத பச்சை',
    descEn: 'Sacred Madinah & Istanbul Mushaf-inspired deep royal emerald and gold.',
    descTa: 'பாரம்பரிய மதீனா & இஸ்தான்புல் முஸ்ஹஃப் பாணியிலான கம்பீரமான மரகத பச்சை மற்றும் தங்கம்.',
    badgeEn: 'Sacred Classic',
    badgeTa: 'புனித மதீனா வடிவம்',
    icon: '🍃',
    previewColors: {
      bg: '#041d16',
      card: '#083226',
      text: '#f0fdf4',
      accent: '#34d399',
      border: 'rgba(52, 211, 153, 0.35)',
    },
    classes: {
      container: 'bg-[#041d16] text-[#f0fdf4]',
      card: 'bg-[#083226]/90 border border-emerald-500/40 shadow-2xl ring-1 ring-emerald-500/30',
      cardBorder: 'border-emerald-500/40',
      header: 'bg-[#06261d]/95 border-emerald-800/40 text-emerald-50',
      footer: 'bg-[#06261d]/95 border-emerald-800/40 text-emerald-50',
      textArabic: 'text-emerald-50',
      textTranslation: 'text-emerald-100/90',
      textMuted: 'text-emerald-300/60',
      accentPill: 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300',
      buttonSecondary: 'bg-[#0a3a2d] border-emerald-700/50 text-emerald-100 hover:border-emerald-400',
      buttonPrimary: 'bg-emerald-400 text-[#041d16] hover:bg-emerald-300 font-bold',
    },
  },
  light: {
    id: 'light',
    nameEn: 'Soft Dawn Light',
    nameTa: 'மென்மையான விடியல் வெளிச்சம்',
    descEn: 'Airy daylight reading mode with balanced contrast and crisp clarity.',
    descTa: 'தெளிவான பகல் நேர வாசிப்புக்கான மென்மையான வெளிச்சத் திரை.',
    badgeEn: 'Daylight Reading',
    badgeTa: 'பகல் நேர வாசிப்பு',
    icon: '☀️',
    previewColors: {
      bg: '#f8fafc',
      card: '#ffffff',
      text: '#0f172a',
      accent: '#6366f1',
      border: '#e2e8f0',
    },
    classes: {
      container: 'bg-slate-50 text-slate-900',
      card: 'bg-white border border-slate-200 shadow-md ring-1 ring-slate-200/80',
      cardBorder: 'border-slate-200',
      header: 'bg-white/95 border-slate-200 text-slate-900',
      footer: 'bg-white/95 border-slate-200 text-slate-900',
      textArabic: 'text-slate-950',
      textTranslation: 'text-slate-700',
      textMuted: 'text-slate-500',
      accentPill: 'bg-slate-100 border-slate-200 text-slate-800',
      buttonSecondary: 'bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-400',
      buttonPrimary: 'bg-slate-900 text-white hover:bg-black',
    },
  },
}

export const DEFAULT_MUSHAF_THEME: MushafThemeId = 'cosmic'

export function getStoredMushafTheme(): MushafThemeId {
  if (typeof window === 'undefined') return DEFAULT_MUSHAF_THEME
  try {
    const saved = localStorage.getItem('deenly_mushaf_theme') as MushafThemeId
    if (saved && MUSHAF_THEMES[saved]) return saved
  } catch {}
  return DEFAULT_MUSHAF_THEME
}

export function setStoredMushafTheme(themeId: MushafThemeId): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('deenly_mushaf_theme', themeId)
  } catch {}
}
