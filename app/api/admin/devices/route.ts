import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for testing when database is unavailable
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
    sessions: [
      {
        id: 'session-1',
        sessionToken: 'mock-session-token',
        status: 'ACTIVE',
        lastActivity: new Date().toISOString(),
        ipAddress: '192.168.1.101'
      }
    ]
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

// GET - List all devices with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const deviceType = searchParams.get('deviceType');
    const locationId = searchParams.get('locationId');
    const search = searchParams.get('search');

    // Try database first, fall back to mock data
    let devices;
    try {
      // Build filter conditions
      const where: any = {};
      
      if (status && status !== 'ALL') {
        where.status = status;
      }
      
      if (deviceType && deviceType !== 'ALL') {
        where.deviceType = deviceType;
      }
      
      if (locationId && locationId !== 'ALL') {
        where.locationId = locationId;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { fingerprint: { contains: search, mode: 'insensitive' } }
        ];
      }

      devices = await prisma.device.findMany({
        where,
        include: {
          sessions: {
            where: { terminatedAt: null },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { status: 'asc' },
          { updatedAt: 'desc' }
        ]
      });
    } catch (dbError) {
      console.warn('Database unavailable, using mock data:', dbError);
      // Filter mock data based on search parameters
      devices = mockDevices.filter(device => {
        if (status && status !== 'ALL' && device.status !== status) return false;
        if (deviceType && deviceType !== 'ALL' && device.deviceType !== deviceType) return false;
        if (locationId && locationId !== 'ALL' && device.locationId !== locationId) return false;
        if (search) {
          const searchLower = search.toLowerCase();
          if (!device.name.toLowerCase().includes(searchLower) && 
              !device.fingerprint.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        return true;
      });
    }

    // Transform devices to API format
    const transformedDevices = devices.map((device: any) => ({
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
      capabilities: device.capabilities as string[],
      userAgent: device.userAgent,
      ipAddress: device.lastIpAddress,
      registeredBy: 'system', // TODO: Add registeredBy field to schema
      approvedBy: device.approvedBy,
      sessions: device.sessions.map((session: any) => ({
        id: session.id,
        startedAt: session.createdAt,
        endedAt: session.terminatedAt,
        isActive: !session.terminatedAt
      }))
    }));

    return NextResponse.json({
      success: true,
      devices: transformedDevices,
      total: transformedDevices.length
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST - Create new device registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fingerprint,
      deviceName,
      deviceType,
      capabilities,
      locationId,
      userAgent,
      ipAddress,
      registeredBy
    } = body;

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: { fingerprint }
    });

    if (existingDevice) {
      return NextResponse.json(
        { success: false, error: 'Device with this fingerprint already exists' },
        { status: 409 }
      );
    }

    // Create new device
    const device = await prisma.device.create({
      data: {
        fingerprint,
        name: deviceName,
        deviceType,
        capabilities: capabilities || [],
        status: 'PENDING_APPROVAL',
        locationId,
        userAgent: userAgent || '',
        lastIpAddress: ipAddress || ''
      }
    });

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
        registeredAt: device.createdAt,
        capabilities: device.capabilities as string[]
      }
    });

  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create device' },
      { status: 500 }
    );
  }
}