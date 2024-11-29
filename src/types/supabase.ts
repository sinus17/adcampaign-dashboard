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
      reports: {
        Row: {
          id: string
          name: string
          platforms: string[]
          metrics: string[]
          campaigns: string[]
          created_at: string
          status: 'generating' | 'ready' | 'error'
          share_url?: string
          last_updated: string
          enable_date_range: boolean
        }
        Insert: {
          id: string
          name: string
          platforms: string[]
          metrics: string[]
          campaigns: string[]
          created_at?: string
          status?: 'generating' | 'ready' | 'error'
          share_url?: string
          last_updated?: string
          enable_date_range?: boolean
        }
        Update: {
          id?: string
          name?: string
          platforms?: string[]
          metrics?: string[]
          campaigns?: string[]
          created_at?: string
          status?: 'generating' | 'ready' | 'error'
          share_url?: string
          last_updated?: string
          enable_date_range?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}