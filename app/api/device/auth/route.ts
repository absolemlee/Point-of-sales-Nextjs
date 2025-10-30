import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  DeviceAuthRequest, 
  DeviceAuthResponse, 
  RegisteredDevice, 
  DeviceType, 
  DeviceStatus 
} from '@/types/device-management';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body: DeviceAuthRequest = await request.json();
    const {
      deviceFingerprint,
      deviceName,
      deviceType,
      capabilities,
      requestedLocation,
      requestedInterface,
      userId,
      ipAddress,
      userAgent
    } = body;

    if (!deviceFingerprint || !requestedLocation || !requestedInterface) {
      return NextResponse.json(
        { success: false, error: 'Missing required device information' } as DeviceAuthResponse,
        { status: 400 }
      );
    }

    // Check if device is already registered
    let device = await findDeviceByFingerprint(deviceFingerprint);
    
    if (!device) {
      // Register new device
      device = await registerNewDevice({
        deviceFingerprint,
        deviceName,
        deviceType,
        capabilities,
        requestedLocation,
        requestedInterface,
        userId,
        ipAddress,
        userAgent
      });
    } else {
      // Update existing device info
      await updateDeviceInfo(device.id, {
        capabilities,
        lastSeen: new Date().toISOString(),
        deviceName: deviceName || device.deviceName
      });
    }

    // Check device access permissions
    const accessCheck = checkDeviceAccess(device, requestedInterface, requestedLocation, userId);
    
    if (!accessCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: accessCheck.reason,
        requiresApproval: accessCheck.requiresApproval
      } as DeviceAuthResponse);
    }

    // Create device session
    const session = await createDeviceSession({
      deviceId: device.id,
      userId: userId || 'anonymous',
      locationId: requestedLocation,
      interfaceType: requestedInterface,
      ipAddress,
      permissions: getDevicePermissions(device, requestedInterface)
    });

    return NextResponse.json({
      success: true,
      deviceId: device.id,
      sessionId: session.id,
      allowedInterfaces: device.allowedInterfaces,
      restrictions: device.restrictions,
      expiresAt: session.expiresAt
    } as DeviceAuthResponse);

  } catch (error) {
    console.error('Error in device authentication:', error);
    return NextResponse.json(
      { success: false, error: 'Device authentication failed' } as DeviceAuthResponse,
      { status: 500 }
    );
  }
}

