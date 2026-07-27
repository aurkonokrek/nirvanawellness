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
      analytics_events: {
        Row: {
          country: string | null
          device: string | null
          event_type: string
          id: number
          occurred_at: string
          path: string
          referrer_host: string | null
          visitor_hash: string
        }
        Insert: {
          country?: string | null
          device?: string | null
          event_type?: string
          id?: never
          occurred_at?: string
          path: string
          referrer_host?: string | null
          visitor_hash: string
        }
        Update: {
          country?: string | null
          device?: string | null
          event_type?: string
          id?: never
          occurred_at?: string
          path?: string
          referrer_host?: string | null
          visitor_hash?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          contact_id: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          preferred_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          contact_id?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          preferred_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          contact_id?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          preferred_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_notes: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          note: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      corporate_inquiries: {
        Row: {
          admin_notes: string | null
          assigned_expert: string | null
          contact_id: string | null
          context: string | null
          created_at: string
          id: string
          name: string
          organisation: string
          preferred_date: string | null
          program_interest: string | null
          role: string | null
          scheduled_at: string | null
          status: string
          team_size: string | null
          updated_at: string
          work_email: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_expert?: string | null
          contact_id?: string | null
          context?: string | null
          created_at?: string
          id?: string
          name: string
          organisation: string
          preferred_date?: string | null
          program_interest?: string | null
          role?: string | null
          scheduled_at?: string | null
          status?: string
          team_size?: string | null
          updated_at?: string
          work_email: string
        }
        Update: {
          admin_notes?: string | null
          assigned_expert?: string | null
          contact_id?: string | null
          context?: string | null
          created_at?: string
          id?: string
          name?: string
          organisation?: string
          preferred_date?: string | null
          program_interest?: string | null
          role?: string | null
          scheduled_at?: string | null
          status?: string
          team_size?: string | null
          updated_at?: string
          work_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_inquiries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_meta: {
        Row: {
          contract_version: number
          id: boolean
          updated_at: string
        }
        Insert: {
          contract_version: number
          id?: boolean
          updated_at?: string
        }
        Update: {
          contract_version?: number
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notification_outbox: {
        Row: {
          created_at: string
          event: string
          id: string
          payload: Json
          sent_at: string | null
          source_id: string
          source_type: string
          status: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          payload?: Json
          sent_at?: string | null
          source_id: string
          source_type: string
          status?: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          payload?: Json
          sent_at?: string | null
          source_id?: string
          source_type?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      session_requests: {
        Row: {
          admin_notes: string | null
          assigned_expert: string | null
          contact_id: string | null
          created_at: string
          email: string
          expert_name: string | null
          expert_slug: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferred_date: string | null
          preferred_format: string
          scheduled_at: string | null
          session_type: string
          status: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_expert?: string | null
          contact_id?: string | null
          created_at?: string
          email: string
          expert_name?: string | null
          expert_slug?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_format?: string
          scheduled_at?: string | null
          session_type?: string
          status?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_expert?: string | null
          contact_id?: string | null
          created_at?: string
          email?: string
          expert_name?: string | null
          expert_slug?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_format?: string
          scheduled_at?: string | null
          session_type?: string
          status?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      add_contact_note: {
        Args: { p_contact_id: string; p_note: string }
        Returns: string
      }
      admin_calendar: {
        Args: { p_from: string; p_to: string }
        Returns: {
          assigned_expert: string
          id: string
          name: string
          scheduled_at: string
          status: string
          type: string
        }[]
      }
      admin_contacts: {
        Args: never
        Returns: {
          email: string
          id: string
          last_submission_at: string
          name: string
          phone: string
          submission_count: number
        }[]
      }
      analytics_conversions: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      analytics_health: { Args: never; Returns: Json }
      analytics_sources: {
        Args: { p_from: string; p_to: string }
        Returns: {
          pageviews: number
          referrer_host: string
          source: string
        }[]
      }
      analytics_top_pages: {
        Args: { p_from: string; p_limit?: number; p_to: string }
        Returns: {
          pageviews: number
          path: string
          unique_visitors: number
        }[]
      }
      analytics_traffic: {
        Args: { p_from: string; p_to: string }
        Returns: {
          day: string
          pageviews: number
          unique_visitors: number
        }[]
      }
      assert_admin: { Args: never; Returns: undefined }
      assert_submission_type: { Args: { p_type: string }; Returns: undefined }
      confirm_corporate_inquiry: {
        Args: { p_id: string; p_notes?: string }
        Returns: Json
      }
      confirm_session_request: {
        Args: { p_id: string; p_notes?: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      kit_timezone: { Args: never; Returns: string }
      list_contact_notes: {
        Args: { p_contact_id: string }
        Returns: {
          created_at: string
          id: string
          note: string
        }[]
      }
      reschedule_corporate_inquiry: {
        Args: { p_id: string; p_new_date: string }
        Returns: Json
      }
      reschedule_session_request: {
        Args: { p_id: string; p_new_date: string }
        Returns: Json
      }
      reschedule_submission: {
        Args: { p_id: string; p_new_date: string; p_type: string }
        Returns: undefined
      }
      set_schedule: {
        Args: {
          p_assigned_expert?: string
          p_id: string
          p_scheduled_at: string
          p_type: string
        }
        Returns: undefined
      }
      set_submission_notes: {
        Args: { p_id: string; p_notes: string; p_type: string }
        Returns: undefined
      }
      set_submission_status: {
        Args: { p_id: string; p_status: string; p_type: string }
        Returns: undefined
      }
      update_contact_message_status: {
        Args: { p_id: string; p_status: string }
        Returns: Json
      }
      upsert_contact: {
        Args: { p_email: string; p_name: string; p_phone: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
