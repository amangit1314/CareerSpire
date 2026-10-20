// Re-exports for the practice.actions/ split. Not a 'use server' file —
// only async functions belong in those; this is the plain type layer.
// Types themselves live in src/types/interfaces.ts and src/types/types.ts;
// enums in src/types/enums.ts.

export { ProblemLanguage, LeaderboardScope } from "@/types/enums";
export { ANY_DIFFICULTY, ANY_STATUS, BOOKMARKED_STATUS } from "@/types/types";
export type {
  ProblemListItem,
  ProblemDetail,
  PracticeFilters,
  SubmissionSummary,
  SubmitResult,
  DailyChallengeInfo,
  LeaderboardEntry,
  UserPracticeStats,
  PracticePageData,
} from "@/types/interfaces";
