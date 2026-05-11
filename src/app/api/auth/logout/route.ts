import { NextRequest, NextResponse } from 'next/server';

const secure = process.env.NODE_ENV === 'production';

function clearNextAuthSession(response: NextResponse) {
  const base = { path: '/', sameSite: 'lax' as const, maxAge: 0, httpOnly: true, secure };
  for (const name of [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
  ]) {
    response.cookies.set(name, '', base);
  }
}

export async function POST(_request?: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 0,
  });
  clearNextAuthSession(response);

  return response;
}

// Also support GET for logout links
export async function GET() {
  return POST(undefined);
}