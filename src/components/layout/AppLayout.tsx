import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { QuranChapterAudioPlayer } from '../QuranChapterAudioPlayer'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const isReadingPage = location.pathname.startsWith('/reading')

  return (
    <div className={`flex bg-background text-on-surface ${isReadingPage ? 'h-[100dvh] max-h-[100dvh] overflow-hidden w-full' : 'min-h-screen'}`}>
      {/* Desktop Persistent Sidebar (Hidden on reading page for 100% immersive focus) */}
      {!isReadingPage && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isReadingPage ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pb-0 w-full' : 'pb-20 md:pb-6 lg:pb-8'}`}>
        {/* Top Global Header (Hidden on reading page so reader top bar is uniquely pinned) */}
        {!isReadingPage && <Header />}

        {/* Dynamic Route Content */}
        <main className={`flex-1 flex flex-col min-h-0 ${isReadingPage ? 'h-full max-h-full overflow-hidden p-0 w-full' : 'p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto'}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile/Tablet Fixed Bottom Navigation (Hidden on Reading Page) */}
      {!isReadingPage && <BottomNav />}

      {/* 🌟 Global Mini Floating Island Audio Player */}
      <QuranChapterAudioPlayer />
    </div>
  )
}
