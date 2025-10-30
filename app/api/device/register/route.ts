import { NextRequest, NextResponse } from 'next/server';
import { RegisteredDevice, DeviceStatus } from '@/types/device-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');

    // In a real implementation:
    // const devices = await db.devices.findMany({
    //   where: {
    //     locationId: locationId || undefined,
    //     status: status as DeviceStatus || undefined
    //   }
    // });

    // Mock device list
    const mockDevices: RegisteredDevice[] = [
      {
        id: 'device-001',
        deviceName: 'Manager iPad Pro',
        deviceType: 'TABLET' as any,
        fingerprint: 'fp-manager-ipad',
        capabilities: {
          screenWidth: 1024,
          screenHeight: 768,
          touchEnabled: true,
          cameraEnabled: true,
          microphoneEnabled: true,
          bluetoothEnabled: true,
          nfcEnabled: false,
          printerConnected: false,
          cashDrawerConnected: false,
          barcodeScanner: false,
          cardReader: false,
          userAgent: 'iPad Safari',
          platform: 'iPad',
          connectionType: 'wifi'
        },
        status: DeviceStatus.ACTIVE,
        locationId: 'loc-downtown-cafe',
        assignedUserId: 'manager-001',
        allowedInterfaces: ['MANAGER_TERMINAL', 'ORDER_ENTRY'],
        restrictions: {
          requiresApproval: false,
          maxSessionDuration: 480,
          locationRestricted: true
        },
        lastSeen: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 86400000).toISOString(),
        registeredBy: 'admin',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'device-002',
        deviceName: 'Kitchen Display Monitor',
        deviceType: 'KITCHEN_DISPLAY' as any,
        fingerprint: 'fp-kitchen-display-001',
        capabilities: {
          screenWidth: 1920,
          screenHeight: 1080,
          touchEnabled: true,
          cameraEnabled: false,
          microphoneEnabled: false,
          bluetoothEnabled: false,
          nfcEnabled: false,
          printerConnected: true,
          cashDrawerConnected: false,
          barcodeScanner: false,
          cardReader: false,
          userAgent: 'Chrome Kiosk',
          platform: 'Linux',
          connectionType: 'ethernet'
        },
        status: DeviceStatus.ACTIVE,
        locationId: 'loc-downtown-cafe',
        stationId: 'kitchen-main',
        allowedInterfaces: ['KITCHEN_DISPLAY'],
        restrictions: {
          requiresApproval: false,
          locationRestricted: true
        },
        lastSeen: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        registeredBy: 'admin',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'device-003',
        deviceName: 'Payment Terminal',
        deviceType: 'PAYMENT_TERMINAL' as any,
        fingerprint: 'fp-payment-terminal-001',
        capabilities: {
          screenWidth: 800,
          screenHeight: 600,
          touchEnabled: true,
          cameraEnabled: false,
          microphoneEnabled: false,
          bluetoothEnabled: true,
          nfcEnabled: true,
          printerConnected: true,
          cashDrawerConnected: true,
          barcodeScanner: true,
          cardReader: true,
          userAgent: 'POS Terminal',
          platform: 'POS',
          connectionType: 'ethernet'
        },
        status: DeviceStatus.ACTIVE,
        locationId: 'loc-downtown-cafe',
        stationId: 'checkout-001',
        allowedInterfaces: ['PAYMENT_TERMINAL'],
        restrictions: {
          requiresApproval: false,
          locationRestricted: true
        },
        lastSeen: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        registeredBy: 'admin',
        updatedAt: new Date().toISOString()
      }
    ];

    let filteredDevices = mockDevices;
    
    if (locationId) {
      filteredDevices = filteredDevices.filter(d => d.locationId === locationId);
    }
    
    if (status) {
      filteredDevices = filteredDevices.filter(d => d.status === status);
    }

    return NextResponse.json({
      success: true,
      devices: filteredDevices
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceName, deviceType, locationId, assignedUserId, allowedInterfaces, restrictions } = body;

    if (!deviceName || !deviceType || !locationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required device information' },
        { status: 400 }
      );
    }

    // Create new device registration
    const deviceId = `device-${Date.now()}`;
    const device: RegisteredDevice = {
      id: deviceId,
      deviceName,
      deviceType,
      fingerprint: '', // Will be set when device connects
      capabilities: {
        screenWidth: 0,
        screenHeight: 0,
        touchEnabled: false,
        cameraEnabled: false,
        microphoneEnabled: false,
        bluetoothEnabled: false,
        nfcEnabled: false,
        printerConnected: false,
        cashDrawerConnected: false,
        barcodeScanner: false,
        cardReader: false,
        userAgent: '',
        platform: '',
        connectionType: 'unknown'
      },
      status: DeviceStatus.PENDING_APPROVAL,
      locationId,
      assignedUserId,
      allowedInterfaces: allowedInterfaces || [],
      restrictions: restrictions || {
        requiresApproval: true,
        locationRestricted: true
      },
      lastSeen: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      registeredBy: 'admin', // Get from auth context
      updatedAt: new Date().toISOString()
    };

    // In a real implementation:
    // await db.devices.create({ data: device });

    console.log('Device registered:', device);

    return NextResponse.json({
      success: true,
      device
    });

  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register device' },
      { status: 500 }
    );
  }
}