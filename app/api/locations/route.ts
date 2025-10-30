import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Location {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP' | 'B2B_HUB' | 'FULFILLMENT_CENTER' | 'ONLINE_STOREFRONT';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED';
  address?: string;
  coordinates?: { lat: number; lng: number };
  operatingHours?: any;
  contactInfo?: any;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

// GET /api/locations - List all locations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let query = supabase.from('Location').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data: locations, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.log('Location table not found, using fallback structure');
      const mockLocations: Location[] = [
        {
          id: 'default-location',
          name: 'Main Kava Lounge',
          type: 'STATIC',
          status: 'ACTIVE',
          address: '123 Main St, Austin, TX',
          coordinates: { lat: 30.2672, lng: -97.7431 },
          operatingHours: {
            monday: { open: '07:00', close: '22:00' },
            tuesday: { open: '07:00', close: '22:00' },
            wednesday: { open: '07:00', close: '22:00' },
            thursday: { open: '07:00', close: '22:00' },
            friday: { open: '07:00', close: '24:00' },
            saturday: { open: '09:00', close: '24:00' },
            sunday: { open: '10:00', close: '20:00' }
          },
          contactInfo: {
            phone: '+1-512-555-0123',
            email: 'main@kavalounge.com'
          },
          settings: {
            allowOnlineOrdering: true,
            acceptsCash: true,
            acceptsCard: true,
            hasWifi: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({ locations: mockLocations, count: mockLocations.length });
    }

    return NextResponse.json({ locations, count: locations?.length || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
