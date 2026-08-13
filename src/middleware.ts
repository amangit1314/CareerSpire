import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-edge';
import { ROUTES } from '@/config/routes';

const publicRoutes = [ROUTES.LOGIN, ROUTES.SIGNUP, '/auth/forgot-password', '/auth/reset-password', '/pricing', '/funding', '/feedback', '/press-kit', '/privacy', '/privacy-policy', '/terms-of-service', '/refund-billing', '/report-issue', '/request-feature', '/roadmap', '/license', '/resources', '/about', '/changelog', '/cookies', '/cancellation-policy', '/cookie-policy', '/faqs', '/terms', '/practice', '/community', '/mock/video'];
const publicExactRoutes = ['/'];

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js dev/hydration requires these; tighten post-launch with nonces
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io",
      "frame-ancestors 'none'",
    ].join('; ')
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/signin') ||
    pathname.startsWith('/api/auth/refresh') ||
    pathname.startsWith('/api/csrf') ||
    pathname.startsWith('/api/health')
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check if route is public
  const isPublicRoute =
    publicExactRoutes.includes(pathname) ||
    publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (isPublicRoute) {
    return addSecurityHeaders(NextResponse.next());
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
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  try {
    await verifyAccessToken(accessToken);
    return addSecurityHeaders(NextResponse.next());
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
          const response = addSecurityHeaders(NextResponse.next());
          response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 6 * 60 * 60, // 6 hours
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
      : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));

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