import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { BookOpen, Loader2 } from 'lucide-react'

export const PublicRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-background splash-gradient flex flex-col items-center justify-center p-6 text-on-surface">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.35)] border border-primary/30 mb-4 animate-pulse">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div className="flex items-center gap-2 text-xs text-primary-fixed-dim font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Only redirect authenticated non-guest users. Guest users can freely access /login and /signup to sign in with Google!
  if (isAuthenticated && !user?.isGuest) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
