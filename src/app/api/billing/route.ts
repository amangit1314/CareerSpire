import { NextResponse } from 'next/server';
import { getBillingDataAction } from '@/app/actions/billing.actions';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';
import type { BillingData } from '@/app/actions/billing.actions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { requireAuth } = await import('@/lib/auth');
    const userId = await requireAuth();
    const data = await getBillingDataAction(userId);
    return NextResponse.json<ApiResponse<BillingData>>({ data });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json<ApiResponse<never>>(errorResponse, {
      status: errorResponse.error.statusCode || 500,
    });
  }
}
