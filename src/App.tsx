import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicRoute } from './components/layout/PublicRoute'
import { SplashScreen } from './screens/SplashScreen'
import { LoginScreen } from './screens/LoginScreen'
import { SignupScreen } from './screens/SignupScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { ReadingScreen } from './screens/ReadingScreen'
import { QuranScreen } from './screens/QuranScreen'
import { HadithScreen } from './screens/HadithScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

export const App: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth)
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
    initAuth()
  }, [initAuth, initTheme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen */}
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
            <Route path="/explore" element={<QuranScreen />} />
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
    </BrowserRouter>
  )
}

export default App
