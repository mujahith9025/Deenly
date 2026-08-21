import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, Smartphone, Tablet, Monitor, ArrowRight } from 'lucide-react'

interface ScreenPlaceholderProps {
  title: string
  description: string
  stitchScreenName?: string
  stitchScreenId?: string
  stitchReady: boolean
  featuresList?: string[]
  currentRoute: string
}

const allScreens = [
  { path: '/', label: 'Splash' },
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Signup' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/reading', label: 'Reading' },
  { path: '/explore', label: 'Explore' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/profile', label: 'Profile' },
  { path: '/settings', label: 'Settings' },
]

export const ScreenPlaceholder: React.FC<ScreenPlaceholderProps> = ({
  title,
  description,
  stitchScreenName,
  stitchScreenId,
  stitchReady,
  featuresList = [],
  currentRoute,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 md:p-8 rounded-2xl glass-card border border-outline-variant/40 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-semibold uppercase tracking-wider">
                Phase 1 Scaffold
              </span>
              {stitchReady ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/30 text-tertiary text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Stitch Design Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Stitch Design
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface font-h1 tracking-tight">
              {title}
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base mt-1 max-w-2xl">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-surface-container text-xs text-on-surface font-mono border border-outline-variant/40">
              Route: {currentRoute}
            </span>
          </div>
        </div>

        {/* Stitch Parity Meta */}
        <div className="mt-6 pt-6 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/20">
            <p className="text-xs text-outline font-medium">Stitch Source Screen</p>
            <p className="text-sm font-semibold text-on-surface mt-0.5 truncate">
              {stitchScreenName || 'Not yet defined in Stitch'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/20">
            <p className="text-xs text-outline font-medium">Stitch Screen ID</p>
            <p className="text-xs font-mono text-primary-fixed-dim mt-1 truncate">
              {stitchScreenId || 'N/A (Generate in Phase 2)'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/20 sm:col-span-2 lg:col-span-1">
            <p className="text-xs text-outline font-medium">Responsive Viewports</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface">
              <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-tertiary" /> Mobile</span>
              <span className="flex items-center gap-1"><Tablet className="w-3.5 h-3.5 text-tertiary" /> Tablet</span>
              <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5 text-tertiary" /> Desktop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Features & Checklist */}
      {featuresList.length > 0 && (
        <div className="p-6 rounded-2xl glass-card border border-outline-variant/40">
          <h2 className="text-lg font-semibold text-on-surface font-h2 mb-3">
            Planned Components & Data Flow (Phase 2)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featuresList.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container/40 border border-outline-variant/20 text-xs text-on-surface">
                <span className="w-5 h-5 rounded-full bg-secondary-container/60 text-secondary text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="mt-0.5">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screen Navigation Matrix */}
      <div className="p-6 rounded-2xl glass-card border border-outline-variant/40">
        <h2 className="text-lg font-semibold text-on-surface font-h2 mb-1">
          Route Navigation Skeleton
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          Test client-side route switching between all 9 scaffolded screens:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {allScreens.map((screen) => {
            const isActive = currentRoute === screen.path
            return (
              <Link
                key={screen.path}
                to={screen.path}
                className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-primary-container text-white border-primary-container shadow-md shadow-primary-container/30'
                    : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface hover:border-primary/50'
                }`}
              >
                <span>{screen.label}</span>
                {isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-outline shrink-0 opacity-60" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
