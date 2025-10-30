import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required' },
        { status: 400 }
      );
    }

    // Mock worker data - replace with real database queries
    const workers = [
      {
        workerId: 'worker-001',
        workerName: 'Alice Johnson',
        currentHours: 6.5,
        breaksTaken: 2,
        status: 'ACTIVE',
        permissions: ['pos:order_entry', 'pos:payment_processing']
      },
      {
        workerId: 'worker-002',
        workerName: 'Bob Smith',
        currentHours: 4.0,
        breaksTaken: 1,
        status: 'ON_BREAK',
        permissions: ['pos:kitchen_display', 'pos:order_preparation']
      },
      {
        workerId: 'worker-003',
        workerName: 'Carol Davis',
        currentHours: 7.5,
        breaksTaken: 2,
        status: 'ACTIVE',
        permissions: ['pos:order_entry', 'pos:customer_service']
      },
      {
        workerId: 'worker-004',
        workerName: 'David Wilson',
        currentHours: 8.0,
        breaksTaken: 3,
        status: 'CLOCKED_OUT',
        permissions: ['pos:kitchen_display', 'pos:food_preparation']
      }
    ];

    // In a real implementation, this would query your database
    // Example:
    // const workers = await db.workerSessions.findMany({
    //   where: { 
    //     locationId,
    //     status: { in: ['ACTIVE', 'ON_BREAK'] }
    //   },
    //   include: { worker: true }
    // });

    return NextResponse.json({
      success: true,
      workers
    });

  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}