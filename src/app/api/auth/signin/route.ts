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