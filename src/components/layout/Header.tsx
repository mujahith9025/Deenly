import React from 'react'
import { Link } from 'react-router-dom'
import { Flame, Sparkles, User, BookOpen, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useI18nStore } from '../../lib/i18n'

export const Header: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const t = useI18nStore((state) => state.t)

  return (
    <header className="sticky top-0 z-40 w-full h-16 glass-nav border-b border-outline-variant/30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Logo (Mobile / Tablet only, Desktop has sidebar) */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-primary/30">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="font-h1 font-bold text-lg text-primary-fixed-dim tracking-tight">
            Deenly
          </span>
        </Link>
      </div>

      {/* Center / Right Header Badges */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Guest Mode: Sign in with Google / Log In Action */}
        {user?.isGuest && (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full primary-gradient-btn text-white text-xs font-semibold shadow-sm hover:scale-105 transition"
            title="Sign in with Google to sync stats"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('signIn')}</span>
            <span className="sm:hidden">{t('signInShort')}</span>
          </Link>
        )}

        {/* Streak Badge */}
        <div 
          title="Current Streak"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary/30 text-xs font-semibold text-primary"
        >
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{user?.currentStreak ?? 0}d</span>
        </div>

        {/* Hasanat Badge */}
        <div 
          title="Total Hasanat Points"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/20 border border-tertiary/40 text-xs font-semibold text-tertiary"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{user?.hasanat ? `${(user.hasanat / 1000).toFixed(1)}k` : '0'} pts</span>
        </div>

        {/* User Profile Avatar */}
        <Link 
          to="/profile" 
          className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/50 overflow-hidden flex items-center justify-center hover:border-primary transition-colors"
        >
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-on-surface-variant" />
          )}
        </Link>
      </div>
    </header>
  )
}
