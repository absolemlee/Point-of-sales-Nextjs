import { createClient } from '@supabase/supabase-js';
import isOnline from 'is-online';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const fetchProduct = async ({
  take = 5,
  skip = 0,
  query,
}: {
  query?: string;
  take: number;
  skip: number;
}) => {
  const isOnlineResult = await isOnline();

  if (!isOnlineResult) {
    throw new Error('No internet connection');
    return;
  }

  ('use server');
  try {
    // Build the query for Supabase with join
    let supabaseQuery = supabase
      .from('Product')
      .select(`
        id,
        productId,
        sellprice,
        ProductStock!Product_productId_fkey (
          id,
          name,
          cat,
          stock,
          price
        )
      `)
      .range(skip, skip + take - 1);

    // Add search filter if query is provided
    if (query) {
      supabaseQuery = supabaseQuery.or(`ProductStock.name.ilike.%${query}%`);
    }

    const { data: results, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    // Transform data to match the expected format
    const transformedResults = (results || []).map((product: any) => ({
      ...product,
      productstock: product.ProductStock, // Rename for compatibility
    }));

    // Get total count
    const { count: total, error: countError } = await supabase
      .from('Product')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    return {
      data: transformedResults,
      metadata: {
        hasNextPage: skip + take < (total || 0),
        totalPages: Math.ceil((total || 0) / take),
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
