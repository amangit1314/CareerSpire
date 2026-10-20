/**
 * User-facing toast/alert/error message strings, centralized here rather
 * than inline at each call site — mirrors `routes.ts`. Grouped per feature
 * (one exported const per page/domain) rather than one flat namespace, so
 * a feature's messages stay easy to find and don't collide by name.
 */

/** src/app/auth/login/page.tsx */
export const LOGIN_MESSAGES = {
  SIGN_IN_FAILED_FALLBACK: "An error occurred. Please try again.",
} as const;

/** src/app/auth/signup/page.tsx */
export const SIGNUP_MESSAGES = {
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  PASSWORD_COMPLEXITY:
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  SIGN_UP_FAILED_FALLBACK: "An error occurred. Please try again.",
} as const;

/** src/components/CodeEditor.tsx */
export const CODE_EDITOR_MESSAGES = {
  CODE_FORMATTED: "Code formatted",
  ERRORS_FOUND: (count: number) =>
    `${count} error${count > 1 ? "s" : ""} found`,
  RUNNING: "Running...",
  RUN_CODE: "Run Code",
} as const;

/** Shared across more than one feature (payment flow, password validation). */
export const MESSAGES = {
  PAYMENT_SUCCESS: "Payment successful!",
  PAYMENT_FAILED_FALLBACK: "Payment failed",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  PASSWORDS_MISMATCH: "Passwords do not match",
} as const;

/** src/app/(user)/dashboard/page.tsx */
export const DASHBOARD_MESSAGES = {
  LOAD_ERROR_FALLBACK:
    "We couldn't load your dashboard data. Please refresh the page or try again later.",
} as const;

/** src/app/(user)/dashboard/billing/page.tsx */
export const BILLING_MESSAGES = {
  LOAD_FAILED: "Failed to load billing data",
  LOAD_FAILED_FULL_PAGE: "Failed to load billing data. Please refresh.",
  ORDER_CREATE_FAILED: "Failed to create order",
  CANCELLATION_SUBMITTED:
    "Cancellation request submitted. Plan active until period ends.",
} as const;

/** src/app/(product)/community/experiences/new/page.tsx */
export const SHARE_EXPERIENCE_MESSAGES = {
  SESSION_EXPIRED: "Session expired. Please log in again.",
  SHARE_SUCCESS: "Experience shared successfully!",
  SHARE_FAILED: "Failed to share experience. Please try again.",
} as const;

/** src/app/(product)/mock/new/page.tsx */
export const NEW_MOCK_MESSAGES = {
  START_FAILED_FALLBACK:
    "Failed to start mock interview. The AI service might be busy.",
} as const;

/** src/app/(product)/mock/[id]/page.tsx */
export const MOCK_INTERVIEW_MESSAGES = {
  SUBMIT_FAILED_FALLBACK: "Failed to submit solution",
} as const;

/** src/app/(product)/mock/video/[id]/page.tsx */
export const VIDEO_MOCK_SESSION_MESSAGES = {
  SAVE_FAILED: "Failed to save interview. Please try again.",
} as const;

/** src/app/(product)/mock/video/page.tsx */
export const VIDEO_MOCK_SETUP_MESSAGES = {
  START_FAILED_FALLBACK: "Failed to start interview",
} as const;

/** src/app/(product)/practice/[id]/_components/HintsTab.tsx */
export const HINTS_MESSAGES = {
  SIGN_IN_TO_UNLOCK: "Sign in to unlock more hints",
  NEED_COINS: (coins: number) =>
    `Need ${coins} coins. Solve problems to earn more.`,
  UNLOCK_FAILED_FALLBACK: "Could not unlock hint",
} as const;

/** src/app/(user)/profile/page.tsx */
export const PROFILE_MESSAGES = {
  PROFILE_UPDATED: "Profile updated",
  UPDATE_FAILED_FALLBACK: "Failed to update",
  PASSWORD_MIN_LENGTH: "Min 6 characters",
  PASSWORD_CHANGED: "Password changed",
  CHANGE_FAILED_FALLBACK: "Failed",
  ACCOUNT_DELETED: "Account deleted",
  DELETE_FAILED_FALLBACK: "Failed",
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/InteractivePractice.tsx */
export const INTERACTIVE_PRACTICE_MESSAGES = {
  CONNECTION_ISSUE: "Connection issue — please try again in a moment",
} as const;

/** src/app/auth/forgot-password/page.tsx */
export const FORGOT_PASSWORD_MESSAGES = {
  REQUEST_FAILED_FALLBACK: "Failed to request password reset",
} as const;

/** src/app/auth/reset-password/page.tsx */
export const RESET_PASSWORD_MESSAGES = {
  INVALID_TOKEN: "Invalid or missing reset token.",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  PASSWORD_COMPLEXITY:
    "Password must contain uppercase, lowercase, and a number",
  RESET_SUCCESS: "Password reset successfully",
  RESET_FAILED_FALLBACK: "Failed to reset password",
} as const;

/** src/app/(product)/practice/[id]/_components/ProblemWorkspace.tsx */
export const PROBLEM_WORKSPACE_MESSAGES = {
  WRITE_CODE_FIRST: "Write some code first",
  RUN_FAILED_FALLBACK: "Run failed",
  SUBMIT_FAILED_FALLBACK: "Submit failed",
  BOOKMARK_UPDATE_FAILED: "Could not update bookmark",
  ACCEPTED_FIRST_SOLVE: (xp: number, coins: number) =>
    `Accepted! +${xp} XP · +${coins} coins`,
  ACCEPTED_AGAIN: "Accepted again — nice!",
  VERDICT_SUMMARY: (verdict: string, passed: number, total: number) =>
    `${verdict}: ${passed}/${total} passed`,
} as const;
