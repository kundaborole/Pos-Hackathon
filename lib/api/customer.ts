import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { FullOrder } from './orders';

export const getPublicOrderDetails = cache(async (orderId: string, tableToken: string): Promise<FullOrder | null> => {
  const supabase = await createClient();

  // First, verify the table token is valid
  const { data: tableSession, error: tokenErr } = await supabase
    .from('table_sessions')
    .select('restaurant_id, table_id')
    .eq('public_token', tableToken)
    .eq('status', 'active')
    .single();

  if (tokenErr || !tableSession) {
    // If not using QR sessions yet (Phase 8), we can fallback to matching the table's qr_token
    const { data: table, error: tableErr } = await supabase
      .from('restaurant_tables')
      .select('restaurant_id, id')
      .eq('qr_token', tableToken)
      .single();
      
    if (tableErr || !table) {
      console.error('Invalid table token');
      return null;
    }
    
    // Now fetch the order using the resolved restaurant_id
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          variants:order_item_variants(*),
          addons:order_item_addons(*)
        )
      `)
      .eq('id', orderId)
      .eq('restaurant_id', table.restaurant_id)
      // .eq('table_id', table.id) // Optionally enforce it matches the table
      .single();

    if (orderErr) return null;
    return order as FullOrder;
  }

  // Handle active session case (future-proofing)
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        variants:order_item_variants(*),
        addons:order_item_addons(*)
      )
    `)
    .eq('id', orderId)
    .eq('restaurant_id', tableSession.restaurant_id)
    .single();

  if (orderErr) return null;
  return order as FullOrder;
});
