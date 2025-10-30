import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to generate a unique ID for a new product
const generateUniqueId = async () => {
  let isUnique = false;
  let customId = '';

  // Loop until a unique ID is generated
  while (!isUnique) {
    // Generate a new ID with the prefix 'PRD-' and a random UUID
    customId = `PRD-${uuidv4().slice(0, 8)}`;
    // Check if the generated ID already exists in the database
    const { data: existingProduct } = await supabase
      .from('ProductStock')
      .select('id')
      .eq('id', customId)
      .single();

    // If the ID is unique, exit the loop
    if (!existingProduct) {
      isUnique = true;
    }
  }

  return customId;
};

// GET /api/product - List all products
export const GET = async (request: Request) => {
  try {
    const { data: products, error } = await supabase
      .from('ProductStock')
      .select('*')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products, count: products?.length || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

// Handler function for POST request to create a new product
export const POST = async (request: Request) => {
  try {
    // Generate a unique ID for the new product
    const customId = await generateUniqueId();
    // Parse the request body as JSON
    const body = await request.json();

    // Create a new product with the generated ID and other details
    const { data: newProduct, error } = await supabase
      .from('ProductStock')
      .insert([{
        id: customId,
        name: body.productName,
        stock: body.stockProduct,
        price: body.buyPrice,
        cat: body.category,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also create in Product table for sell price
    if (body.sellPrice) {
      await supabase
        .from('Product')
        .insert([{
          productStockId: customId,
          sellprice: body.sellPrice,
        }]);
    }

    // Return the newly created product in the response
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    // Handle errors
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
