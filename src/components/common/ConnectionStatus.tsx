import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react'
import { testSupabaseConnection, type ConnectionTestResult } from '../../lib/connectionTest'

export const ConnectionStatus: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [result, setResult] = useState<ConnectionTestResult>({
    status: 'unconfigured',
    message: 'Testing connection...',
    timestamp: '',
  })
  const [isTesting, setIsTesting] = useState(false)

  const runTest = async () => {
    setIsTesting(true)
    try {
      const res = await testSupabaseConnection()
      setResult(res)
    } finally {
      setIsTesting(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  if (compact) {
    return (
      <div 
        onClick={runTest}
        title={`Supabase: ${result.message} (Click to re-test)`}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant cursor-pointer hover:border-primary/50 transition-colors"
      >
        <span 
          className={`w-2 h-2 rounded-full ${
            result.status === 'connected' 
              ? 'bg-tertiary shadow-[0_0_8px_#4edea3]' 
              : result.status === 'unconfigured'
              ? 'bg-amber-400'
              : 'bg-error'
          }`} 
        />
        <span className="font-medium text-[11px]">
          {result.status === 'connected' ? 'Supabase Connected' : result.status === 'unconfigured' ? 'Supabase Sandbox' : 'Supabase Error'}
        </span>
        {isTesting && <RefreshCw className="w-3 h-3 animate-spin ml-0.5 text-primary" />}
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 text-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="font-semibold text-on-surface">Supabase Backend Status</span>
        </div>
        <button
          onClick={runTest}
          disabled={isTesting}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/30 transition"
        >
          <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-primary' : ''}`} />
          <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>
      
      <div className="flex items-start gap-2.5 text-xs text-on-surface-variant">
        {result.status === 'connected' ? (
          <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-medium text-on-surface">{result.message}</p>
          <p className="text-[11px] text-outline mt-0.5">Last checked: {result.timestamp || 'Just now'}</p>
        </div>
      </div>
    </div>
  )
}
