import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LocationParams {
  params: {
    id: string;
  };
}

export interface LocationProduct {
  id: string;
  locationId: string;
  productId: string;
  locationName?: string; // Override product name for this location
  locationPrice?: number; // Override price for this location
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK';
  category?: string;
  prepTime?: number;
  dailyLimit?: number;
  currentStock?: number;
  sortOrder: number;
  isVisible: boolean;
  product?: any; // Joined ProductStock data
}

// GET /api/locations/[id]/products - Get products available at location
export async function GET(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Try to get location-specific products
    let query = supabase
      .from('LocationProduct')
      .select(`
        *,
        product:ProductStock(*)
      `)
      .eq('locationId', locationId);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: locationProducts, error } = await query.order('sortOrder');

    if (error) {
      // Fallback: Return all products from ProductStock with default location settings
      console.log('LocationProduct table not found, using fallback');
      
      let fallbackQuery = supabase
        .from('ProductStock')
        .select('*');

      if (category) {
        // Note: ProductStock might not have category, so this is a limitation
        fallbackQuery = fallbackQuery.ilike('name', `%${category}%`);
      }

      const { data: products, error: productError } = await fallbackQuery;

      if (productError) {
        return NextResponse.json(
          { error: 'Failed to fetch products' },
          { status: 500 }
        );
      }

      // Transform products to LocationProduct format
      const fallbackProducts: LocationProduct[] = (products || []).map(product => ({
        id: `loc_${locationId}_${product.id}`,
        locationId,
        productId: product.id,
        locationName: product.name,
        locationPrice: product.price,
        status: product.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
        category: 'General', // Default category
        prepTime: 5, // Default prep time
        dailyLimit: undefined,
        currentStock: product.stock,
        sortOrder: 0,
        isVisible: true,
        product
      }));

      return NextResponse.json({ 
        products: fallbackProducts, 
        count: fallbackProducts.length,
        message: 'Using fallback product list - please run SQL schema for full functionality'
      });
    }

    return NextResponse.json({ 
      products: locationProducts, 
      count: locationProducts?.length || 0 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch location products' },
      { status: 500 }
    );
  }
}

// POST /api/locations/[id]/products - Add product to location
export async function POST(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const body = await request.json();
    const { 
      productId, 
      locationName, 
      locationPrice, 
      status, 
      category, 
      prepTime, 
      dailyLimit, 
      currentStock, 
      sortOrder, 
      isVisible 
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('ProductStock')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const locationProductId = `lp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newLocationProduct: LocationProduct = {
      id: locationProductId,
      locationId,
      productId,
      locationName: locationName || product.name,
      locationPrice: locationPrice || product.price,
      status: status || 'AVAILABLE',
      category: category || 'General',
      prepTime: prepTime || 5,
      dailyLimit,
      currentStock: currentStock !== undefined ? currentStock : product.stock,
      sortOrder: sortOrder || 0,
      isVisible: isVisible !== undefined ? isVisible : true
    };

    // Try to insert into LocationProduct table
    const { data, error } = await supabase
      .from('LocationProduct')
      .insert([newLocationProduct])
      .select(`
        *,
        product:ProductStock(*)
      `)
      .single();

    if (error) {
      console.log('LocationProduct table not available, using fallback');
      return NextResponse.json({ 
        product: { ...newLocationProduct, product },
        message: 'Product added to location (fallback mode - please run SQL schema first)' 
      });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add product to location' },
      { status: 500 }
    );
  }
}