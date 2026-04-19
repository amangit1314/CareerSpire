import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getQuestionsFromBank, generateAndCacheQuestionBank } from '@/lib/question-bank';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

interface QuestionBankResponse {
  skill: string;
  niche: string;
  topics: string[];
  questions: unknown[];
  fromCache: boolean;
  hitCount: number;
}

const VALID_NICHES = ['programming', 'hr', 'government'] as const;

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Rate limit: 5 skill searches per day on free plan
    const rateLimit = await checkRateLimit(userId, RATE_LIMITS.QUESTION_BANK_SEARCH);
    if (!rateLimit.allowed) {
      const headers = await getRateLimitHeaders(rateLimit);
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: 'Daily question bank search limit reached. Upgrade your plan for unlimited searches.',
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { skill, niche } = body;

    if (!skill || typeof skill !== 'string' || skill.trim().length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { error: { message: 'Skill name is required', code: 'INVALID_INPUT', statusCode: 400 } },
        { status: 400 }
      );
    }

    if (!niche || !VALID_NICHES.includes(niche)) {
      return NextResponse.json<ApiResponse<never>>(
        { error: { message: 'Niche must be one of: programming, hr, government', code: 'INVALID_INPUT', statusCode: 400 } },
        { status: 400 }
      );
    }

    const skillNormalized = skill.trim();
    const headers = await getRateLimitHeaders(rateLimit);

    // 1. Check DB cache (case-insensitive) — uses shared module
    const cached = await getQuestionsFromBank(skillNormalized, 1);
    if (cached) {
      // getQuestionsFromBank already increments hitCount
      return NextResponse.json<ApiResponse<QuestionBankResponse>>(
        {
          data: {
            skill: skillNormalized,
            niche,
            topics: [], // Fetch topics separately if needed
            questions: cached,
            fromCache: true,
            hitCount: cached.length,
          },
        },
        { headers }
      );
    }

    // 2. Not found — generate via AI + cache using shared module
    const { topics, questions } = await generateAndCacheQuestionBank(skillNormalized, niche);

    if (questions.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { error: { message: 'AI could not generate questions for this skill. Try a different name.', code: 'AI_ERROR', statusCode: 502 } },
        { status: 502 }
      );
    }

    return NextResponse.json<ApiResponse<QuestionBankResponse>>(
      {
        data: {
          skill: skillNormalized,
          niche,
          topics,
          questions,
          fromCache: false,
          hitCount: 1,
        },
      },
      { status: 201, headers }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}
