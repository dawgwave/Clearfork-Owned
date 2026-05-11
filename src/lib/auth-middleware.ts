import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyToken, getUserById, hasPermission, hasRole, type UserWithRoles } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: UserWithRoles;
}

/**
 * Get user from Authorization header or cookies
 */
export async function getUserFromRequest(request: NextRequest): Promise<UserWithRoles | null> {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token) {
    token = request.cookies.get('auth-token')?.value || null;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      return await getUserById(payload.userId);
    }
  }

  const nextSecret = process.env.NEXTAUTH_SECRET;
  if (nextSecret) {
    const nextToken = await getToken({ req: request, secret: nextSecret });
    if (nextToken && typeof nextToken.appUserId === 'number') {
      return await getUserById(nextToken.appUserId);
    }
  }

  return null;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Add user to request
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = user;

  return handler(authenticatedRequest);
}

/**
 * Middleware to require specific role
 */
export async function requireRole(
  roleName: string,
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  return requireAuth(request, async (req) => {
    if (!req.user || !hasRole(req.user, roleName)) {
      return NextResponse.json(
        { error: `${roleName} role required` },
        { status: 403 }
      );
    }
    return handler(req);
  });
}

/**
 * Middleware to require specific permission
 */
export async function requirePermission(
  resource: string,
  action: string,
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  return requireAuth(request, async (req) => {
    if (!req.user || !hasPermission(req.user, resource, action)) {
      return NextResponse.json(
        { error: `Permission required: ${action} ${resource}` },
        { status: 403 }
      );
    }
    return handler(req);
  });
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  return requireRole('admin', request, handler);
}

/**
 * Get current user info (for API routes)
 */
export async function getCurrentUser(request: NextRequest): Promise<{ user?: UserWithRoles; error?: string }> {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return { error: 'Not authenticated' };
    }
    return { user };
  } catch (error) {
    return { error: 'Authentication error' };
  }
}