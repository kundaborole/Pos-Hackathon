import { requireAuth } from '@/lib/auth';
import { getAvailableProducts, getCategories } from '@/lib/api/products';
import { getActiveFloors } from '@/lib/api/floors';
import { getActiveSession } from '@/lib/api/pos';
import POSOrderClient from './pos-client';

export default async function POSOrderPage({
  searchParams
}: {
  searchParams: Promise<{ table_id?: string }>
}) {
  const profile = await requireAuth();
  
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
