import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw, BookOpen } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Deenly:', error, errorInfo)
    
    // If it's a dynamic chunk loading error after a new deployment, auto-reload once to fetch fresh assets
    const isChunkError = 
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.message?.includes('ChunkLoadError')

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('deenly_chunk_reload')
      const now = Date.now()
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('deenly_chunk_reload', now.toString())
        window.location.reload()
      }
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.clear()
    } catch {}
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-background splash-gradient flex flex-col items-center justify-center p-6 text-on-surface text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.35)] border border-primary/30 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>

          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-outline-variant/30 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-on-surface">
              Deenly is Updating
            </h2>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              A fresh update was loaded. Tap below to reload the app seamlessly.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-2xl primary-gradient-btn text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg hover:opacity-95 active:scale-98"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh App</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
