import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail)
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const signInAsGuest = useAuthStore((state) => state.signInAsGuest)
  const signOut = useAuthStore((state) => state.signOut)
  const setError = useAuthStore((state) => state.setError)

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    setError,
  }
}
