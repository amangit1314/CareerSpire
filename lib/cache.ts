// Cache utilities for server-side caching

export const CACHE_TAGS = {
  USER: 'user',
  DASHBOARD: 'dashboard',
  MOCK_SESSION: 'mock-session',
  NOTIFICATIONS: 'notifications',
  QUESTIONS: 'questions',
} as const;

export const CACHE_REVALIDATE = {
  USER: 60 * 5, // 5 minutes
  DASHBOARD: 30, // 30 seconds
  MOCK_SESSION: 60, // 1 minute
  NOTIFICATIONS: 30, // 30 seconds
  QUESTIONS: 60 * 60, // 1 hour
} as const;

export function getCacheHeaders(tag: string, revalidate: number) {
  return {
    'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
    'CDN-Cache-Control': `public, s-maxage=${revalidate}`,
    'Vercel-CDN-Cache-Control': `public, s-maxage=${revalidate}`,
  };
}
