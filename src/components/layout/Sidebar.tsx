import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  ScrollText, 
  User, 
  Settings, 
  LogOut, 
  Sparkles, 
  Flame, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/quran', label: 'Quran', icon: BookOpen },
  { path: '/hadith', label: 'Hadith', icon: ScrollText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-surface-container-low border-r border-outline-variant/30 shrink-0 select-none transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20 p-3' : 'w-20 lg:w-64 p-3 lg:p-5'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-1 py-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center p-2 shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-primary/30 shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} min-w-0`}>
            <span className="font-h1 font-bold text-lg text-primary-fixed-dim tracking-tight block">
              Deenly
            </span>
            <span className="text-[10px] text-outline uppercase tracking-wider font-label-caps block">
              Islamic Companion
            </span>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-xl hover:bg-surface-container-high text-outline hover:text-on-surface transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all font-medium text-xs ${
                  isActive
                    ? 'bg-primary-container text-white shadow-md font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={item.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`${isCollapsed ? 'hidden' : 'hidden lg:inline'}`}>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Mini Card in Sidebar Footer (Links to Profile) */}
      <div className="pt-3 border-t border-outline-variant/30">
        <div
          className={`rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'justify-between p-2 lg:p-3'
          }`}
        >
          <NavLink
            to="/profile"
            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/50 overflow-hidden shrink-0 flex items-center justify-center">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-on-surface-variant" />
              )}
            </div>
            <div className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} truncate`}>
              <p className="text-xs font-semibold text-on-surface truncate">{user?.name || 'Muslim Seeker'}</p>
              <div className="flex items-center gap-2 text-[10px] text-tertiary">
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> {user?.currentStreak || 0}d
                </span>
                <span className="flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-tertiary" /> {user?.hasanat || 0}
                </span>
              </div>
            </div>
          </NavLink>

          <button
            onClick={() => signOut()}
            title="Sign out"
            className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} p-1.5 rounded-lg hover:bg-surface-container-highest text-outline hover:text-error transition cursor-pointer`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
