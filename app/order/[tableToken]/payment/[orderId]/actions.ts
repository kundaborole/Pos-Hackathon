"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { validateTableSession } from "@/lib/api/customer";

export async function processPaymentAction(
  publicToken: string,
  orderId: string,
  method: string,
  amount: number
) {
  const session = await validateTableSession(publicToken);
  if (!session) {
    return { success: false, error: 'Invalid or expired session' };
  }

  const adminClient = createAdminClient();

  // 1. Verify the order belongs to this session and is unpaid
  const { data: order, error: orderErr } = await adminClient
    .from('orders')
    .select('id, total_amount, payment_status, kitchen_status, table_id, order_status')
    .eq('id', orderId)
    .eq('restaurant_id', session.restaurant_id)
    .single();

  if (orderErr || !order) {
    return { success: false, error: 'Order not found' };
  }

  if (order.payment_status === 'paid') {
    return { success: true, message: 'Order is already paid' };
  }

  if (Math.abs(Number(order.total_amount) - amount) > 0.01) {
    // Basic guard
    return { success: false, error: 'Payment amount mismatch' };
  }

  // 2. Insert Payment Record
  const { error: paymentErr } = await adminClient
    .from('payments')
    .insert({
      restaurant_id: session.restaurant_id,
      order_id: order.id,
      payment_method: method as "upi" | "cash" | "card",
      amount: amount,
      status: 'paid', // Correct enum value
      paid_at: new Date().toISOString()
    });

  if (paymentErr) {
    console.error('Payment Error:', paymentErr);
    return { success: false, error: 'Failed to record payment' };
  }

  // 3. Trigger Order Completion Workflow
  // If payment is paid, we update the order to paid.
  // If kitchen is also completed, the whole order is completed.
  
  const isOrderFullyComplete = order.kitchen_status === 'completed';

  const { error: updateErr } = await adminClient
    .from('orders')
    .update({
      payment_status: 'paid',
      order_status: isOrderFullyComplete ? 'completed' : order.order_status
    })
    .eq('id', order.id);

  if (updateErr) {
    return { success: false, error: 'Failed to update order status' };
  }

  // 4. If fully complete, free the table
  if (isOrderFullyComplete && order.table_id) {
    await adminClient
      .from('restaurant_tables')
      .update({ status: 'available' }) // Free up the table
      .eq('id', order.table_id);
  }

  return { success: true };
}
