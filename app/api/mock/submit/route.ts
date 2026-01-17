import { NextRequest, NextResponse } from 'next/server';
import { submitSolutionAction } from '@/app/actions/mock.actions';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, SubmitSolutionResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Rate limiting
    const rateLimit = await checkRateLimit(userId, RATE_LIMITS.MOCK_SUBMIT);
    if (!rateLimit.allowed) {
      const headers = await getRateLimitHeaders(rateLimit);
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: `Too many submission attempts. Please wait a moment before trying again.`,
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const result = await submitSolutionAction(userId, body);

    const headers = await getRateLimitHeaders(rateLimit);

    return NextResponse.json<ApiResponse<SubmitSolutionResponse>>(
      {
        data: { result },
      },
      { headers, status: 201 }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}
