import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from 'react';
import { FullOrder } from './orders';
import { Database } from '@/types/supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
export type ProductVariantValue = Database['public']['Tables']['product_variant_values']['Row'];
export type ProductAddon = Database['public']['Tables']['product_addons']['Row'];

export type FullProduct = Product & {
  variants: (ProductVariant & {
    values: ProductVariantValue[];
  })[];
  addons: ProductAddon[];
};

export type FullCategory = Category & {
  products: FullProduct[];
};

export type ValidatedSession = {
  restaurant_id: string;
  table_id: string;
  public_token: string;
  restaurant_name: string;
  table_number: string;
  floor_name: string;
  capacity: number;
};

// 1. Validate the active session
export const validateTableSession = cache(async (publicToken: string): Promise<ValidatedSession | null> => {
  if (!publicToken) return null;
  const adminClient = createAdminClient();

  const { data: session, error: sessionErr } = await adminClient
    .from('table_sessions')
    .select('restaurant_id, table_id, public_token, status, restaurants(name, is_open), restaurant_tables(table_number, capacity, floors(name))')
    .eq('public_token', publicToken)
    .eq('status', 'active')
    .single();

  if (sessionErr || !session || !session.restaurants || !session.restaurant_tables) {
    return null;
  }

  // @ts-ignore - relation typing
  if (session.restaurants?.is_open === false) {
    return null;
  }

  return {
    restaurant_id: session.restaurant_id,
    table_id: session.table_id,
    public_token: session.public_token,
    // @ts-ignore - relation typing
    restaurant_name: session.restaurants?.name,
    // @ts-ignore - relation typing
    table_number: session.restaurant_tables?.table_number,
    // @ts-ignore - relation typing
    floor_name: session.restaurant_tables?.floors?.name || 'Main Floor',
    // @ts-ignore - relation typing
    capacity: session.restaurant_tables?.capacity || 4
  };
});

// 2. Fetch Public Menu for the Session
export const getCustomerMenu = cache(async (restaurantId: string): Promise<FullCategory[]> => {
  const adminClient = createAdminClient();

  // Fetch categories
  const { data: categories, error: catError } = await adminClient
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_order', { ascending: true });

  if (catError || !categories) return [];

  // Fetch available products with relations
  const { data: products, error: prodError } = await adminClient
    .from('products')
    .select(`
      *,
      variants:product_variants(
        *,
        values:product_variant_values(*)
      ),
      addons:product_addons(*)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true);

  if (prodError || !products) return [];

  // Assemble the tree
  const categoryTree = categories.map(cat => ({
    ...cat,
    products: products.filter(p => p.category_id === cat.id) as FullProduct[]
  })).filter(cat => cat.products.length > 0);

  return categoryTree;
});

// 3. Fetch specific Product securely
export const getPublicProductDetails = cache(async (productId: string, publicToken: string): Promise<FullProduct | null> => {
  const session = await validateTableSession(publicToken);
  if (!session) return null;

  const adminClient = createAdminClient();
  const { data: product, error: prodErr } = await adminClient
    .from('products')
    .select(`
      *,
      variants:product_variants(
        *,
        values:product_variant_values(*)
      ),
      addons:product_addons(*)
    `)
    .eq('id', productId)
    .eq('restaurant_id', session.restaurant_id)
    .eq('is_available', true)
    .single();

  if (prodErr) return null;
  return product as FullProduct;
});

// 4. Fetch specific Order details securely
export const getPublicOrderDetails = cache(async (orderId: string, publicToken: string): Promise<FullOrder | null> => {
  const session = await validateTableSession(publicToken);
  if (!session) return null;

  const adminClient = createAdminClient();
  const baseQuery = adminClient
    .from('orders')
    .select(`
      *,
      table:restaurant_tables(*),
      items:order_items(
        *,
        variants:order_item_variants(*),
        addons:order_item_addons(*)
      )
    `)
    .eq('restaurant_id', session.restaurant_id)
    .eq('table_id', session.table_id);

  if (orderId === 'latest') {
    const { data: order, error: orderErr } = await baseQuery.order('created_at', { ascending: false }).limit(1).single();
    if (orderErr) return null;
    return order as FullOrder;
  } else {
    const { data: order, error: orderErr } = await baseQuery.eq('id', orderId).single();
    if (orderErr) return null;
    return order as FullOrder;
  }
});
