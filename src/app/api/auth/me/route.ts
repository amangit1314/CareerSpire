import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, User } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getCurrentUserAction } = await import('@/app/actions/auth.actions');
    const user = await getCurrentUserAction();
    return NextResponse.json<ApiResponse<User>>({
      data: user,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 401,
    });
  }
}
