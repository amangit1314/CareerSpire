'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Difficulty } from '@/types/enums';
import { AppError } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeedItemType = 'experience' | 'video';
export type Outcome = 'offered' | 'rejected' | 'pending' | 'ghosted' | 'accepted';

export interface FeedUser {
    id: string;
    name: string | null;
    image: string | null;
}

export interface ExperienceFeedItem {
    kind: 'experience';
    id: string;
    createdAt: Date;
    company: string;
    role: string;
    outcome: string;
    difficulty: string;
    rounds: number;
    interviewType: string;
    tips: string;
    likes: number;
    user: FeedUser;
}

export interface VideoFeedItem {
    kind: 'video';
    id: string;
    createdAt: Date;
    thumbnailUrl: string | null;
    difficulty: string;
    interviewType: string;
    views: number;
    likes: number;
    user: FeedUser;
}

export type FeedItem = ExperienceFeedItem | VideoFeedItem;

export interface CommunityFeedFilters {
    type?: 'all' | 'experiences' | 'videos';
    company?: string;
    outcome?: 'all' | 'offered' | 'rejected' | 'pending';
    difficulty?: 'all' | 'EASY' | 'MEDIUM' | 'HARD';
    search?: string;
    limit?: number;
}

export interface CommunityStats {
    experienceCount: number;
    videoCount: number;
    memberCount: number;
    offersReported: number;
    newThisWeek: number;
    topCompanies: { name: string; count: number }[];
}

export interface CommunityFacets {
    companies: string[];
}

// ---------------------------------------------------------------------------
// Write: create an interview experience
// ---------------------------------------------------------------------------

export async function createInterviewExperience(data: {
    company: string;
    role: string;
    interviewType: string;
    difficulty: Difficulty;
    outcome: string;
    rounds: number;
    questions: unknown;
    tips: string;
}) {
    try {
        const userId = await requireAuth();
        const experience = await prisma.interviewExperience.create({
            data: {
                userId,
                company: data.company,
                role: data.role,
                interviewType: data.interviewType,
                difficulty: data.difficulty,
                outcome: data.outcome,
                rounds: data.rounds,
                questions: data.questions as object,
                tips: data.tips,
                isPublic: true,
            },
        });
        revalidatePath('/community');
        return experience;
    } catch (error) {
        console.error('createInterviewExperience failed:', error);
        throw new AppError('Failed to save experience', 'DATABASE_ERROR', 500);
    }
}

// ---------------------------------------------------------------------------
// Read: unified feed (experiences + videos) with filters
// ---------------------------------------------------------------------------

