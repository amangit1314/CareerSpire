/**
 * Static UI copy for the Community hub (experience feed + video wall).
 * Centralized here rather than inline in JSX — mirrors
 * `routes.ts`/`messages.ts`.
 */

/** src/app/(product)/community/experiences/new/page.tsx */
export const SHARE_EXPERIENCE_CONTENT = {
  AUTH_REQUIRED_TITLE: "Authentication Required",
  AUTH_REQUIRED_DESCRIPTION:
    "Please log in to share your interview experience with the community.",
  LOG_IN: "Log In",
  BACK_TO_COMMUNITY: "Back to Community",
  TITLE: "Share Your Journey",
  DESCRIPTION:
    "Empower others by detailing your interview process. Your experience could be the key to someone else's success.",
  FUNDAMENTALS_TITLE: "The Fundamentals",
  FUNDAMENTALS_DESCRIPTION: "Basic details about the opportunity",
  COMPANY_LABEL: "Company Name",
  COMPANY_PLACEHOLDER: "e.g. Google, Meta, Startup XYZ",
  ROLE_LABEL: "Role / Position",
  ROLE_PLACEHOLDER: "e.g. Software Engineer, Frontend Dev",
  INTERVIEW_TYPE_LABEL: "Interview Type",
  INTERVIEW_TYPE_PLACEHOLDER: "Select type",
  TYPE_ONSITE: "Onsite",
  TYPE_REMOTE: "Remote (Video)",
  TYPE_PHONE: "Phone Screen",
  TYPE_HYBRID: "Hybrid",
  DIFFICULTY_LABEL: "Difficulty",
  DIFFICULTY_PLACEHOLDER: "Select difficulty",
  DIFFICULTY_EASY: "Easy",
  DIFFICULTY_MEDIUM: "Medium",
  DIFFICULTY_HARD: "Hard",
  OUTCOME_LABEL: "Outcome",
  ROUNDS_TITLE: "Interview Rounds",
  ADD_ROUND: "Add Round",
  ROUND_TITLE_LABEL: "Round Title",
  ROUND_TITLE_PLACEHOLDER: "e.g. DSA & Problem Solving",
  ROUND_DESCRIPTION_LABEL: "Description / Experience",
  ROUND_DESCRIPTION_PLACEHOLDER: "Describe what happened in this round...",
  QUESTIONS_LABEL: "Specific Questions Asked",
  ADD_QUESTION: "Add Question",
  QUESTION_LABEL: "QUESTION",
  QUESTION_PLACEHOLDER: "e.g. Reverse a Linked List",
  QUESTION_LINK_LABEL: "LINK (LEETCODE/GFG)",
  QUESTION_LINK_PLACEHOLDER: "https://leetcode.com/problems/...",
  TIPS_TITLE: "Preparation Strategy & Tips",
  TIPS_DESCRIPTION:
    "What helped you the most? Any advice for fellow candidates?",
  TIPS_PLACEHOLDER:
    "Share your preparation resources, common mistakes to avoid, and general advice...",
  CANCEL: "Cancel",
  PUBLISHING: "Publishing...",
  PUBLISH: "Publish Experience",
  DEFAULT_ROUND_TITLE: "Round 1: Technical",
  ADDITIONAL_ROUND_TITLE: (n: number) => `Round ${n}: `,
} as const;

/** src/app/(product)/community/_components/FeedCard.tsx */
export const FEED_CARD_CONTENT = {
  TIME_JUST_NOW: "Just now",
  TIME_MINUTES_AGO: (m: number) => `${m}m ago`,
  TIME_HOURS_AGO: (h: number) => `${h}h ago`,
  TIME_DAYS_AGO: (d: number) => `${d}d ago`,
  TIME_WEEKS_AGO: (w: number) => `${w}w ago`,
  TIME_MONTHS_AGO: (mo: number) => `${mo}mo ago`,
  OUTCOME_OFFERED: "Offered",
  OUTCOME_REJECTED: "Rejected",
  OUTCOME_PENDING: "Pending",
  OUTCOME_GHOSTED: "Ghosted",
  ROUNDS: (n: number) => `${n} ${n === 1 ? "round" : "rounds"}`,
  ANONYMOUS_NAME: "Anonymous",
  VIDEO_BADGE: "Video",
} as const;

