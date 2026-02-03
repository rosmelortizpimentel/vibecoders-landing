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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      app_stacks: {
        Row: {
          app_id: string
          created_at: string
          stack_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          stack_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          stack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_stacks_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_stacks_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "tech_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      app_statuses: {
        Row: {
          color: string
          created_at: string
          display_order: number
          icon: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color: string
          created_at?: string
          display_order?: number
          icon: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      apps: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number
          hours_building: number | null
          hours_ideation: number | null
          id: string
          is_visible: boolean
          logo_url: string | null
          name: string | null
          status_id: string | null
          tagline: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          hours_building?: number | null
          hours_ideation?: number | null
          id?: string
          is_visible?: boolean
          logo_url?: string | null
          name?: string | null
          status_id?: string | null
          tagline?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          hours_building?: number | null
          hours_ideation?: number | null
          id?: string
          is_visible?: boolean
          logo_url?: string | null
          name?: string | null
          status_id?: string | null
          tagline?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apps_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "app_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      general_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_position: string | null
          avatar_url: string | null
          banner_position: string | null
          banner_url: string | null
          bio: string | null
          card_style: string | null
          created_at: string | null
          email_public: string | null
          font_family: string | null
          github: string | null
          id: string
          instagram: string | null
          is_pioneer: boolean
          linkedin: string | null
          location: string | null
          lovable: string | null
          member_number: number
          name: string | null
          primary_color: string | null
          show_pioneer_badge: boolean
          tagline: string | null
          tiktok: string | null
          twitter: string | null
          updated_at: string | null
          username: string | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_position?: string | null
          avatar_url?: string | null
          banner_position?: string | null
          banner_url?: string | null
          bio?: string | null
          card_style?: string | null
          created_at?: string | null
          email_public?: string | null
          font_family?: string | null
          github?: string | null
          id: string
          instagram?: string | null
          is_pioneer?: boolean
          linkedin?: string | null
          location?: string | null
          lovable?: string | null
          member_number?: number
          name?: string | null
          primary_color?: string | null
          show_pioneer_badge?: boolean
          tagline?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_position?: string | null
          avatar_url?: string | null
          banner_position?: string | null
          banner_url?: string | null
          bio?: string | null
          card_style?: string | null
          created_at?: string | null
          email_public?: string | null
          font_family?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          is_pioneer?: boolean
          linkedin?: string | null
          location?: string | null
          lovable?: string | null
          member_number?: number
          name?: string | null
          primary_color?: string | null
          show_pioneer_badge?: boolean
          tagline?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      showcase_gallery: {
        Row: {
          author_avatar: string | null
          author_linkedin: string | null
          author_name: string
          author_twitter: string | null
          author_website: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          project_logo_url: string | null
          project_tagline: string
          project_thumbnail: string
          project_title: string
          project_url: string
        }
        Insert: {
          author_avatar?: string | null
          author_linkedin?: string | null
          author_name: string
          author_twitter?: string | null
          author_website?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          project_logo_url?: string | null
          project_tagline: string
          project_thumbnail: string
          project_title: string
          project_url: string
        }
        Update: {
          author_avatar?: string | null
          author_linkedin?: string | null
          author_name?: string
          author_twitter?: string | null
          author_website?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          project_logo_url?: string | null
          project_tagline?: string
          project_thumbnail?: string
          project_title?: string
          project_url?: string
        }
        Relationships: []
      }
      tech_stacks: {
        Row: {
          created_at: string
          display_order: number
          id: string
          logo_url: string
          name: string
          tags: Json
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          logo_url: string
          name: string
          tags?: Json
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string
          name?: string
          tags?: Json
        }
        Relationships: []
      }
      tools_library: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          pricing_model: string | null
          tagline: string
          website_url: string
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          pricing_model?: string | null
          tagline: string
          website_url: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          pricing_model?: string | null
          tagline?: string
          website_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          created_at: string | null
          device_type: string | null
          email: string
          id: string
          language: string | null
          os_name: string | null
          os_version: string | null
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          timezone: string | null
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          created_at?: string | null
          device_type?: string | null
          email: string
          id?: string
          language?: string | null
          os_name?: string | null
          os_version?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          created_at?: string | null
          device_type?: string | null
          email?: string
          id?: string
          language?: string | null
          os_name?: string | null
          os_version?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
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
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
