import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the development session cookie
  response.cookies.set('dev-session', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });

  return response;
}