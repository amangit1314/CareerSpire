import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshTokenAction } from '@/app/actions/auth.actions';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            message: 'Your session has expired. Please log in again.',
            code: 'NO_REFRESH_TOKEN',
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    const { accessToken } = await refreshTokenAction(refreshToken);

    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    return NextResponse.json<ApiResponse<{ accessToken: string }>>({
      data: { accessToken },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 401
    });
  }
}
