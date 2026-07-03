import { getPublicOrderDetails } from '@/lib/api/customer';
import PaymentClient from './payment-client';
import { notFound } from 'next/navigation';

export default async function PaymentPage({ params }: { params: Promise<{ tableToken: string, orderId: string }> }) {
  const resolvedParams = await params;
  
  const order = await getPublicOrderDetails(resolvedParams.orderId, resolvedParams.tableToken);

  if (!order) {
    return notFound();
  }

  // If already paid, redirect to success
  if (order.payment_status === 'paid') {
    return notFound(); // Or a custom paid page
  }

  return <PaymentClient order={order} tableToken={resolvedParams.tableToken} />;
}
