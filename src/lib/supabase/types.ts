export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          created_at: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string;
          address: string;
          city: string;
          state: string | null;
          zip: string;
          lat: number | null;
          lng: number | null;
          service_cost: number;
          service_frequency: "weekly" | "biweekly" | "monthly" | null;
          service_notes: string | null;
          is_active: boolean | null;
          stripe_customer_id: string | null;
          stripe_payment_method_id: string | null;
          payment_setup_token: string | null;
          payment_setup_expires_at: string | null;
          payment_confirmed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone: string;
          address: string;
          city: string;
          state?: string | null;
          zip: string;
          lat?: number | null;
          lng?: number | null;
          service_cost: number;
          service_frequency?: "weekly" | "biweekly" | "monthly" | null;
          service_notes?: string | null;
          is_active?: boolean | null;
          stripe_customer_id?: string | null;
          stripe_payment_method_id?: string | null;
          payment_setup_token?: string | null;
          payment_setup_expires_at?: string | null;
          payment_confirmed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string;
          address?: string;
          city?: string;
          state?: string | null;
          zip?: string;
          lat?: number | null;
          lng?: number | null;
          service_cost?: number;
          service_frequency?: "weekly" | "biweekly" | "monthly" | null;
          service_notes?: string | null;
          is_active?: boolean | null;
          stripe_customer_id?: string | null;
          stripe_payment_method_id?: string | null;
          payment_setup_token?: string | null;
          payment_setup_expires_at?: string | null;
          payment_confirmed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string | null;
          scheduled_date: string;
          scheduled_order: number | null;
          status:
            | "scheduled"
            | "completed"
            | "billed"
            | "cancelled"
            | "rescheduled"
            | null;
          amount_charged: number | null;
          stripe_payment_intent_id: string | null;
          billed_at: string | null;
          completed_at: string | null;
          completion_photo_url: string | null;
          completion_notes: string | null;
          cancelled_reason: string | null;
          rescheduled_to: string | null;
          is_recurring: boolean | null;
          recurrence_source_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_id?: string | null;
          scheduled_date: string;
          scheduled_order?: number | null;
          status?:
            | "scheduled"
            | "completed"
            | "billed"
            | "cancelled"
            | "rescheduled"
            | null;
          amount_charged?: number | null;
          stripe_payment_intent_id?: string | null;
          billed_at?: string | null;
          completed_at?: string | null;
          completion_photo_url?: string | null;
          completion_notes?: string | null;
          cancelled_reason?: string | null;
          rescheduled_to?: string | null;
          is_recurring?: boolean | null;
          recurrence_source_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_id?: string | null;
          scheduled_date?: string;
          scheduled_order?: number | null;
          status?:
            | "scheduled"
            | "completed"
            | "billed"
            | "cancelled"
            | "rescheduled"
            | null;
          amount_charged?: number | null;
          stripe_payment_intent_id?: string | null;
          billed_at?: string | null;
          completed_at?: string | null;
          completion_photo_url?: string | null;
          completion_notes?: string | null;
          cancelled_reason?: string | null;
          rescheduled_to?: string | null;
          is_recurring?: boolean | null;
          recurrence_source_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_recurrence_source_id_fkey";
            columns: ["recurrence_source_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      communications: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string | null;
          job_id: string | null;
          type: "sms" | "email" | "payment_link" | null;
          direction: "outbound" | null;
          content: string | null;
          status: "sent" | "failed" | null;
          provider_message_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_id?: string | null;
          job_id?: string | null;
          type?: "sms" | "email" | "payment_link" | null;
          direction?: "outbound" | null;
          content?: string | null;
          status?: "sent" | "failed" | null;
          provider_message_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_id?: string | null;
          job_id?: string | null;
          type?: "sms" | "email" | "payment_link" | null;
          direction?: "outbound" | null;
          content?: string | null;
          status?: "sent" | "failed" | null;
          provider_message_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "communications_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "communications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
