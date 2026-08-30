import React, { useState } from 'react'
import { 
  X, 
  Download, 
  Smartphone, 
  Apple, 
  Monitor, 
  CheckCircle2, 
  Share2, 
  PlusSquare,
  Sparkles,
  WifiOff,
  Bell
} from 'lucide-react'
import { usePWAInstall } from '../hooks/usePWAInstall'

interface PWAInstallModalProps {
  isOpen: boolean
  onClose: () => void
  isTamil?: boolean
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, isTamil }) => {
  const { platform, isInstallable, promptInstall, isInstalled } = usePWAInstall()
  const [selectedDevice, setSelectedDevice] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (platform === 'ios') return 'ios'
    if (platform === 'windows' || platform === 'mac') return 'desktop'
    return 'android'
  })
  const [installSuccess, setInstallSuccess] = useState(false)

  if (!isOpen) return null

  const handleOneTapInstall = async () => {
    const success = await promptInstall()
    if (success) {
      setInstallSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-surface-container-highest border border-primary/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-h1 text-on-surface">
                {isTamil ? 'Deenly செயலியை நிறுவுக (PWA)' : 'Install Deenly Web App'}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {isTamil ? 'அனைத்து சாதனங்களிலும் முழுமையான ஆஃப்லைன் அனுபவம்' : '100% Native full-screen & offline experience'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Quick Install Banner if browser supports beforeinstallprompt */}
        {isInstallable && !isInstalled && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/40 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-on-surface block">
                {isTamil ? 'விரைவு நிறுவல் தயாராக உள்ளது' : 'Instant 1-Tap Install Ready'}
              </span>
              <span className="text-[11px] text-on-surface-variant block">
                {isTamil ? 'உங்கள் முகப்புத் திரையில் நேரடியாகச் சேர்க்கவும்' : 'Add directly to your home screen or desktop'}
              </span>
            </div>
            <button
              onClick={handleOneTapInstall}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isTamil ? 'நிறுவுக' : 'Install Now'}</span>
            </button>
          </div>
        )}

        {/* Device Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-surface-container p-1 rounded-2xl border border-outline-variant/20">
          <button
            onClick={() => setSelectedDevice('android')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedDevice === 'android'
                ? 'bg-surface-container-highest text-primary shadow-xs border border-primary/30'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setSelectedDevice('ios')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedDevice === 'ios'
                ? 'bg-surface-container-highest text-primary shadow-xs border border-primary/30'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setSelectedDevice('desktop')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedDevice === 'desktop'
                ? 'bg-surface-container-highest text-primary shadow-xs border border-primary/30'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Detailed Step-by-Step Instructions Container */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {selectedDevice === 'android' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'Google Chrome அல்லது Samsung Internet-ல் Deenly பக்கத்தைத் திறக்கவும்.'
                    : 'Open Deenly in Google Chrome or Samsung Internet browser.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'மேல் வலது மூலையில் உள்ள மூன்று புள்ளிகளைத் (⋮) தொடவும்.'
                    : 'Tap the three vertical dots menu (⋮) in the top-right corner of Chrome.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'மெனுவில் "Install app" அல்லது "Add to Home screen"-ஐத் தேர்ந்தெடுக்கவும்.'
                    : 'Select "Install app" or "Add to Home screen" from the menu options.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? '"Install" என்பதைக் கிளிக் செய்து முடிக்கவும். Deenly உங்கள் முகப்புத் திரையில் தோன்றும்.'
                    : 'Tap "Install" to confirm. Deenly will now appear on your phone home screen.'}
                </p>
              </div>
            </div>
          )}

          {selectedDevice === 'ios' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'இணைப்பை ஆப்பிள் Safari உலாவியில் திறக்கவும் (Chrome/Firefox-ல் iOS PWA சேர்க்க முடியாது).'
                    : 'Open Deenly in Apple Safari browser (iOS requires Safari to install PWAs).'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-on-surface leading-relaxed flex items-center gap-1.5 flex-wrap">
                    <span>{isTamil ? 'திரையின் கீழ் பகுதியில் உள்ள' : 'Tap the'}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-primary px-2 py-0.5 rounded-md bg-surface-container-highest border border-outline-variant/40">
                      <Share2 className="w-3 h-3" />
                      <span>{isTamil ? 'பகிர் (Share) ஐகானைத் தொடவும்' : 'Share Button (Square with Up Arrow)'}</span>
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-on-surface leading-relaxed flex items-center gap-1.5 flex-wrap">
                    <span>{isTamil ? 'கீழே உருட்டி' : 'Scroll down the share sheet and tap'}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-secondary px-2 py-0.5 rounded-md bg-surface-container-highest border border-outline-variant/40">
                      <PlusSquare className="w-3 h-3" />
                      <span>{isTamil ? '"Add to Home Screen"-ஐத் தொடவும்' : '"Add to Home Screen"'}</span>
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'மேல் வலது மூலையில் உள்ள "Add" என்பதைக் கிளிக் செய்யவும். முழுத் திரை ஆப்பாக இயங்கும்.'
                    : 'Tap "Add" in the top-right corner. Deenly will now launch in fullscreen without Safari URL bars.'}
                </p>
              </div>
            </div>
          )}

          {selectedDevice === 'desktop' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'Google Chrome, Microsoft Edge அல்லது Brave உலாவியில் Deenly-ஐத் திறக்கவும்.'
                    : 'Open Deenly in Google Chrome, Microsoft Edge, or Brave on your PC or Mac.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? 'முகவரிப் பட்டியின் வலது ஓரத்தில் உள்ள நிறுவல் ஐகானைக் (⊕ அல்லது 💻) கிளிக் செய்யவும்.'
                    : 'Look at the address bar on the right side and click the "Install Deenly" icon (⊕ or 💻).'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-outline-variant/25 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {isTamil
                    ? '"Install" என்பதைக் கிளிக் செய்யவும். டெஸ்க்டாப் குறுக்குவழியாக நேரடியாகத் திறக்கும்.'
                    : 'Click "Install" in the confirmation popup to launch Deenly in a dedicated desktop window.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PWA Key Features Footer */}
        <div className="pt-3 border-t border-outline-variant/20 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <WifiOff className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <span className="text-[10px] font-bold text-on-surface block">
              {isTamil ? 'ஆஃப்லைன் வசதி' : 'Offline Ready'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <Bell className="w-3.5 h-3.5 text-secondary mx-auto mb-1" />
            <span className="text-[10px] font-bold text-on-surface block">
              {isTamil ? 'தினசரி நினைவூட்டல்' : 'Daily Reminders'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-on-surface block">
              {isTamil ? 'முழுத் திரை வேகம்' : 'Instant PWA'}
            </span>
          </div>
        </div>

        {installSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isTamil ? 'செயலி வெற்றிகரமாக நிறுவப்பட்டது!' : 'Deenly installed successfully!'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
