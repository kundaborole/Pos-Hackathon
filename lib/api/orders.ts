import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/supabase';
import { cache } from 'react';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemVariant = Database['public']['Tables']['order_item_variants']['Row'];
export type OrderItemAddon = Database['public']['Tables']['order_item_addons']['Row'];

export type FullOrder = Order & {
  items: (OrderItem & {
    variants: OrderItemVariant[];
    addons: OrderItemAddon[];
  })[];
};

export const getOrderDetails = cache(async (restaurantId: string, orderId: string): Promise<FullOrder | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        variants:order_item_variants(*),
        addons:order_item_addons(*)
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order details:', error);
    return null;
  }

  return data as FullOrder;
});