export async function getCommunityFeed(
    filters: CommunityFeedFilters = {},
): Promise<FeedItem[]> {
    const limit = filters.limit ?? 30;
    const type = filters.type ?? 'all';

    const expFilter: Record<string, unknown> = { isPublic: true };
    if (filters.company) {
        expFilter.company = { contains: filters.company, mode: 'insensitive' };
    }
    if (filters.outcome && filters.outcome !== 'all') {
        const outcomeMap: Record<string, string[]> = {
            offered: ['offered', 'accepted'],
            rejected: ['rejected'],
            pending: ['pending', 'ghosted'],
        };
        expFilter.outcome = { in: outcomeMap[filters.outcome] ?? [filters.outcome] };
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
        expFilter.difficulty = filters.difficulty;
    }
    if (filters.search) {
        expFilter.OR = [
            { company: { contains: filters.search, mode: 'insensitive' } },
            { role: { contains: filters.search, mode: 'insensitive' } },
            { tips: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    const videoFilter: Record<string, unknown> = { isPublic: true };
    if (filters.difficulty && filters.difficulty !== 'all') {
        videoFilter.difficulty = filters.difficulty;
    }

    const wantExperiences = type === 'all' || type === 'experiences';
    const wantVideos = type === 'all' || type === 'videos';

    const [experiences, videos] = await Promise.all([
        wantExperiences
            ? prisma.interviewExperience.findMany({
                  where: expFilter,
                  include: {
                      user: { select: { id: true, name: true, image: true } },
                  },
                  orderBy: { createdAt: 'desc' },
                  take: limit,
              })
            : Promise.resolve([]),
        wantVideos
            ? prisma.mockSession.findMany({
                  where: { ...videoFilter, videoRecordingUrl: { not: null } },
                  include: {
                      user: { select: { id: true, name: true, image: true } },
                  },
                  orderBy: { startedAt: 'desc' },
                  take: limit,
              })
            : Promise.resolve([]),
    ]);

    const expItems: ExperienceFeedItem[] = experiences.map((e) => ({
        kind: 'experience',
        id: e.id,
        createdAt: e.createdAt,
        company: e.company,
        role: e.role,
        outcome: e.outcome,
        difficulty: e.difficulty,
        rounds: e.rounds,
        interviewType: e.interviewType,
        tips: e.tips,
        likes: e.likes,
        user: e.user,
    }));

    const vidItems: VideoFeedItem[] = videos.map((v) => ({
        kind: 'video',
        id: v.id,
        createdAt: v.startedAt,
        thumbnailUrl: v.videoThumbnailUrl,
        difficulty: v.difficulty,
        interviewType: v.interviewType,
        views: v.views,
        likes: v.likes,
        user: v.user,
    }));

    return [...expItems, ...vidItems]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Read: stats (this-week focus, not vanity lifetime numbers)
// ---------------------------------------------------------------------------

export async function getCommunityStats(): Promise<CommunityStats> {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            experienceCount,
            videoCount,
            memberCount,
            offersReported,
            newExpThisWeek,
            newVidThisWeek,
            topCompaniesRaw,
        ] = await Promise.all([
            prisma.interviewExperience.count({ where: { isPublic: true } }),
            prisma.mockSession.count({
                where: { isPublic: true, videoRecordingUrl: { not: null } },
            }),
            prisma.user.count(),
            prisma.interviewExperience.count({
                where: { isPublic: true, outcome: { in: ['offered', 'accepted'] } },
            }),
            prisma.interviewExperience.count({
                where: { isPublic: true, createdAt: { gte: oneWeekAgo } },
            }),
            prisma.mockSession.count({
                where: { isPublic: true, startedAt: { gte: oneWeekAgo } },
            }),
            prisma.interviewExperience.groupBy({
                by: ['company'],
                where: { isPublic: true },
                _count: { company: true },
                orderBy: { _count: { company: 'desc' } },
                take: 5,
            }),
        ]);

        return {
            experienceCount,
            videoCount,
            memberCount,
            offersReported,
            newThisWeek: newExpThisWeek + newVidThisWeek,
            topCompanies: topCompaniesRaw.map((c) => ({
                name: c.company,
                count: c._count.company,
            })),
        };
    } catch (error) {
        console.error('getCommunityStats failed:', error);
        return {
            experienceCount: 0,
            videoCount: 0,
            memberCount: 0,
            offersReported: 0,
            newThisWeek: 0,
            topCompanies: [],
        };
    }
}

// ---------------------------------------------------------------------------
// Read: filter facets (distinct companies for quick-filter chips)
// ---------------------------------------------------------------------------

export async function getCommunityFacets(): Promise<CommunityFacets> {
    try {
        const rows = await prisma.interviewExperience.groupBy({
            by: ['company'],
            where: { isPublic: true },
            _count: { company: true },
            orderBy: { _count: { company: 'desc' } },
            take: 20,
        });
        return { companies: rows.map((r) => r.company) };
    } catch (error) {
        console.error('getCommunityFacets failed:', error);
        return { companies: [] };
    }
}

// ---------------------------------------------------------------------------
// Kept for backward-compat (other pages still import this)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Consolidated: fetch all static community page data in one round trip
// ---------------------------------------------------------------------------

export interface CommunityPageData {
    stats: CommunityStats;
    facets: CommunityFacets;
}

export async function getCommunityPageData(): Promise<CommunityPageData> {
    const [stats, facets] = await Promise.all([
        getCommunityStats(),
        getCommunityFacets(),
    ]);
    return { stats, facets };
}

export async function getRecentExperiences(limit: number = 6) {
    try {
        return await prisma.interviewExperience.findMany({
            where: { isPublic: true },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    } catch (error) {
        console.error('getRecentExperiences failed:', error);
        return [];
    }
}
