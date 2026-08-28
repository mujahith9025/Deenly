import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Handle Vite dynamic chunk preloading errors smoothly when deployments change
window.addEventListener('vite:preloadError', () => {
  const lastReload = sessionStorage.getItem('deenly_preload_reload')
  const now = Date.now()
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('deenly_preload_reload', now.toString())
    window.location.reload()
  }
})

// Auto-register and auto-update PWA service worker whenever user enters the app
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Update service worker in background
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Deenly is ready for offline recitation')
  },
  onRegistered(registration) {
    if (registration) {
      // Check for updates on entry / window focus
      const handleCheckUpdate = () => {
        registration.update().catch(() => {})
      }

      window.addEventListener('focus', handleCheckUpdate)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          handleCheckUpdate()
        }
      })
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