/** src/app/(product)/community/page.tsx */
export const COMMUNITY_PAGE_CONTENT = {
  FILTERED_RESULTS: "Filtered results",
  LATEST: "Latest from the community",
  ITEM_COUNT: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
  LOADING: "Loading…",
  EMPTY_FILTERED_TITLE: "No matches for these filters",
  EMPTY_TITLE: "No stories shared yet",
  EMPTY_FILTERED_HINT:
    "Try broadening your search or clearing a filter. The community grows every week.",
  EMPTY_HINT:
    "Be the first to share an interview experience — it takes 2 minutes and helps countless others.",
  CLEAR_FILTERS: "Clear filters",
  SHARE_EXPERIENCE: "Share your experience",
} as const;

/** src/app/(product)/community/_components/CommunityFilters.tsx */
export const COMMUNITY_FILTERS_CONTENT = {
  SEARCH_PLACEHOLDER: "Search company, role, or keywords…",
  CLEAR_SEARCH_ARIA: "Clear search",
  TYPE_ALL: "All",
  TYPE_EXPERIENCES: "Experiences",
  TYPE_VIDEOS: "Videos",
  OUTCOME_ANY: "Any outcome",
  OUTCOME_OFFERED: "Offered",
  OUTCOME_REJECTED: "Rejected",
  OUTCOME_PENDING: "Pending",
  COMPANY_LABEL: "Company",
  CLEAR: "Clear",
} as const;

/** src/app/(product)/community/_components/CommunityHero.tsx */
export const COMMUNITY_HERO_CONTENT = {
  EYEBROW: "Community",
  TITLE: "Learn from people who just interviewed.",
  DESCRIPTION:
    "Real interview experiences, mock recordings, and hard-won tips — shared by candidates just like you.",
  SHARE_EXPERIENCE: "Share an experience",
  RECORD_VIDEO: "Record a video mock",
  LIVE: "Live",
  NEW_THIS_WEEK: "new this week",
  OFFERS_REPORTED: "offers reported",
  MEMBERS: "members",
  TRENDING: "Trending",
} as const;

/** src/app/(product)/community/videos/page.tsx */
export const VIDEO_WALL_CONTENT = {
  BACK_TO_COMMUNITY: "Back to Community",
  TITLE: "Video Mock Interviews",
  DESCRIPTION:
    "Watch real interview recordings shared by our community. Learn from others' experiences and prepare for your own interviews.",
  INTERVIEWS_AVAILABLE: "interviews available",
  READY_TO_RECORD: "Ready to Record?",
  START_RECORDING: "Start Recording",
  RECORD_HINT:
    "Practice with our AI interviewer and optionally share your recording to help others.",
  RESULTS_TITLE: "Community Interviews",
  RESULTS_SUMMARY: (shown: number, total: number) =>
    `Showing ${shown} of ${total} interviews`,
  SORT_RECENT: "Recent",
  SORT_POPULAR: "Popular",
  SORT_TRENDING: "Trending",
} as const;

/** src/app/(product)/community/videos/_components/VideoFilters.tsx */
export const VIDEO_FILTERS_CONTENT = {
  SEARCH_PLACEHOLDER: "Search interviews by presenter name...",
  DIFFICULTY_PLACEHOLDER: "Difficulty",
  ALL_DIFFICULTIES: "All Difficulties",
  DIFFICULTY_EASY: "Easy",
  DIFFICULTY_MEDIUM: "Medium",
  DIFFICULTY_HARD: "Hard",
  SORT_PLACEHOLDER: "Sort by",
  SORT_RECENT: "Most Recent",
  SORT_POPULAR: "Most Viewed",
  SORT_TRENDING: "Trending",
  DATE_RANGE: "Date Range",
  CLEAR_DATES: "Clear Dates",
} as const;

/** src/app/(product)/community/videos/_components/VideoCard.tsx */
export const VIDEO_CARD_CONTENT = {
  ANONYMOUS_NAME: "Anonymous",
  TITLE_SUFFIX: "'s Interview",
} as const;

/** src/app/(product)/community/videos/_components/EmptyState.tsx */
export const VIDEO_EMPTY_STATE_CONTENT = {
  TITLE: "No Interviews Found",
  DESCRIPTION:
    "Try adjusting your filters or search terms to find what you're looking for.",
  CLEAR_FILTERS: "Clear All Filters",
  RECORD_YOUR_OWN: "Record Your Own",
} as const;
