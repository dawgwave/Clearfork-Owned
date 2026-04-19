import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Clear the auth cookie
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
  });

  return response;
}

// Also support GET for logout links
export async function GET(request: NextRequest) {
  return POST(request);
}