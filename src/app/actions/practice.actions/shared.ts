// Types shared across the practice.actions/ split. Not a 'use server' file —
// only async functions belong in those; this is the plain type layer.

import type { TestResult } from '@/lib/code-runner';
import type { TestCase } from '@/types';
import type { ProblemStatus } from '@prisma/client';

export type ProblemLanguage = 'javascript' | 'python' | 'java';

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
    difficulty?: 'all' | 'EASY' | 'MEDIUM' | 'HARD';
    tag?: string;
    status?: 'all' | 'SOLVED' | 'ATTEMPTED' | 'TODO' | 'BOOKMARKED';
    sort?: 'recent' | 'difficulty' | 'solved';
    limit?: number;
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
    testResult: TestResult;
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
