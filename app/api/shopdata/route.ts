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
    // Fetch shopData from the database using Supabase
    const { data: shopData, error } = await supabase
      .from('ShopData')
      .select('*');

    if (error) {
      throw error;
    }

    // Extract the first item from the result or provide default values
    const data = shopData?.[0] || {
      id: 'default-shop',
      name: 'Point of Sale System',
      tax: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Return the data as a JSON response with a 200 status code
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching shop data:', error);

    // Return a detailed error message as a JSON response with a 500 status code
    return NextResponse.json(
      { error: 'Failed to fetch shop data. Please try again later.' },
      { status: 500 }
    );
  }
}
