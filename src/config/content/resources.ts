/**
 * Static UI copy for the Resources hub (question bank + AI tutor).
 * Centralized here rather than inline in JSX — mirrors
 * `routes.ts`/`messages.ts`.
 */

/** src/app/(product)/resources/_components/UserRoadmaps.tsx */
export const USER_ROADMAPS_CONTENT = {
  NOT_STARTED: "Not started",
  TIME_JUST_NOW: "Just now",
  TIME_MINUTES_AGO: (m: number) => `${m}m ago`,
  TIME_HOURS_AGO: (h: number) => `${h}h ago`,
  TIME_DAYS_AGO: (d: number) => `${d}d ago`,
  TIME_WEEKS_AGO: (w: number) => `${w}w ago`,
  TIME_MONTHS_AGO: (mo: number) => `${mo}mo ago`,
  EYEBROW: "Continue where you left off",
  TITLE: "Your Roadmaps",
  TRACK_COUNT: (n: number) => `${n} custom ${n === 1 ? "track" : "tracks"}`,
  PINNED_BADGE: "Pinned",
  OPTIONS_ARIA: "Roadmap options",
  UNPIN: "Unpin",
  PIN_TO_TOP: "Pin to top",
  ARCHIVE: "Archive",
  AI_BADGE: "AI",
  PROGRESS_LABEL: "Progress",
  PERCENT_DONE: (pct: number) => `${pct}% done`,
  CONTINUE: "Continue",
} as const;

/** src/app/(product)/resources/_components/ResourceHero.tsx */
export const RESOURCE_HERO_CONTENT = {
  EYEBROW: "AI-Powered Learning",
  TITLE_LINE_1: "Master Any Skill with",
  TITLE_LINE_2: "Curated & AI-Generated Paths",
  DESCRIPTION:
    "Explore hand-picked interview prep tracks, or type any skill and let our AI build a personalized practice roadmap instantly.",
  STAT_TRACKS: "Curated tracks",
  STAT_QUESTIONS: "Practice questions",
  STAT_ROADMAPS: "AI roadmaps created",
  SEARCH_ARIA: "Search for any skill",
  GENERATE: "Generate",
  TRY_LABEL: "Try",
} as const;

/** src/app/(product)/resources/[category]/[topic]/page.tsx */
export const TOPIC_DETAILS_CONTENT = {
  BACK_TO_CATEGORY: (category: string) => `Back to ${category}`,
  DESCRIPTION: "Deep dive into essential concepts and interview patterns.",
  STUDY_GUIDE_TAB: "Study Guide",
  PRACTICE_QUESTIONS_TAB: "Practice Questions",
  KEY_TAKEAWAYS: "Key Takeaways",
  START_PRACTICING: "Start Practicing This Topic",
  NO_QUESTIONS:
    "No questions generated yet. Try refreshing to generate new ones!",
} as const;

/** src/app/(product)/resources/page.tsx */
export const RESOURCES_PAGE_CONTENT = {
  EYEBROW: "Curated tracks",
  TITLE: "Popular Tracks",
  DESCRIPTION: "Hand-picked, high-signal interview prep paths",
  PROGRESS_LABEL: "Progress",
  CURATED_COLLECTION: "Curated Collection",
  AI_GENERATED: "AI Generated",
  PRACTICE: "Practice",
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/ProblemPanel.tsx */
export const PROBLEM_PANEL_CONTENT = {
  TITLE: "Problem Statement",
  HINTS_TITLE: "Hints",
  HINTS_USED: (used: number, total: number) => `${used}/${total} used`,
  TRY_YOURSELF_HINT:
    "Try solving on your own first — hints reveal one at a time.",
  REVEAL_HINT_ARIA: (n: number) => `Reveal hint ${n}`,
  HINT_LABEL: (n: number) => `Hint ${n}`,
  REVEAL_PREVIOUS_FIRST: (n: number) => `Reveal Hint ${n} first`,
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/page.tsx */
export const QUESTION_PRACTICE_CONTENT = {
  BREADCRUMB_ARIA: "Breadcrumb",
  RESOURCES_LINK: "Resources",
  BACK_TO_TOPIC: (topic: string) => `Back to ${topic}`,
} as const;

/** src/app/(product)/resources/[category]/page.tsx */
export const RESOURCE_CATEGORY_CONTENT = {
  BACK_TO_RESOURCES: "← Back to Resources",
  MASTERY_PATH_SUFFIX: "Mastery Path",
  AI_POWERED_BADGE: "AI-Powered",
  DESCRIPTION: (category: string) =>
    `Master ${category} concept by concept. Follow the syllabus below to gain in-depth knowledge and practice interview-ready questions.`,
  START_LEARNING: "Start Learning",
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/InteractivePractice.tsx */
export const INTERACTIVE_PRACTICE_CONTENT = {
  TITLE: (topic: string) => `AI Tutor · ${topic}`,
  STATUS: "Practice Mode · Live",
  RESET_ARIA: "Reset conversation",
  RESET: "Reset",
  AI_THINKING_ARIA: "AI is thinking",
  INPUT_PLACEHOLDER:
    "Type your answer or paste code (Shift+Enter for new line)…",
  SEND_ARIA: "Send message",
  DISCLAIMER: "AI can make mistakes. Verify important information.",
  CONNECTION_LOST_MESSAGE:
    "Looks like I lost connection for a moment. Could you send that again?",
  NUDGE_TRY_PROMPT:
    "I want to take a shot at the solution now. Ready for me to share my approach.",
  NUDGE_HINT_PROMPT: "Can I have the next hint?",
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/_components/RateLimitPause.tsx */
export const RATE_LIMIT_PAUSE_CONTENT = {
  RESET_HOURS: (h: number) => `in ~${h}h`,
  RESET_MINUTES: (m: number) => `in ~${m}m`,
  RESET_MOMENT: "in a moment",
  RESET_TOMORROW: "tomorrow",
  TITLE: "That's a wrap for today",
  DESCRIPTION: (used: number, limit: number, resetsInText: string) =>
    `You've had ${used} tutor messages today (limit: ${limit}). Your conversation is saved — pick it back up ${resetsInText}.`,
  UPGRADE: "Upgrade for more",
  BACK_TO_DASHBOARD: "Back to dashboard",
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/_components/SoftNudge.tsx */
export const SOFT_NUDGE_CONTENT = {
  TITLE: "You've been on this one a while.",
  DESCRIPTION:
    "Best way to learn is to try. Ready to take a shot, or want one more nudge?",
  TAKE_A_SHOT: "Take a shot",
  ONE_MORE_HINT: "One more hint",
  DISMISS_ARIA: "Dismiss suggestion",
} as const;

/** src/app/(product)/resources/[category]/[topic]/[questionId]/_components/ThinkingDots.tsx */
export const THINKING_DOTS_CONTENT = {
  SR_LABEL: "AI is thinking",
} as const;
