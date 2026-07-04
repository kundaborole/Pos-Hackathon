"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function submitPosOrderAction(payload: {
  table_id?: string;
  pos_session_id?: string;
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
  if (!['admin', 'waiter'].includes(profile.role)) {
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

export async function processPaymentAction(payload: {
  order_id: string;
  pos_session_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi';
}) {
  const profile = await requireAuth();
  
  if (!['admin', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for payment processing');
  }

  const supabase = await createClient();

  const { error: paymentError } = await supabase.from('payments').insert({
    restaurant_id: profile.restaurant_id,
    order_id: payload.order_id,
    payment_method: payload.payment_method,
    status: 'paid',
    amount: payload.amount,
    paid_at: new Date().toISOString()
  });

  if (paymentError) {
    return { success: false, error: paymentError.message };
  }

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      order_status: 'completed',
      pos_session_id: payload.pos_session_id,
      completed_at: new Date().toISOString()
    })
    .eq('id', payload.order_id)
    .eq('restaurant_id', profile.restaurant_id)
    .select('table_id')
    .single();

  if (orderError) {
    return { success: false, error: orderError.message };
  }

  if (orderData?.table_id) {
    await supabase
      .from('restaurant_tables')
      .update({ status: 'cleaning' })
      .eq('id', orderData.table_id);
  }

  return { success: true };
}

export async function closeRegisterAction(payload: {
  pos_session_id: string;
  expected_cash: number;
  counted_cash: number;
  closing_notes: string;
}) {
  const profile = await requireAuth();
  
  if (!['admin', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for register operations');
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('pos_sessions')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      expected_cash: payload.expected_cash,
      counted_cash: payload.counted_cash,
      closing_notes: payload.closing_notes
    })
    .eq('id', payload.pos_session_id)
    .eq('restaurant_id', profile.restaurant_id);

  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}
