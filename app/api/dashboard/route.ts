import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Handler function for GET request
export async function GET(req: NextRequest) {
  try {
    // Fetch all product stocks
    const { data: productStocks, error: stockError } = await supabase
      .from('ProductStock')
      .select('stock');

    if (stockError) throw stockError;

    // Fetch all transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('Transaction')
      .select('totalAmount');

    if (transactionError) throw transactionError;

    // Fetch all on sale products
    const { data: onSaleProducts, error: onSaleError } = await supabase
      .from('OnSaleProduct')
      .select('quantity');

    if (onSaleError) throw onSaleError;

    // Calculate aggregated data
    const totalStock = {
      _sum: {
        stock: productStocks?.reduce((sum, item) => sum + (item.stock || 0), 0) || 0
      }
    };

    const totalAmount = {
      _sum: {
        totalAmount: transactions?.reduce((sum, item) => sum + (parseFloat(item.totalAmount || '0')), 0) || 0
      }
    };

    const totalQuantity = {
      _sum: {
        quantity: onSaleProducts?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
      }
    };

    // Return aggregated data in the response
    return NextResponse.json(
      { totalStock, totalAmount, totalQuantity },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
