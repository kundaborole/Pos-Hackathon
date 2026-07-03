import { getPublicProductDetails, validateTableSession } from '@/lib/api/customer';
import ProductClient from './product-client';
import { notFound } from 'next/navigation';

export default async function ProductDetailsPage({ params }: { params: Promise<{ tableToken: string, productId: string }> }) {
  const resolvedParams = await params;
  
  const session = await validateTableSession(resolvedParams.tableToken);
  
  if (!session) {
    return notFound();
  }

  const product = await getPublicProductDetails(resolvedParams.productId, session.public_token);

  if (!product) {
    return notFound();
  }

  return <ProductClient product={product} session={session} />;
}
