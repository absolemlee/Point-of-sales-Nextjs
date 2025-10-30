import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const stationId = searchParams.get('stationId');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required' },
        { status: 400 }
      );
    }

    // Mock pending order for payment - replace with real database query
    const pendingOrder = {
      id: 'order-001',
      orderNumber: '101',
      items: [
        {
          id: 'item-001',
          name: 'Grilled Chicken Sandwich',
          quantity: 1,
          unitPrice: 12.99,
          totalPrice: 12.99
        },
        {
          id: 'item-002',
          name: 'French Fries',
          quantity: 1,
          unitPrice: 4.99,
          totalPrice: 4.99
        },
        {
          id: 'item-003',
          name: 'Soft Drink',
          quantity: 2,
          unitPrice: 2.49,
          totalPrice: 4.98
        }
      ],
      subtotal: 22.96,
      tax: 2.07,
      discounts: 0,
      tips: 0,
      total: 25.03,
      customerName: 'John Doe',
      orderType: 'DINE_IN',
      status: 'PENDING'
    };

    // In a real implementation, this would query your database
    // Example:
    // const order = await db.orders.findFirst({
    //   where: { 
    //     locationId, 
    //     status: 'READY_FOR_PAYMENT',
    //     stationId: stationId || undefined 
    //   },
    //   include: { items: true }
    // });

    return NextResponse.json({
      success: true,
      order: pendingOrder
    });

  } catch (error) {
    console.error('Error fetching pending order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending order' },
      { status: 500 }
    );
  }
}