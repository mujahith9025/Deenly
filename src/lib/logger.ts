type LogLevel = 'info' | 'warn' | 'error' | 'event'

export interface LogEvent {
  event: string
  payload?: Record<string, unknown>
  timestamp: string
  level: LogLevel
}

const LOG_HISTORY_LIMIT = 50
const logHistory: LogEvent[] = []

export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    const entry: LogEvent = {
      event: message,
      payload: context,
      timestamp: new Date().toISOString(),
      level: 'info',
    }
    logHistory.push(entry)
    if (logHistory.length > LOG_HISTORY_LIMIT) logHistory.shift()
    console.log(`ℹ️ [DEENLY INFO] ${message}`, context || '')
  },

  warn(message: string, context?: Record<string, unknown>): void {
    const entry: LogEvent = {
      event: message,
      payload: context,
      timestamp: new Date().toISOString(),
      level: 'warn',
    }
    logHistory.push(entry)
    if (logHistory.length > LOG_HISTORY_LIMIT) logHistory.shift()
    console.warn(`⚠️ [DEENLY WARN] ${message}`, context || '')
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { raw: error }
    const entry: LogEvent = {
      event: message,
      payload: { ...context, error: errorDetails },
      timestamp: new Date().toISOString(),
      level: 'error',
    }
    logHistory.push(entry)
    if (logHistory.length > LOG_HISTORY_LIMIT) logHistory.shift()
    console.error(`🚨 [DEENLY ERROR] ${message}`, error, context || '')
  },

  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    const entry: LogEvent = {
      event: eventName,
      payload: properties,
      timestamp: new Date().toISOString(),
      level: 'event',
    }
    logHistory.push(entry)
    if (logHistory.length > LOG_HISTORY_LIMIT) logHistory.shift()
    console.log(`📊 [DEENLY EVENT: ${eventName}]`, properties || '')
  },

  getRecentLogs(): LogEvent[] {
    return [...logHistory]
  },
}
