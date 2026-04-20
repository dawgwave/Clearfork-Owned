import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { isRecaptchaVerificationEnabled, verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, recaptchaToken } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA if configured (less strict for login)
    if (recaptchaToken && isRecaptchaVerificationEnabled()) {
      const captcha = await verifyRecaptcha(recaptchaToken);
      if (!captcha.success || captcha.score < 0.3) { // Lower threshold for login
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    // Authenticate user
    const { user, error } = await authenticateUser(email.toLowerCase().trim(), password);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles.map(r => r.name),
      },
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // TODO: Set to true when HTTPS is configured
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}