import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { AppError } from './errors';

const CSRF_COOKIE_NAME = '__csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token and set it as a cookie.
 * Uses the double-submit cookie pattern:
 * - Server sets a random token in a non-httpOnly cookie (readable by JS)
 * - Client sends it back in a custom header on state-changing requests
 * - Server validates the header matches the cookie
 *
 * This works because:
 * - Cross-origin requests cannot read cookies from another domain
 * - Cross-origin requests cannot set custom headers without CORS preflight
 */
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

/**
 * Validate the CSRF token from request headers against the cookie.
 * Call this on all state-changing API routes (POST, PUT, DELETE, PATCH).
 */
export async function validateCsrfToken(headerToken: string | null): Promise<void> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken || !headerToken) {
    throw new AppError(
      'Invalid request. Please refresh the page and try again.',
      'CSRF_VALIDATION_FAILED',
      403
    );
  }

  // Timing-safe comparison to prevent timing attacks
  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (cookieBuffer.length !== headerBuffer.length || !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    throw new AppError(
      'Invalid request. Please refresh the page and try again.',
      'CSRF_VALIDATION_FAILED',
      403
    );
  }
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
