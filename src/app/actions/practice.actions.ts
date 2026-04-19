'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import { runTests, type TestResult } from '@/lib/code-runner';
import { awardPracticeRewards } from '@/lib/practiceRewards';
import { applyCoinChange, COIN_SPEND } from '@/lib/practiceCoins';
import type { Question, TestCase } from '@/types';
import type { ProblemStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Read: problem list
// ---------------------------------------------------------------------------

export async function getPracticeProblems(
    filters: PracticeFilters = {},
): Promise<ProblemListItem[]> {
    const userId = await getCurrentUserId();
    const limit = filters.limit ?? 100;

    // Filter by type DSA only (the hub's scope)
    const where: Record<string, unknown> = { type: 'DSA' };

    if (filters.difficulty && filters.difficulty !== 'all') {
        where.difficulty = filters.difficulty;
    }
    if (filters.tag) {
        where.tags = { has: filters.tag };
    }
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { topic: { contains: filters.search, mode: 'insensitive' } },
            { tags: { has: filters.search.toLowerCase() } },
        ];
    }

    const orderBy =
        filters.sort === 'difficulty'
            ? [{ difficulty: 'asc' as const }, { createdAt: 'desc' as const }]
            : filters.sort === 'solved'
              ? [{ createdAt: 'desc' as const }]
              : [{ createdAt: 'desc' as const }];

    const problems = await prisma.question.findMany({
        where,
        select: {
            id: true,
            title: true,
            topic: true,
            difficulty: true,
            tags: true,
        },
        orderBy,
        take: limit,
    });

    // Solved counts per-problem (one aggregate query)
    const solvedCounts = await prisma.userProblemProgress.groupBy({
        by: ['questionId'],
        where: {
            questionId: { in: problems.map((p) => p.id) },
            status: 'SOLVED',
        },
        _count: { userId: true },
    });
    const solvedMap = new Map<string, number>(
        solvedCounts.map((c) => [c.questionId, c._count.userId]),
    );

    // User progress overlay
    let progressMap = new Map<
        string,
        { status: ProblemStatus; isBookmarked: boolean }
    >();
    if (userId) {
        const rows = await prisma.userProblemProgress.findMany({
            where: {
                userId,
                questionId: { in: problems.map((p) => p.id) },
            },
            select: { questionId: true, status: true, isBookmarked: true },
        });
        progressMap = new Map(
            rows.map((r) => [
                r.questionId,
                { status: r.status, isBookmarked: r.isBookmarked },
            ]),
        );
    }

    const items: ProblemListItem[] = problems.map((p) => {
        const prog = progressMap.get(p.id);
        return {
            id: p.id,
            title: p.title,
            topic: p.topic,
            difficulty: p.difficulty,
            tags: p.tags,
            solvedCount: solvedMap.get(p.id) ?? 0,
            userStatus: prog?.status ?? 'TODO',
            isBookmarked: prog?.isBookmarked ?? false,
        };
    });

    // Status filter applied post-query (since it needs the user overlay)
    if (filters.status && filters.status !== 'all' && userId) {
        if (filters.status === 'BOOKMARKED') {
            return items.filter((i) => i.isBookmarked);
        }
        return items.filter((i) => i.userStatus === filters.status);
    }

    return items;
}

// ---------------------------------------------------------------------------
// Read: distinct tags for filter facets
// ---------------------------------------------------------------------------

export async function getPracticeFacets(): Promise<{ tags: string[] }> {
    const rows = await prisma.question.findMany({
        where: { type: 'DSA' },
        select: { tags: true },
        take: 500,
    });
    const counts = new Map<string, number>();
    for (const r of rows) {
        for (const t of r.tags) {
            if (!t) continue;
            counts.set(t, (counts.get(t) ?? 0) + 1);
        }
    }
    const sorted = Array.from(counts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30)
        .map(([tag]) => tag);
    return { tags: sorted };
}

// ---------------------------------------------------------------------------
// Read: single problem detail + user progress overlay
// ---------------------------------------------------------------------------

