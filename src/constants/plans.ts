/**
 * Subscription plan identifiers used by src/lib/pricing.ts's PLANS array.
 * Distinct from the Prisma SubscriptionTier enum (FREE/STARTER/PRO), which
 * is the DB-level tier — PLAN_IDS are the pricing-page-facing slugs used in
 * URLs, purchase calls, and UI state (e.g. `processing === planId`).
 */
export const PLAN_IDS = {
  FREE: 'free',
  PRO: 'pro',
  PLACEMENT: 'placement',
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];
