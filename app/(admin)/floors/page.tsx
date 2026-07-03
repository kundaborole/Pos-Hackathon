import { requireAuth } from '@/lib/auth';
import { getFloors } from '@/lib/api/floors';
import FloorsConfigurationClient from './floors-client';

export const dynamic = 'force-dynamic';

export default async function FloorsConfigurationPage() {
  const profile = await requireAuth();
  console.log('[DEBUG READ] requireAuth returned profile:', { id: profile.id, restaurant_id: profile.restaurant_id });
  
  const floors = await getFloors(profile.restaurant_id);
  console.log('[DEBUG READ] getFloors returned:', floors.length, 'floors');

  return <FloorsConfigurationClient initialFloors={floors} />;
}
