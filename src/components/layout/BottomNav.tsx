import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ScrollText, Settings } from 'lucide-react'

const mobileNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/quran', label: 'Quran', icon: BookOpen },
  { path: '/hadith', label: 'Hadith', icon: ScrollText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-outline-variant/30 px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110 bg-primary-container/20' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5 shadow-[0_0_6px_#d2bbff]" />}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
