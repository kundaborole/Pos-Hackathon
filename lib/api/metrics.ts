import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export interface DashboardMetrics {
  kpis: {
    revenue: number;
    revenueTrend: string;
    isRevenuePositive: boolean;
    orders: number;
    ordersTrend: string;
    isOrdersPositive: boolean;
    avgTicket: number;
    ticketTrend: string;
    isTicketPositive: boolean;
  };
  recentOrders: {
    id: string;
    order_number: string;
    table: string;
    status: string;
    time: string;
    total: number;
  }[];
  kitchenPulse: {
    pendingTickets: number;
    completedToday: number;
  };
}

export const getDashboardMetrics = cache(async (restaurantId: string): Promise<DashboardMetrics> => {
  const supabase = await createClient();
  
  // 1. Get today's bounds
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // 2. Fetch today's completed orders for KPI
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('id, total_amount, order_status, kitchen_status, created_at, restaurant_tables(table_number), order_number')
    .eq('restaurant_id', restaurantId)
    .gte('created_at', todayStr);

  const completedToday = todayOrders?.filter(o => o.order_status === 'completed') || [];
  const revenueToday = completedToday.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const orderCountToday = completedToday.length;
  const avgTicketToday = orderCountToday > 0 ? revenueToday / orderCountToday : 0;

  // 3. Format recent orders (top 5)
  const recentOrders = (todayOrders || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(o => ({
      id: o.id,
      order_number: o.order_number,
      // @ts-expect-error relation
      table: o.restaurant_tables?.table_number || 'N/A',
      status: o.order_status,
      time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: Number(o.total_amount)
    }));

  // 4. Kitchen Pulse
  const pendingTickets = (todayOrders || []).filter(o => o.kitchen_status === 'pending' || o.kitchen_status === 'preparing').length;

  return {
    kpis: {
      revenue: revenueToday,
      revenueTrend: '+0%', // Mock trend for hackathon
      isRevenuePositive: true,
      orders: orderCountToday,
      ordersTrend: '+0%',
      isOrdersPositive: true,
      avgTicket: avgTicketToday,
      ticketTrend: '+0%',
      isTicketPositive: true
    },
    recentOrders,
    kitchenPulse: {
      pendingTickets,
      completedToday: completedToday.length
    }
  };
});
