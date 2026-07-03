import { getCustomerMenu, validateTableSession } from '@/lib/api/customer';
import MenuClient from './menu-client';
import { notFound } from 'next/navigation';

export default async function MenuPage({ params }: { params: Promise<{ tableToken: string }> }) {
  const resolvedParams = await params;
  
  // Validate session securely on the server
  const session = await validateTableSession(resolvedParams.tableToken);
  
  if (!session) {
    // Treat invalid or closed sessions as a 404 or redirect to an error page
    return notFound();
  }

  // Fetch the menu filtered strictly by the validated restaurant_id
  const categories = await getCustomerMenu(session.restaurant_id);

  return <MenuClient categories={categories} session={session} />;
}
