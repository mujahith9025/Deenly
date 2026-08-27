import React from 'react'

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="w-16 h-16 rounded-full bg-primary/20 blur-xl animate-pulse" />
        
        {/* Spinning Ring */}
        <div className="absolute w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />

        {/* Crescent / Sparkle Center */}
        <span className="text-xl select-none animate-bounce">🌙</span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary/80 font-label-caps">
        Loading...
      </p>
    </div>
  )
}
