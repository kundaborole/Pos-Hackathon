import { getPublicOrderDetails, validateTableSession } from '@/lib/api/customer';
import SuccessClient from './success-client';
import { notFound } from 'next/navigation';

export default async function SuccessPage({ params }: { params: Promise<{ tableToken: string, orderId: string }> }) {
  const resolvedParams = await params;
  
  const session = await validateTableSession(resolvedParams.tableToken);
  if (!session) return notFound();

  const order = await getPublicOrderDetails(resolvedParams.orderId, resolvedParams.tableToken);
  if (!order) return notFound();

  return <SuccessClient order={order} tableToken={resolvedParams.tableToken} tableNumber={session.table_number} />;
}
