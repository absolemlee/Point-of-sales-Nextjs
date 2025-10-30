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

    // Mock kitchen statistics - replace with real database queries
    const stats = {
      activeOrders: 12,
      completedToday: 87,
      averageTime: 14, // minutes
      overdueOrders: 2,
      currentWaitTime: 18 // minutes
    };

    // In a real implementation, this would query your database
    // Example:
    // const stats = await db.kitchenStats.findFirst({ where: { locationId } });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching kitchen stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch kitchen stats' },
      { status: 500 }
    );
  }
}