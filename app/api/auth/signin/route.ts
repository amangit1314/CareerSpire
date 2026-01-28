import { NextRequest, NextResponse } from 'next/server';
import { signInAction } from '@/app/actions/auth.actions';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(ip, RATE_LIMITS.AUTH);

    if (!rateLimit.allowed) {
      const headers = await getRateLimitHeaders(rateLimit);
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: `Too many login attempts. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000 / 60)} minutes before trying again.`,
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const response = await signInAction(body);

    const headers = await getRateLimitHeaders(rateLimit);

    return NextResponse.json<ApiResponse<AuthResponse>>(
      { data: response },
      { headers }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}

// // app/api/auth/signin/route.ts
// import { NextRequest } from 'next/server';
// import { signInAction } from '@/app/actions/auth.actions';
// import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
// import { createErrorResponse } from '@/lib/errors';
// import { corsJsonResponse, corsHeaders, handleCorsPreflight } from '@/lib/cors';
// import type { ApiResponse, AuthResponse } from '@/types';

// export async function POST(request: NextRequest) {
//   try {
//     // Check for preflight request
//     const preflightResponse = handleCorsPreflight(request);
//     if (preflightResponse) return preflightResponse;

//     const ip = request.headers.get('x-forwarded-for') || 'unknown';
//     const rateLimit = await checkRateLimit(ip, RATE_LIMITS.AUTH);

//     if (!rateLimit.allowed) {
//       const headers = await getRateLimitHeaders(rateLimit);
//       // ApiResponse<never>
//       return corsJsonResponse(
//         {
//           error: {
//             message: `Too many login attempts. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000 / 60)} minutes before trying again.`,
//             code: 'RATE_LIMIT_EXCEEDED',
//             statusCode: 429,
//           },
//         },
//         429
//       );
//     }

//     const body = await request.json();
//     const response = await signInAction(body);

//     const headers = await getRateLimitHeaders(rateLimit);

//     // Create CORS response
//     // <ApiResponse<AuthResponse>>
//     const corsResponse = corsJsonResponse(
//       { data: response },
//       200
//     );

//     // Add rate limit headers
//     Object.entries(headers).forEach(([key, value]) => {
//       corsResponse.headers.set(key, value);
//     });

//     return corsResponse;
//   } catch (error) {
//     console.error('SignIn error:', error); // Add logging
//     const errorResponse = createErrorResponse(error);
//     // <ApiResponse<never>>
//     return corsJsonResponse(errorResponse, errorResponse.error.statusCode || 400);
//   }
// }

// // Add OPTIONS handler for CORS preflight
// export async function OPTIONS(request: NextRequest) {
//   return handleCorsPreflight(request);
// }