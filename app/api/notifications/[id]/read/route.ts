import { NextRequest, NextResponse } from 'next/server';
import { markNotificationReadAction } from '@/app/actions/notification.actions';
import { requireAuth } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const notification = await markNotificationReadAction(userId, id);

    return NextResponse.json<ApiResponse<typeof notification>>({
      data: notification,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}
