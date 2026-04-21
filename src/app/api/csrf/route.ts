import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf — Issue a CSRF token.
 * The token is set as a cookie AND returned in the response body.
 * Client must send it in the x-csrf-token header on state-changing requests.
 */
export async function GET() {
  const token = await generateCsrfToken();
  return NextResponse.json<ApiResponse<{ csrfToken: string }>>({
    data: { csrfToken: token },
  });
}
