import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { cache } from 'react';

type Floor = Database['public']['Tables']['floors']['Row'];
type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row'];

export type FloorWithTables = Floor & {
  tables: RestaurantTable[];
};

export const getFloors = cache(async (restaurantId: string): Promise<FloorWithTables[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('floors')
    .select(`
      *,
      tables:restaurant_tables(*)
    `)
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[DEBUG getFloors] Supabase error:', error);
    return [];
  }
  console.log('[DEBUG getFloors] Supabase returned data count:', data?.length);

  // Ensure tables are ordered by table_number logically (e.g. 1, 2, 3...)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((floor: any) => ({
    ...floor,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tables: (floor.tables || []).sort((a: any, b: any) => 
      a.table_number.localeCompare(b.table_number, undefined, { numeric: true })
    )
  }));
});

export const getActiveFloors = cache(async (restaurantId: string): Promise<FloorWithTables[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('floors')
    .select(`
      *,
      tables:restaurant_tables(*)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching active floors:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((floor: any) => ({
    ...floor,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tables: (floor.tables || []).filter((t: any) => t.is_active).sort((a: any, b: any) => 
      a.table_number.localeCompare(b.table_number, undefined, { numeric: true })
    )
  }));
});
