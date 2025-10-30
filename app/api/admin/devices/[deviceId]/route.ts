import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for testing (same as in route.ts)
const mockDevices = [
  {
    id: 'dev-1',
    fingerprint: 'mock-fingerprint-001',
    deviceType: 'MANAGER_STATION',
    name: 'Main Manager Station',
    description: 'Primary management terminal',
    capabilities: {
      hasTouchScreen: true,
      hasScanner: false,
      hasPrinter: true,
      hasPaymentProcessor: false
    },
    locationId: 'loc-1',
    assignedUserId: null,
    status: 'PENDING_APPROVAL',
    approvedBy: null,
    approvedAt: null,
    userAgent: 'Mozilla/5.0 (Test Browser)',
    lastIpAddress: '192.168.1.100',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions: []
  },
  {
    id: 'dev-2',
    fingerprint: 'mock-fingerprint-002',
    deviceType: 'KITCHEN_DISPLAY',
    name: 'Kitchen Display #1',
    description: 'Main kitchen display terminal',
    capabilities: {
      hasTouchScreen: true,
      hasScanner: false,
      hasPrinter: false,
      hasPaymentProcessor: false
    },
    locationId: 'loc-1',
    assignedUserId: 'user-1',
    status: 'ACTIVE',
    approvedBy: 'admin-1',
    approvedAt: new Date().toISOString(),
    userAgent: 'Mozilla/5.0 (Kitchen Terminal)',
    lastIpAddress: '192.168.1.101',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions: []
  },
  {
    id: 'dev-3',
    fingerprint: 'mock-fingerprint-003',
    deviceType: 'PAYMENT_TERMINAL',
    name: 'Payment Terminal #1',
    description: 'Main payment processing terminal',
    capabilities: {
      hasTouchScreen: true,
      hasScanner: true,
      hasPrinter: true,
      hasPaymentProcessor: true
    },
    locationId: 'loc-1',
    assignedUserId: null,
    status: 'MAINTENANCE',
    approvedBy: 'admin-1',
    approvedAt: new Date().toISOString(),
    userAgent: 'Mozilla/5.0 (Payment Terminal)',
    lastIpAddress: '192.168.1.102',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions: []
  }
];

// PUT - Update device (approve, reject, suspend, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    const body = await request.json();
    const { action, approvedBy, reason } = body;

    // Try database first, fall back to mock data
    let device;
    try {
      device = await prisma.device.findUnique({
        where: { id: deviceId }
      });
    } catch (dbError) {
      console.warn('Database unavailable, using mock data for device:', deviceId);
      device = mockDevices.find(d => d.id === deviceId);
      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
    }

    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date()
    };

    switch (action) {
      case 'approve':
        updateData.status = 'ACTIVE';
        updateData.approvedAt = new Date();
        updateData.approvedBy = approvedBy;
        break;

      case 'reject':
        updateData.status = 'REJECTED';
        break;

      case 'suspend':
        updateData.status = 'INACTIVE';
        // For database, end all active sessions
        try {
          await prisma.deviceSession.updateMany({
            where: {
              deviceId: deviceId,
              terminatedAt: null
            },
            data: {
              terminatedAt: new Date(),
              terminatedReason: 'DEVICE_SUSPENDED'
            }
          });
        } catch (dbError) {
          console.warn('Cannot update sessions in mock mode');
        }
        break;

      case 'reactivate':
        updateData.status = 'ACTIVE';
        break;

      case 'update_capabilities':
        updateData.capabilities = body.capabilities;
        break;

      case 'update_location':
        updateData.locationId = body.locationId;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Try to update device in database, fall back to mock response
    let updatedDevice;
    try {
      updatedDevice = await prisma.device.update({
        where: { id: deviceId },
        data: updateData,
        include: {
          sessions: {
            where: { terminatedAt: null },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } catch (dbError) {
      console.warn('Database unavailable, simulating update for mock device');
      // Update mock device in memory (for this request only)
      const mockDevice = mockDevices.find(d => d.id === deviceId);
      if (mockDevice) {
        Object.assign(mockDevice, updateData);
        updatedDevice = { ...mockDevice, sessions: mockDevice.sessions || [] };
      } else {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      device: {
        id: updatedDevice.id,
        fingerprint: updatedDevice.fingerprint,
        deviceType: updatedDevice.deviceType,
        deviceName: updatedDevice.name,
        status: updatedDevice.status,
        locationId: updatedDevice.locationId,
        locationName: null, // TODO: Add location relation
        lastSeen: updatedDevice.lastSeen,
        registeredAt: updatedDevice.createdAt,
        approvedAt: updatedDevice.approvedAt,
        capabilities: updatedDevice.capabilities as string[],
        userAgent: updatedDevice.userAgent,
        ipAddress: updatedDevice.lastIpAddress,
        registeredBy: 'system', // TODO: Add registeredBy field to schema
        approvedBy: updatedDevice.approvedBy,
        sessions: updatedDevice.sessions.map((session: any) => ({
          id: session.id,
          startedAt: session.createdAt,
          endedAt: session.terminatedAt,
          isActive: !session.terminatedAt
        }))
      }
    });

  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update device' },
      { status: 500 }
    );
  }
}

// DELETE - Delete device (hard delete or soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    const { searchParams } = new URL(request.url);
    const softDelete = searchParams.get('soft') === 'true';

    if (softDelete) {
      // Soft delete - just update status
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: 'INACTIVE'
        }
      });
    } else {
      // Hard delete - remove from database
      // First end all sessions
      await prisma.deviceSession.updateMany({
        where: { deviceId: deviceId },
        data: {
          terminatedAt: new Date(),
          terminatedReason: 'DEVICE_DELETED'
        }
      });

      // Then delete the device
      await prisma.device.delete({
        where: { id: deviceId }
      });
    }

    return NextResponse.json({
      success: true,
      message: softDelete ? 'Device soft deleted' : 'Device permanently deleted'
    });

  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete device' },
      { status: 500 }
    );
  }
}

// GET - Get device details
export async function GET(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;

    // Try database first, fall back to mock data
    let device;
    try {
      device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: {
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 50 // Last 50 sessions
          }
        }
      });
    } catch (dbError) {
      console.warn('Database unavailable, using mock data for device:', deviceId);
      device = mockDevices.find(d => d.id === deviceId);
    }

    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      device: {
        id: device.id,
        fingerprint: device.fingerprint,
        deviceType: device.deviceType,
        deviceName: device.name,
        status: device.status,
        locationId: device.locationId,
        locationName: null, // TODO: Add location relation
        lastSeen: device.lastSeen,
        registeredAt: device.createdAt,
        approvedAt: device.approvedAt,
        capabilities: device.capabilities,
        userAgent: device.userAgent,
        ipAddress: device.lastIpAddress,
        registeredBy: 'system', // TODO: Add registeredBy field to schema
        approvedBy: device.approvedBy,
        sessions: (device.sessions || []).map((session: any) => ({
          id: session.id,
          startedAt: session.createdAt || session.lastActivity,
          endedAt: session.terminatedAt,
          isActive: !session.terminatedAt,
          endReason: session.terminatedReason
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching device details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device details' },
      { status: 500 }
    );
  }
}