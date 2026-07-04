import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/supabase';
import { cache } from 'react';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
type ProductVariantValue = Database['public']['Tables']['product_variant_values']['Row'];
type ProductAddon = Database['public']['Tables']['product_addons']['Row'];

export type CategoryWithProductCount = Category & {
  product_count?: number;
};

export type FullProduct = Product & {
  variants?: (ProductVariant & {
    values: ProductVariantValue[];
  })[];
  addons?: ProductAddon[];
  category?: Category;
};

// Use React cache to deduplicate fetches within a single request
export const getCategories = cache(async (restaurantId: string): Promise<CategoryWithProductCount[]> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((cat: any) => ({
    ...cat,
    product_count: cat.products[0]?.count || 0
  }));
});

export const getProducts = cache(async (restaurantId: string): Promise<FullProduct[]> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*, values:product_variant_values(*)),
      addons:product_addons(*)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as FullProduct[];
});

export const getAvailableProducts = cache(async (restaurantId: string): Promise<FullProduct[]> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*, values:product_variant_values(*)),
      addons:product_addons(*)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active products:', error);
    return [];
  }

  return data as FullProduct[];
});
