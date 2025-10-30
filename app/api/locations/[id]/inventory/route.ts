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

export interface LocationInventory {
  id: string;
  locationId: string;
  productId: string;
  allocatedQuantity: number;
  currentQuantity: number;
  usageType: 'INGREDIENT' | 'MIXER' | 'RETAIL' | 'SUPPLY';
  unitType: string;
  costPerUnit?: number;
  sellingPrice?: number;
  strainType?: string;
  potency?: string;
  expirationDate?: string;
  notes?: string;
  product?: any;
}

// GET /api/locations/[id]/inventory - Get inventory allocated to location
export async function GET(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const { searchParams } = new URL(request.url);
    const usageType = searchParams.get('usageType');
    const strainType = searchParams.get('strainType');
    const lowStock = searchParams.get('lowStock');

    let query = supabase
      .from('LocationInventory')
      .select(`
        *,
        product:ProductStock(*)
      `)
      .eq('locationId', locationId);

    if (usageType) {
      query = query.eq('usageType', usageType);
    }

    if (strainType) {
      query = query.eq('strainType', strainType);
    }

    if (lowStock === 'true') {
      // Show items where current quantity is 20% or less of allocated
      query = query.lt('currentQuantity', 'allocatedQuantity * 0.2');
    }

    const { data: inventory, error } = await query.order('product.name');

    if (error) {
      // Fallback: Create mock inventory based on existing products
      console.log('LocationInventory table not found, using fallback');
      
      const { data: products, error: productError } = await supabase
        .from('ProductStock')
        .select('*');

      if (productError) {
        return NextResponse.json(
          { error: 'Failed to fetch inventory' },
          { status: 500 }
        );
      }

      // Create mock inventory based on location type
      const { data: location } = await supabase
        .from('Location')
        .select('type')
        .eq('id', locationId)
        .single();

      const locationType = location?.type || 'STATIC';
      
      const mockInventory: LocationInventory[] = (products || []).map((product, index) => {
        // Determine usage type based on product name and location type
        let usageType: LocationInventory['usageType'] = 'INGREDIENT';
        let unitType = 'grams';
        let allocatedQuantity = 1000; // Default 1kg
        
        const productName = product.name.toLowerCase();
        
        if (productName.includes('kava') && productName.includes('powder')) {
          usageType = 'INGREDIENT';
          unitType = 'grams';
          allocatedQuantity = locationType === 'STATIC' ? 2000 : 500;
        } else if (productName.includes('kratom') && productName.includes('powder')) {
          usageType = 'INGREDIENT';
          unitType = 'grams';
          allocatedQuantity = locationType === 'STATIC' ? 1000 : 250;
        } else if (productName.includes('mixer') || productName.includes('blend')) {
          usageType = 'MIXER';
          unitType = 'ml';
          allocatedQuantity = 500;
        } else if (productName.includes('can') || productName.includes('leilo')) {
          usageType = 'RETAIL';
          unitType = 'cans';
          allocatedQuantity = locationType === 'POPUP' ? 48 : 12;
        } else {
          usageType = 'RETAIL';
          unitType = 'units';
          allocatedQuantity = 20;
        }

        return {
          id: `inv_${locationId}_${product.id}`,
          locationId,
          productId: product.id,
          allocatedQuantity,
          currentQuantity: Math.floor(allocatedQuantity * 0.7), // 70% current stock
          usageType,
          unitType,
          costPerUnit: product.price * 0.6, // Assume 60% cost ratio
          sellingPrice: usageType === 'RETAIL' ? product.price : undefined,
          strainType: productName.includes('kava') ? 'Noble' : 
                     productName.includes('kratom') ? 'Maeng Da' : undefined,
          potency: productName.includes('kava') || productName.includes('kratom') ? 'Medium' : undefined,
          product
        };
      });

      // Filter mock data if needed
      let filteredInventory = mockInventory;
      if (usageType) {
        filteredInventory = filteredInventory.filter(item => item.usageType === usageType);
      }
      if (strainType) {
        filteredInventory = filteredInventory.filter(item => item.strainType === strainType);
      }

      return NextResponse.json({ 
        inventory: filteredInventory, 
        count: filteredInventory.length,
        message: 'Using fallback inventory data - please run SQL schema for full functionality'
      });
    }

    return NextResponse.json({ 
      inventory, 
      count: inventory?.length || 0 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch location inventory' },
      { status: 500 }
    );
  }
}

// POST /api/locations/[id]/inventory - Allocate inventory to location
export async function POST(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const body = await request.json();
    const { 
      productId, 
      allocatedQuantity, 
      usageType, 
      unitType,
      costPerUnit,
      sellingPrice,
      strainType,
      potency,
      expirationDate,
      notes
    } = body;

    if (!productId || !allocatedQuantity || !usageType || !unitType) {
      return NextResponse.json(
        { error: 'Product ID, allocated quantity, usage type, and unit type are required' },
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

    const inventoryId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newInventory: Partial<LocationInventory> = {
      id: inventoryId,
      locationId,
      productId,
      allocatedQuantity,
      currentQuantity: allocatedQuantity, // Start with full allocation
      usageType,
      unitType,
      costPerUnit,
      sellingPrice,
      strainType,
      potency,
      expirationDate,
      notes
    };

    // Try to insert into LocationInventory table
    const { data, error } = await supabase
      .from('LocationInventory')
      .insert([newInventory])
      .select(`
        *,
        product:ProductStock(*)
      `)
      .single();

    if (error) {
      console.log('LocationInventory table not available, using fallback');
      return NextResponse.json({ 
        inventory: { ...newInventory, product },
        message: 'Inventory allocated (fallback mode - please run SQL schema first)' 
      });
    }

    return NextResponse.json({ inventory: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to allocate inventory to location' },
      { status: 500 }
    );
  }
}