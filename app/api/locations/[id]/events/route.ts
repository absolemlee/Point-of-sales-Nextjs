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

export interface LocationEvent {
  id: string;
  locationId: string;
  eventName: string;
  eventDescription?: string;
  eventType: 'POPUP' | 'KAVA_NIGHT' | 'PRIVATE_PARTY' | 'FESTIVAL' | 'PARTNERSHIP';
  organizer: string;
  hostVenue?: string;
  hostVenueAddress?: string;
  hostVenueContact?: any;
  eventDate: string;
  startTime: string;
  endTime: string;
  setupTime?: string;
  cleanupTime?: string;
  expectedAttendance?: number;
  ticketPrice?: number;
  eventUrl?: string;
  socialMediaLinks?: any;
  specialInstructions?: string;
  equipmentNeeded?: string[];
  staffRequired?: number;
  authorizedTenders?: string[];
  eventStatus: 'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// GET /api/locations/[id]/events - Get events for location
export async function GET(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    const month = searchParams.get('month'); // YYYY-MM format
    const upcoming = searchParams.get('upcoming') === 'true';

    let query = supabase
      .from('LocationEvent')
      .select('*')
      .eq('locationId', locationId);

    if (eventType) {
      query = query.eq('eventType', eventType);
    }

    if (status) {
      query = query.eq('eventStatus', status);
    }

    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query = query.gte('eventDate', startDate).lte('eventDate', endDate);
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('eventDate', today);
    }

    const { data: events, error } = await query.order('eventDate');

    if (error) {
      // Fallback: Create mock events based on location type
      console.log('LocationEvent table not found, using fallback');
      
      const { data: location } = await supabase
        .from('Location')
        .select('type, name')
        .eq('id', locationId)
        .single();

      const locationType = location?.type || 'STATIC';
      const locationName = location?.name || 'Default Location';

      const mockEvents: LocationEvent[] = [];

      if (locationType === 'STATIC') {
        // Static locations might have special events
        mockEvents.push({
          id: 'evt-static-special',
          locationId,
          eventName: 'Kava Education Night',
          eventDescription: 'Learn about different kava strains and preparation methods',
          eventType: 'KAVA_NIGHT',
          organizer: 'Location Manager',
          eventDate: '2025-11-15',
          startTime: '19:00',
          endTime: '22:00',
          setupTime: '18:00',
          expectedAttendance: 30,
          ticketPrice: 20.00,
          eventStatus: 'PLANNED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (locationType === 'POPUP') {
        // Popup events
        mockEvents.push({
          id: 'evt-popup-market',
          locationId,
          eventName: 'Weekend Farmers Market Pop-up',
          eventDescription: 'Kava and kratom products at the local farmers market',
          eventType: 'POPUP',
          organizer: 'Event Coordinator',
          hostVenue: 'Downtown Farmers Market',
          hostVenueAddress: '456 Market Square',
          eventDate: '2025-10-26',
          startTime: '09:00',
          endTime: '15:00',
          setupTime: '08:00',
          cleanupTime: '16:00',
          expectedAttendance: 100,
          equipmentNeeded: ['Portable Bar', 'Kava Strainer', 'Tables', 'Canopy'],
          staffRequired: 2,
          eventStatus: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (locationType === 'VENUE_PARTNERSHIP') {
        // Partnership events
        mockEvents.push({
          id: 'evt-partner-brewery',
          locationId,
          eventName: 'Kava & Craft Beer Pairing Night',
          eventDescription: 'Explore the synergy between kava and craft beer',
          eventType: 'PARTNERSHIP',
          organizer: 'Authorized Tender',
          hostVenue: 'Local Craft Brewery',
          hostVenueAddress: '789 Brewery Ave',
          eventDate: '2025-11-08',
          startTime: '20:00',
          endTime: '23:00',
          expectedAttendance: 50,
          ticketPrice: 25.00,
          authorizedTenders: ['tender-001', 'tender-002'],
          eventStatus: 'PLANNED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      return NextResponse.json({
        events: mockEvents,
        count: mockEvents.length,
        message: 'Using fallback event data - please run SQL schema for full functionality'
      });
    }

    return NextResponse.json({
      events,
      count: events?.length || 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/locations/[id]/events - Create new event
export async function POST(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const body = await request.json();
    const eventData = { ...body, locationId };

    if (!eventData.eventName || !eventData.eventType || !eventData.eventDate || !eventData.startTime || !eventData.endTime) {
      return NextResponse.json(
        { error: 'Event name, type, date, start time, and end time are required' },
        { status: 400 }
      );
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newEvent: Partial<LocationEvent> = {
      id: eventId,
      ...eventData,
      eventStatus: eventData.eventStatus || 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('LocationEvent')
      .insert([newEvent])
      .select()
      .single();

    if (error) {
      console.log('LocationEvent table not available, using fallback');
      return NextResponse.json({
        event: newEvent,
        message: 'Event created (fallback mode - please run SQL schema first)'
      });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}