import React, { useState, useEffect } from 'react'
import { 
  X, 
  Sparkles, 
  Plus, 
  Save, 
  Trash2, 
  Target, 
  BookOpen, 
  FileText
} from 'lucide-react'
import { type DhikrItem } from '../lib/dhikrData'
import { useTasbihStore } from '../store/useTasbihStore'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'
import { triggerHapticLight, triggerHapticSuccess, triggerHapticWarning } from '../lib/haptics'

interface CustomDhikrModalProps {
  isOpen: boolean
  onClose: () => void
  editingDhikr?: DhikrItem | null
}

export const CustomDhikrModal: React.FC<CustomDhikrModalProps> = ({
  isOpen,
  onClose,
  editingDhikr = null,
}) => {
  const user = useAuthStore((state) => state.user)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const { addCustomDhikr, updateCustomDhikr, deleteCustomDhikr } = useTasbihStore()

  // Form State
  const [transliteration, setTransliteration] = useState('')
  const [arabic, setArabic] = useState('')
  const [translationEn, setTranslationEn] = useState('')
  const [translationTa, setTranslationTa] = useState('')
  const [virtueEn, setVirtueEn] = useState('')
  const [virtueTa, setVirtueTa] = useState('')
  const [target, setTarget] = useState<number>(33)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (editingDhikr) {
      setTransliteration(editingDhikr.transliteration || '')
      setArabic(editingDhikr.arabic || '')
      setTranslationEn(editingDhikr.translationEn || '')
      setTranslationTa(editingDhikr.translationTa || '')
      setVirtueEn(editingDhikr.virtueEn || '')
      setVirtueTa(editingDhikr.virtueTa || '')
      setTarget(editingDhikr.defaultTarget || 33)
      setErrorMsg('')
    } else {
      setTransliteration('')
      setArabic('')
      setTranslationEn('')
      setTranslationTa('')
      setVirtueEn('')
      setVirtueTa('')
      setTarget(33)
      setErrorMsg('')
    }
  }, [editingDhikr, isOpen])

  if (!isOpen) return null

  const targetPresets = [33, 100, 300, 500, 1000]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transliteration.trim()) {
      setErrorMsg(isTamil ? 'தயவுசெய்து திக்ர் பெயரைக் குறிப்பிடவும்.' : 'Please provide a title or transliteration name.')
      triggerHapticWarning()
      return
    }

    if (target <= 0) {
      setErrorMsg(isTamil ? 'இலக்கு 1 அல்லது அதற்கு மேல் இருக்க வேண்டும்.' : 'Target must be at least 1.')
      triggerHapticWarning()
      return
    }

    const payload = {
      transliteration: transliteration.trim(),
      arabic: arabic.trim() || '—',
      translationEn: translationEn.trim() || transliteration.trim(),
      translationTa: translationTa.trim() || translationEn.trim() || transliteration.trim(),
      virtueEn: virtueEn.trim() || 'Personal custom Dhikr remembrance.',
      virtueTa: virtueTa.trim() || virtueEn.trim() || 'தனிப்பயன் திக்ர் மற்றும் துஆ.',
      reference: 'Personal Dhikr',
      referenceTa: 'சுயமாக சேர்க்கப்பட்டது',
      defaultTarget: target,
      category: 'custom' as const,
    }

    if (editingDhikr) {
      updateCustomDhikr(editingDhikr.id, payload)
    } else {
      addCustomDhikr(payload)
    }

    triggerHapticSuccess()
    onClose()
  }

  const handleDelete = () => {
    if (!editingDhikr) return
    const confirmMsg = isTamil 
      ? `"${editingDhikr.transliteration}" திக்ரை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`
      : `Are you sure you want to delete "${editingDhikr.transliteration}"?`
    if (window.confirm(confirmMsg)) {
      deleteCustomDhikr(editingDhikr.id)
      triggerHapticWarning()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-surface-container-low border border-outline-variant/30 w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-on-surface relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-h1">
                {editingDhikr 
                  ? (isTamil ? 'திக்ரைத் திருத்துக' : 'Edit Custom Dhikr')
                  : (isTamil ? 'புதிய திக்ர் / துஆவைச் சேர்க்க' : 'Add Custom Dhikr or Dua')
                }
              </h3>
              <p className="text-xs text-on-surface-variant">
                {isTamil ? 'உங்கள் விருப்பமான துஆக்கள் மற்றும் தனிப்பட்ட திக்ர்களைச் சேமிக்கவும்' : 'Create personal Duas and Salawat with custom targets'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHapticLight()
              onClose()
            }}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer shadow-2xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-semibold animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Title / Transliteration (Required) */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>{isTamil ? 'திக்ர் பெயர் / உச்சரிப்பு (Title)' : 'Dhikr Title / Transliteration'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder={isTamil ? 'எ.கா: Rabbana Atina Fiddunya...' : 'e.g. Rabbana Atina Fiddunya Hasanatan...'}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* 2. Arabic Text (Optional) */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface flex items-center justify-between">
              <span>{isTamil ? 'அரபு வசனம் (Arabic Text - விருப்பத்தேர்வு)' : 'Arabic Text (Optional)'}</span>
              <span className="text-[10px] text-outline">{isTamil ? 'அரபு விசைப்பலகை' : 'RTL Arabic'}</span>
            </label>
            <textarea
              rows={2}
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً..."
              dir="rtl"
              style={{ fontFamily: arabicFontFamily }}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface text-base sm:text-lg focus:outline-none focus:border-primary transition leading-relaxed"
            />
          </div>

          {/* 3. English & Tamil Translations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-on-surface flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>{isTamil ? 'ஆங்கில விளக்கம்' : 'English Meaning'}</span>
              </label>
              <input
                type="text"
                value={translationEn}
                onChange={(e) => setTranslationEn(e.target.value)}
                placeholder="Our Lord, give us good in this world..."
                className="w-full px-3 py-2 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary transition"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-on-surface flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-secondary" />
                <span>{isTamil ? 'தமிழ் விளக்கம்' : 'Tamil Meaning'}</span>
              </label>
              <input
                type="text"
                value={translationTa}
                onChange={(e) => setTranslationTa(e.target.value)}
                placeholder="எங்கள் இறைவா! எங்களுக்கு இவ்வுலகிலும்..."
                className="w-full px-3 py-2 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* 4. Target Setting */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-on-surface flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>{isTamil ? 'தினசரி இலக்கு (Target Count)' : 'Daily Target Count'}</span>
              </span>
              <span className="text-primary font-extrabold text-xs">{target}x</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {targetPresets.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => {
                    triggerHapticLight()
                    setTarget(p)
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border text-xs ${
                    target === p
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  {p}x
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-outline text-[11px]">{isTamil ? 'தனிப்பயன்:' : 'Custom:'}</span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={target}
                  onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 px-2.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-center font-bold text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* 5. Personal Note / Virtue (Optional) */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface">
              {isTamil ? 'குறிப்பு அல்லது ஆன்மீகச் சிறப்பு (Personal Note)' : 'Personal Note / Spiritual Virtue (Optional)'}
            </label>
            <input
              type="text"
              value={virtueEn}
              onChange={(e) => setVirtueEn(e.target.value)}
              placeholder={isTamil ? 'எ.கா: காலை தொழுகைக்குப் பின் ஓதுவது...' : 'e.g. For peace of heart / Morning reflection'}
              className="w-full px-3 py-2 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline-variant/25 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-outline font-bold uppercase font-label-caps">
              <span>{isTamil ? 'முன்னோட்டம்' : 'Live Preview'}</span>
              <span className="text-primary">{target}x {isTamil ? 'இலக்கு' : 'Target'}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-xs sm:text-sm text-on-surface truncate">
                  {transliteration || (isTamil ? 'திக்ர் பெயர்' : 'Dhikr Title')}
                </p>
                <p className="text-[11px] text-on-surface-variant italic truncate">
                  "{translationEn || (isTamil ? 'விளக்கம்' : 'Translation')}"
                </p>
              </div>
              {arabic && (
                <span 
                  className="text-lg text-primary shrink-0" 
                  style={{ fontFamily: arabicFontFamily }}
                  dir="rtl"
                >
                  {arabic}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
            {editingDhikr ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isTamil ? 'நீக்குக' : 'Delete'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHapticLight()
                  onClose()
                }}
                className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition cursor-pointer"
              >
                {isTamil ? 'ரத்து' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 shadow-md transition cursor-pointer active:scale-95"
              >
                {editingDhikr ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>
                  {editingDhikr 
                    ? (isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes')
                    : (isTamil ? 'திக்ரைச் சேர்' : 'Create Dhikr')
                  }
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  )
}
