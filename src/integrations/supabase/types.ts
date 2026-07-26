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
      session_requests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          session_type: string
          preferred_format: string
          timezone: string | null
          preferred_date: string | null
          expert_slug: string | null
          expert_name: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          session_type?: string
          preferred_format?: string
          timezone?: string | null
          preferred_date?: string | null
          expert_slug?: string | null
          expert_name?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          session_type?: string
          preferred_format?: string
          timezone?: string | null
          preferred_date?: string | null
          expert_slug?: string | null
          expert_name?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      corporate_inquiries: {
        Row: {
          id: string
          name: string
          role: string | null
          organisation: string
          work_email: string
          team_size: string | null
          program_interest: string | null
          context: string | null
          preferred_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          organisation: string
          work_email: string
          team_size?: string | null
          program_interest?: string | null
          context?: string | null
          preferred_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          organisation?: string
          work_email?: string
          team_size?: string | null
          program_interest?: string | null
          context?: string | null
          preferred_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          preferred_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          preferred_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          preferred_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: "admin"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: "admin"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "admin"
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notification_outbox: {
        Row: {
          id: string
          source_type: string
          source_id: string
          event: string
          payload: Json
          status: string
          created_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          source_type: string
          source_id: string
          event: string
          payload?: Json
          status?: string
          created_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          source_type?: string
          source_id?: string
          event?: string
          payload?: Json
          status?: string
          created_at?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: number
          occurred_at: string
          event_type: string
          path: string
          referrer_host: string | null
          visitor_hash: string
          country: string | null
          device: string | null
        }
        Insert: {
          occurred_at?: string
          event_type?: string
          path: string
          referrer_host?: string | null
          visitor_hash: string
          country?: string | null
          device?: string | null
        }
        Update: {
          occurred_at?: string
          event_type?: string
          path?: string
          referrer_host?: string | null
          visitor_hash?: string
          country?: string | null
          device?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: { key: string; value: string; updated_at: string }
        Insert: { key: string; value?: string; updated_at?: string }
        Update: { key?: string; value?: string; updated_at?: string }
        Relationships: []
      }
      kit_meta: {
        Row: { id: boolean; contract_version: number; updated_at: string }
        Insert: { id?: boolean; contract_version: number; updated_at?: string }
        Update: { id?: boolean; contract_version?: number; updated_at?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: "admin" }
        Returns: boolean
      }
      kit_timezone: { Args: Record<PropertyKey, never>; Returns: string }
      analytics_traffic: {
        Args: { p_from: string; p_to: string }
        Returns: { day: string; pageviews: number; unique_visitors: number }[]
      }
      analytics_top_pages: {
        Args: { p_from: string; p_to: string; p_limit?: number }
        Returns: { path: string; pageviews: number; unique_visitors: number }[]
      }
      analytics_sources: {
        Args: { p_from: string; p_to: string }
        Returns: { source: string; referrer_host: string; pageviews: number }[]
      }
      analytics_conversions: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      confirm_session_request: {
        Args: { p_id: string; p_notes?: string }
        Returns: Json
      }
      reschedule_session_request: {
        Args: { p_id: string; p_new_date: string }
        Returns: Json
      }
      confirm_corporate_inquiry: {
        Args: { p_id: string; p_notes?: string }
        Returns: Json
      }
      reschedule_corporate_inquiry: {
        Args: { p_id: string; p_new_date: string }
        Returns: Json
      }
      update_contact_message_status: {
        Args: { p_id: string; p_status: string }
        Returns: Json
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

export const Constants = {
  public: {
    Enums: { app_role: ["admin"] as const },
  },
} as const