export async function getProblemDetail(
    questionId: string,
): Promise<ProblemDetail | null> {
    const userId = await getCurrentUserId();

    const q = await prisma.question.findUnique({
        where: { id: questionId },
    });
    if (!q || q.type !== 'DSA') return null;

    const sampleTestCases = Array.isArray(q.testCases)
        ? (q.testCases as unknown as TestCase[]).filter((t) => !t.isHidden)
        : [];

    let userProgress: ProblemDetail['userProgress'] = {
        status: 'TODO',
        isBookmarked: false,
        lastLanguage: null,
        lastCode: null,
    };

    if (userId) {
        const [prog, lastSub] = await Promise.all([
            prisma.userProblemProgress.findUnique({
                where: { userId_questionId: { userId, questionId } },
            }),
            prisma.practiceSubmission.findFirst({
                where: { userId, questionId },
                orderBy: { submittedAt: 'desc' },
                select: { language: true, code: true },
            }),
        ]);
        userProgress = {
            status: prog?.status ?? 'TODO',
            isBookmarked: prog?.isBookmarked ?? false,
            lastLanguage: (lastSub?.language as ProblemLanguage) ?? null,
            lastCode: lastSub?.code ?? null,
        };
    }

    return {
        id: q.id,
        title: q.title,
        description: q.description,
        topic: q.topic,
        difficulty: q.difficulty,
        tags: q.tags,
        hints: q.hints,
        starterCode: q.starterCode,
        entryFunctionName: q.entryFunctionName,
        language: q.language,
        expectedComplexity: q.expectedComplexity,
        sampleTestCases,
        userProgress,
    };
}

// ---------------------------------------------------------------------------
// Read: submission history
// ---------------------------------------------------------------------------

export async function getSubmissionHistory(
    questionId: string,
): Promise<SubmissionSummary[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const rows = await prisma.practiceSubmission.findMany({
        where: { userId, questionId },
        orderBy: { submittedAt: 'desc' },
        take: 25,
        select: {
            id: true,
            verdict: true,
            language: true,
            testsPassed: true,
            testsTotal: true,
            runtimeMs: true,
            submittedAt: true,
        },
    });
    return rows;
}

// ---------------------------------------------------------------------------
// Action: run against sample tests (no persistence)
// ---------------------------------------------------------------------------

export async function runProblem(
    questionId: string,
    code: string,
    language: ProblemLanguage,
): Promise<TestResult> {
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q || q.type !== 'DSA') {
        return {
            passed: 0,
            total: 0,
            verdict: 'UNKNOWN',
            details: [],
        };
    }

    // Run against VISIBLE test cases only (the "Run" button is for quick feedback).
    const visibleOnly = {
        ...q,
        testCases: Array.isArray(q.testCases)
            ? (q.testCases as unknown as TestCase[]).filter((t) => !t.isHidden)
            : [],
    } as unknown as Question;

    return runTests(code, visibleOnly, language);
}

// ---------------------------------------------------------------------------
// Action: submit (runs all tests, persists, updates progress, awards rewards)
// ---------------------------------------------------------------------------

