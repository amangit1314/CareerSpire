'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import type { TestCase } from '@/types';
import type { ProblemStatus } from '@prisma/client';
import type { ProblemListItem, ProblemDetail, PracticeFilters, ProblemLanguage } from './shared';

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
