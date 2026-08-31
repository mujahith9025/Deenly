import React from 'react'
import { Loader2 } from 'lucide-react'

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in select-none">
      <div className="relative flex items-center justify-center w-14 h-14 mb-3">
        {/* Soft Ambient Glow centered directly behind spinner */}
        <div className="absolute inset-0 rounded-full bg-primary/25 blur-xl animate-pulse" />

        {/* Circular Loading Spinner */}
        <Loader2 className="w-9 h-9 text-primary animate-spin relative z-10" />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-primary/90 font-label-caps text-center">
        Loading...
      </p>
    </div>
  )
}
