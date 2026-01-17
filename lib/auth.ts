import { cookies } from 'next/headers';
import { verify, sign } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AppError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const decoded = verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new AppError('Token expired or invalid', 'INVALID_TOKEN', 401);
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const decoded = verify(token, JWT_REFRESH_SECRET) as TokenPayload;

    // Check if token is revoked
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Verify refresh token hash matches
    const isValid = await compare(token, session.refreshTokenHash);
    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    return decoded;
  } catch (error) {
    throw new AppError('Refresh token expired or invalid', 'INVALID_REFRESH_TOKEN', 401);
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = await verifyAccessToken(accessToken);
    return payload.userId;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new AppError('Unauthorized. Please log in to continue.', 'UNAUTHORIZED', 401);
  }
  return userId;
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  userId: string
): Promise<void> {
  const cookieStore = await cookies();

  // Store refresh token hash in database
  console.log('setAuthCookies: hashing refresh token...');
  const refreshTokenHash = await hash(refreshToken, 12);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  console.log('setAuthCookies: creating session in DB...');
  await prisma.session.create({
    data: {
      userId,
      sessionToken: `session-${Date.now()}`,
      refreshTokenHash,
      expires: expiresAt,
    },
  });
  console.log('setAuthCookies: session created.');

  // Set HTTP-only cookies
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}


