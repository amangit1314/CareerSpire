/**
 * Static UI copy for the Practice hub. Centralized here rather than
 * inline in JSX — mirrors `routes.ts`/`messages.ts`.
 */

/** src/app/(product)/practice/_components/DailyChallengeBanner.tsx */
export const DAILY_CHALLENGE_BANNER_CONTENT = {
  LABEL_SOLVED: "Today's Challenge · Solved",
  LABEL_UNSOLVED: "Today's Challenge",
  REWARD: "+100",
  ACTION_REVIEW: "Review",
  ACTION_SOLVE: "Solve",
} as const;

/** src/app/(product)/practice/_components/PracticeHero.tsx */
export const PRACTICE_HERO_CONTENT = {
  EYEBROW: "Practice Hub",
  TITLE: "Solve problems. Build a streak. Climb the board.",
  DESCRIPTION:
    "Battle-tested DSA problems with an AI-powered sandbox, instant test feedback, and daily challenges that actually matter.",
  STAT_STREAK: "streak",
  STAT_SOLVED: "solved",
  STAT_COINS: "coins",
  ANONYMOUS_HINT: "Sign in to track your progress & climb the leaderboard",
  RANK_LABEL: (xp: number) => `rank · ${xp} XP`,
  RANK_LABEL_UNRANKED: "ranked",
} as const;

/** src/app/(product)/practice/[id]/_components/ProblemWorkspace.tsx */
export const PROBLEM_WORKSPACE_CONTENT = {
  EXPAND_PANEL_ARIA: "Expand problem panel (Cmd/Ctrl + B)",
  EXPAND_PANEL_TITLE: "Expand (Cmd/Ctrl + B)",
  COLLAPSE_PANEL_ARIA: "Collapse problem panel (Cmd/Ctrl + B)",
  COLLAPSE_PANEL_TITLE: "Collapse (Cmd/Ctrl + B)",
  PANEL_COLLAPSED_LABEL: "Problem",
  TOGGLE_BOOKMARK_ARIA: "Toggle bookmark",
  TAB_DESCRIPTION: "Description",
  TAB_HINTS: (n: number) => `Hints (${n})`,
  TAB_SUBMISSIONS: "Submissions",
  RUN: "Run",
  SUBMIT: "Submit",
  FIRST_SOLVE_TITLE: "Accepted — first solve!",
  RESOLVE_TITLE: "Accepted again",
  REWARD_XP: "XP earned",
  REWARD_COINS: "Coins",
  REWARD_STREAK: "Streak",
  REWARD_TOTAL_SOLVED: "Total solved",
  NEW_ACHIEVEMENTS: "New achievements",
  BADGES_UNLOCKED: (n: number) => `🏆 ${n} badge${n > 1 ? "s" : ""} unlocked`,
  VIEW_SUBMISSIONS: "View submissions",
  MORE_PROBLEMS: "More problems",
} as const;

/** src/app/(product)/practice/page.tsx */
export const PRACTICE_PAGE_CONTENT = {
  FILTERED_PROBLEMS: "Filtered problems",
  ALL_PROBLEMS: "All problems",
  PROBLEM_COUNT: (n: number) => `${n} ${n === 1 ? "problem" : "problems"}`,
  LOADING_PROBLEMS: "Loading problems…",
  EMPTY_FILTERED_TITLE: "No problems match these filters",
  EMPTY_TITLE: "No problems yet",
  EMPTY_FILTERED_HINT: "Try broadening your search or clearing a filter.",
  EMPTY_HINT:
    "The problem bank is empty. Run the seed script to generate problems.",
  CLEAR_FILTERS: "Clear filters",
  BROWSE_RESOURCES: "Browse Resources",
} as const;

/** src/app/(product)/practice/leaderboard/page.tsx */
export const LEADERBOARD_CONTENT = {
  BACK_TO_PRACTICE: "Back to Practice",
  EYEBROW: "Leaderboard",
  TITLE: "Top performers",
  SCOPE_ALL_TIME: "All-time",
  SCOPE_WEEKLY: "This week",
  LOADING: "Loading…",
  EMPTY_TITLE: "No one's on the board yet",
  EMPTY_HINT: "Be the first to solve a problem and claim #1.",
  COL_RANK: "Rank",
  COL_USER: "User",
  COL_SOLVED_WEEK: "Solved (week)",
  COL_SOLVED_TOTAL: "Total solved",
  COL_STREAK: "Streak",
  COL_XP: "XP",
  ANONYMOUS_NAME: "Anonymous",
  YOU_BADGE: "you",
} as const;

