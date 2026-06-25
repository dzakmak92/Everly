// Generated from the Supabase project schema (thin-server control/commerce plane).
// Regenerate with the Supabase MCP `generate_typescript_types` tool or:
//   supabase gen types typescript --project-id ertsbomehtfotflbdndm
//
// IMPORTANT (PRD §3/§11/§14): these tables are the ENTIRE server surface.
// No child / maternal / health data is ever stored here — it lives on-device,
// or as opaque ciphertext in `relay_records`.

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
      admin_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id: string
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_admin_id: string | null
          actor_role: Database["public"]["Enums"]["admin_role"] | null
          after: Json | null
          at: string
          before: Json | null
          id: number
          ip: unknown
          subject_user_id: string | null
        }
        Insert: {
          action: string
          actor_admin_id?: string | null
          actor_role?: Database["public"]["Enums"]["admin_role"] | null
          after?: Json | null
          at?: string
          before?: Json | null
          id?: never
          ip?: unknown
          subject_user_id?: string | null
        }
        Update: {
          action?: string
          actor_admin_id?: string | null
          actor_role?: Database["public"]["Enums"]["admin_role"] | null
          after?: Json | null
          at?: string
          before?: Json | null
          id?: never
          ip?: unknown
          subject_user_id?: string | null
        }
        Relationships: []
      }
      config: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          kill_switch: boolean
          locked: boolean
          rollout: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          kill_switch?: boolean
          locked?: boolean
          rollout?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          kill_switch?: boolean
          locked?: boolean
          rollout?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          email: string | null
          entitlements: Json
          id: string
          locale: string
          name: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          sub_status: Database["public"]["Enums"]["sub_status"]
          suspended: boolean
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          email?: string | null
          entitlements?: Json
          id: string
          locale?: string
          name?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          sub_status?: Database["public"]["Enums"]["sub_status"]
          suspended?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          email?: string | null
          entitlements?: Json
          id?: string
          locale?: string
          name?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          sub_status?: Database["public"]["Enums"]["sub_status"]
          suspended?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      relay_records: {
        Row: {
          created_at: string
          encrypted_payload: string
          id: string
          owner_id: string
          recipients: string[]
          updated_at: string
          version_vector: Json
          wrapped_keys: Json
        }
        Insert: {
          created_at?: string
          encrypted_payload: string
          id?: string
          owner_id: string
          recipients?: string[]
          updated_at?: string
          version_vector?: Json
          wrapped_keys?: Json
        }
        Update: {
          created_at?: string
          encrypted_payload?: string
          id?: string
          owner_id?: string
          recipients?: string[]
          updated_at?: string
          version_vector?: Json
          wrapped_keys?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_role_of: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_admin_writer: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_superadmin: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: {
      admin_role: "superadmin" | "admin" | "support"
      plan_tier: "free" | "pro" | "family" | "lifetime"
      sub_status:
        | "none"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]

export type Profile = Tables<"profiles">
export type FeatureFlag = Tables<"feature_flags">
export type ConfigRow = Tables<"config">
export type RelayRecord = Tables<"relay_records">
export type PlanTier = Enums<"plan_tier">
export type SubStatus = Enums<"sub_status">
export type AdminRole = Enums<"admin_role">
