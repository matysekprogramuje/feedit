// Vygenerováno ze schématu projektu feedback-system (Supabase).
// Použití:  const supabase = createClient<Database>(url, key)
// Pro regeneraci:  npx supabase gen types typescript --project-id szxakuntflwocnaqqfag > database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          feedback_id: string
          id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          feedback_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          feedback_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      feedback_ratings: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          stars: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_ratings_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          body: string
          category_id: string | null
          created_at: string
          id: string
          keywords: string[]
          rating: number
          search_vector: unknown
          stars_avg: number
          stars_count: number
          status: Database["public"]["Enums"]["feedback_status"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          category_id?: string | null
          created_at?: string
          id?: string
          keywords?: string[]
          rating: number
          search_vector?: unknown
          stars_avg?: number
          stars_count?: number
          status?: Database["public"]["Enums"]["feedback_status"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          category_id?: string | null
          created_at?: string
          id?: string
          keywords?: string[]
          rating?: number
          search_vector?: unknown
          stars_avg?: number
          stars_count?: number
          status?: Database["public"]["Enums"]["feedback_status"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      feedback_details: {
        Row: {
          author_name: string | null
          body: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          id: string | null
          keywords: string[] | null
          my_stars: number | null
          rating: number | null
          stars_avg: number | null
          stars_count: number | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_set_feedback_status: {
        Args: {
          p_feedback_id: string
          p_status: Database["public"]["Enums"]["feedback_status"]
        }
        Returns: {
          body: string
          category_id: string | null
          created_at: string
          id: string
          keywords: string[]
          rating: number
          search_vector: unknown
          stars_avg: number
          stars_count: number
          status: Database["public"]["Enums"]["feedback_status"]
          title: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "feedbacks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      f_unaccent: { Args: { "": string }; Returns: string }
      feedback_search_vector: {
        Args: { p_body: string; p_keywords: string[]; p_title: string }
        Returns: unknown
      }
      get_category_stats: {
        Args: never
        Returns: {
          average_rating: number
          category_id: string
          feedback_count: number
          name: string
          slug: string
        }[]
      }
      get_feedback_stats: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      search_feedbacks: {
        Args: {
          p_category?: string
          p_limit?: number
          p_min_rating?: number
          p_offset?: number
          p_query?: string
          p_status?: Database["public"]["Enums"]["feedback_status"]
        }
        Returns: {
          author_name: string | null
          body: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          id: string | null
          keywords: string[] | null
          my_stars: number | null
          rating: number | null
          stars_avg: number | null
          stars_count: number | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "feedback_details"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "user" | "admin"
      feedback_status: "new" | "in_progress" | "resolved" | "wont_fix"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
      feedback_status: ["new", "in_progress", "resolved", "wont_fix"],
    },
  },
} as const
