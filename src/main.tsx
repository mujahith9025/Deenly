import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Auto-register and auto-update PWA service worker whenever user enters the app
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Force reload to activate new deployment immediately
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Deenly is ready for offline recitation')
  },
  onRegistered(registration) {
    if (registration) {
      // Check for updates on entry / window focus / visibility change
      registration.update().catch(() => {})

      const handleCheckUpdate = () => {
        registration.update().catch(() => {})
      }

      window.addEventListener('focus', handleCheckUpdate)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          handleCheckUpdate()
        }
      })

      // Periodically check for updates
      setInterval(() => {
        registration.update().catch(() => {})
      }, 5 * 60 * 1000)
    }
  },
})

// Listen to service worker controller changes for instant seamless reload
if ('serviceWorker' in navigator) {
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