// Database functions using Prisma
async function findDeviceByFingerprint(fingerprint: string): Promise<RegisteredDevice | null> {
  try {
    const device = await prisma.device.findUnique({
      where: { fingerprint }
    });

    if (!device) return null;

    // Convert Prisma device to RegisteredDevice type
    return {
      id: device.id,
      deviceName: device.name,
      deviceType: device.deviceType as DeviceType,
      fingerprint: device.fingerprint,
      capabilities: device.capabilities as any,
      status: device.status as DeviceStatus,
      locationId: device.locationId || 'default-location',
      allowedInterfaces: getDefaultInterfacesForDevice(device.deviceType as DeviceType),
      restrictions: {
        requiresApproval: device.status === 'PENDING_APPROVAL',
        maxSessionDuration: 480,
        locationRestricted: true
      },
      lastSeen: device.lastSeen?.toISOString() || new Date().toISOString(),
      registeredAt: device.createdAt.toISOString(),
      registeredBy: device.assignedUserId || 'system',
      updatedAt: device.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error finding device by fingerprint:', error);
    return null;
  }
}

async function registerNewDevice(data: DeviceAuthRequest): Promise<RegisteredDevice> {
  try {
    // Determine default interfaces based on device type
    const defaultInterfaces = getDefaultInterfacesForDevice(data.deviceType);
    
    // Determine if approval is required
    const requiresApproval = determineApprovalRequirement(data);
    
    const device = await prisma.device.create({
      data: {
        fingerprint: data.deviceFingerprint,
        deviceType: data.deviceType,
        name: data.deviceName || `${data.deviceType} Device`,
        description: `Auto-registered ${data.deviceType} device`,
        capabilities: data.capabilities as any,
        locationId: data.requestedLocation,
        assignedUserId: data.userId,
        status: requiresApproval ? 'PENDING_APPROVAL' : 'ACTIVE',
        userAgent: data.userAgent,
        lastIpAddress: data.ipAddress,
        lastSeen: new Date()
      }
    });

    // Convert to RegisteredDevice type
    return {
      id: device.id,
      deviceName: device.name,
      deviceType: device.deviceType as DeviceType,
      fingerprint: device.fingerprint,
      capabilities: device.capabilities as any,
      status: device.status as DeviceStatus,
      locationId: device.locationId || 'default-location',
      allowedInterfaces: defaultInterfaces,
      restrictions: {
        requiresApproval,
        maxSessionDuration: 480,
        locationRestricted: true
      },
      lastSeen: device.lastSeen?.toISOString() || new Date().toISOString(),
      registeredAt: device.createdAt.toISOString(),
      registeredBy: device.assignedUserId || 'system',
      updatedAt: device.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error registering new device:', error);
    throw new Error('Failed to register device');
  }
}

async function updateDeviceInfo(deviceId: string, updates: any) {
  try {
    await prisma.device.update({
      where: { id: deviceId },
      data: {
        capabilities: updates.capabilities as any,
        lastSeen: updates.lastSeen ? new Date(updates.lastSeen) : new Date(),
        name: updates.deviceName
      }
    });
    console.log(`Updated device ${deviceId}`);
  } catch (error) {
    console.error('Error updating device info:', error);
  }
}

function checkDeviceAccess(
  device: RegisteredDevice, 
  interfaceType: string, 
  locationId: string, 
  userId?: string
): { allowed: boolean; reason?: string; requiresApproval?: boolean } {
  
  if (device.status === DeviceStatus.PENDING_APPROVAL) {
    return { 
      allowed: false, 
      reason: 'Device pending approval', 
      requiresApproval: true 
    };
  }
  
  if (device.status === DeviceStatus.BLOCKED) {
    return { allowed: false, reason: 'Device is blocked' };
  }
  
  if (device.status === DeviceStatus.MAINTENANCE) {
    return { allowed: false, reason: 'Device is in maintenance mode' };
  }
  
  if (device.restrictions.locationRestricted && device.locationId !== locationId) {
    return { allowed: false, reason: 'Device not authorized for this location' };
  }
  
  if (!device.allowedInterfaces.includes(interfaceType)) {
    return { allowed: false, reason: 'Interface not permitted on this device' };
  }
  
  return { allowed: true };
}

async function createDeviceSession(data: {
  deviceId: string;
  userId: string;
  locationId: string;
  interfaceType: string;
  ipAddress: string;
  permissions: string[];
}) {
  try {
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now
    const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await prisma.deviceSession.create({
      data: {
        deviceId: data.deviceId,
        userId: data.userId === 'anonymous' ? null : data.userId,
        sessionToken,
        status: 'ACTIVE',
        lastActivity: new Date(),
        ipAddress: data.ipAddress,
        userAgent: '', // Could be passed from request headers
        expiresAt
      }
    });

    return {
      id: session.id,
      deviceId: session.deviceId,
      userId: session.userId || 'anonymous',
      locationId: data.locationId,
      interfaceType: data.interfaceType,
      startTime: session.createdAt.toISOString(),
      lastActivity: session.lastActivity.toISOString(),
      ipAddress: session.ipAddress || '',
      status: session.status,
      permissions: data.permissions,
      expiresAt: session.expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Error creating device session:', error);
    throw new Error('Failed to create device session');
  }
}

function getDefaultInterfacesForDevice(deviceType: DeviceType): string[] {
  switch (deviceType) {
    case DeviceType.CUSTOMER_KIOSK:
      return ['CUSTOMER_KIOSK', 'CUSTOMER_ORDERING'];
    case DeviceType.KITCHEN_DISPLAY:
      return ['KITCHEN_DISPLAY'];
    case DeviceType.PAYMENT_TERMINAL:
      return ['PAYMENT_TERMINAL'];
    case DeviceType.MOBILE_POS:
      return ['MOBILE_POS', 'ORDER_ENTRY'];
    case DeviceType.TABLET_POS:
      return ['ORDER_ENTRY', 'PAYMENT_TERMINAL', 'MANAGER_TERMINAL'];
    case DeviceType.MANAGER_STATION:
      return ['MANAGER_TERMINAL', 'ORDER_ENTRY', 'PAYMENT_TERMINAL', 'KITCHEN_DISPLAY'];
    default:
      return ['CUSTOMER_ORDERING'];
  }
}

function determineApprovalRequirement(data: DeviceAuthRequest): boolean {
  // Require approval for sensitive interfaces or new device types
  const sensitiveInterfaces = ['MANAGER_TERMINAL', 'PAYMENT_TERMINAL'];
  
  if (sensitiveInterfaces.includes(data.requestedInterface)) {
    return true;
  }
  
  // Require approval for manager stations in production
  if (data.deviceType === DeviceType.MANAGER_STATION) {
    return true;
  }
  
  return false;
}

function getDevicePermissions(device: RegisteredDevice, interfaceType: string): string[] {
  const basePermissions = ['pos:basic_access'];
  
  switch (interfaceType) {
    case 'MANAGER_TERMINAL':
      return [...basePermissions, 'pos:manager_functions', 'pos:override_permissions', 'pos:staff_management'];
    case 'PAYMENT_TERMINAL':
      return [...basePermissions, 'pos:payment_processing', 'pos:refund_processing'];
    case 'KITCHEN_DISPLAY':
      return [...basePermissions, 'pos:kitchen_display', 'pos:order_management'];
    case 'ORDER_ENTRY':
      return [...basePermissions, 'pos:order_entry', 'pos:customer_service'];
    default:
      return basePermissions;
  }
}