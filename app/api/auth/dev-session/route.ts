import { NextRequest, NextResponse } from 'next/server';
import { KavaPRRole } from '@/schema/kavap-r-types';

export async function GET(request: NextRequest) {
  try {
    // Check for dev session cookie
    const devSession = request.cookies.get('dev-session');
    
    if (!devSession || devSession.value !== 'admin@admin.com') {
      return NextResponse.json({ success: false, error: 'No dev session found' });
    }

    // Return mock dev user data
    const devUser = {
      id: 'dev-admin-001',
      email: 'admin@admin.com',
      name: 'Development Admin',
      username: 'dev.admin',
      role: KavaPRRole.SUPERADMIN,
      permissions: [
        'system:admin',
        'users:admin',
        'locations:admin',
        'products:admin',
        'transactions:admin',
        'analytics:admin',
        'configuration:admin',
        'audit:admin'
      ],
      isActive: true,
      locationType: undefined,
      locationId: undefined,
      department: 'Administration',
      managerId: undefined
    };

    return NextResponse.json({
      success: true,
      user: devUser
    });

  } catch (error) {
    console.error('Error checking dev session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}