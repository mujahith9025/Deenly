import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicRoute } from './components/layout/PublicRoute'
import { SplashScreen } from './screens/SplashScreen'
import { RouteLoadingFallback } from './components/RouteLoadingFallback'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

// 🚀 Lazy-Loaded Screen Chunks for Maximum Initial Load Performance
const LoginScreen = lazy(() => import('./screens/LoginScreen').then((m) => ({ default: m.LoginScreen })))
const SignupScreen = lazy(() => import('./screens/SignupScreen').then((m) => ({ default: m.SignupScreen })))
const DashboardScreen = lazy(() => import('./screens/DashboardScreen').then((m) => ({ default: m.DashboardScreen })))
const ReadingScreen = lazy(() => import('./screens/ReadingScreen').then((m) => ({ default: m.ReadingScreen })))
const QuranScreen = lazy(() => import('./screens/QuranScreen').then((m) => ({ default: m.QuranScreen })))
const ExploreScreen = lazy(() => import('./screens/ExploreScreen').then((m) => ({ default: m.ExploreScreen })))
const HadithScreen = lazy(() => import('./screens/HadithScreen').then((m) => ({ default: m.HadithScreen })))
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })))

// ⚡ Opportunistic Screen Prefetcher (Loads key routes during browser idle time)
function prefetchKeyRoutes() {
  if (typeof window === 'undefined') return
  const prefetch = () => {
    try {
      import('./screens/DashboardScreen').catch(() => {})
      import('./screens/ReadingScreen').catch(() => {})
      import('./screens/QuranScreen').catch(() => {})
      import('./screens/ExploreScreen').catch(() => {})
    } catch {}
  }

  try {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 3000 })
    } else {
      setTimeout(prefetch, 1500)
    }
  } catch {
    setTimeout(prefetch, 1500)
  }
}

export const App: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth)
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
    initAuth()
    prefetchKeyRoutes()

    const handleWindowFocus = () => {
      if (document.visibilityState === 'visible') {
        const auth = useAuthStore.getState()
        if (auth.isAuthenticated && auth.user) {
          auth.syncNow()
        }
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleWindowFocus)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleWindowFocus)
    }
  }, [initAuth, initTheme])

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Splash Screen (Eagerly loaded for instant paint) */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/splash" element={<SplashScreen />} />

          {/* Public-Only Auth Routes (Redirects to /dashboard if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
          </Route>

          {/* Protected App Routes (Redirects to /login if unauthenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardScreen />} />
              {/* Dedicated 1-Verse Recitation Engine accessed from Dashboard */}
              <Route path="/reading" element={<ReadingScreen />} />
              {/* All 114 Quran Chapters & Whole Chapter Stream */}
              <Route path="/quran" element={<QuranScreen />} />
              {/* Spiritual Explorer: Digital Tasbih Studio, Daily Dhikr Goals & Authentic Du'as */}
              <Route path="/explore" element={<ExploreScreen />} />
              {/* The Six Major Hadith Books (Kutub al-Sittah) in Arabic, English & Tamil */}
              <Route path="/hadith" element={<HadithScreen />} />
              <Route path="/leaderboard" element={<Navigate to="/hadith" replace />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
