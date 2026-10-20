/**
 * Static UI copy for the dashboard/profile/billing area. Centralized here
 * rather than inline in JSX — mirrors `routes.ts`/`messages.ts`.
 */

/** src/app/(user)/profile/page.tsx */
export const PROFILE_CONTENT = {
  SAVE: "Save",
  CANCEL: "Cancel",
  DEFAULT_DISPLAY_NAME: "Member",
  LEVEL_BADGE: (level: number, title: string) => `Lv.${level} ${title}`,
  STREAK_BADGE: (days: number) => `${days}d streak`,
  TIER_PRO: "Pro",
  TIER_FREE: "Free",
  XP_SUFFIX: "XP",
  XP_TO_NEXT_LEVEL: (xpNeeded: number, nextTitle: string) =>
    `${xpNeeded} XP to ${nextTitle}`,
  ACHIEVEMENTS_TITLE: "Achievements",
  ACCOUNT_TITLE: "Account",
  EMAIL_LABEL: "Email",
  CHANGE_PASSWORD: "Change Password",
  PLAN_TITLE: "Plan",
  PLAN_SUFFIX: "Plan",
  PRO_PLAN_DESCRIPTION: "Unlimited AI interviews & exclusive paths",
  FREE_MOCKS_REMAINING: (n: number) =>
    `${n} free mock${n === 1 ? "" : "s"} remaining`,
  UPGRADE: "Upgrade",
  DANGER_ZONE_TITLE: "Delete Account",
  DANGER_ZONE_DESCRIPTION:
    "Permanently remove your account and all data. This cannot be undone.",
  DELETE_ACCOUNT: "Delete Account",
  CHANGE_PASSWORD_MODAL_TITLE: "Change Password",
  CURRENT_PASSWORD_LABEL: "Current Password",
  NEW_PASSWORD_LABEL: "New Password",
  CONFIRM_NEW_PASSWORD_LABEL: "Confirm New Password",
  UPDATE_PASSWORD: "Update Password",
  UPDATING_PASSWORD: "Updating...",
  DELETE_CONFIRM_TITLE: "Delete Account?",
  DELETE_CONFIRM_PERMANENT: "permanent",
  DELETE_CONFIRM_BODY_SUFFIX: ". All progress and data will be lost.",
  DELETE_CONFIRM_ACTION: "Yes, Delete My Account",
  DELETING: "Deleting...",
  STAT_PROBLEMS_SOLVED: "Problems Solved",
  STAT_CURRENT_STREAK: "Current Streak",
  STAT_COINS: "Coins",
  STAT_TOTAL_XP: "Total XP",
  STAT_RANK: "Rank",
} as const;

/** src/app/(user)/dashboard/billing/page.tsx */
export const BILLING_CONTENT = {
  TITLE: "Billing & Subscription",
  SUBTITLE: "Manage your plan, credits, and payment history",
  PLAN_SUFFIX: "Plan",
  STATUS_ACTIVE: "Active",
  STATUS_EXPIRED: "Expired",
  RENEWS_PREFIX: "Renews",
  USAGE_LABEL: "Mocks used this period",
  MOCKS_REMAINING: (n: number) => `${n} mock${n !== 1 ? "s" : ""} remaining`,
  UPGRADE_PLAN: "Upgrade Plan",
  CANCEL_PLAN: "Cancel Plan",
  CANCEL_CONFIRM_TITLE: (planName: string) => `Cancel your ${planName} plan?`,
  CANCEL_CONFIRM_BODY:
    "Your plan will remain active until the end of the current billing period. You'll lose access to premium features after that.",
  CANCEL_CONFIRM_ACTION: "Confirm Cancel",
  CANCEL_KEEP_ACTION: "Keep Plan",
  MOCK_PACKS_TITLE: "Buy Mock Packs",
  MOCK_PACKS_SUBTITLE: "Top up your mocks — no subscription needed",
  MOCK_PACK_SUFFIX: "Pack",
  VOICE_PACKS_TITLE: "Voice Interview Sessions",
  VOICE_PACKS_SUBTITLE: "Purchased separately — not included in any plan",
  VOICE_PACK_SUFFIX: "Voice Pack",
  BUY: "Buy",
  PAYMENT_HISTORY_TITLE: "Payment History",
  PAYMENT_HISTORY_SUBTITLE: "Your recent transactions",
  NO_PAYMENTS: "No payments yet",
  TABLE_DATE: "Date",
  TABLE_DESCRIPTION: "Description",
  TABLE_AMOUNT: "Amount",
  TABLE_STATUS: "Status",
  MOCK_PACK_ROW_LABEL: "Mock Pack",
  PAYMENT_STATUS_COMPLETED: "Completed",
  PAYMENT_STATUS_PENDING: "Pending",
  PAYMENT_STATUS_FAILED: "Failed",
} as const;

/** src/app/(user)/dashboard/page.tsx */
export const DASHBOARD_CONTENT = {
  TITLE: "Dashboard",
  SUBTITLE: "Track your progress and improve your interview skills",
  LOAD_ERROR_TITLE: "Failed to load dashboard",
  FREE_MOCKS_REMAINING: (n: number) =>
    `${n} Free Mock${n > 1 ? "s" : ""} Remaining`,
  FREE_MOCKS_HINT: "Start practicing now to improve your skills",
  START_MOCK: "Start Mock Interview",
  STAT_TOTAL_MOCKS: "Total Mocks",
  STAT_AVERAGE_SCORE: "Average Score",
  STAT_COMPLETED: "Completed",
  STAT_FREE_MOCKS_LEFT: "Free Mocks Left",
  TREND_TITLE: "Performance Trend",
  TREND_SUBTITLE: "Your practice scores over time",
  FOCUS_AREAS_TITLE: "Focus Areas",
  FOCUS_AREAS_SUBTITLE: "These topics need more practice",
  RECENT_MOCKS_TITLE: "Recent Mock Interviews",
  RECENT_MOCKS_SUBTITLE: "Your latest practice sessions",
  EMPTY_RECENT_MOCKS_TITLE: "No mock interviews yet",
  EMPTY_RECENT_MOCKS_HINT: "Start your first session to see results here.",
} as const;

/** src/app/(user)/dashboard/_components/ScoreTrendChart.tsx */
export const SCORE_TREND_CHART_CONTENT = {
  TOOLTIP_LABEL: "Practice Score",
  AVG_LABEL: (avg: number) => `Avg: ${avg}%`,
  HIGHEST: "Highest",
  AVERAGE: "Average",
  IMPROVEMENT: "Improvement",
} as const;

/** src/app/(user)/dashboard/_components/RecentMockRow.tsx */
export const RECENT_MOCK_ROW_CONTENT = {
  SCORE_EXCELLENT: "Excellent",
  SCORE_GOOD: "Good",
  SCORE_NEEDS_WORK: "Needs work",
  LABEL: "Mock Interview",
  VIEW_DETAILS: "View Details",
  VIEW_DETAILS_ARIA: (score: number) =>
    `View details for mock with score ${score}%`,
} as const;
