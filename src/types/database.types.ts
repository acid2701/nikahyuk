export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleEnum = "partner" | "wo" | "family_committee";
export type EventSideEnum = "groom" | "bride" | "joint";
export type AttendanceStatusEnum =
  | "pending"
  | "attending"
  | "declined"
  | "checked_in";
export type PaymentStatusEnum = "unpaid" | "paid";
export type CueTypeEnum = "sound" | "lighting" | "multimedia" | "music";
export type GiftTypeEnum = "cash" | "item" | "voucher";
export type ActionTypeEnum =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SHIFT_TIMELINE";

export interface CustomPermissions {
  budget?: boolean;
  vendor?: boolean;
  rundown?: boolean;
  guest?: boolean;
  gift_log?: boolean;
}

export interface ModuleAccess {
  rundown?: boolean;
  checkin?: boolean;
  guest_list?: boolean;
}

export interface Database {
  public: {
    Tables: {
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      global_role_templates: {
        Row: {
          id: string;
          role_name: string;
          default_permissions: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_name: string;
          default_permissions?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_name?: string;
          default_permissions?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_backups: {
        Row: {
          id: string;
          file_name: string;
          r2_file_key: string;
          file_size_bytes: number;
          encryption_algo: string;
          status: "success" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          r2_file_key: string;
          file_size_bytes: number;
          encryption_algo?: string;
          status: "success" | "failed";
          created_at?: string;
        };
        Update: {
          id?: string;
          file_name?: string;
          r2_file_key?: string;
          file_size_bytes?: number;
          encryption_algo?: string;
          status?: "success" | "failed";
          created_at?: string;
        };
        Relationships: [];
      };
      weddings: {
        Row: {
          id: string;
          created_by: string;
          groom_name: string;
          bride_name: string;
          wedding_slug: string;
          groom_father_name?: string | null;
          groom_mother_name?: string | null;
          bride_father_name?: string | null;
          bride_mother_name?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          groom_name: string;
          bride_name: string;
          wedding_slug: string;
          groom_father_name?: string | null;
          groom_mother_name?: string | null;
          bride_father_name?: string | null;
          bride_mother_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          groom_name?: string;
          bride_name?: string;
          wedding_slug?: string;
          groom_father_name?: string | null;
          groom_mother_name?: string | null;
          bride_father_name?: string | null;
          bride_mother_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wedding_collaborators: {
        Row: {
          id: string;
          wedding_id: string;
          user_id: string;
          role: UserRoleEnum;
          custom_permissions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          user_id: string;
          role?: UserRoleEnum;
          custom_permissions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          user_id?: string;
          role?: UserRoleEnum;
          custom_permissions?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wedding_collaborators_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      wedding_events: {
        Row: {
          id: string;
          wedding_id: string;
          event_name: string;
          event_date: string | null;
          time_start: string | null;
          time_end: string | null;
          event_side: EventSideEnum;
          location_name: string | null;
          location_maps_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          event_name: string;
          event_date?: string | null;
          time_start?: string | null;
          time_end?: string | null;
          event_side?: EventSideEnum;
          location_name?: string | null;
          location_maps_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          event_name?: string;
          event_date?: string | null;
          time_start?: string | null;
          time_end?: string | null;
          event_side?: EventSideEnum;
          location_name?: string | null;
          location_maps_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wedding_events_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      guest_categories: {
        Row: {
          id: string;
          wedding_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guest_categories_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      guests: {
        Row: {
          id: string;
          wedding_id: string;
          category_id: string | null;
          full_name: string;
          sanitized_phone: string | null;
          default_pax: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          category_id?: string | null;
          full_name: string;
          sanitized_phone?: string | null;
          default_pax?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          category_id?: string | null;
          full_name?: string;
          sanitized_phone?: string | null;
          default_pax?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guests_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "guest_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      event_tables: {
        Row: {
          id: string;
          event_id: string;
          table_number_or_name: string;
          max_seats: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          table_number_or_name: string;
          max_seats?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          table_number_or_name?: string;
          max_seats?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_tables_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          }
        ];
      };
      event_guest_assignments: {
        Row: {
          id: string;
          event_id: string;
          guest_id: string;
          table_id: string | null;
          actual_pax: number;
          attendance_status: AttendanceStatusEnum;
          souvenir_received: boolean;
          is_walk_in: boolean;
          checkin_timestamp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          guest_id: string;
          table_id?: string | null;
          actual_pax?: number;
          attendance_status?: AttendanceStatusEnum;
          souvenir_received?: boolean;
          is_walk_in?: boolean;
          checkin_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          guest_id?: string;
          table_id?: string | null;
          actual_pax?: number;
          attendance_status?: AttendanceStatusEnum;
          souvenir_received?: boolean;
          is_walk_in?: boolean;
          checkin_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_guest_assignments_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_guest_assignments_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_guest_assignments_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "event_tables";
            referencedColumns: ["id"];
          }
        ];
      };
      vendors: {
        Row: {
          id: string;
          wedding_id: string;
          category: string;
          vendor_name: string;
          pic_name: string | null;
          sanitized_phone: string | null;
          contract_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          category: string;
          vendor_name: string;
          pic_name?: string | null;
          sanitized_phone?: string | null;
          contract_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          category?: string;
          vendor_name?: string;
          pic_name?: string | null;
          sanitized_phone?: string | null;
          contract_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_documents: {
        Row: {
          id: string;
          vendor_id: string;
          document_title: string;
          r2_file_key: string;
          file_size_bytes: number;
          mime_type: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          document_title: string;
          r2_file_key: string;
          file_size_bytes: number;
          mime_type: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          document_title?: string;
          r2_file_key?: string;
          file_size_bytes?: number;
          mime_type?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      budget_categories: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_categories_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          }
        ];
      };
      budget_items: {
        Row: {
          id: string;
          event_id: string;
          category_id: string | null;
          vendor_id: string | null;
          item_name: string;
          estimated_cost: number;
          target_payer: EventSideEnum;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          category_id?: string | null;
          vendor_id?: string | null;
          item_name: string;
          estimated_cost?: number;
          target_payer?: EventSideEnum;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          category_id?: string | null;
          vendor_id?: string | null;
          item_name?: string;
          estimated_cost?: number;
          target_payer?: EventSideEnum;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_items_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "budget_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_items_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_milestones: {
        Row: {
          id: string;
          budget_item_id: string;
          milestone_name: string;
          amount: number;
          due_date: string | null;
          paid_date: string | null;
          alert_days_before: number;
          payment_status: PaymentStatusEnum;
          paid_by: EventSideEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          budget_item_id: string;
          milestone_name: string;
          amount?: number;
          due_date?: string | null;
          paid_date?: string | null;
          alert_days_before?: number;
          payment_status?: PaymentStatusEnum;
          paid_by?: EventSideEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          budget_item_id?: string;
          milestone_name?: string;
          amount?: number;
          due_date?: string | null;
          paid_date?: string | null;
          alert_days_before?: number;
          payment_status?: PaymentStatusEnum;
          paid_by?: EventSideEnum;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_milestones_budget_item_id_fkey";
            columns: ["budget_item_id"];
            isOneToOne: false;
            referencedRelation: "budget_items";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_attachments: {
        Row: {
          id: string;
          milestone_id: string;
          r2_file_key: string;
          file_name: string;
          file_size_bytes: number;
          mime_type: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          r2_file_key: string;
          file_name: string;
          file_size_bytes: number;
          mime_type: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          milestone_id?: string;
          r2_file_key?: string;
          file_name?: string;
          file_size_bytes?: number;
          mime_type?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_attachments_milestone_id_fkey";
            columns: ["milestone_id"];
            isOneToOne: false;
            referencedRelation: "payment_milestones";
            referencedColumns: ["id"];
          }
        ];
      };
      rundowns: {
        Row: {
          id: string;
          event_id: string;
          time_start: string;
          time_end: string;
          activity_title: string;
          pic_name: string | null;
          location: string | null;
          contingency_plan: string | null;
          is_internal_only: boolean;
          is_completed: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          time_start: string;
          time_end: string;
          activity_title: string;
          pic_name?: string | null;
          location?: string | null;
          contingency_plan?: string | null;
          is_internal_only?: boolean;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          time_start?: string;
          time_end?: string;
          activity_title?: string;
          pic_name?: string | null;
          location?: string | null;
          contingency_plan?: string | null;
          is_internal_only?: boolean;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rundowns_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          }
        ];
      };
      rundown_cues: {
        Row: {
          id: string;
          rundown_id: string;
          cue_type: CueTypeEnum;
          instruction: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rundown_id: string;
          cue_type: CueTypeEnum;
          instruction: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rundown_id?: string;
          cue_type?: CueTypeEnum;
          instruction?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rundown_cues_rundown_id_fkey";
            columns: ["rundown_id"];
            isOneToOne: false;
            referencedRelation: "rundowns";
            referencedColumns: ["id"];
          }
        ];
      };
      souvenirs: {
        Row: {
          id: string;
          event_id: string;
          souvenir_name: string;
          total_stock: number;
          distributed_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          souvenir_name: string;
          total_stock?: number;
          distributed_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          souvenir_name?: string;
          total_stock?: number;
          distributed_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "souvenirs_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          }
        ];
      };
      gifts_log: {
        Row: {
          id: string;
          event_id: string;
          guest_id: string | null;
          giver_name: string;
          gift_type: GiftTypeEnum;
          amount: number;
          item_description: string | null;
          giver_side: EventSideEnum;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          guest_id?: string | null;
          giver_name: string;
          gift_type?: GiftTypeEnum;
          amount?: number;
          item_description?: string | null;
          giver_side?: EventSideEnum;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          guest_id?: string | null;
          giver_name?: string;
          gift_type?: GiftTypeEnum;
          amount?: number;
          item_description?: string | null;
          giver_side?: EventSideEnum;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gifts_log_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "wedding_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gifts_log_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          }
        ];
      };
      shareable_tokens: {
        Row: {
          id: string;
          wedding_id: string;
          token_hash: string;
          pin_hash: string | null;
          module_access: Json;
          hide_internal_notes: boolean;
          expires_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          token_hash: string;
          pin_hash?: string | null;
          module_access?: Json;
          hide_internal_notes?: boolean;
          expires_at: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          token_hash?: string;
          pin_hash?: string | null;
          module_access?: Json;
          hide_internal_notes?: boolean;
          expires_at?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shareable_tokens_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          wedding_id: string;
          user_id: string | null;
          user_display_name: string;
          module_name: string;
          action_type: ActionTypeEnum;
          change_diff: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          user_id?: string | null;
          user_display_name: string;
          module_name: string;
          action_type: ActionTypeEnum;
          change_diff?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          user_id?: string | null;
          user_display_name?: string;
          module_name?: string;
          action_type?: ActionTypeEnum;
          change_diff?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_wedding_member: {
        Args: {
          p_wedding_id: string;
        };
        Returns: boolean;
      };
      is_superadmin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role_enum: UserRoleEnum;
      event_side_enum: EventSideEnum;
      attendance_status_enum: AttendanceStatusEnum;
      payment_status_enum: PaymentStatusEnum;
      cue_type_enum: CueTypeEnum;
      gift_type_enum: GiftTypeEnum;
      action_type_enum: ActionTypeEnum;
    };
  };
}
