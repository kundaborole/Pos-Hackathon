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
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          kitchen_station_id: string | null
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          kitchen_station_id?: string | null
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          kitchen_station_id?: string | null
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
      }
      floors: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
      }
      kitchen_stations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
      }
      order_item_addons: {
        Row: {
          addon_name_snapshot: string
          id: string
          order_item_id: string
          price: number
        }
        Insert: {
          addon_name_snapshot: string
          id?: string
          order_item_id: string
          price?: number
        }
        Update: {
          addon_name_snapshot?: string
          id?: string
          order_item_id?: string
          price?: number
        }
      }
      order_item_variants: {
        Row: {
          id: string
          order_item_id: string
          price_delta: number
          value_name_snapshot: string
          variant_name_snapshot: string
        }
        Insert: {
          id?: string
          order_item_id: string
          price_delta?: number
          value_name_snapshot: string
          variant_name_snapshot: string
        }
        Update: {
          id?: string
          order_item_id?: string
          price_delta?: number
          value_name_snapshot?: string
          variant_name_snapshot?: string
        }
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          kitchen_status: Database["public"]["Enums"]["kitchen_status"]
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          special_instructions: string | null
          tax_amount: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kitchen_status?: Database["public"]["Enums"]["kitchen_status"]
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity?: number
          special_instructions?: string | null
          tax_amount?: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kitchen_status?: Database["public"]["Enums"]["kitchen_status"]
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          special_instructions?: string | null
          tax_amount?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          discount_amount: number
          id: string
          kitchen_status: Database["public"]["Enums"]["kitchen_status"]
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          order_type: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          pos_session_id: string | null
          restaurant_id: string
          service_charge: number
          source: Database["public"]["Enums"]["order_source"]
          special_instructions: string | null
          subtotal: number
          table_id: string | null
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          kitchen_status?: Database["public"]["Enums"]["kitchen_status"]
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          order_type?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pos_session_id?: string | null
          restaurant_id: string
          service_charge?: number
          source: Database["public"]["Enums"]["order_source"]
          special_instructions?: string | null
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          kitchen_status?: Database["public"]["Enums"]["kitchen_status"]
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          order_type?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pos_session_id?: string | null
          restaurant_id?: string
          service_charge?: number
          source?: Database["public"]["Enums"]["order_source"]
          special_instructions?: string | null
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
      }
      payment_method_configs: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_enabled: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          restaurant_id: string
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_enabled?: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          restaurant_id: string
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_enabled?: boolean | null
          method?: Database["public"]["Enums"]["payment_method"]
          restaurant_id?: string
          updated_at?: string
          upi_id?: string | null
        }
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          restaurant_id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          paid_at?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          restaurant_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          restaurant_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
        }
      }
      pos_sessions: {
        Row: {
          cashier_id: string
          closed_at: string | null
          closing_notes: string | null
          counted_cash: number | null
          created_at: string
          expected_cash: number | null
          id: string
          opened_at: string
          opening_cash: number
          restaurant_id: string
          status: string
          terminal_id: string
        }
        Insert: {
          cashier_id: string
          closed_at?: string | null
          closing_notes?: string | null
          counted_cash?: number | null
          created_at?: string
          expected_cash?: number | null
          id?: string
          opened_at?: string
          opening_cash?: number
          restaurant_id: string
          status?: string
          terminal_id: string
        }
        Update: {
          cashier_id?: string
          closed_at?: string | null
          closing_notes?: string | null
          counted_cash?: number | null
          created_at?: string
          expected_cash?: number | null
          id?: string
          opened_at?: string
          opening_cash?: number
          restaurant_id?: string
          status?: string
          terminal_id?: string
        }
      }
      pos_terminals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
      }
      product_addons: {
        Row: {
          created_at: string
          id: string
          is_available: boolean | null
          name: string
          price: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          name: string
          price?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number
          product_id?: string
        }
      }
      product_variant_values: {
        Row: {
          created_at: string
          id: string
          name: string
          price_delta: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_delta?: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_delta?: number
          variant_id?: string
        }
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string
        }
      }
      products: {
        Row: {
          base_price: number
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          kitchen_station_id: string | null
          name: string
          restaurant_id: string
          send_to_kitchen: boolean | null
          tax_rate: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          base_price?: number
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          kitchen_station_id?: string | null
          name: string
          restaurant_id: string
          send_to_kitchen?: boolean | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          kitchen_station_id?: string | null
          name?: string
          restaurant_id?: string
          send_to_kitchen?: boolean | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          restaurant_id: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          restaurant_id: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          restaurant_id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          staff_id?: string | null
          updated_at?: string
        }
      }
      restaurant_tables: {
        Row: {
          capacity: number | null
          created_at: string
          floor_id: string
          id: string
          is_active: boolean | null
          qr_token: string
          restaurant_id: string
          status: Database["public"]["Enums"]["table_status"] | null
          table_number: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          floor_id: string
          id?: string
          is_active?: boolean | null
          qr_token: string
          restaurant_id: string
          status?: Database["public"]["Enums"]["table_status"] | null
          table_number: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          floor_id?: string
          id?: string
          is_active?: boolean | null
          qr_token?: string
          restaurant_id?: string
          status?: Database["public"]["Enums"]["table_status"] | null
          table_number?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          created_at: string
          currency: string
          default_tax_rate: number | null
          id: string
          is_open: boolean | null
          name: string
          order_prefix: string | null
          service_charge: number | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_tax_rate?: number | null
          id?: string
          is_open?: boolean | null
          name: string
          order_prefix?: string | null
          service_charge?: number | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_tax_rate?: number | null
          id?: string
          is_open?: boolean | null
          name?: string
          order_prefix?: string | null
          service_charge?: number | null
          timezone?: string
          updated_at?: string
        }
      }
      table_sessions: {
        Row: {
          closed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          opened_at: string
          public_token: string
          restaurant_id: string
          status: string
          table_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          opened_at?: string
          public_token?: string
          restaurant_id: string
          status?: string
          table_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          opened_at?: string
          public_token?: string
          restaurant_id?: string
          status?: string
          table_id?: string
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
      kitchen_status: "pending" | "preparing" | "completed"
      order_source: "pos" | "waiter" | "qr" | "kiosk"
      order_status:
        | "draft"
        | "confirmed"
        | "to_cook"
        | "preparing"
        | "ready"
        | "served"
        | "completed"
        | "cancelled"
      payment_method: "cash" | "card" | "upi"
      payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
      staff_role: "admin" | "cashier" | "waiter" | "kitchen"
      table_status:
        | "available"
        | "occupied"
        | "preparing"
        | "ready"
        | "waiting_payment"
        | "cleaning"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
