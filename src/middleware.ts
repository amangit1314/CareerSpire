import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-edge';

const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/pricing', '/funding', '/feedback', '/press-kit', '/privacy', '/privacy-policy', '/terms-of-service', '/refund-billing', '/report-issue', '/request-feature', '/roadmap', '/license', '/resources', '/about', '/changelog', '/cookies', '/cancellation-policy', '/cookie-policy', '/faqs', '/terms', '/practice', '/community', '/mock/video'];
const publicExactRoutes = ['/'];
const apiPublicRoutes = ['/api/auth/signup', '/api/auth/signin'];

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
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
    pathname.startsWith('/api/csrf')
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
    return NextResponse.redirect(new URL('/auth/login', request.url));
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


// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_LIVE_APP_URL || 'https://careerspire.vercel.app')
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
} as const;

// Helper to add CORS headers to a response
function addCorsHeaders(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// // Helper to create a CORS-enabled response
// function corsResponse(status: number = 200, body?: any) {
//   const response = body
//     ? NextResponse.json(body, { status })
//     : new NextResponse(null, { status });

//   return addCorsHeaders(response);
// }

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const isApiRoute = pathname.startsWith('/api');

//   // ==================== HANDLE PREFLIGHT REQUESTS (OPTIONS) ====================
//   if (request.method === 'OPTIONS') {
//     return corsResponse(200);
//   }

//   // ==================== SKIP MIDDLEWARE FOR CERTAIN ROUTES ====================
//   if (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/api/auth/signup') ||
//     pathname.startsWith('/api/auth/signin') ||
//     pathname.startsWith('/api/auth/refresh')
//   ) {
//     const response = NextResponse.next();
//     // Only add CORS headers for API routes
//     if (isApiRoute) {
//       return addCorsHeaders(response);
//     }
//     return response;
//   }

//   // ==================== CHECK IF ROUTE IS PUBLIC ====================
//   const isPublicRoute = publicRoutes.some((route) =>
//     pathname === route || pathname.startsWith(route)
//   );

//   if (isPublicRoute) {
//     const response = NextResponse.next();
//     // Only add CORS headers for API routes
//     if (isApiRoute) {
//       return addCorsHeaders(response);
//     }
//     return response;
//   }

//   // ==================== CHECK AUTHENTICATION FOR PROTECTED ROUTES ====================
//   const accessToken = request.cookies.get('access_token')?.value;

//   if (!accessToken) {
//     if (isApiRoute) {
//       return corsResponse(401, {
//         error: {
//           message: 'Unauthorized. Please log in to continue.',
//           code: 'UNAUTHORIZED'
//         }
//       });
//     }
//     const redirectResponse = NextResponse.redirect(new URL('/auth/login', request.url));
//     return addCorsHeaders(redirectResponse);
//   }

//   try {
//     await verifyAccessToken(accessToken);
//     const response = NextResponse.next();
//     // Only add CORS headers for API routes
//     if (isApiRoute) {
//       return addCorsHeaders(response);
//     }
//     return response;
//   } catch (error) {
//     // Token expired or invalid - try refresh
//     const refreshToken = request.cookies.get('refresh_token')?.value;

//     if (refreshToken && isApiRoute) {
//       // Try to refresh token for API routes
//       try {
//         const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
//           method: 'POST',
//           headers: {
//             Cookie: `refresh_token=${refreshToken}`,
//           },
//         });

//         if (refreshResponse.ok) {
//           const { accessToken: newAccessToken } = await refreshResponse.json();
//           const response = NextResponse.next();

//           // Set new access token
//           response.cookies.set('access_token', newAccessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 15 * 60,
//             path: '/',
//           });

//           // Only add CORS headers for API routes
//           if (isApiRoute) {
//             return addCorsHeaders(response);
//           }
//           return response;
//         }
//       } catch (refreshError) {
//         // Refresh failed - continue to error handling
//       }
//     }

//     // Clear invalid tokens
//     const response = isApiRoute
//       ? NextResponse.json({
//         error: {
//           message: 'Session expired. Please log in again.',
//           code: 'TOKEN_EXPIRED'
//         }
//       }, { status: 401 })
//       : NextResponse.redirect(new URL('/auth/login', request.url));

//     // Clear cookies
//     response.cookies.delete('access_token');
//     response.cookies.delete('refresh_token');

//     // Only add CORS headers for API routes
//     if (isApiRoute) {
//       return addCorsHeaders(response);
//     }
//     return response;
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!_next/static|_next/image|favicon.ico).*)',
//   ],
// };