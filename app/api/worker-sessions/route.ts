import { NextRequest, NextResponse } from 'next/server';
import { WorkerSession } from '@/types/shift-management';

// Mock data for development - replace with actual database calls
const mockWorkerSessions: WorkerSession[] = [
  {
    id: 'session-001',
    workerId: 'worker-001',
    workerName: 'Alex Rivera',
    shiftId: 'shift-001',
    locationId: 'loc-downtown-cafe',
    role: 'CASHIER',
    assignedStations: ['POS_1', 'PAYMENT_TERMINAL'],
    permissions: ['pos:operate', 'payment:process', 'orders:manage'],
    clockInTime: '2025-10-20T06:00:00Z',
    lastActivity: '2025-10-20T07:58:00Z',
    deviceInfo: {
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ipAddress: '192.168.1.101',
      screenSize: '1024x768'
    },
    status: 'ACTIVE'
  },
  {
    id: 'session-002',
    workerId: 'worker-002',
    workerName: 'Jordan Kim',
    shiftId: 'shift-001',
    locationId: 'loc-downtown-cafe',
    role: 'KITCHEN',
    assignedStations: ['KITCHEN_DISPLAY'],
    permissions: ['kitchen:operate', 'orders:prepare', 'inventory:update'],
    clockInTime: '2025-10-20T06:15:00Z',
    lastActivity: '2025-10-20T07:55:00Z',
    deviceInfo: {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      ipAddress: '192.168.1.102',
      screenSize: '1920x1080'
    },
    status: 'ACTIVE'
  },
  {
    id: 'session-003',
    workerId: 'worker-003',
    workerName: 'Taylor Brooks',
    shiftId: 'shift-001',
    locationId: 'loc-downtown-cafe',
    role: 'SERVER',
    assignedStations: ['ORDER_RUNNER'],
    permissions: ['orders:serve', 'customer:assist'],
    clockInTime: '2025-10-20T06:30:00Z',
    lastActivity: '2025-10-20T08:00:00Z',
    deviceInfo: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ipAddress: '192.168.1.103',
      screenSize: '390x844'
    },
    status: 'ON_BREAK'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const workerId = searchParams.get('workerId');
    const shiftId = searchParams.get('shiftId');
    const status = searchParams.get('status');

    let filteredSessions = mockWorkerSessions;

    if (locationId) {
      filteredSessions = filteredSessions.filter(s => s.locationId === locationId);
    }

    if (workerId) {
      filteredSessions = filteredSessions.filter(s => s.workerId === workerId);
    }

    if (shiftId) {
      filteredSessions = filteredSessions.filter(s => s.shiftId === shiftId);
    }

    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      totalSessions: filteredSessions.length,
      activeSessions: filteredSessions.filter(s => s.status === 'ACTIVE').length
    });

  } catch (error) {
    console.error('Error fetching worker sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      workerId, 
      workerName, 
      shiftId, 
      locationId, 
      role, 
      assignedStations, 
      permissions,
      deviceInfo 
    } = body;

    if (action === 'clock-in') {
      // Check if worker is already clocked in
      const existingSession = mockWorkerSessions.find(
        s => s.workerId === workerId && s.status === 'ACTIVE'
      );

      if (existingSession) {
        return NextResponse.json(
          { success: false, error: 'Worker already clocked in' },
          { status: 400 }
        );
      }

      const newSession: WorkerSession = {
        id: `session-${Date.now()}`,
        workerId,
        workerName,
        shiftId,
        locationId,
        role,
        assignedStations: assignedStations || [],
        permissions: permissions || [],
        clockInTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        deviceInfo: deviceInfo || {
          userAgent: 'Unknown',
          ipAddress: '0.0.0.0',
          screenSize: 'Unknown'
        },
        status: 'ACTIVE'
      };

      mockWorkerSessions.push(newSession);

      return NextResponse.json({
        success: true,
        session: newSession,
        message: 'Worker clocked in successfully'
      });
    }

    if (action === 'clock-out') {
      const sessionIndex = mockWorkerSessions.findIndex(
        s => s.workerId === workerId && s.status !== 'INACTIVE'
      );

      if (sessionIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'No active session found' },
          { status: 404 }
        );
      }

      mockWorkerSessions[sessionIndex].status = 'INACTIVE';
      mockWorkerSessions[sessionIndex].lastActivity = new Date().toISOString();

      return NextResponse.json({
        success: true,
        session: mockWorkerSessions[sessionIndex],
        message: 'Worker clocked out successfully'
      });
    }

    if (action === 'break-start') {
      const sessionIndex = mockWorkerSessions.findIndex(
        s => s.workerId === workerId && s.status === 'ACTIVE'
      );

      if (sessionIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'No active session found' },
          { status: 404 }
        );
      }

      mockWorkerSessions[sessionIndex].status = 'ON_BREAK';
      mockWorkerSessions[sessionIndex].lastActivity = new Date().toISOString();

      return NextResponse.json({
        success: true,
        session: mockWorkerSessions[sessionIndex],
        message: 'Break started'
      });
    }

    if (action === 'break-end') {
      const sessionIndex = mockWorkerSessions.findIndex(
        s => s.workerId === workerId && s.status === 'ON_BREAK'
      );

      if (sessionIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'No break session found' },
          { status: 404 }
        );
      }

      mockWorkerSessions[sessionIndex].status = 'ACTIVE';
      mockWorkerSessions[sessionIndex].lastActivity = new Date().toISOString();

      return NextResponse.json({
        success: true,
        session: mockWorkerSessions[sessionIndex],
        message: 'Break ended'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing worker session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId, updates } = body;

    const sessionIndex = mockWorkerSessions.findIndex(
      s => s.workerId === workerId && s.status !== 'INACTIVE'
    );

    if (sessionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'No active session found' },
        { status: 404 }
      );
    }

    mockWorkerSessions[sessionIndex] = {
      ...mockWorkerSessions[sessionIndex],
      ...updates,
      lastActivity: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      session: mockWorkerSessions[sessionIndex],
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Error updating worker session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}