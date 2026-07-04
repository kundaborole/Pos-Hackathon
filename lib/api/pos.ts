import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/supabase';
import { cache } from 'react';

type POSTerminal = Database['public']['Tables']['pos_terminals']['Row'];
type POSSession = Database['public']['Tables']['pos_sessions']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

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
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('pos_sessions')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching active POS session:', error);
    return null;
  }

  return data;
});

export const getPendingOrders = cache(async (restaurantId: string): Promise<Order[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('payment_status', 'unpaid')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending orders:', error);
    return [];
  }
  return data;
});

export const getSessionPayments = cache(async (restaurantId: string, sessionId: string): Promise<Payment[]> => {
  const supabase = await createClient();
  
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('pos_session_id', sessionId);

  if (ordersError || !orders || orders.length === 0) {
    return [];
  }

  const orderIds = orders.map(o => o.id);

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .in('order_id', orderIds)
    .eq('status', 'paid');

  if (paymentsError) {
    console.error('Error fetching session payments:', paymentsError);
    return [];
  }
  return payments;
});
