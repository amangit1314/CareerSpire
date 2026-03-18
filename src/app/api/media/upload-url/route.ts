import { NextRequest, NextResponse } from 'next/server';
import { createMediaUploadUrlAction } from '@/app/actions/media.actions';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(ip, RATE_LIMITS.API_GENERAL);

    if (!rateLimit.allowed) {
      const headers = await getRateLimitHeaders(rateLimit);
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: `Too many upload requests. Please wait a moment before trying again.`,
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const result = await createMediaUploadUrlAction(body);

    const headers = await getRateLimitHeaders(rateLimit);

    return NextResponse.json<ApiResponse<typeof result>>(
      {
        data: result,
      },
      { headers }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}
