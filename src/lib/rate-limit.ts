import { prisma } from '@/lib/prisma';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Postgres-backed rate limiting that survives serverless cold starts
 * and works correctly across multiple instances.
 *
 * Uses a simple sliding window approach with Prisma raw queries
 * against a lightweight rate_limit_entries table.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // Clean up expired entries and count current window in one transaction
    const [, countResult] = await prisma.$transaction([
      // Prune expired entries older than 2x window to prevent table bloat
      prisma.rateLimitEntry.deleteMany({
        where: {
          key,
          createdAt: { lt: new Date(now.getTime() - windowMs * 2) },
        },
      }),
      // Count entries within current window
      prisma.rateLimitEntry.count({
        where: {
          key,
          createdAt: { gte: windowStart },
        },
      }),
    ]);

    if (countResult >= maxRequests) {
      // Find the oldest entry in the window to calculate accurate reset time
      const oldestEntry = await prisma.rateLimitEntry.findFirst({
        where: {
          key,
          createdAt: { gte: windowStart },
        },
        orderBy: { createdAt: 'asc' },
      });

      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestEntry
          ? new Date(oldestEntry.createdAt.getTime() + windowMs)
          : resetAt,
      };
    }

    // Record this request
    await prisma.rateLimitEntry.create({
      data: { key, createdAt: now },
    });

    return {
      allowed: true,
      remaining: maxRequests - countResult - 1,
      resetAt,
    };
  } catch (error) {
    // If rate limiting fails (DB issue), allow the request but log it
    // This prevents rate limiting infrastructure from causing outages
    console.error('Rate limit check failed, allowing request:', error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt,
    };
  }
}

export async function getRateLimitHeaders(result: RateLimitResult): Promise<HeadersInit> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
  };
}

// Rate limit configurations
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'auth',
  },
  MOCK_START: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyPrefix: 'mock:start',
  },
  MOCK_SUBMIT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: 'mock:submit',
  },
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: 'api',
  },
  QUESTION_BANK_SEARCH: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 5,
    keyPrefix: 'qbank:search',
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyPrefix: 'pwd:reset',
  },
} as const;
