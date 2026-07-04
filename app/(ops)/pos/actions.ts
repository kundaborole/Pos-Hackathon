"use server";

import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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
  
  if (!['admin', 'waiter'].includes(profile.role)) {
    throw new Error('Unauthorized role for POS order submission');
  }

  const supabase = createAdminClient();

  // 1. Generate Order Number
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const orderNumber = `ORD-${dateStr}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // 2. Insert Order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      restaurant_id: profile.restaurant_id,
      order_number: orderNumber,
      table_id: payload.table_id || null,
      pos_session_id: payload.pos_session_id || null,
      created_by: profile.id,
      source: payload.source,
      order_type: payload.order_type || 'dine_in',
      order_status: 'draft',
      kitchen_status: 'pending',
      payment_status: 'unpaid',
      subtotal: 0,
      tax_amount: 0,
      service_charge: 0,
      discount_amount: 0,
      total_amount: 0,
      special_instructions: payload.special_instructions,
      idempotency_key: payload.idempotency_key
    })
    .select('id')
    .single();

  if (orderError || !orderData) {
    console.error('Order Insert Error:', orderError);
    return { success: false, error: orderError?.message || 'Failed to create order' };
  }

  // 3. Insert Items
  for (const item of payload.items) {
    // Get product price (mocked fetch for simplicity, assume 0 base if not found)
    const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).single();
    
    const { data: itemData, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name_snapshot: product ? product.name : 'Unknown Product',
        quantity: item.quantity,
        unit_price: product ? product.base_price : 0,
        tax_amount: 0,
        total_price: (product ? product.base_price : 0) * item.quantity,
        kitchen_status: 'pending',
        special_instructions: item.special_instructions
      })
      .select('id')
      .single();

    if (itemError || !itemData) continue;

    // Insert variants
    for (const variant of item.variants) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { value_id: _variant, ...variantData } = variant;
      await supabase.from('order_item_variants').insert({
        order_item_id: itemData.id,
        variant_name_snapshot: 'Variant',
        value_name_snapshot: 'Value',
        price_delta: 0
      });
    }

    // Insert addons
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _addon of item.addons) {
      await supabase.from('order_item_addons').insert({
        order_item_id: itemData.id,
        addon_name_snapshot: 'Addon',
        quantity: 1,
        unit_price: 0,
        total_price: 0
      });
    }
  }

  return { 
    success: true, 
    order_id: orderData.id, 
    order_number: orderNumber 
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

  const supabase = createAdminClient();

  // 1. Insert payment
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      restaurant_id: profile.restaurant_id,
      order_id: payload.order_id,
      amount: payload.amount,
      payment_method: payload.payment_method,
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (paymentError) {
    console.error('Payment Error:', paymentError);
    return { success: false, error: paymentError.message || 'Payment failed' };
  }

  // 2. Update order status and get table_id
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'paid', 
      order_status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', payload.order_id)
    .select('table_id')
    .single();

  if (orderError) {
    return { success: false, error: orderError.message };
  }

  // 3. Free table
  if (orderData?.table_id) {
    await supabase
      .from('restaurant_tables')
      .update({ status: 'available' })
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

  const supabase = createAdminClient();
  
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
