"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function submitPosOrderAction(payload: {
  table_id: string;
  pos_session_id: string;
  source: string;
  order_type: string;
  special_instructions: string;
  idempotency_key: string;
  items: {
    product_id: string;
    quantity: number;
    special_instructions: string;
    variants: { value_id: string }[];
    addons: { addon_id: string }[];
  }[];
}) {
  const profile = await requireAuth();
  
  // Enforce server-side role check
  if (!['admin', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for POS order submission');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('create_pos_order', {
    payload: {
      ...payload,
      restaurant_id: profile.restaurant_id // Although RPC ignores it, good practice
    }
  });

  if (error) {
    console.error('RPC error:', error);
    return { success: false, error: error.message };
  }

  if (data?.error) {
    return { success: false, error: data.message || data.error };
  }

  return { 
    success: true, 
    order_id: data.order_id, 
    order_number: data.order_number 
  };
}
