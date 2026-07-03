import { requireAuth } from '@/lib/auth';
import { getActiveFloors } from '@/lib/api/floors';
import OperationalFloorClient from './floor-client';

export default async function OperationalFloorPage() {
  const profile = await requireAuth();
  const floors = await getActiveFloors(profile.restaurant_id);

  return <OperationalFloorClient initialFloors={floors} />;
}
