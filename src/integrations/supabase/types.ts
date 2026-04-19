export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      awards: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          granting_body: string
          id: string
          image_url: string | null
          profile_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          granting_body: string
          id?: string
          image_url?: string | null
          profile_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          granting_body?: string
          id?: string
          image_url?: string | null
          profile_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "awards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          color: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          icon: string
          id: string
          key: string
          name_ar: string
          name_en: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          key: string
          name_ar: string
          name_en: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          key?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          issuer: string
          profile_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en: string | null
          updated_at: string
          url: string | null
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          issuer: string
          profile_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en?: string | null
          updated_at?: string
          url?: string | null
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          issuer?: string
          profile_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          url?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color_class: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          key: string
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          color_class?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          key: string
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          color_class?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          key?: string
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          event_date: string
          id: string
          image_url: string | null
          location: string | null
          profile_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en: string | null
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          location?: string | null
          profile_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string | null
          profile_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar?: string
          title_en?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_badges: {
        Row: {
          badge_id: string
          granted_at: string
          granted_by: string | null
          id: string
          note: string | null
          profile_id: string
        }
        Insert: {
          badge_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          profile_id: string
        }
        Update: {
          badge_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          ref_id: string | null
          ref_table: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          ref_id?: string | null
          ref_table?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          ref_id?: string | null
          ref_table?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          department_id: string | null
          email: string
          id: string
          initials: string | null
          is_featured: boolean
          name_ar: string
          name_en: string | null
          office_location: string | null
          orcid: string | null
          phone: string | null
          rank: Database["public"]["Enums"]["academic_rank"] | null
          scholar_url: string | null
          specialty_ar: string | null
          specialty_en: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          website_url: string | null
          years_exp: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          id: string
          initials?: string | null
          is_featured?: boolean
          name_ar: string
          name_en?: string | null
          office_location?: string | null
          orcid?: string | null
          phone?: string | null
          rank?: Database["public"]["Enums"]["academic_rank"] | null
          scholar_url?: string | null
          specialty_ar?: string | null
          specialty_en?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          website_url?: string | null
          years_exp?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          id?: string
          initials?: string | null
          is_featured?: boolean
          name_ar?: string
          name_en?: string | null
          office_location?: string | null
          orcid?: string | null
          phone?: string | null
          rank?: Database["public"]["Enums"]["academic_rank"] | null
          scholar_url?: string | null
          specialty_ar?: string | null
          specialty_en?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          website_url?: string | null
          years_exp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          abstract: string | null
          authors: string | null
          citations_count: number | null
          created_at: string
          doi: string | null
          id: string
          journal_name: string | null
          profile_id: string
          publication_year: number
          publisher: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en: string | null
          type: Database["public"]["Enums"]["publication_type"]
          updated_at: string
          url: string | null
        }
        Insert: {
          abstract?: string | null
          authors?: string | null
          citations_count?: number | null
          created_at?: string
          doi?: string | null
          id?: string
          journal_name?: string | null
          profile_id: string
          publication_year: number
          publisher?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en?: string | null
          type?: Database["public"]["Enums"]["publication_type"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          abstract?: string | null
          authors?: string | null
          citations_count?: number | null
          created_at?: string
          doi?: string | null
          id?: string
          journal_name?: string | null
          profile_id?: string
          publication_year?: number
          publisher?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar?: string
          title_en?: string | null
          type?: Database["public"]["Enums"]["publication_type"]
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      academic_rank: "professor" | "associate" | "lecturer" | "assistant"
      app_role: "super_admin" | "professor" | "visitor"
      content_status: "pending" | "approved" | "rejected"
      event_type:
        | "conference"
        | "workshop"
        | "seminar"
        | "training"
        | "community"
        | "other"
      member_status: "active" | "suspended" | "inactive"
      publication_type:
        | "journal"
        | "conference"
        | "book"
        | "chapter"
        | "thesis"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      academic_rank: ["professor", "associate", "lecturer", "assistant"],
      app_role: ["super_admin", "professor", "visitor"],
      content_status: ["pending", "approved", "rejected"],
      event_type: [
        "conference",
        "workshop",
        "seminar",
        "training",
        "community",
        "other",
      ],
      member_status: ["active", "suspended", "inactive"],
      publication_type: [
        "journal",
        "conference",
        "book",
        "chapter",
        "thesis",
        "other",
      ],
    },
  },
} as const
