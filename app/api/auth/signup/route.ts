import { NextRequest, NextResponse } from 'next/server';
import { signUpAction } from '@/app/actions/auth.actions';
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
            message: `Too many signup attempts. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000 / 60)} minutes before trying again.`,
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    console.log('POST /api/auth/signup body:', { email: body.email });
    const response = await signUpAction(body);
    console.log('POST /api/auth/signup action response data:', JSON.stringify(response, null, 2));

    const headers = await getRateLimitHeaders(rateLimit);
    const apiResponse: ApiResponse<AuthResponse> = { data: response };
    console.log('POST /api/auth/signup sending ApiResponse:', JSON.stringify(apiResponse, null, 2));

    return NextResponse.json<ApiResponse<AuthResponse>>(
      apiResponse,
      { headers, status: 201 }
    );
  } catch (error) {
    console.error('POST /api/auth/signup error:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}
