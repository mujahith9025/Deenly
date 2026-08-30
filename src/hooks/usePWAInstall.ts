import { useState, useEffect, useCallback } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface PWAInstallState {
  isStandalone: boolean
  isInstallable: boolean
  isInstalled: boolean
  platform: 'ios' | 'android' | 'windows' | 'mac' | 'other'
  isDismissed: boolean
  promptInstall: () => Promise<boolean>
  dismissPrompt: () => void
}

const DISMISS_KEY = 'deenly_pwa_install_dismissed'

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState<boolean>(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })

  // Detect Platform
  const [platform, setPlatform] = useState<'ios' | 'android' | 'windows' | 'mac' | 'other'>('other')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Detect Standalone / Installed mode
    const checkStandalone = () => {
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
      const isAndroidApp = document.referrer.includes('android-app://')
      setIsStandalone(Boolean(isDisplayStandalone || isNavigatorStandalone || isAndroidApp))
    }

    checkStandalone()

    // 2. Detect User OS / Platform
    const ua = window.navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setPlatform('ios')
    } else if (/android/.test(ua)) {
      setPlatform('android')
    } else if (/win/.test(ua)) {
      setPlatform('windows')
    } else if (/mac/.test(ua)) {
      setPlatform('mac')
    } else {
      setPlatform('other')
    }

    // 3. Listen for beforeinstallprompt event (Chromium, Android, Edge, Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches)
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsStandalone(true)
        return true
      }
      return false
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err)
      return false
    }
  }, [deferredPrompt])

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // ignore storage error
    }
  }, [])

  return {
    isStandalone,
    isInstallable: Boolean(deferredPrompt),
    isInstalled: isStandalone,
    platform,
    isDismissed,
    promptInstall,
    dismissPrompt,
  }
}
