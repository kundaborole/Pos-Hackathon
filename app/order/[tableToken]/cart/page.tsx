import { validateTableSession } from '@/lib/api/customer';
import CartClient from './cart-client';
import { notFound } from 'next/navigation';

export default async function CartPage({ params }: { params: Promise<{ tableToken: string }> }) {
  const resolvedParams = await params;
  
  const session = await validateTableSession(resolvedParams.tableToken);
  
  if (!session) {
    return notFound();
  }

  return <CartClient session={session} />;
}
