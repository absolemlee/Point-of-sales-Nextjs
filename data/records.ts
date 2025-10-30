import { createClient } from '@supabase/supabase-js';
import isOnline from 'is-online';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export const fetchRecords = async ({
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
    // Build the query for Supabase
    let supabaseQuery = supabase
      .from('Transaction')
      .select(`
        id,
        totalAmount,
        createdAt,
        isComplete,
        OnSaleProduct!OnSaleProduct_transactionId_fkey (
          id,
          productId,
          quantity
        )
      `)
      .order('createdAt', { ascending: true })
      .range(skip, skip + take - 1);

    // Add search filter if query is provided
    if (query) {
      supabaseQuery = supabaseQuery.ilike('id', `%${query}%`);
    }

    const { data: results, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    // Calculate total quantity for each transaction
    const resultsWithTotalQuantity = (results || []).map((transaction: any) => {
      const totalQuantity = (transaction.OnSaleProduct || []).reduce(
        (sum: number, product: any) => sum + (product.quantity || 0),
        0
      );
      return {
        ...transaction,
        products: transaction.OnSaleProduct, // Rename for compatibility
        totalQuantity,
      };
    });

    // Get total count
    const { count: totalTransactions, error: countError } = await supabase
      .from('Transaction')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    return {
      data: resultsWithTotalQuantity,
      metadata: {
        hasNextPage: skip + take < (totalTransactions || 0),
        totalPages: Math.ceil((totalTransactions || 0) / take),
      },
    };
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
};
