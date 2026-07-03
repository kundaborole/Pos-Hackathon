import { requireAuth } from '@/lib/auth';
import { getCategories } from '@/lib/api/products';
import CategoriesClient from './categories-client';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const profile = await requireAuth();
  const categories = await getCategories(profile.restaurant_id);

  return <CategoriesClient initialCategories={categories} />;
}
