/**
 * Static UI copy for marketing / company / support pages — (platform),
 * (company), (support) route groups. Centralized here rather than inline
 * in JSX — mirrors `routes.ts`/`messages.ts`.
 */

/** src/app/(company)/privacy/page.tsx */
export const PRIVACY_PAGE_CONTENT = {
  TITLE: "Privacy at CareerSpire",
  SUBTITLE:
    "Your trust is our most valuable asset. Here's how we protect your data.",
  READ_FULL_POLICY: "Read the full Privacy Policy",
} as const;

/** src/app/(support)/faqs/page.tsx */
export const FAQS_PAGE_CONTENT = {
  TITLE: "Frequently Asked Questions",
  SUBTITLE: "Common questions about CareerSpire, pricing, and features.",
  STILL_HAVE_QUESTIONS: "Still have questions?",
  SUPPORT_HINT: "Our support team is here to help.",
  CONTACT_SUPPORT: "Contact Support",
} as const;

/** src/app/(company)/press-kit/page.tsx */
export const PRESS_KIT_PAGE_CONTENT = {
  TITLE: "Press Kit",
  SUBTITLE: "Everything you need to write about CareerSpire.",
  ABOUT_TITLE: "About CareerSpire",
  ABOUT_BODY:
    "CareerSpire is an AI-powered interview preparation platform built for college students and early-career software engineers in India. It combines AI mock interviews (text and video), a DSA practice hub with an in-browser code editor, an adaptive AI tutor, curated learning tracks, and a peer community — all starting at ₹0.",
  QUICK_FACTS_TITLE: "Quick Facts",
  BRAND_TITLE: "Brand",
  BRAND_DESCRIPTION_PREFIX: "CS monogram mark + wordmark. Primary colour:",
  KEY_FEATURES_TITLE: "Key Features",
} as const;

/** src/app/(support)/request-feature/page.tsx */
export const REQUEST_FEATURE_PAGE_CONTENT = {
  TITLE: "Request a Feature",
  SUBTITLE:
    "Have an idea that would make interview prep better? We're listening.",
  FEATURE_TITLE_LABEL: "Feature Title",
  FEATURE_TITLE_PLACEHOLDER:
    "e.g. Support for C++ in Practice Hub, Company-specific mock paths",
  AREA_LABEL: "Which area does this relate to?",
  PROBLEM_LABEL: "What problem does this solve?",
  PROBLEM_PLACEHOLDER:
    "Describe the problem or pain point you're experiencing...",
  SOLUTION_LABEL: "How should it work?",
  SOLUTION_PLACEHOLDER: "Describe your ideal solution...",
  SUBMIT: "Submit Feature Request",
  ROADMAP_PROMPT_PREFIX: "Check our",
  ROADMAP_LINK: "roadmap",
  ROADMAP_PROMPT_SUFFIX: "to see what's already planned.",
} as const;

/** src/app/(support)/report-issue/page.tsx */
export const REPORT_ISSUE_PAGE_CONTENT = {
  TITLE: "Report an Issue",
  SUBTITLE:
    "Found a bug in the code editor, mock interviews, or anywhere else? Let us know.",
  NAME_LABEL: "Name",
  NAME_PLACEHOLDER: "Your name",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "Your email",
  AREA_LABEL: "Area",
  DESCRIPTION_LABEL: "Description",
  DESCRIPTION_PLACEHOLDER:
    "What happened? What did you expect? Include the browser you're using and any error messages you saw.",
  SUBMIT: "Submit Report",
  EMAIL_PROMPT: "You can also email us directly at",
} as const;

/** src/app/(company)/funding/page.tsx */
export const FUNDING_PAGE_CONTENT = {
  TITLE: "Funding & Investment",
  SUBTITLE:
    "Our journey to make quality interview preparation accessible to every engineering student in India.",
  MISSION_TITLE: "Our Mission",
  MISSION_BODY_1:
    "Most students walk into placement season underprepared — not because they lack talent, but because structured, affordable practice doesn't exist. CareerSpire changes that with AI-powered mocks starting at ₹0, a full DSA practice hub, and an AI tutor available 24/7.",
  MISSION_BODY_2:
    "We're open to strategic partnerships and investment that align with our mission of accessible, high-quality interview prep.",
  GET_IN_TOUCH: "Get in Touch",
} as const;

/** src/app/(company)/cookies/page.tsx */
export const COOKIES_PAGE_CONTENT = {
  TITLE: "Cookies & Tracking",
  SUBTITLE:
    "We use cookies to keep you logged in, not to track you around the web.",
  AUTH_TITLE: "Authentication (Essential)",
  AUTH_DESCRIPTION_PREFIX: "Two HTTP-only cookies (",
  AUTH_DESCRIPTION_MID: " and ",
  AUTH_DESCRIPTION_SUFFIX:
    ") keep you signed in securely. These cannot be read by JavaScript.",
  THEME_TITLE: "Theme Preference",
  THEME_DESCRIPTION:
    "Remembers your light/dark mode choice via localStorage. First-party only.",
  NO_TRACKING_TITLE: "No Tracking Cookies",
  NO_TRACKING_DESCRIPTION:
    "No Google Analytics, no Facebook Pixel, no advertising scripts. Zero cross-site tracking.",
  READ_FULL_POLICY: "Read the full Cookie Policy",
} as const;

