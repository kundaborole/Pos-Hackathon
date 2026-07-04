import { getPublicOrderDetails } from '@/lib/api/customer';
import OrderTrackerClient from './tracker-client';
import { notFound } from 'next/navigation';

export default async function OrderTrackingPage({ params }: { params: Promise<{ tableToken: string, orderId: string }> }) {
  const resolvedParams = await params;
  
  const order = await getPublicOrderDetails(resolvedParams.orderId, resolvedParams.tableToken);

  if (!order) {
    if (resolvedParams.orderId === 'latest') {
      return (
        <div className="flex flex-col min-h-screen bg-bg-surface items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-black text-text-primary mb-2">No Orders Yet</h1>
          <p className="text-text-secondary font-medium">You haven&apos;t placed any orders yet. Go to the Menu to start ordering.</p>
        </div>
      );
    }
    return notFound();
  }

  return <OrderTrackerClient order={order} tableToken={resolvedParams.tableToken} />;
}
