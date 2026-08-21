import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const isReadingPage = location.pathname.startsWith('/reading')

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isReadingPage ? 'pb-6 md:pb-6 lg:pb-8' : 'pb-20 md:pb-6 lg:pb-8'}`}>
        {/* Top Header */}
        <Header />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile/Tablet Fixed Bottom Navigation (Hidden on Reading Page so reader controls are fully unblocked) */}
      {!isReadingPage && <BottomNav />}
    </div>
  )
}
