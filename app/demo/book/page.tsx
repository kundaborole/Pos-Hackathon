import { getActiveFloors } from '@/lib/api/floors';
import BookingClient from './booking-client';

export default async function TableBookingDemoPage() {
  // Use the default restaurant ID from the seed data for the demo
  const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || '11111111-1111-1111-1111-111111111111';
  
  const floors = await getActiveFloors(restaurantId);

  return (
    <BookingClient initialFloors={floors} />
  );
}
