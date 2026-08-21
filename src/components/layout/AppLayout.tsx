import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const isReadingPage = location.pathname.startsWith('/reading')

  return (
    <div className={`flex bg-background text-on-surface ${isReadingPage ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isReadingPage ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pb-0' : 'pb-20 md:pb-6 lg:pb-8'}`}>
        {/* Top Header */}
        <Header />

        {/* Dynamic Route Content */}
        <main className={`flex-1 flex flex-col ${isReadingPage ? 'overflow-hidden p-0 w-full' : 'p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto'}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile/Tablet Fixed Bottom Navigation (Hidden on Reading Page so reader controls are fully unblocked) */}
      {!isReadingPage && <BottomNav />}
    </div>
  )
}
