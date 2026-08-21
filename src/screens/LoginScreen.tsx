import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, ArrowRight, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signInWithEmail, signInWithGoogle, signInAsGuest, error, setError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard'

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setError(null)

    // Form Validation
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setValidationError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setValidationError('Please enter a valid email address format.')
      return
    }

    if (!password) {
      setValidationError('Please enter your password.')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await signInWithEmail(cleanEmail, password)
      navigate(returnPath, { replace: true })
    } catch (err: unknown) {
      // Handled via store error state
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setValidationError(null)
    setError(null)
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
      navigate(returnPath, { replace: true })
    } catch (err: unknown) {
      // Handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuestDemo = () => {
    signInAsGuest()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-background splash-gradient text-on-surface select-none relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-container/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex justify-between items-center mb-4 z-10">
        <Link
          to="/"
          className="text-xs text-on-surface-variant hover:text-primary transition flex items-center gap-1"
        >
          &larr; Back to Splash
        </Link>
        <button
          onClick={handleGuestDemo}
          className="text-xs px-3 py-1 rounded-full bg-secondary-container/60 hover:bg-secondary-container border border-secondary/30 text-secondary transition"
        >
          Instant Demo Mode
        </button>
      </div>

      {/* Login Card (Stitch Spec) */}
      <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-3xl glass-card border border-outline-variant/40 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(124,58,237,0.3)] border border-primary/30">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-h1 text-primary-fixed-dim">Welcome Back</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Sign in to continue your Quran reading streak
          </p>
        </div>

        {/* Inline Error Banner */}
        {(validationError || error) && (
          <div className="mb-4 p-3 rounded-2xl bg-error-container/40 border border-error/50 text-error flex items-start gap-2.5 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{validationError || error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-medium text-xs flex items-center justify-center gap-3 transition shadow-sm mb-4 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="text-[11px] text-outline uppercase font-medium tracking-wider">or email</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="you@example.com"
                required
                className="w-full bg-surface-container/80 border border-outline-variant/40 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-on-surface-variant">Password</label>
              <span className="text-[11px] text-primary hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container/80 border border-outline-variant/40 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full primary-gradient-btn text-white py-3 px-4 rounded-full font-semibold text-xs flex items-center justify-center gap-2 mt-4 hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
