import { NextResponse } from 'next/server';
import { markAllNotificationsReadAction } from '@/app/actions/notification.actions';
import { requireAuth } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    const userId = await requireAuth();
    await markAllNotificationsReadAction(userId);

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}
