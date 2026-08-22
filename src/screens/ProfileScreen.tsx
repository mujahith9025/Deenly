import React, { useState } from 'react'
import { 
  User, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Award, 
  Bookmark, 
  Calendar,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  Trash2,
  RefreshCw,
  LogIn,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useAuth } from '../hooks/useAuth'

export const ProfileScreen: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showResetStatsModal, setShowResetStatsModal] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const { user, signOut } = useAuth()
  const resetUserStatsToZero = useAuthStore((state) => state.resetUserStatsToZero)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)
  const navigate = useNavigate()

  const handleResetStats = async () => {
    setIsResetting(true)
    try {
      await resetUserStatsToZero()
      setShowResetStatsModal(false)
    } finally {
      setIsResetting(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await deleteAccount()
      setShowDeleteModal(false)
      navigate('/signup', { replace: true })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const badges = [
    { title: '7-Day Streak', desc: 'Read Quran 7 days in a row', date: 'Earned 2w ago', icon: Flame, color: 'text-amber-400' },
    { title: 'Surah Al-Kahf', desc: 'Read Surah Al-Kahf 4 Fridays in a row', date: 'Earned 1w ago', icon: Award, color: 'text-tertiary' },
    { title: 'Milestone Goal', desc: 'Read first 100 Ayahs', date: 'Earned 3d ago', icon: BookOpen, color: 'text-primary' },
  ]

  const savedBookmarks = [
    { surah: 'Surah Al-Baqarah', ayah: 255, title: 'Ayat al-Kursi', timestamp: 'Saved 2 days ago' },
    { surah: 'Surah Ali \'Imran', ayah: 190, title: 'Creation of Heavens & Earth', timestamp: 'Saved 5 days ago' },
    { surah: 'Surah Ad-Duhaa', ayah: 5, title: 'Promise of Allah\'s Favor', timestamp: 'Saved 1 week ago' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">My Spiritual Profile</h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
            Your personal Quran reading journey, milestones, and account management.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Hero Banner */}
        <div className="p-6 md:p-8 rounded-3xl glass-card border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 shadow-md">
          <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-primary/50 overflow-hidden shrink-0 flex items-center justify-center shadow-xl">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-on-surface-variant" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="text-xl md:text-2xl font-bold font-h1 text-on-surface">
                {user?.name || 'Muslim Seeker'}
              </h2>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface self-center md:self-auto transition"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>App Settings</span>
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant">{user?.email || (user?.isGuest ? 'Guest Mode (Unsynced)' : 'No email registered')}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3 text-xs">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'August 2026'}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/30 text-tertiary font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> {(user?.hasanat || 0).toLocaleString()} Hasanat
              </span>
            </div>
          </div>
        </div>

        {/* Stats Triad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-outline-variant/30 text-center shadow-sm">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-on-surface">{user?.currentStreak || 0} Days</p>
            <p className="text-xs text-outline mt-0.5">Current Streak</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-outline-variant/30 text-center shadow-sm">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-on-surface">{user?.pages || 0} Pages</p>
            <p className="text-xs text-outline mt-0.5">Total Quran Read</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-outline-variant/30 text-center shadow-sm">
            <Award className="w-6 h-6 text-tertiary mx-auto mb-2" />
            <p className="text-2xl font-bold text-tertiary">{user?.verses || 0} Ayahs</p>
            <p className="text-xs text-outline mt-0.5">Verses Recited</p>
          </div>
        </div>

        {/* Badges and Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <h3 className="text-lg font-bold font-h2 text-on-surface">Spiritual Milestones</h3>
            <div className="space-y-3">
              {badges.map((b, i) => {
                const Icon = b.icon
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${b.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface">{b.title}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">{b.desc}</p>
                    </div>
                    <span className="text-[10px] text-outline shrink-0">{b.date}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Saved Bookmarks */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md">
            <h3 className="text-lg font-bold font-h2 text-on-surface">Saved Ayahs & Notes</h3>
            <div className="space-y-3">
              {savedBookmarks.map((bm, i) => (
                <Link
                  key={i}
                  to="/reading"
                  className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between hover:border-primary/40 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-on-surface">{bm.surah}:{bm.ayah}</p>
                      <p className="text-[11px] text-on-surface-variant">{bm.title}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACCOUNT & DANGER ZONE MANAGEMENT                                          */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-5 shadow-md">
          <h3 className="text-base font-bold font-h2 text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Account & Data Management</span>
          </h3>

          {/* Guest Sign-In CTA */}
          {user?.isGuest && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-sm font-bold text-on-surface block">Back up your progress</span>
                <span className="text-xs text-on-surface-variant">Sign in with Google to sync stats across all your devices.</span>
              </div>
              <Link
                to="/login"
                className="px-5 py-2 rounded-full primary-gradient-btn text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google</span>
              </Link>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {/* Reset Stats to Zero */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container/50 border border-outline-variant/20">
              <div>
                <span className="text-xs font-bold text-on-surface block">Reset Reading Stats</span>
                <span className="text-[11px] text-on-surface-variant">Clear Hasanat points and start a clean slate</span>
              </div>
              <button
                type="button"
                onClick={() => setShowResetStatsModal(true)}
                className="px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 hover:border-amber-500/50 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Zero</span>
              </button>
            </div>

            {/* Log Out */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container/50 border border-outline-variant/20">
              <div>
                <span className="text-xs font-bold text-on-surface block">Sign Out</span>
                <span className="text-[11px] text-on-surface-variant">Log out of your session on this device</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 hover:border-primary/50 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <div>
                <span className="text-xs font-bold text-rose-400 block">Delete Account</span>
                <span className="text-[11px] text-on-surface-variant">Permanently delete your profile and all synced cloud records</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Stats Confirmation Modal */}
      {showResetStatsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-outline-variant/40 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold font-h2 text-on-surface">Reset All Stats to Zero?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This will reset your Hasanat points, verse counters, page counts, and streaks to zero. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetStatsModal(false)}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetStats}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-full bg-amber-500 text-gray-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-400 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isResetting ? 'Resetting...' : 'Yes, Reset Stats'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-rose-500/40 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold font-h2 text-rose-400">Permanently Delete Account?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                All your spiritual bookmarks, reading streaks, Hasanat points, and synced progress will be permanently erased.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-500 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDeletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isDeletingAccount ? 'Deleting...' : 'Delete Forever'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
