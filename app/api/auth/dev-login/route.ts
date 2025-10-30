import { NextRequest, NextResponse } from 'next/server';

// Development-only superadmin login
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Development login not available in production' }, { status: 403 });
  }

  // Check for development credentials
  if (email === 'admin@admin.com' && password === 'admin') {
    // For development mode, skip database operations and return success
    // This allows immediate testing without database setup
    const response = NextResponse.json({
      success: true,
      user: {
        id: 'dev-admin-001',
        email: 'admin@admin.com',
        name: 'Development Admin',
        username: 'dev.admin',
        role: 'SUPERADMIN',
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
        isActive: true
      },
      message: 'Development admin login successful'
    });

    // Set a development session cookie
    response.cookies.set('dev-session', 'admin@admin.com', {
      httpOnly: true,
      secure: false, // Development only
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  }  return NextResponse.json({ error: 'Invalid development credentials' }, { status: 401 });
}

// GET endpoint to check if dev mode is available
export async function GET() {
  return NextResponse.json({
    devMode: process.env.NODE_ENV !== 'production',
    message: process.env.NODE_ENV === 'production' 
      ? 'Development mode not available' 
      : 'Development mode available. Use admin@admin.com / admin'
  });
}