"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function sendOrderToKitchenAction(orderId: string) {
  const profile = await requireAuth();
  
  if (!['admin', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for this action');
  }

  const supabase = await createClient();

  // Validate order belongs to restaurant
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, kitchen_status, table_id')
    .eq('id', orderId)
    .eq('restaurant_id', profile.restaurant_id)
    .single();

  if (orderErr || !order) {
    return { success: false, error: 'Order not found' };
  }

  if (order.kitchen_status !== 'pending') {
    return { success: false, error: 'Order is not in pending state' };
  }

  // Find items that need to go to kitchen
  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('id')
    .eq('order_id', orderId)
    .eq('kitchen_status', 'pending');

  if (itemsErr) {
    return { success: false, error: 'Failed to fetch order items' };
  }

  if (!items || items.length === 0) {
    // Maybe everything was completed instantly? 
    // Just update order status
    await supabase.from('orders').update({ kitchen_status: 'completed' }).eq('id', orderId);
    return { success: true };
  }

  // Update items to preparing
  const itemIds = items.map(i => i.id);
  const { error: updateItemsErr } = await supabase
    .from('order_items')
    .update({ kitchen_status: 'preparing' })
    .in('id', itemIds);

  if (updateItemsErr) {
    return { success: false, error: 'Failed to update items' };
  }

  // Update order to preparing
  const { error: updateOrderErr } = await supabase
    .from('orders')
    .update({ kitchen_status: 'preparing' })
    .eq('id', orderId);

  if (updateOrderErr) {
    return { success: false, error: 'Failed to update order' };
  }

  // Update table status if applicable
  if (order.table_id) {
    await supabase
      .from('restaurant_tables')
      .update({ status: 'preparing' })
      .eq('id', order.table_id);
  }

  return { success: true };
}
