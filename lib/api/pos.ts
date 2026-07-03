import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { cache } from 'react';

type POSTerminal = Database['public']['Tables']['pos_terminals']['Row'];
type POSSession = Database['public']['Tables']['pos_sessions']['Row'];

export const getTerminals = cache(async (restaurantId: string): Promise<POSTerminal[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pos_terminals')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching terminals:', error);
    return [];
  }

  return data;
});

export const getActiveSession = cache(async (restaurantId: string, cashierId: string): Promise<POSSession | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pos_sessions')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('cashier_id', cashierId)
    .eq('status', 'open')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching active POS session:', error);
    return null;
  }

  return data;
});