/** src/app/(product)/practice/_components/ProblemList.tsx */
export const PROBLEM_LIST_CONTENT = {
  PREV_PAGE_ARIA: "Previous page",
  NEXT_PAGE_ARIA: "Next page",
} as const;

/** src/app/(product)/practice/_components/ProblemFilters.tsx */
export const PROBLEM_FILTERS_CONTENT = {
  SEARCH_PLACEHOLDER: "Search problems by title, topic, or tag…",
  CLEAR_SEARCH_ARIA: "Clear search",
  TAGS_LABEL: "Tags",
  CLEAR: "Clear",
} as const;

/** src/app/(product)/practice/[id]/_components/HintsTab.tsx */
export const HINTS_TAB_CONTENT = {
  EMPTY: "No hints for this problem.",
  TITLE: "Hints",
  HINT_FREE_LABEL: "Hint 1 (free)",
  HINT_LABEL: (n: number) => `Hint ${n}`,
  REVEAL: "Reveal",
  UNLOCKING: "Unlocking…",
} as const;

/** src/app/(product)/practice/[id]/_components/ProblemDescription.tsx */
export const PROBLEM_DESCRIPTION_CONTENT = {
  EXAMPLES_TITLE: "Examples",
  INPUT_LABEL: "Input:",
  EXPECTED_LABEL: "Expected:",
  COMPLEXITY_LABEL: "Target complexity",
} as const;

/** src/app/(product)/practice/[id]/_components/TestOutput.tsx */
export const TEST_OUTPUT_CONTENT = {
  VERDICT_ACCEPTED: "Accepted",
  VERDICT_WRONG_ANSWER: "Wrong Answer",
  VERDICT_TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  VERDICT_RUNTIME_ERROR: "Runtime Error",
  VERDICT_COMPILE_ERROR: "Compile Error",
  VERDICT_NOT_RUN: "Not Run",
  EMPTY: "Run your code to see test results here.",
  TESTS_PASSED: (passed: number, total: number) =>
    `${passed}/${total} tests passed`,
  CASE_LABEL: (n: number) => `Case ${n}`,
  INPUT_LABEL: "input:",
  EXPECTED_LABEL: "expected:",
  GOT_LABEL: "got:",
  ALL_PASS:
    "🎉 All sample tests pass. Click Submit to run the full test suite.",
} as const;

/** src/app/(product)/practice/[id]/_components/SubmissionsTab.tsx */
export const SUBMISSIONS_TAB_CONTENT = {
  VERDICT_ACCEPTED: "Accepted",
  VERDICT_TIME_LIMIT: "Time Limit",
  VERDICT_COMPILE_ERROR: "Compile Error",
  VERDICT_RUNTIME_ERROR: "Runtime Error",
  VERDICT_WRONG_ANSWER: "Wrong Answer",
  TIME_JUST_NOW: "just now",
  TIME_MINUTES_AGO: (m: number) => `${m}m ago`,
  TIME_HOURS_AGO: (h: number) => `${h}h ago`,
  TIME_DAYS_AGO: (d: number) => `${d}d ago`,
  TIME_WEEKS_AGO: (w: number) => `${w}w ago`,
  LOADING: "Loading submissions…",
  EMPTY: "No submissions yet. Run your code, then click Submit.",
} as const;

/** src/app/(product)/practice/_components/LeaderboardSnippet.tsx */
export const LEADERBOARD_SNIPPET_CONTENT = {
  TITLE: "Top this week",
  FULL_BOARD_LINK: "Full board",
  EMPTY: "No one has solved a problem this week yet. Be the first!",
  ANONYMOUS_NAME: "Anonymous",
  YOU_BADGE: "you",
  SOLVED_THIS_WEEK: (n: number) => `${n} solved this week`,
} as const;

/** src/app/(product)/practice/[id]/page.tsx */
export const PRACTICE_DETAIL_CONTENT = {
  BREADCRUMB_ARIA: "Breadcrumb",
  BREADCRUMB_PRACTICE: "Practice",
} as const;
