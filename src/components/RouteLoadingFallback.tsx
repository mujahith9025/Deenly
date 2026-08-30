import React from 'react'
import { Loader2 } from 'lucide-react'

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="w-14 h-14 rounded-full bg-primary/20 blur-xl animate-pulse" />

        {/* Single Main Circular Loading Spinner */}
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary/90 font-label-caps">
        Loading...
      </p>
    </div>
  )
}
