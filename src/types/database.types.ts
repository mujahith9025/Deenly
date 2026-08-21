export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          uid: string
          name: string
          email: string
          photo_url: string | null
          created_at: string
          preferred_translation: string
          daily_goal_verses: number
          hasanat: number
          verses: number
          time: number
          pages: number
          current_streak: number
          best_streak: number
          last_read_surah?: number
          last_read_ayah?: number
          last_read_at?: string | null
        }
        Insert: {
          id: string
          uid?: string
          name?: string
          email?: string
          photo_url?: string | null
          created_at?: string
          preferred_translation?: string
          daily_goal_verses?: number
          hasanat?: number
          verses?: number
          time?: number
          pages?: number
          current_streak?: number
          best_streak?: number
          last_read_surah?: number
          last_read_ayah?: number
          last_read_at?: string | null
        }
        Update: {
          id?: string
          uid?: string
          name?: string
          email?: string
          photo_url?: string | null
          created_at?: string
          preferred_translation?: string
          daily_goal_verses?: number
          hasanat?: number
          verses?: number
          time?: number
          pages?: number
          current_streak?: number
          best_streak?: number
          last_read_surah?: number
          last_read_ayah?: number
          last_read_at?: string | null
        }
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          surah_number: number
          ayah_number: number
          juz_number: number
          page_number: number
          last_read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          surah_number: number
          ayah_number: number
          juz_number: number
          page_number: number
          last_read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          surah_number?: number
          ayah_number?: number
          juz_number?: number
          page_number?: number
          last_read_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_type: 'quran' | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'dhikr' | 'charity'
          completed_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_type: 'quran' | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'dhikr' | 'charity'
          completed_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_type?: 'quran' | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'dhikr' | 'charity'
          completed_date?: string
          created_at?: string
        }
      }
    }
  }
}
