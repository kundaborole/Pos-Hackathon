import { createClient } from '@/lib/supabase/server';

import { Database } from '@/types/supabase';
import { cache } from 'react';

export type KitchenStation = Database['public']['Tables']['kitchen_stations']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type KitchenTicketItem = OrderItem & {
  product: {
    kitchen_station_id: string | null;
    category: {
      kitchen_station_id: string | null;
    } | null;
  } | null;
};

export type KitchenTicket = Order & {
  table: { table_number: string } | null;
  items: KitchenTicketItem[];
};

export const getKitchenStations = cache(async (restaurantId: string): Promise<KitchenStation[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kitchen_stations')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name');

  if (error) {
    console.error('Error fetching kitchen stations:', error);
    return [];
  }
  return data;
});

export const getActiveKitchenTickets = cache(async (restaurantId: string): Promise<KitchenTicket[]> => {
  const supabase = await createClient();
  
  // Fetch orders that are not completed (pending, preparing) 
  // or completed today. For simplicity in the hackathon, we fetch orders where order_status is NOT 'completed' or 'cancelled'.
  // Actually, KDS cares about kitchen_status.
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      table:restaurant_tables(table_number),
      items:order_items(
        *,
        product:products(
          kitchen_station_id,
          category:categories(kitchen_station_id)
        )
      )
    `)
    .eq('restaurant_id', restaurantId)
    .in('kitchen_status', ['pending', 'preparing', 'completed']) // We might want to filter out old completed orders later
    .neq('order_status', 'completed')
    .neq('order_status', 'cancelled')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching kitchen tickets:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any as KitchenTicket[];
});
