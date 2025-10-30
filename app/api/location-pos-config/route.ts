import { NextRequest, NextResponse } from 'next/server';
import { LocationPOSConfig } from '@/types/shift-management';

// Mock data for development - replace with actual database calls
const mockLocationConfigs: LocationPOSConfig[] = [
  {
    id: 'config-downtown-cafe',
    locationId: 'loc-downtown-cafe',
    activeShiftId: 'shift-001',
    
    posStations: [
      {
        id: 'POS_1',
        name: 'Main Counter POS',
        type: 'ORDER_ENTRY',
        isActive: true,
        assignedWorkerId: 'worker-001',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          screenSize: '1024x768',
          lastActivity: '2025-10-20T07:58:00Z'
        }
      },
      {
        id: 'KITCHEN_DISPLAY',
        name: 'Kitchen Display System',
        type: 'KITCHEN_DISPLAY',
        isActive: true,
        assignedWorkerId: 'worker-002',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          screenSize: '1920x1080',
          lastActivity: '2025-10-20T07:55:00Z'
        }
      },
      {
        id: 'PAYMENT_TERMINAL',
        name: 'Payment Processing Terminal',
        type: 'PAYMENT',
        isActive: true,
        assignedWorkerId: 'worker-001'
      },
      {
        id: 'MANAGER_TERMINAL',
        name: 'Manager Override Terminal',
        type: 'MANAGER',
        isActive: true
      }
    ],
    
    activeMenus: [
      {
        menuId: 'menu-breakfast',
        name: 'Breakfast Menu',
        startTime: '06:00:00',
        endTime: '11:00:00',
        isActive: true
      },
      {
        menuId: 'menu-all-day',
        name: 'All Day Menu',
        startTime: '06:00:00',
        endTime: '22:00:00',
        isActive: true
      }
    ],
    
    paymentOptions: {
      cash: true,
      card: true,
      mobile: true,
      giftCard: true,
      loyalty: true
    },
    
    settings: {
      requireWorkerSignIn: true,
      allowCustomerOrdering: false,
      kitchenDisplayEnabled: true,
      receiptPrintingEnabled: true,
      loyaltyProgramActive: true,
      taxRate: 8.25,
      tipOptions: [15, 18, 20, 25],
      maxOrderValue: 500,
      autoCloseOrders: true,
      orderTimeoutMinutes: 30
    },
    
    updatedAt: '2025-10-20T07:30:00Z'
  },
  {
    id: 'config-university-kiosk',
    locationId: 'loc-university-kiosk',
    activeShiftId: 'shift-002',
    
    posStations: [
      {
        id: 'KIOSK_1',
        name: 'Self-Service Kiosk',
        type: 'ORDER_ENTRY',
        isActive: true
      },
      {
        id: 'PREP_STATION',
        name: 'Prep Station Display',
        type: 'KITCHEN_DISPLAY',
        isActive: true,
        assignedWorkerId: 'worker-004'
      }
    ],
    
    activeMenus: [
      {
        menuId: 'menu-quick-serve',
        name: 'Quick Serve Menu',
        startTime: '08:00:00',
        endTime: '20:00:00',
        isActive: true
      }
    ],
    
    paymentOptions: {
      cash: false,
      card: true,
      mobile: true,
      giftCard: false,
      loyalty: true
    },
    
    settings: {
      requireWorkerSignIn: false,
      allowCustomerOrdering: true,
      kitchenDisplayEnabled: true,
      receiptPrintingEnabled: false,
      loyaltyProgramActive: true,
      taxRate: 8.25,
      tipOptions: [0, 10, 15],
      maxOrderValue: 100,
      autoCloseOrders: true,
      orderTimeoutMinutes: 15
    },
    
    updatedAt: '2025-10-20T08:15:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const includeWorkerSessions = searchParams.get('includeSessions') === 'true';

    if (locationId) {
      const config = mockLocationConfigs.find(c => c.locationId === locationId);
      if (!config) {
        return NextResponse.json(
          { success: false, error: 'Location configuration not found' },
          { status: 404 }
        );
      }

      let activeSessions = [];
      if (includeWorkerSessions) {
        // Fetch active worker sessions for this location
        const sessionsResponse = await fetch(`${request.nextUrl.origin}/api/worker-sessions?locationId=${locationId}&status=ACTIVE`);
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          activeSessions = sessionsData.sessions || [];
        }
      }

      return NextResponse.json({
        success: true,
        config,
        activeSessions,
        stationStatus: {
          totalStations: config.posStations.length,
          activeStations: config.posStations.filter(s => s.isActive).length,
          assignedStations: config.posStations.filter(s => s.assignedWorkerId).length
        }
      });
    }

    // Return all location configurations
    return NextResponse.json({
      success: true,
      configs: mockLocationConfigs,
      totalLocations: mockLocationConfigs.length
    });

  } catch (error) {
    console.error('Error fetching location POS config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, updates } = body;

    const configIndex = mockLocationConfigs.findIndex(c => c.locationId === locationId);
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Location configuration not found' },
        { status: 404 }
      );
    }

    // Deep merge updates
    mockLocationConfigs[configIndex] = {
      ...mockLocationConfigs[configIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Handle specific update types
    if (updates.posStations) {
      mockLocationConfigs[configIndex].posStations = updates.posStations;
    }

    if (updates.settings) {
      mockLocationConfigs[configIndex].settings = {
        ...mockLocationConfigs[configIndex].settings,
        ...updates.settings
      };
    }

    if (updates.paymentOptions) {
      mockLocationConfigs[configIndex].paymentOptions = {
        ...mockLocationConfigs[configIndex].paymentOptions,
        ...updates.paymentOptions
      };
    }

    return NextResponse.json({
      success: true,
      config: mockLocationConfigs[configIndex],
      message: 'Location configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating location POS config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, locationId, stationId, workerId } = body;

    const configIndex = mockLocationConfigs.findIndex(c => c.locationId === locationId);
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Location configuration not found' },
        { status: 404 }
      );
    }

    if (action === 'assign-station') {
      const stationIndex = mockLocationConfigs[configIndex].posStations.findIndex(s => s.id === stationId);
      if (stationIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'POS station not found' },
          { status: 404 }
        );
      }

      mockLocationConfigs[configIndex].posStations[stationIndex].assignedWorkerId = workerId;
      const currentDeviceInfo = mockLocationConfigs[configIndex].posStations[stationIndex].deviceInfo;
      if (currentDeviceInfo) {
        mockLocationConfigs[configIndex].posStations[stationIndex].deviceInfo = {
          ...currentDeviceInfo,
          lastActivity: new Date().toISOString()
        };
      } else {
        mockLocationConfigs[configIndex].posStations[stationIndex].deviceInfo = {
          userAgent: 'Unknown',
          screenSize: 'Unknown',
          lastActivity: new Date().toISOString()
        };
      }
      mockLocationConfigs[configIndex].updatedAt = new Date().toISOString();

      return NextResponse.json({
        success: true,
        config: mockLocationConfigs[configIndex],
        message: 'Station assigned successfully'
      });
    }

    if (action === 'unassign-station') {
      const stationIndex = mockLocationConfigs[configIndex].posStations.findIndex(s => s.id === stationId);
      if (stationIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'POS station not found' },
          { status: 404 }
        );
      }

      delete mockLocationConfigs[configIndex].posStations[stationIndex].assignedWorkerId;
      mockLocationConfigs[configIndex].updatedAt = new Date().toISOString();

      return NextResponse.json({
        success: true,
        config: mockLocationConfigs[configIndex],
        message: 'Station unassigned successfully'
      });
    }

    if (action === 'toggle-station') {
      const stationIndex = mockLocationConfigs[configIndex].posStations.findIndex(s => s.id === stationId);
      if (stationIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'POS station not found' },
          { status: 404 }
        );
      }

      mockLocationConfigs[configIndex].posStations[stationIndex].isActive = 
        !mockLocationConfigs[configIndex].posStations[stationIndex].isActive;
      mockLocationConfigs[configIndex].updatedAt = new Date().toISOString();

      return NextResponse.json({
        success: true,
        config: mockLocationConfigs[configIndex],
        message: 'Station status toggled successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing POS station:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}