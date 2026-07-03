import { requireAuth } from '@/lib/auth';
import { getOrderDetails } from '@/lib/api/orders';
import OrderDetailsClient from './order-details-client';

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const profile = await requireAuth();
  const resolvedParams = await params;
  
  const order = await getOrderDetails(profile.restaurant_id, resolvedParams.orderId);

  return <OrderDetailsClient order={order} />;
}