export async function submitProblem(
    questionId: string,
    code: string,
    language: ProblemLanguage,
): Promise<SubmitResult> {
    const userId = await getCurrentUserId();
    if (!userId) {
        throw new Error('You need to sign in to submit.');
    }

    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q || q.type !== 'DSA') {
        throw new Error('Problem not found.');
    }

    // Run all tests (hidden included)
    const testResult = await runTests(code, q as unknown as Question, language);

    // Existing progress — to know if this is the first solve
    const prev = await prisma.userProblemProgress.findUnique({
        where: { userId_questionId: { userId, questionId } },
    });
    const wasAlreadySolved = prev?.status === 'SOLVED';
    const isAccepted = testResult.verdict === 'AC';
    const isFirstSolve = isAccepted && !wasAlreadySolved;

    // Persist submission
    const submission = await prisma.practiceSubmission.create({
        data: {
            userId,
            questionId,
            code,
            language,
            verdict: testResult.verdict,
            testsPassed: testResult.passed,
            testsTotal: testResult.total,
        },
    });

    // Update progress (upsert)
    const nextStatus: ProblemStatus = isAccepted
        ? 'SOLVED'
        : wasAlreadySolved
          ? 'SOLVED' // once solved, stays solved even on later WA
          : 'ATTEMPTED';

    await prisma.userProblemProgress.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: {
            status: nextStatus,
            lastAttemptAt: new Date(),
            attemptCount: { increment: 1 },
            firstSolvedAt:
                isFirstSolve ? new Date() : prev?.firstSolvedAt ?? null,
            bestSubmissionId:
                isAccepted && !wasAlreadySolved
                    ? submission.id
                    : prev?.bestSubmissionId ?? null,
        },
        create: {
            userId,
            questionId,
            status: nextStatus,
            attemptCount: 1,
            firstSolvedAt: isAccepted ? new Date() : null,
            bestSubmissionId: isAccepted ? submission.id : null,
        },
    });

    // Rewards — only on AC
    let rewards: SubmitResult['rewards'] = null;
    if (isAccepted) {
        // Is this today's daily challenge?
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const daily = await prisma.dailyChallenge.findUnique({
            where: { date: today },
        });
        const isDailyChallenge = daily?.questionId === questionId;

        const r = await awardPracticeRewards({
            userId,
            questionId,
            difficulty: q.difficulty,
            isFirstSolve,
            isDailyChallenge,
        });
        rewards = {
            xpEarned: r.xpEarned,
            coinsEarned: r.coinsEarned,
            newBadges: r.newBadges,
            newStreak: r.newStreak,
            streakUpdated: r.streakUpdated,
            coinBalance: r.coinBalance,
            totalSolved: r.totalSolved,
        };
    }

    return {
        submissionId: submission.id,
        testResult,
        isFirstSolve,
        rewards,
    };
}

// ---------------------------------------------------------------------------
// Action: toggle bookmark
// ---------------------------------------------------------------------------

export async function toggleBookmark(questionId: string): Promise<boolean> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Auth required');

    const existing = await prisma.userProblemProgress.findUnique({
        where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
        const next = !existing.isBookmarked;
        await prisma.userProblemProgress.update({
            where: { userId_questionId: { userId, questionId } },
            data: { isBookmarked: next },
        });
        return next;
    }

    await prisma.userProblemProgress.create({
        data: { userId, questionId, status: 'TODO', isBookmarked: true },
    });
    return true;
}

// ---------------------------------------------------------------------------
// Action: spend coins (hint reveal / solution unlock)
// ---------------------------------------------------------------------------

export async function spendCoinsForUnlock(
    reason: 'hint_reveal' | 'solution_unlock',
    refId: string,
): Promise<{ newBalance: number }> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Auth required');

    const amount =
        reason === 'hint_reveal' ? COIN_SPEND.HINT_REVEAL : COIN_SPEND.SOLUTION_UNLOCK;

    return applyCoinChange({
        userId,
        amount: -amount,
        reason,
        refId,
    });
}

// ---------------------------------------------------------------------------
// Read: leaderboard
// ---------------------------------------------------------------------------

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

export async function getLeaderboard(
    scope: 'all' | 'weekly' = 'all',
    limit: number = 50,
): Promise<LeaderboardEntry[]> {
    const currentUserId = await getCurrentUserId();

    if (scope === 'all') {
        const users = await prisma.user.findMany({
            orderBy: [{ xp: 'desc' }, { problemsSolvedCount: 'desc' }],
            take: limit,
            select: {
                id: true,
                name: true,
                image: true,
                xp: true,
                problemsSolvedCount: true,
                currentStreak: true,
            },
        });
        return users.map((u, i) => ({
            rank: i + 1,
            userId: u.id,
            name: u.name,
            image: u.image,
            xp: u.xp,
            problemsSolved: u.problemsSolvedCount,
            currentStreak: u.currentStreak,
            isYou: u.id === currentUserId,
        }));
    }

    // Weekly = aggregate AC submissions in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekly = await prisma.practiceSubmission.groupBy({
        by: ['userId'],
        where: { submittedAt: { gte: weekAgo }, verdict: 'AC' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: limit,
    });

    if (weekly.length === 0) return [];

    const userRows = await prisma.user.findMany({
        where: { id: { in: weekly.map((w) => w.userId) } },
        select: {
            id: true,
            name: true,
            image: true,
            xp: true,
            problemsSolvedCount: true,
            currentStreak: true,
        },
    });
    const byId = new Map(userRows.map((u) => [u.id, u]));

    return weekly.map((w, i) => {
        const u = byId.get(w.userId);
        return {
            rank: i + 1,
            userId: w.userId,
            name: u?.name ?? null,
            image: u?.image ?? null,
            xp: u?.xp ?? 0,
            problemsSolved: w._count.id, // weekly solves
            currentStreak: u?.currentStreak ?? 0,
            isYou: w.userId === currentUserId,
        };
    });
}

