import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Database types - removed webhook_response for now to avoid schema errors
export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          name: string
          job_description: string | null
          job_document_url: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          job_description?: string | null
          job_document_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          job_description?: string | null
          job_document_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      job_documents: {
        Row: {
          id: string
          filename: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          uploaded_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          filename: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          uploaded_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          filename?: string
          file_path?: string
          file_url?: string
          file_size?: number
          file_type?: string
          uploaded_at?: string
          created_by?: string | null
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          skills: string[] | null
          experience_years: number | null
          status: string
          cv_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          skills?: string[] | null
          experience_years?: number | null
          status?: string
          cv_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          skills?: string[] | null
          experience_years?: number | null
          status?: string
          cv_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string | null
          requirements: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          requirements?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          requirements?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      campaign_candidates: {
        Row: {
          id: string
          campaign_id: string
          candidate_id: string
          match_score: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          candidate_id: string
          match_score?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          candidate_id?: string
          match_score?: number | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}
