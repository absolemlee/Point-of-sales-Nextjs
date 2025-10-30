import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const PATCH = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Update the store name if 'storeName' is in the body
    if ('storeName' in body) {
      const { data: updatedStorename, error } = await supabase
        .from('ShopData')
        .update({ name: body.storeName })
        .eq('id', String(params.id))
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json(updatedStorename, { status: 201 });
    }

    // Update the store tax if 'tax' is in the body
    if ('tax' in body) {
      const { data: updatedStoretax, error } = await supabase
        .from('ShopData')
        .update({ tax: body.tax })
        .eq('id', String(params.id))
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json(updatedStoretax, { status: 201 });
    }

    // If neither 'shopName' nor 'tax' is in the body, return an error
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error: any) {
    // Handle errors
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
