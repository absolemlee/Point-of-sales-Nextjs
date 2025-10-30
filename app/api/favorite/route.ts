export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Instantiate Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Handler function for GET requests
export async function GET(req: NextRequest) {
  try {
    // Get all OnSaleProduct data to calculate aggregations manually
    const { data: onSaleProducts, error: onSaleError } = await supabase
      .from('OnSaleProduct')
      .select('productId, quantity');

    if (onSaleError) {
      throw onSaleError;
    }

    // Group and sum quantities by productId
    const productQuantities: Record<string, number> = {};
    (onSaleProducts || []).forEach((item) => {
      if (!productQuantities[item.productId]) {
        productQuantities[item.productId] = 0;
      }
      productQuantities[item.productId] += item.quantity;
    });

    // Get top 5 products by quantity sold
    const topProductIds = Object.entries(productQuantities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, quantity]) => ({ productId, totalQuantity: quantity }));

    // Get detailed information for each top product
    const productDetails = await Promise.all(
      topProductIds.map(async (product) => {
        const { data: productDetail, error } = await supabase
          .from('Product')
          .select(`
            *,
            ProductStock!Product_productId_fkey (*)
          `)
          .eq('productId', product.productId)
          .single();

        if (error) {
          console.error('Error fetching product detail:', error);
          return null;
        }

        return {
          ...productDetail,
          productstock: productDetail.ProductStock,
          _sum: { quantity: product.totalQuantity },
        };
      })
    );

    // Filter out any null results
    const validProductDetails = productDetails.filter(Boolean);

    // Return the top products with their details as a JSON response with a 200 status code
    return NextResponse.json({ topProducts: validProductDetails }, { status: 200 });
  } catch (error) {
    // Log and return an error message as a JSON response with a 500 status code if there's an error
    console.error('Error occurred:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
