import { supabase, isConfigured } from './supabase'

export interface ConnectionTestResult {
  status: 'connected' | 'unconfigured' | 'error'
  message: string
  timestamp: string
  details?: unknown
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const timestamp = new Date().toLocaleTimeString()
  
  if (!isConfigured) {
    return {
      status: 'unconfigured',
      message: 'Supabase credentials not configured yet. (Using local sandbox mode)',
      timestamp,
    }
  }

  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    
    if (error) {
      // If table doesn't exist yet, auth/connection still worked
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return {
          status: 'connected',
          message: 'Connected to Supabase (Schema initialization pending)',
          timestamp,
          details: error.message,
        }
      }
      return {
        status: 'error',
        message: `Supabase error: ${error.message}`,
        timestamp,
        details: error,
      }
    }

    return {
      status: 'connected',
      message: `Successfully connected to Supabase database (${data ? data.length : 0} rows found)`,
      timestamp,
      details: data,
    }
  } catch (err: unknown) {
    return {
      status: 'error',
      message: `Connection failed: ${err instanceof Error ? err.message : String(err)}`,
      timestamp,
      details: err,
    }
  }
}
