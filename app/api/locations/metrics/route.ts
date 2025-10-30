import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LocationMetrics {
  locationId: string;
  dailySales: number;
  transactionCount: number;
  averageTicket: number;
  staffOnDuty: number;
  currentShift?: {
    id: string;
    startTime: string;
    managerId: string;
    staffCount: number;
  };
  systemStatus: {
    posSystem: 'online' | 'offline' | 'warning';
    paymentProcessor: 'online' | 'offline' | 'warning';
    printer: 'online' | 'offline' | 'warning';
    network: 'online' | 'offline' | 'warning';
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
  lastUpdate: string;
}

// GET /api/locations/metrics - Get real-time metrics for all locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    // Mock data for development - in production this would query real systems
    const mockMetrics: LocationMetrics[] = [
      {
        locationId: 'loc-downtown-cafe',
        dailySales: 2847.50,
        transactionCount: 94,
        averageTicket: 30.29,
        staffOnDuty: 6,
        currentShift: {
          id: 'shift-001',
          startTime: '08:00',
          managerId: 'mgr-alice',
          staffCount: 6
        },
        systemStatus: {
          posSystem: 'online',
          paymentProcessor: 'online',
          printer: 'warning',
          network: 'online'
        },
        alerts: [
          {
            id: 'alert-001',
            type: 'warning',
            message: 'Receipt printer low on paper',
            timestamp: new Date().toISOString()
          }
        ],
        lastUpdate: new Date().toISOString()
      },
      {
        locationId: 'loc-university-kiosk',
        dailySales: 1234.75,
        transactionCount: 67,
        averageTicket: 18.43,
        staffOnDuty: 3,
        currentShift: {
          id: 'shift-002',
          startTime: '10:00',
          managerId: 'mgr-bob',
          staffCount: 3
        },
        systemStatus: {
          posSystem: 'online',
          paymentProcessor: 'online',
          printer: 'online',
          network: 'online'
        },
        alerts: [],
        lastUpdate: new Date().toISOString()
      },
      {
        locationId: 'loc-mall-popup',
        dailySales: 896.25,
        transactionCount: 45,
        averageTicket: 19.92,
        staffOnDuty: 2,
        systemStatus: {
          posSystem: 'online',
          paymentProcessor: 'warning',
          printer: 'online',
          network: 'warning'
        },
        alerts: [
          {
            id: 'alert-002',
            type: 'warning',
            message: 'Intermittent network connectivity',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            id: 'alert-003',
            type: 'info',
            message: 'Peak hours approaching - consider additional staff',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          }
        ],
        lastUpdate: new Date().toISOString()
      }
    ];

    // Filter by location if specified
    const filteredMetrics = locationId 
      ? mockMetrics.filter(m => m.locationId === locationId)
      : mockMetrics;

    return NextResponse.json({
      metrics: filteredMetrics,
      count: filteredMetrics.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching location metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location metrics' },
      { status: 500 }
    );
  }
}

// POST /api/locations/metrics - Update location metrics (for real-time updates)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, metrics } = body;

    // In production, this would update real metrics in the database
    // For now, return success
    
    return NextResponse.json({
      success: true,
      locationId,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating location metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update location metrics' },
      { status: 500 }
    );
  }
}