import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

const publicRoutes = ['/auth/login', '/auth/signup', '/', '/pricing'];
const apiPublicRoutes = ['/api/auth/signup', '/api/auth/signin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/signin') ||
    pathname.startsWith('/api/auth/refresh')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: { message: 'Unauthorized. Please log in to continue.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    await verifyAccessToken(accessToken);
    return NextResponse.next();
  } catch (error) {
    // Token expired or invalid - try refresh
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (refreshToken && pathname.startsWith('/api')) {
      // Try to refresh token for API routes
      try {
        const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
          method: 'POST',
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          const { accessToken: newAccessToken } = await refreshResponse.json();
          const response = NextResponse.next();
          response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
          });
          return response;
        }
      } catch (refreshError) {
        // Refresh failed
      }
    }

    // Clear invalid tokens
    const response = pathname.startsWith('/api')
      ? NextResponse.json(
          { error: { message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' } },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/auth/login', request.url));

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
