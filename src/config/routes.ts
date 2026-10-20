/**
 * Page routes referenced from more than one place. Not exhaustive — only
 * routes that were duplicated as string literals across files are listed
 * here; one-off route strings stay inline where they're used.
 */
export const ROUTES = {
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  FORGOT_PASSWORD: "/auth/forgot-password",
  DASHBOARD: "/dashboard",
  PRICING: "/pricing",
  RESOURCES: "/resources",
  PRACTICE: "/practice",
  COMMUNITY: "/community",
  COMMUNITY_NEW_EXPERIENCE: "/community/experiences/new",
  MOCK_NEW: "/mock/new",
  MOCK_VIDEO: "/mock/video",
  REQUEST_FEATURE: "/request-feature",
  NOTIFICATIONS: "/notifications",
} as const;
