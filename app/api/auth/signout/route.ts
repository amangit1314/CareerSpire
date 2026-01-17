import { NextResponse } from 'next/server';
import { signOutAction } from '@/app/actions/auth.actions';
import { requireAuth } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    const userId = await requireAuth();
    await signOutAction(userId);
    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 400,
    });
  }
}
