import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  Compass, 
  Trophy, 
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
  { path: '/reading', label: 'Quran Reader', icon: BookOpen },
  { path: '/explore', label: 'Explore & Surahs', icon: Compass },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/profile', label: 'My Profile', icon: User },
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
          <div className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} truncate`}>
            <h1 className="font-h1 font-bold text-xl text-primary-fixed-dim tracking-tight">
              Deenly
            </h1>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-wide">
              Read. Reflect. Reward.
            </p>
          </div>
        </div>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="hidden lg:flex p-1.5 rounded-xl hover:bg-surface-container text-outline hover:text-on-surface transition cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center rounded-2xl text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center p-3' : 'justify-center lg:justify-start px-3.5 lg:px-4 py-3 gap-3.5'
                } ${
                  isActive
                    ? 'primary-gradient-btn text-white font-semibold shadow-md shadow-primary-container/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={isCollapsed ? 'hidden' : 'hidden lg:inline'}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Mini Card in Sidebar Footer */}
      <div className="pt-3 border-t border-outline-variant/30">
        <div
          className={`rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'justify-between p-2 lg:p-3'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
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
          </div>

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
