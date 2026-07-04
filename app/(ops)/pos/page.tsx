import { requireAuth } from '@/lib/auth';
import { getAvailableProducts, getCategories } from '@/lib/api/products';
import { getActiveFloors } from '@/lib/api/floors';
import { getActiveSession, getPendingOrders, getSessionPayments } from '@/lib/api/pos';
import POSOrderClient from './pos-client';
import CashierDashboardClient from './cashier-dashboard';
import { Database } from '@/types/supabase';

export default async function POSOrderPage({
  searchParams
}: {
  searchParams: Promise<{ table_id?: string }>
}) {
  const profile = await requireAuth();
  
  if (profile.role === 'cashier') {
    const [activeSession, pendingOrders] = await Promise.all([
      getActiveSession(profile.restaurant_id, profile.id),
      getPendingOrders(profile.restaurant_id)
    ]);
    
    // Fetch payments for session if session is active
    let sessionPayments: Database['public']['Tables']['payments']['Row'][] = [];
    if (activeSession) {
      sessionPayments = await getSessionPayments(profile.restaurant_id, activeSession.id);
    }
    
    return (
      <CashierDashboardClient 
        activeSession={activeSession}
        profileName={profile.full_name}
        pendingOrders={pendingOrders}
        sessionPayments={sessionPayments}
      />
    );
  }

  // Fallback to POS order entry for admin / waiter
  const [products, categories, floors, activeSession, resolvedParams] = await Promise.all([
    getAvailableProducts(profile.restaurant_id),
    getCategories(profile.restaurant_id),
    getActiveFloors(profile.restaurant_id),
    getActiveSession(profile.restaurant_id, profile.id),
    searchParams
  ]);

  return (
    <POSOrderClient 
      products={products} 
      categories={categories} 
      floors={floors} 
      activeSession={activeSession}
      profileName={profile.full_name}
      initialTableId={resolvedParams.table_id}
    />
  );
}