// ---------------------------------------------------------------------------
// Read: daily challenge
// ---------------------------------------------------------------------------

export async function getDailyChallenge(): Promise<DailyChallengeInfo | null> {
    const userId = await getCurrentUserId();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const challenge = await prisma.dailyChallenge.findUnique({
        where: { date: today },
    });
    if (!challenge) return null;

    const q = await prisma.question.findUnique({
        where: { id: challenge.questionId },
        select: { id: true, title: true, difficulty: true, tags: true },
    });
    if (!q) return null;

    let solved = false;
    if (userId) {
        const p = await prisma.userProblemProgress.findUnique({
            where: { userId_questionId: { userId, questionId: q.id } },
            select: { status: true, firstSolvedAt: true },
        });
        // Counted as "solved today" if status is SOLVED AND firstSolvedAt is today OR solved today
        solved =
            p?.status === 'SOLVED' &&
            !!p.firstSolvedAt &&
            p.firstSolvedAt >= today;
    }

    return {
        date: today.toISOString().slice(0, 10),
        questionId: q.id,
        title: q.title,
        difficulty: q.difficulty,
        tags: q.tags,
        solved,
    };
}

// ---------------------------------------------------------------------------
// Read: user practice stats (for hero ribbon)
// ---------------------------------------------------------------------------

export interface UserPracticeStats {
    isAnonymous: boolean;
    xp: number;
    coins: number;
    currentStreak: number;
    longestStreak: number;
    problemsSolved: number;
    rank: number | null;
}

export async function getUserPracticeStats(): Promise<UserPracticeStats> {
    const userId = await getCurrentUserId();
    if (!userId) {
        return {
            isAnonymous: true,
            xp: 0,
            coins: 0,
            currentStreak: 0,
            longestStreak: 0,
            problemsSolved: 0,
            rank: null,
        };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            xp: true,
            coins: true,
            currentStreak: true,
            longestStreak: true,
            problemsSolvedCount: true,
        },
    });
    if (!user) {
        return {
            isAnonymous: false,
            xp: 0,
            coins: 0,
            currentStreak: 0,
            longestStreak: 0,
            problemsSolved: 0,
            rank: null,
        };
    }

    // Rank = 1 + count of users with strictly more XP
    const higher = await prisma.user.count({
        where: { xp: { gt: user.xp } },
    });

    return {
        isAnonymous: false,
        xp: user.xp,
        coins: user.coins,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        problemsSolved: user.problemsSolvedCount,
        rank: higher + 1,
    };
}

// ---------------------------------------------------------------------------
// Consolidated: fetch all static practice page data in one round trip
// ---------------------------------------------------------------------------

export interface PracticePageData {
    facets: { tags: string[] };
    stats: UserPracticeStats;
    daily: DailyChallengeInfo | null;
    leaderboard: LeaderboardEntry[];
}

export async function getPracticePageData(): Promise<PracticePageData> {
    const [facets, stats, daily, leaderboard] = await Promise.all([
        getPracticeFacets(),
        getUserPracticeStats(),
        getDailyChallenge(),
        getLeaderboard('weekly', 5),
    ]);
    return { facets, stats, daily, leaderboard };
}