/** src/app/(company)/roadmap/page.tsx */
export const ROADMAP_PAGE_CONTENT = {
  TITLE: "Roadmap",
  SUBTITLE: "What we've shipped, what we're building, and what's coming next.",
  FEATURE_IDEA_PROMPT: "Have a feature idea?",
  REQUEST_FEATURE: "Request a Feature",
} as const;

/** src/app/(platform)/features/page.tsx */
export const FEATURES_PAGE_CONTENT = {
  BADGE: "Platform Features",
  TITLE_LINE_1: "Engineered for",
  TITLE_LINE_2: "Interview Success",
  SUBTITLE:
    "A complete ecosystem designed to transform how you prepare for technical interviews. From AI-led teaching to community-driven insights.",
  CTA_TITLE: "Ready to experience the future?",
  CTA_SUBTITLE:
    "Join thousands of candidates who are already using our AI to land their dream roles.",
  CTA_PRIMARY: "Start Practice Now",
  CTA_SECONDARY: "Join Community",
} as const;

/** src/app/(company)/changelog/page.tsx */
export const CHANGELOG_PAGE_CONTENT = {
  TITLE: "Changelog",
  SUBTITLE: "What's new and improved in CareerSpire.",
} as const;

/** src/app/(company)/about/page.tsx */
export const ABOUT_PAGE_CONTENT = {
  HERO_TITLE_LINE_1: "Interview prep that",
  HERO_TITLE_LINE_2: "actually works.",
  HERO_SUBTITLE:
    "CareerSpire is an AI-powered platform built for college students and early-career engineers preparing for internships, campus placements, and their first tech roles.",
  HERO_PROBLEM_PREFIX:
    "Most students walk into placement season underprepared — not because they lack talent, but because they lack",
  HERO_PROBLEM_HIGHLIGHT: "structured, affordable practice.",
  HERO_PROBLEM_SUFFIX: "We built CareerSpire to change that.",
  OFFER_BADGE: "What we offer",
  OFFER_TITLE: "Everything you need, one platform.",
  OFFER_BODY:
    "Offline coaching costs lakhs. YouTube is scattered. LeetCode is lonely. CareerSpire brings it all together — AI mock interviews, a full DSA practice hub, curated learning tracks, an AI tutor, and a community — at a price that makes sense for students.",
  VALUES_TITLE: "What we believe in",
  VALUES_SUBTITLE: "The principles behind every feature.",
  HOW_IT_WORKS_TITLE: "How CareerSpire works",
  HOW_IT_WORKS_SUBTITLE: "A complete prep cycle in one platform.",
  GAMIFICATION_TITLE: "Built to keep you coming back",
  GAMIFICATION_BODY:
    "Interview prep is a marathon, not a sprint. CareerSpire uses streaks, coins, XP, daily challenges, and a leaderboard to turn consistent practice into a habit.",
  CTA_TITLE: "Start preparing today",
  CTA_BODY:
    "Free to start. No credit card. Unlimited practice problems, learning tracks, and community access from day one.",
  CTA_PRIMARY: "Get Started Free",
  CTA_SECONDARY: "See Pricing",
} as const;

/** src/app/(platform)/pricing/page.tsx + _components/PlanCard.tsx */
export const PRICING_PAGE_CONTENT = {
  BADGE: "Student-friendly pricing",
  TITLE_PREFIX: "Plans that fit your",
  TITLE_HIGHLIGHT: "prep budget",
  SUBTITLE:
    "Start free with unlimited practice. Upgrade when you need AI mocks for placement season.",
  BILLING_MONTHLY: "Monthly",
  BILLING_YEARLY: "Yearly",
  BILLING_YEARLY_SAVE: "Save 20%",
  FREE_FEATURES_TITLE: "Free on every plan",
  MOCK_PACKS_TITLE: "Mock Interview Packs",
  MOCK_PACKS_SUBTITLE: "Pay as you go",
  MOCK_PACKS_BUY: "Buy Mocks",
  VOICE_PACKS_TITLE: "Video Interview Packs",
  VOICE_PACKS_SUBTITLE: "Top-up anytime",
  VOICE_PACKS_BUY: "Buy",
  FAQ_TITLE: "Frequently Asked Questions",
  CURRENT_PLAN: "Current Plan",
  LIMIT_AI_MOCKS: "AI Mocks",
  LIMIT_VIDEO_MOCKS: "Video Mocks",
  LIMIT_AI_TUTOR: "AI Tutor",
  LIMIT_UNLIMITED: "Unlimited",
  PRICE_FOREVER: "/forever",
  PRICE_MONTHLY: "/month",
  BILLED_YEARLY_PREFIX: "Billed",
  BILLED_YEARLY_SAVE: "Save",
} as const;

/** src/app/(support)/feedback/page.tsx */
export const FEEDBACK_PAGE_CONTENT = {
  TITLE: "Give Feedback",
  SUBTITLE: "Your feedback directly shapes what we build next.",
  RATING_LABEL: "How would you rate CareerSpire?",
  MESSAGE_LABEL: "What's on your mind?",
  MESSAGE_PLACEHOLDER:
    "What do you like? What could be better? Which feature do you use the most — mocks, practice hub, AI tutor, or community?",
  SUBMIT: "Send Feedback",
  REQUEST_FEATURE_PROMPT: "Want to suggest a specific feature instead?",
  REQUEST_FEATURE_LINK: "Request a feature",
} as const;
