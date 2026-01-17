import { NextResponse } from 'next/server';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, User } from '@/types';

export async function GET() {
  try {
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
