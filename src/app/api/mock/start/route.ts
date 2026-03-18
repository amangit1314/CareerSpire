import { NextRequest, NextResponse } from 'next/server';
import { startMockAction } from '@/app/actions/mock.actions';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, StartMockResponse } from '@/types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Rate limiting
    const rateLimit = await checkRateLimit(userId, RATE_LIMITS.MOCK_START);
    if (!rateLimit.allowed) {
      const headers = await getRateLimitHeaders(rateLimit);
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: `You've started too many mock interviews. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000 / 60)} minutes before starting another one.`,
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const session = await startMockAction(userId, body);

    const headers = await getRateLimitHeaders(rateLimit);

    return NextResponse.json<ApiResponse<StartMockResponse>>(
      {
        data: { session },
      },
      { headers, status: 201 }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    console.log(`Error response: ${JSON.stringify(errorResponse)}`);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}
