import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate()
  const signInAsGuest = useAuthStore((state) => state.signInAsGuest)

  const handleGuestEntry = () => {
    signInAsGuest()
    navigate('/dashboard')
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-between p-6 splash-gradient text-on-surface select-none relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-container/25 blur-[120px] pointer-events-none" />

      {/* Top Bar / Stitch Parity Pill */}
      <div className="w-full max-w-md flex justify-between items-center z-10 pt-2">
        <span className="px-3 py-1 rounded-full bg-surface-container/80 border border-outline-variant/30 text-xs text-secondary font-medium">
          Stitch Screen ID: 53d89d6c
        </span>
        <Link
          to="/dashboard"
          className="text-xs text-on-surface-variant hover:text-primary transition"
        >
          Skip to App &rarr;
        </Link>
      </div>

      {/* Center Brand Splash Card */}
      <main className="flex flex-col items-center justify-center px-container-margin w-full max-w-md mx-auto text-center z-10 relative my-auto">
        {/* Logo Mark Asset */}
        <div className="mb-6 w-28 h-28 md:w-36 md:h-36 animate-logo shadow-[0_0_50px_rgba(124,58,237,0.4)] rounded-full bg-surface-container flex items-center justify-center p-6 border border-primary/40 relative">
          <BookOpen className="w-full h-full text-primary drop-shadow-[0_0_12px_rgba(210,187,255,0.6)]" />
        </div>

        {/* Wordmark */}
        <h1 className="font-h1 text-4xl md:text-5xl font-extrabold text-primary-fixed-dim tracking-tight mb-2 animate-wordmark drop-shadow-md">
          Deenly
        </h1>

        {/* Tagline */}
        <p className="font-body-md text-base md:text-lg text-on-surface-variant tracking-wide animate-tagline max-w-xs mx-auto">
          Read. Reflect. Reward.
        </p>

        <p className="text-xs text-outline mt-3 max-w-xs">
          Your daily Quran companion with streak tracking, Khatm goals, and Hasanat rewards.
        </p>
      </main>

      {/* Action Buttons */}
      <div className="w-full max-w-sm mx-auto space-y-3 z-10 pb-4">
        <Link
          to="/dashboard"
          className="w-full primary-gradient-btn text-white py-3.5 px-6 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition hover:opacity-95"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/login"
            className="py-3 px-4 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-center font-medium text-xs transition"
          >
            Log In
          </Link>
          <button
            onClick={handleGuestEntry}
            className="py-3 px-4 rounded-full bg-secondary-container/60 hover:bg-secondary-container border border-secondary/30 text-secondary text-center font-medium text-xs transition"
          >
            Guest Demo
          </button>
        </div>
      </div>
    </div>
  )
}
