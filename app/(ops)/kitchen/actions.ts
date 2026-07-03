"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function updateOrderItemStatusAction(itemId: string, status: 'pending' | 'preparing' | 'completed') {
  const profile = await requireAuth();
  
  if (!['admin', 'kitchen', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for this action');
  }

  const supabase = await createClient();

  // First, verify the item belongs to the restaurant
  const { data: item, error: itemErr } = await supabase
    .from('order_items')
    .select('order_id, orders!inner(restaurant_id)')
    .eq('id', itemId)
    .single();

  if (itemErr || !item) {
    return { success: false, error: 'Item not found' };
  }

  // @ts-expect-error - relation join typing
  if (item.orders.restaurant_id !== profile.restaurant_id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Update item status
  const { error: updateErr } = await supabase
    .from('order_items')
    .update({ kitchen_status: status })
    .eq('id', itemId);

  if (updateErr) {
    return { success: false, error: 'Failed to update item status' };
  }

  // If item is marked completed, check if ALL items for this order are completed
  if (status === 'completed') {
    const { data: allItems, error: allItemsErr } = await supabase
      .from('order_items')
      .select('kitchen_status')
      .eq('order_id', item.order_id);

    if (!allItemsErr && allItems) {
      const allCompleted = allItems.every(i => i.kitchen_status === 'completed');
      if (allCompleted) {
        // Automatically mark the entire order as completed
        await updateOrderKitchenStatusAction(item.order_id, 'completed');
      }
    }
  }

  return { success: true };
}

export async function updateOrderKitchenStatusAction(orderId: string, status: 'pending' | 'preparing' | 'completed') {
  const profile = await requireAuth();
  
  if (!['admin', 'kitchen', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for this action');
  }

  const supabase = await createClient();

  // Validate order belongs to restaurant
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, table_id')
    .eq('id', orderId)
    .eq('restaurant_id', profile.restaurant_id)
    .single();

  if (orderErr || !order) {
    return { success: false, error: 'Order not found' };
  }

  // Update order status
  const { error: updateOrderErr } = await supabase
    .from('orders')
    .update({ kitchen_status: status })
    .eq('id', orderId);

  if (updateOrderErr) {
    return { success: false, error: 'Failed to update order status' };
  }

  // Update all non-completed items to the new status as a fallback 
  // (e.g. if entire order is marked preparing, pending items should become preparing)
  if (status === 'preparing') {
    await supabase
      .from('order_items')
      .update({ kitchen_status: 'preparing' })
      .eq('order_id', orderId)
      .eq('kitchen_status', 'pending');
  } else if (status === 'completed') {
    await supabase
      .from('order_items')
      .update({ kitchen_status: 'completed' })
      .eq('order_id', orderId)
      .neq('kitchen_status', 'completed');
  }

  // If order is completed, update table status to ready
  if (status === 'completed' && order.table_id) {
    await supabase
      .from('restaurant_tables')
      .update({ status: 'ready' })
      .eq('id', order.table_id);
  } else if (status === 'preparing' && order.table_id) {
    await supabase
      .from('restaurant_tables')
      .update({ status: 'preparing' })
      .eq('id', order.table_id);
  }

  return { success: true };
}
