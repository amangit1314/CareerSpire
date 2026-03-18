import { NextResponse } from 'next/server';
import { getDashboardStatsAction } from '@/app/actions/dashboard.actions';
import { requireAuth } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse, DashboardStats } from '@/types';

export async function GET() {
  try {
    const userId = await requireAuth();
    const stats = await getDashboardStatsAction(userId);

    return NextResponse.json<ApiResponse<DashboardStats>>({
      data: stats,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}
