import { supabase, isConfigured } from './supabase'
import type { SessionDelta } from '../types/auth'

const OFFLINE_QUEUE_KEY = 'deenly_offline_sync_queue'
const DEVICE_ID_KEY = 'deenly_device_id'
const BROADCAST_CHANNEL_NAME = 'deenly_sync_channel'

let broadcastChannel: BroadcastChannel | null = null

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server_node'
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = `dev_${Math.random().toString(36).substr(2, 8)}_${Date.now().toString(36)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function getOfflineQueue(): SessionDelta[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveOfflineQueue(queue: SessionDelta[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.warn('Failed to save offline queue:', err)
  }
}

export const syncService = {
  getDeviceId,
  getPendingCount(): number {
    return getOfflineQueue().length
  },

  initRealtimeSync(
    userId: string,
    onRemoteDelta: (delta: SessionDelta) => void,
    onRemoteReset?: () => void
  ): () => void {
    const currentDeviceId = getDeviceId()

    // 1. Setup Browser BroadcastChannel for instant multi-tab & multi-window sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
        broadcastChannel.onmessage = (event) => {
          const data = event.data
          if (!data) return
          if (data.type === 'reset_stats' && data.userId === userId && data.deviceId !== currentDeviceId) {
            console.log('🔄 Received remote reset_stats via BroadcastChannel')
            onRemoteReset?.()
            return
          }
          const delta = data as SessionDelta
          if (delta && delta.userId === userId && delta.deviceId !== currentDeviceId) {
            console.log('🔄 Received remote session delta via BroadcastChannel:', delta)
            onRemoteDelta(delta)
          }
        }
      } catch (e) {
        console.warn('BroadcastChannel not supported:', e)
      }
    }

    // 2. Setup Supabase Realtime Channel if configured
    let supabaseChannel: ReturnType<typeof supabase.channel> | null = null
    if (isConfigured && userId) {
      try {
        supabaseChannel = supabase
          .channel(`reading_sync_${userId}`)
          .on(
            'broadcast',
            { event: 'session_delta' },
            (payload) => {
              const delta = payload.payload as SessionDelta
              if (delta && delta.deviceId !== currentDeviceId) {
                console.log('📡 Received remote delta via Supabase Realtime:', delta)
                onRemoteDelta(delta)
              }
            }
          )
          .on(
            'broadcast',
            { event: 'reset_stats' },
            (payload) => {
              const data = payload.payload as { deviceId?: string }
              if (data && data.deviceId !== currentDeviceId) {
                console.log('📡 Received remote reset_stats via Supabase Realtime')
                onRemoteReset?.()
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${userId}`,
            },
            (payload) => {
              const newRow = payload.new as { hasanat?: number; verses?: number }
              if (newRow && (newRow.hasanat === 0 || newRow.hasanat == null) && (newRow.verses === 0 || newRow.verses == null)) {
                console.log('📡 Detected zeroed stats in profiles row via Postgres Changes')
                onRemoteReset?.()
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.warn('Supabase realtime subscription failed:', err)
      }
    }

    // 3. Online Reconnection Listener
    const handleOnline = () => {
      console.log('🌐 Network online detected, flushing offline sync queue...')
      this.flushOfflineQueue(onRemoteDelta)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close()
        broadcastChannel = null
      }
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
      }
    }
  },

  async publishResetStats(userId: string): Promise<boolean> {
    const payload = {
      type: 'reset_stats',
      userId,
      deviceId: getDeviceId(),
      timestamp: Date.now(),
    }

    // 1. Local BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload)
      } catch (err) {
        console.warn('BroadcastChannel reset message failed:', err)
      }
    }

    // 2. Supabase Realtime Broadcast
    if (isConfigured && userId) {
      try {
        const channel = supabase.channel(`reading_sync_${userId}`)
        await channel.send({
          type: 'broadcast',
          event: 'reset_stats',
          payload,
        })
      } catch (err) {
        console.warn('Supabase reset stats broadcast failed:', err)
      }
    }

    // Clear any pending offline queue
    saveOfflineQueue([])
    return true
  },

  async publishSessionDelta(
    delta: SessionDelta
  ): Promise<{ success: boolean; queued: boolean }> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    // If offline, queue locally
    if (!isOnline) {
      const queue = getOfflineQueue()
      queue.push(delta)
      saveOfflineQueue(queue)
      console.log('📦 Device offline. Queued session delta for sync:', delta)
      return { success: true, queued: true }
    }

    // 1. Broadcast to other local tabs/devices via BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(delta)
      } catch (err) {
        console.warn('BroadcastChannel postMessage error:', err)
      }
    }

    // 2. Send via Supabase Realtime Broadcast & Postgres if configured
    if (isConfigured) {
      try {
        const channel = supabase.channel(`reading_sync_${delta.userId}`)
        await channel.send({
          type: 'broadcast',
          event: 'session_delta',
          payload: delta,
        })
      } catch (err) {
        console.warn('Failed to publish delta via Supabase, saving to queue:', err)
        const queue = getOfflineQueue()
        queue.push(delta)
        saveOfflineQueue(queue)
        return { success: false, queued: true }
      }
    }

    return { success: true, queued: false }
  },

  async flushOfflineQueue(
    onRemoteDelta?: (delta: SessionDelta) => void
  ): Promise<number> {
    const queue = getOfflineQueue()
    if (queue.length === 0) return 0

    console.log(`🚀 Flushing ${queue.length} offline session deltas...`)
    let flushedCount = 0

    for (const delta of queue) {
      // Broadcast flushed delta
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage(delta)
        } catch {
          // ignore
        }
      }
      if (onRemoteDelta) {
        onRemoteDelta(delta)
      }
      flushedCount++
    }

    // Clear queue after successful flush
    saveOfflineQueue([])
    return flushedCount
  },
}
