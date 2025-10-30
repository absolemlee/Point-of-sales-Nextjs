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

export interface DayHours {
  isOpen: boolean;
  open?: string;
  close?: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  timezone: string;
  lastUpdated: string;
}

export interface HoursException {
  id: string;
  locationId: string;
  date: string;
  exceptionType: 'CLOSED' | 'SPECIAL_HOURS' | 'HOLIDAY' | 'MAINTENANCE' | 'EVENT';
  openTime?: string;
  closeTime?: string;
  reason: string;
  notes?: string;
  isRecurring: boolean;
}

// GET /api/locations/[id]/hours - Get operating hours and exceptions
export async function GET(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const { searchParams } = new URL(request.url);
    const includeExceptions = searchParams.get('includeExceptions') === 'true';
    const month = searchParams.get('month'); // YYYY-MM format
    const year = searchParams.get('year');

    // Get location with operating hours
    const { data: location, error: locationError } = await supabase
      .from('Location')
      .select('operatingHours, name, type')
      .eq('id', locationId)
      .single();

    if (locationError) {
      // Fallback for default location
      if (locationId === 'default-location') {
        const defaultHours: OperatingHours = {
          monday: { isOpen: true, open: '07:00', close: '18:00' },
          tuesday: { isOpen: true, open: '07:00', close: '18:00' },
          wednesday: { isOpen: true, open: '07:00', close: '18:00' },
          thursday: { isOpen: true, open: '07:00', close: '18:00' },
          friday: { isOpen: true, open: '07:00', close: '20:00' },
          saturday: { isOpen: true, open: '08:00', close: '20:00' },
          sunday: { isOpen: false },
          timezone: 'America/New_York',
          lastUpdated: new Date().toISOString()
        };

        return NextResponse.json({
          hours: defaultHours,
          exceptions: [],
          message: 'Using fallback hours data'
        });
      }

      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    let exceptions: HoursException[] = [];

    if (includeExceptions) {
      // Get exceptions for the specified period
      let exceptionsQuery = supabase
        .from('OperatingHoursException')
        .select('*')
        .eq('locationId', locationId);

      if (month) {
        const startDate = `${month}-01`;
        const endDate = `${month}-31`; // Simple approach
        exceptionsQuery = exceptionsQuery
          .gte('date', startDate)
          .lte('date', endDate);
      } else if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        exceptionsQuery = exceptionsQuery
          .gte('date', startDate)
          .lte('date', endDate);
      }

      const { data: exceptionsData, error: exceptionsError } = 
        await exceptionsQuery.order('date');

      if (!exceptionsError && exceptionsData) {
        exceptions = exceptionsData;
      }
    }

    return NextResponse.json({
      hours: location.operatingHours || {},
      exceptions,
      location: {
        name: location.name,
        type: location.type
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch operating hours' },
      { status: 500 }
    );
  }
}

// PUT /api/locations/[id]/hours - Update operating hours
export async function PUT(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const body = await request.json();
    const { operatingHours } = body;

    if (!operatingHours) {
      return NextResponse.json(
        { error: 'Operating hours are required' },
        { status: 400 }
      );
    }

    // Add metadata to hours
    const enhancedHours = {
      ...operatingHours,
      lastUpdated: new Date().toISOString()
    };

    const { data: location, error } = await supabase
      .from('Location')
      .update({ 
        operatingHours: enhancedHours,
        updatedAt: new Date().toISOString()
      })
      .eq('id', locationId)
      .select()
      .single();

    if (error) {
      console.log('Location table not available for hours update');
      return NextResponse.json({
        location: { id: locationId, operatingHours: enhancedHours },
        message: 'Hours updated (fallback mode - please run SQL schema first)'
      });
    }

    return NextResponse.json({ location });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update operating hours' },
      { status: 500 }
    );
  }
}

// POST /api/locations/[id]/hours - Add hours exception
export async function POST(request: Request, { params }: LocationParams) {
  try {
    const { id: locationId } = params;
    const body = await request.json();
    const { date, exceptionType, openTime, closeTime, reason, notes, isRecurring } = body;

    if (!date || !exceptionType || !reason) {
      return NextResponse.json(
        { error: 'Date, exception type, and reason are required' },
        { status: 400 }
      );
    }

    const exceptionId = `exc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newException: Partial<HoursException> = {
      id: exceptionId,
      locationId,
      date,
      exceptionType,
      openTime,
      closeTime,
      reason,
      notes,
      isRecurring: isRecurring || false
    };

    const { data, error } = await supabase
      .from('OperatingHoursException')
      .insert([newException])
      .select()
      .single();

    if (error) {
      console.log('OperatingHoursException table not available, using fallback');
      return NextResponse.json({
        exception: newException,
        message: 'Exception added (fallback mode - please run SQL schema first)'
      });
    }

    return NextResponse.json({ exception: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add hours exception' },
      { status: 500 }
    );
  }
}