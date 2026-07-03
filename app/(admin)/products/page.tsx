import { requireAuth } from '@/lib/auth';
import { getProducts, getCategories } from '@/lib/api/products';
import ProductsClient from './products-client';

export default async function ProductsPage() {
  const profile = await requireAuth();
  
  const [products, categories] = await Promise.all([
    getProducts(profile.restaurant_id),
    getCategories(profile.restaurant_id)
  ]);

  return <ProductsClient initialProducts={products} categories={categories} />;
}
