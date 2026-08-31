import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { BookOpen, Loader2 } from 'lucide-react'

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-background splash-gradient flex flex-col items-center justify-center p-6 text-on-surface select-none">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.35)] border border-primary/30 mb-5 animate-pulse">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 text-xs text-primary-fixed-dim font-medium text-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs font-semibold text-primary/90">Verifying session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? <>{children}</> : <Outlet />
}
