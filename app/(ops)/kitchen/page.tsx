import { requireAuth } from '@/lib/auth';
import { getActiveKitchenTickets, getKitchenStations } from '@/lib/api/kitchen';
import KitchenClient from './kitchen-client';

export default async function KitchenPage() {
  const profile = await requireAuth();
  
  const [stations, tickets] = await Promise.all([
    getKitchenStations(profile.restaurant_id),
    getActiveKitchenTickets(profile.restaurant_id)
  ]);

  return <KitchenClient 
    initialTickets={tickets} 
    stations={stations} 
    _restaurantId={profile.restaurant_id} 
  />;
}
