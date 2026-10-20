// Practice hub interfaces (src/app/actions/practice.actions/,
// src/app/(product)/practice/). Part of the `interfaces/` split — see
// `interfaces/index.ts`.

import type { TestResult as CodeRunnerTestResult } from "@/lib/code-runner";
import type { TestCase } from "./core";
import type { ProblemStatus } from "@prisma/client";
import type { Difficulty, ProblemLanguage, CoinReason } from "../enums";
import type { AnyDifficulty, AnyStatus, BookmarkedStatus } from "../types";

export interface ProblemListItem {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  tags: string[];
  solvedCount: number;
  /** User's status: 'SOLVED' | 'ATTEMPTED' | 'TODO' (absent = TODO) */
  userStatus: ProblemStatus;
  isBookmarked: boolean;
}

export interface ProblemDetail {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  tags: string[];
  hints: string[];
  starterCode: string | null;
  entryFunctionName: string | null;
  language: string | null;
  expectedComplexity: string | null;
  sampleTestCases: TestCase[]; // visible examples only
  userProgress: {
    status: ProblemStatus;
    isBookmarked: boolean;
    lastLanguage: ProblemLanguage | null;
    lastCode: string | null;
  };
}

export interface PracticeFilters {
  search?: string;
  difficulty?: AnyDifficulty | Difficulty;
  tag?: string;
  status?: AnyStatus | ProblemStatus | BookmarkedStatus;
  sort?: "recent" | "difficulty" | "solved";
  limit?: number;
}

/** Client-side mirror of `PracticeFilters` (src/app/(product)/practice/_components/ProblemFilters.tsx) */
export interface PracticeFilterState {
  search: string;
  difficulty: AnyDifficulty | Difficulty;
  status: AnyStatus | ProblemStatus | BookmarkedStatus;
  tag: string;
}

export interface SubmissionSummary {
  id: string;
  verdict: string;
  language: string;
  testsPassed: number;
  testsTotal: number;
  runtimeMs: number | null;
  submittedAt: Date;
}

export interface SubmitResult {
  submissionId: string;
  testResult: CodeRunnerTestResult;
  isFirstSolve: boolean;
  rewards: {
    xpEarned: number;
    coinsEarned: number;
    newBadges: string[];
    newStreak: number;
    streakUpdated: boolean;
    coinBalance: number;
    totalSolved: number;
  } | null;
}

export interface DailyChallengeInfo {
  date: string; // ISO date
  questionId: string;
  title: string;
  difficulty: string;
  tags: string[];
  solved: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  xp: number;
  problemsSolved: number;
  currentStreak: number;
  isYou: boolean;
}

export interface UserPracticeStats {
  isAnonymous: boolean;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  problemsSolved: number;
  rank: number | null;
}

export interface PracticePageData {
  facets: { tags: string[] };
  stats: UserPracticeStats;
  daily: DailyChallengeInfo | null;
  leaderboard: LeaderboardEntry[];
}

/** src/lib/practice/coins.ts */
export interface CoinChangeInput {
  userId: string;
  amount: number; // positive = earn; negative = spend
  reason: CoinReason;
  refId?: string; // questionId | submissionId
}
