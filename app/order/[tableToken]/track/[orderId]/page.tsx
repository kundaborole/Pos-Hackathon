import { getPublicOrderDetails } from '@/lib/api/customer';
import OrderTrackerClient from './tracker-client';
import { notFound } from 'next/navigation';

export default async function OrderTrackingPage({ params }: { params: Promise<{ tableToken: string, orderId: string }> }) {
  const resolvedParams = await params;
  
  const order = await getPublicOrderDetails(resolvedParams.orderId, resolvedParams.tableToken);

  if (!order) {
    return notFound();
  }

  return <OrderTrackerClient order={order} tableToken={resolvedParams.tableToken} />;
}
