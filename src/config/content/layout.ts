/**
 * Static UI copy for shared layout chrome — Navbar, Footer. Centralized
 * here rather than inline in JSX — mirrors `routes.ts`/`messages.ts`.
 */

/** src/components/Navbar.tsx */
export const NAVBAR_CONTENT = {
  PROFILE: "Profile",
  LOG_OUT: "Log out",
  LOG_IN: "Log in",
  GET_STARTED: "Get Started",
  LOGIN: "Login",
  LOGOUT: "Logout",
  DEFAULT_AVATAR_INITIAL: "U",
  DEFAULT_USER_NAME: "User",
} as const;

/** src/components/NotificationBell.tsx */
export const NOTIFICATION_BELL_CONTENT = {
  TITLE: "Notifications",
  MARKING: "Marking...",
  MARK_ALL_READ: "Mark all read",
  EMPTY: "No notifications",
  VIEW_ALL: "View all notifications",
  UNREAD_OVERFLOW: "9+",
} as const;

/** src/components/gates/LearningPathGate.tsx */
export const LEARNING_PATH_GATE_CONTENT = {
  TITLE: "No learning paths left",
  DESCRIPTION:
    "You've used all your learning paths this month. Get more instantly.",
  BUY_PREFIX: "Buy extra path —",
  UPGRADE_PLAN: "Upgrade your plan",
  MAYBE_LATER: "Maybe later",
} as const;

/** src/components/gates/MockCreditsGate.tsx */
export const MOCK_CREDITS_GATE_CONTENT = {
  TITLE: "You've used all your mocks",
  DESCRIPTION: "Choose an option to keep practicing",
  PAYG_BADGE: "Pay as you go",
  PAYG_SUBTITLE: "Buy a mock pack",
  POPULAR_BADGE: "Most Popular",
  BEST_VALUE_BADGE: "Best Value",
  UPGRADE_TO_PRO: "Upgrade to Pro",
  UPGRADE_TO_PLACEMENT: "Upgrade to Placement",
  MAYBE_LATER: "Maybe later",
} as const;

/** src/components/gates/VoiceCreditsGate.tsx */
export const VOICE_CREDITS_GATE_CONTENT = {
  TITLE: "Get Voice Interview Sessions",
  DESCRIPTION:
    "Voice interviews are purchased separately and are not included in any plan.",
  BUY: "Buy",
  MAYBE_LATER: "Maybe later",
} as const;

/** src/components/StaticPageLayout.tsx */
export const STATIC_PAGE_LAYOUT_CONTENT = {
  HOME: "Home",
  LEGAL: "Legal",
  UPDATED_PREFIX: "Updated",
  QUESTIONS_TITLE: "Questions?",
  QUESTIONS_BODY: "Reach out for any legal or billing inquiries.",
  CONTACT_EMAIL: "gitaman8481@gmail.com",
} as const;

/** src/components/Footer.tsx */
export const FOOTER_CONTENT = {
  TAGLINE:
    "The intersection of artificial intelligence and career success. Join the elite circle of prepared engineers.",
  COPYRIGHT_SUFFIX: "CareerSpire. Crafted for excellence.",
  BY_PREFIX: "By",
  AUTHOR_NAME: "Aman Soni",
  UPCOMING_BADGE: "Soon",
} as const;
