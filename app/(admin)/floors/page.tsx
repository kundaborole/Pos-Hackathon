import { requireAuth } from '@/lib/auth';
import { getFloors } from '@/lib/api/floors';
import FloorsConfigurationClient from './floors-client';

export default async function FloorsConfigurationPage() {
  const profile = await requireAuth();
  const floors = await getFloors(profile.restaurant_id);

  return <FloorsConfigurationClient initialFloors={floors} />;
}
