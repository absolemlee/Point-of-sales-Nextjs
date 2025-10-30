import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const userId = searchParams.get('userId');
    const locationId = searchParams.get('locationId');

    // Mock active sessions
    const mockSessions = [
      {
        id: 'session-001',
        deviceId: 'device-001',
        userId: 'manager-001',
        locationId: 'loc-downtown-cafe',
        interfaceType: 'MANAGER_TERMINAL',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        ipAddress: '192.168.1.101',
        status: 'ACTIVE',
        permissions: ['pos:manager_functions', 'pos:override_permissions'],
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours from now
      },
      {
        id: 'session-002',
        deviceId: 'device-002',
        userId: 'system',
        locationId: 'loc-downtown-cafe',
        interfaceType: 'KITCHEN_DISPLAY',
        startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
        ipAddress: '192.168.1.102',
        status: 'ACTIVE',
        permissions: ['pos:kitchen_display'],
        expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString() // 16 hours from now
      }
    ];

    let filteredSessions = mockSessions;

    if (deviceId) {
      filteredSessions = filteredSessions.filter(s => s.deviceId === deviceId);
    }

    if (userId) {
      filteredSessions = filteredSessions.filter(s => s.userId === userId);
    }

    if (locationId) {
      filteredSessions = filteredSessions.filter(s => s.locationId === locationId);
    }

    return NextResponse.json({
      success: true,
      sessions: filteredSessions
    });

  } catch (error) {
    console.error('Error fetching device sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, userId, locationId, interfaceType, permissions } = body;

    if (!deviceId || !userId || !locationId || !interfaceType) {
      return NextResponse.json(
        { success: false, error: 'Missing required session information' },
        { status: 400 }
      );
    }

    // Create new device session
    const sessionId = `session-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now

    const session = {
      id: sessionId,
      deviceId,
      userId,
      locationId,
      interfaceType,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: request.ip || 'unknown',
      status: 'ACTIVE',
      permissions: permissions || [],
      expiresAt: expiresAt.toISOString()
    };

    // In a real implementation:
    // await db.deviceSessions.create({ data: session });

    console.log('Device session created:', session);

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error creating device session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create device session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation:
    // await db.deviceSessions.update({
    //   where: { id: sessionId },
    //   data: { status: 'EXPIRED', endTime: new Date() }
    // });

    console.log(`Device session ${sessionId} ended`);

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('Error ending device session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end device session' },
      { status: 500 }
    );
  }
}