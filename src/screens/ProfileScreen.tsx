import React from 'react'
import { 
  User, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Award, 
  Bookmark, 
  Calendar,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user)

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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-h1 text-on-surface">My Spiritual Profile</h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
            Your personal Quran reading journey, milestones, and habit streaks.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Hero Banner */}
        <div className="p-6 md:p-8 rounded-3xl glass-card border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
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
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface self-center md:self-auto"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant">{user?.email || 'No email registered'}</p>
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
          <div className="p-5 rounded-2xl glass-card border border-outline-variant/30 text-center">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-on-surface">{user?.currentStreak || 0} Days</p>
            <p className="text-xs text-outline mt-0.5">Current Streak</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-outline-variant/30 text-center">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-on-surface">{user?.pages || 0} Pages</p>
            <p className="text-xs text-outline mt-0.5">Total Quran Read</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-outline-variant/30 text-center">
            <Award className="w-6 h-6 text-tertiary mx-auto mb-2" />
            <p className="text-2xl font-bold text-tertiary">{user?.verses || 0} Ayahs</p>
            <p className="text-xs text-outline mt-0.5">Verses Recited</p>
          </div>
        </div>

        {/* Badges and Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4">
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
          <div className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4">
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
      </div>
    </div>
  )
}
