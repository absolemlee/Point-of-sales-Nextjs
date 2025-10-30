import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build filter conditions
    const where: any = {};
    
    if (locationId) {
      where.locationId = locationId;
    }
    
    if (status) {
      where.status = status;
    } else {
      // Default to active orders
      where.status = {
        in: ['PENDING', 'IN_PREPARATION']
      };
    }

    // Get orders from database
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        orderTime: 'asc' // Oldest orders first
      },
      take: limit,
      include: {
        location: {
          select: {
            id: true,
            name: true
          }
        },
        payments: {
          select: {
            status: true,
            method: true
          }
        }
      }
    });

    // Transform orders for kitchen display
    const kitchenOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      customerName: order.customerName || 'Guest',
      tableNumber: order.tableNumber,
      items: Array.isArray(order.items) ? order.items : [],
      orderTime: order.orderTime.toISOString(),
      estimatedCompletionTime: order.prepStartTime 
        ? new Date(order.prepStartTime.getTime() + 15 * 60000).toISOString() // 15 minutes prep time
        : new Date(order.orderTime.getTime() + 20 * 60000).toISOString(), // 20 minutes from order
      status: order.status,
      totalItems: Array.isArray(order.items) ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0,
      priority: determinePriority(order),
      location: order.location?.name || 'Unknown',
      isPaid: order.payments.some((p: any) => p.status === 'COMPLETED')
    }));

    return NextResponse.json({
      success: true,
      orders: kitchenOrders,
      total: kitchenOrders.length
    });

  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch kitchen orders' },
      { status: 500 }
    );
  }
}

// Helper function to determine order priority
function determinePriority(order: any): string {
  // Check if order is delayed
  const orderAge = Date.now() - new Date(order.orderTime).getTime();
  const thirtyMinutes = 30 * 60 * 1000;
  
  if (orderAge > thirtyMinutes) {
    return 'URGENT';
  }
  
  // Check for rush items or special conditions
  if (order.orderType === 'DELIVERY') {
    return 'HIGH';
  }
  
  return 'NORMAL';
}