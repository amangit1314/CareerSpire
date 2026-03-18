import { NextRequest, NextResponse } from 'next/server';
import {
  getNotificationPreferencesAction,
  updateNotificationPreferencesAction,
} from '@/app/actions/notification.actions';
import { requireAuth } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const userId = await requireAuth();
    const preferences = await getNotificationPreferencesAction(userId);

    return NextResponse.json<ApiResponse<typeof preferences>>({
      data: preferences,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const preferences = await updateNotificationPreferencesAction(userId, body);

    return NextResponse.json<ApiResponse<typeof preferences>>({
      data: preferences,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}
