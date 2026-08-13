/**
 * Page routes referenced from more than one place. Not exhaustive — only
 * routes that were duplicated as string literals across files are listed
 * here; one-off route strings stay inline where they're used.
 */
export const ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
} as const;
