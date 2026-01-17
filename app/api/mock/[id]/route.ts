import { NextRequest, NextResponse } from 'next/server';
import { getMockSessionAction } from '@/app/actions/mock.actions';
import { requireAuth } from '@/lib/auth';
import type { ApiResponse, MockSession } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const session = await getMockSessionAction(userId, id);

    return NextResponse.json<ApiResponse<MockSession>>({
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<never>>(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 401 : 404 }
    );
  }
}
