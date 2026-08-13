'use server';

import { prisma } from '@/lib/prisma';
import { type UserRoadmap, normalizeSlug, defaultDisplayName, isCuratedSlug } from './shared';

/**
 * List the current user's custom roadmaps, enriched with live question
 * totals and attempted counts. Pinned first, then most-recently-visited.
 */
export async function getUserRoadmaps(userId?: string): Promise<UserRoadmap[]> {
    if (!userId) return [];

    const roadmaps = await prisma.userRoadmap.findMany({
        where: { userId, isArchived: false },
        orderBy: [{ isPinned: 'desc' }, { lastVisitedAt: 'desc' }],
    });

    if (roadmaps.length === 0) return [];

    // Get total questions per slug and the user's attempt count per slug
    // in two parallelized queries to keep the list fast.
    const slugs = roadmaps.map((r) => r.slug);

    const [totals, userAttempts] = await Promise.all([
        Promise.all(
            slugs.map((s) =>
                prisma.question.count({
                    where: { topic: { equals: s, mode: 'insensitive' } },
                }),
            ),
        ),
        prisma.mockResult.findMany({
            where: {
                session: { userId },
                question: {
                    topic: { in: slugs, mode: 'insensitive' },
                },
            },
            select: { questionId: true, question: { select: { topic: true } } },
        }),
    ]);

    const attemptsBySlug = new Map<string, Set<string>>();
    for (const a of userAttempts) {
        const key = a.question.topic.toLowerCase();
        if (!attemptsBySlug.has(key)) attemptsBySlug.set(key, new Set());
        attemptsBySlug.get(key)!.add(a.questionId);
    }

    return roadmaps.map((r, i) => ({
        slug: r.slug,
        name: r.displayName,
        totalQuestions: totals[i],
        completedQuestions: attemptsBySlug.get(r.slug.toLowerCase())?.size ?? 0,
        tutorMessages: r.tutorMessages,
        lastVisitedAt: r.lastVisitedAt,
        startedAt: r.startedAt,
        isPinned: r.isPinned,
    }));
}

/**
 * Record that the current user has visited a custom skill page. Idempotent
 * upsert — creates a roadmap on first visit, bumps `lastVisitedAt` thereafter.
 * Silent no-op for anonymous users or curated slugs.
 */
export async function recordRoadmapVisit(
    rawSlug: string,
    rawDisplayName?: string,
): Promise<void> {
    try {
        const { getCurrentUserId } = await import('@/lib/auth');
        const userId = await getCurrentUserId();
        if (!userId) return;

        const slug = normalizeSlug(rawSlug);
        if (!slug || isCuratedSlug(slug)) return;

        const displayName = rawDisplayName?.trim() || defaultDisplayName(rawSlug);

        await prisma.userRoadmap.upsert({
            where: { userId_slug: { userId, slug } },
            update: {
                lastVisitedAt: new Date(),
                isArchived: false, // un-archive on revisit
            },
            create: {
                userId,
                slug,
                displayName,
            },
        });
    } catch (error) {
        // Never block page render on this best-effort telemetry write
        console.error('recordRoadmapVisit failed:', error);
    }
}

/**
 * Bump the tutor message count for a user's roadmap. Called from tutorChat
 * after a successful response. No-op if the roadmap doesn't exist (e.g.
 * curated slug or anonymous user).
 */
export async function incrementRoadmapTutorMessages(
    userId: string,
    rawSlug: string,
): Promise<void> {
    try {
        const slug = normalizeSlug(rawSlug);
        if (!slug || isCuratedSlug(slug)) return;

        await prisma.userRoadmap.updateMany({
            where: { userId, slug },
            data: {
                tutorMessages: { increment: 1 },
                lastVisitedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('incrementRoadmapTutorMessages failed:', error);
    }
}

/** Pin / unpin a roadmap (moves it to the top of the list). */
export async function toggleRoadmapPin(rawSlug: string): Promise<void> {
    const { getCurrentUserId } = await import('@/lib/auth');
    const userId = await getCurrentUserId();
    if (!userId) return;

    const slug = normalizeSlug(rawSlug);
    const existing = await prisma.userRoadmap.findUnique({
        where: { userId_slug: { userId, slug } },
        select: { isPinned: true },
    });
    if (!existing) return;

    await prisma.userRoadmap.update({
        where: { userId_slug: { userId, slug } },
        data: { isPinned: !existing.isPinned },
    });
}

/** Soft-delete (archive) a roadmap. Re-visiting it restores it. */
export async function archiveRoadmap(rawSlug: string): Promise<void> {
    const { getCurrentUserId } = await import('@/lib/auth');
    const userId = await getCurrentUserId();
    if (!userId) return;

    const slug = normalizeSlug(rawSlug);
    await prisma.userRoadmap.updateMany({
        where: { userId, slug },
        data: { isArchived: true, isPinned: false },
    });
}
