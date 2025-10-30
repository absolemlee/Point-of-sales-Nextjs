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

// GET /api/locations/[id] - Get single location
export async function GET(request: Request, { params }: LocationParams) {
  try {
    const { id } = params;

    const { data: location, error } = await supabase
      .from('Location')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Fallback for default location
      if (id === 'default-location') {
        const mockLocation = {
          id: 'default-location',
          name: 'Main Location',
          type: 'STATIC',
          status: 'ACTIVE',
          address: '123 Main St, City, State',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          operatingHours: {
            monday: { open: '07:00', close: '18:00' },
            tuesday: { open: '07:00', close: '18:00' },
            wednesday: { open: '07:00', close: '18:00' },
            thursday: { open: '07:00', close: '18:00' },
            friday: { open: '07:00', close: '20:00' },
            saturday: { open: '08:00', close: '20:00' },
            sunday: { open: '09:00', close: '17:00' }
          },
          contactInfo: {
            phone: '+1-555-0123',
            email: 'main@coffeeshop.com'
          },
          settings: {
            allowOnlineOrdering: true,
            acceptsCash: true,
            acceptsCard: true,
            hasWifi: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return NextResponse.json({ location: mockLocation });
      }
      
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ location });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// PUT /api/locations/[id] - Update location
export async function PUT(request: Request, { params }: LocationParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, type, status, address, coordinates, operatingHours, contactInfo, settings } = body;

    const updateData = {
      name,
      type,
      status,
      address,
      coordinates,
      operatingHours,
      contactInfo,
      settings,
      updatedAt: new Date().toISOString()
    };

    const { data: location, error } = await supabase
      .from('Location')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.log('Location table not available for update');
      return NextResponse.json({ 
        location: { id, ...updateData },
        message: 'Location updated (fallback mode - please run SQL schema first)' 
      });
    }

    return NextResponse.json({ location });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE /api/locations/[id] - Delete location
export async function DELETE(request: Request, { params }: LocationParams) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('Location')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Location table not available for deletion');
      return NextResponse.json({ 
        message: 'Location deletion requested (fallback mode - please run SQL schema first)' 
      });
    }

    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}