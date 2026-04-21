import { NextRequest, NextResponse } from 'next/server';
import { signUpAction } from '@/app/actions/auth.actions';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { validateCsrfToken, CSRF_HEADER_NAME } from '@/lib/csrf';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // CSRF validation
    await validateCsrfToken(request.headers.get(CSRF_HEADER_NAME));

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = await checkRateLimit(ip, RATE_LIMITS.AUTH);

    if (!rateLimit.allowed) {
      const headers = await getRateLimitHeaders(rateLimit);
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: `Too many signup attempts. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000 / 60)} minutes before trying again.`,
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const response = await signUpAction(body);

    const headers = await getRateLimitHeaders(rateLimit);

    return NextResponse.json<ApiResponse<AuthResponse>>(
      { data: response },
      { headers, status: 201 }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}
