'use server';

import { prisma } from '@/lib/prisma';
import { MockSessionStatus, QuestionType, Difficulty } from '@/types/enums';
import type { MockSession, HRQuestion } from '@/types';
import { generateHRQuestions } from '@/lib/llm';
import { AppError } from '@/lib/errors';
import { getSignedUrl } from '@/lib/supabase/storage';

// Start a video mock interview session
export async function startVideoMock(
    userId: string,
    difficulty: Difficulty = Difficulty.MEDIUM
): Promise<MockSession> {
    const user: any = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    }

    if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining <= 0) {
        throw new AppError('No mocks remaining. Please upgrade your plan.', 'NO_MOCKS_REMAINING', 403);
    }

    // Generate HR/behavioral questions for video interview
    const questions = await generateHRQuestions({
        difficulty: difficulty as any,
        count: 5
    });

    const session = await prisma.mockSession.create({
        data: {
            userId,
            status: MockSessionStatus.IN_PROGRESS,
            interviewType: QuestionType.VIDEO,
            difficulty: difficulty as any,
            hrQuestions: questions,
        },
    });

    // Decrement free mocks
    if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
        });
    }

    return {
        id: session.id,
        userId,
        status: session.status as MockSessionStatus,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        type: QuestionType.VIDEO,
        hrQuestions: questions as any,
        results: [],
    };
}

// Save video recording URL to session
export async function saveVideoRecording(
    userId: string,
    sessionId: string,
    videoUrl: string,
    thumbnailUrl?: string
): Promise<void> {
    const session: any = await prisma.mockSession.findFirst({
        where: { id: sessionId, userId },
    });

    if (!session) {
        throw new AppError('Session not found', 'NOT_FOUND', 404);
    }

    await prisma.mockSession.update({
        where: { id: sessionId },
        data: {
            videoRecordingUrl: videoUrl, // This is now the path
            videoThumbnailUrl: thumbnailUrl,
            status: MockSessionStatus.COMPLETED,
            completedAt: new Date(),
        },
    });
}

// Toggle video interview public visibility
export async function toggleVideoPublic(
    userId: string,
    sessionId: string
): Promise<boolean> {
    const session: any = await prisma.mockSession.findFirst({
        where: { id: sessionId, userId },
    });

    if (!session) {
        throw new AppError('Session not found', 'NOT_FOUND', 404);
    }

    const updated = await prisma.mockSession.update({
        where: { id: sessionId },
        data: { isPublic: !session.isPublic },
    });

    return updated.isPublic;
}

// Get public video interviews (community feed)
export async function getPublicVideoInterviews(
    page: number = 1,
    limit: number = 12
) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
        prisma.mockSession.findMany({
            where: {
                interviewType: 'VIDEO',
                isPublic: true,
                videoRecordingUrl: { not: null },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { startedAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.mockSession.count({
            where: {
                interviewType: 'VIDEO',
                isPublic: true,
                videoRecordingUrl: { not: null },
            },
        }),
    ]);

    return {
        videos: await Promise.all((sessions as any[]).map(async s => ({
            id: s.id,
            videoUrl: s.videoRecordingUrl ? await getSignedUrl(s.videoRecordingUrl).catch(() => null) : null,
            thumbnailUrl: s.videoThumbnailUrl ? await getSignedUrl(s.videoThumbnailUrl).catch(() => null) : null,
            views: s.views,
            likes: s.likes,
            difficulty: s.difficulty,
            createdAt: s.startedAt,
            user: s.user,
        }))),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Like a video interview
export async function likeVideoInterview(
    userId: string,
    sessionId: string
): Promise<{ liked: boolean; likes: number }> {
    // Check if already liked
    const existingLike = await prisma.videoLike.findUnique({
        where: {
            sessionId_userId: { sessionId, userId },
        },
    });

    if (existingLike) {
        // Unlike
        await prisma.videoLike.delete({
            where: { id: existingLike.id },
        });

        const updated = await prisma.mockSession.update({
            where: { id: sessionId },
            data: { likes: { decrement: 1 } },
        });

        return { liked: false, likes: updated.likes };
    } else {
        // Like
        await prisma.videoLike.create({
            data: { sessionId, userId },
        });

        const updated = await prisma.mockSession.update({
            where: { id: sessionId },
            data: { likes: { increment: 1 } },
        });

        return { liked: true, likes: updated.likes };
    }
}

// Increment view count
export async function incrementVideoViews(sessionId: string): Promise<void> {
    await prisma.mockSession.update({
        where: { id: sessionId },
        data: { views: { increment: 1 } },
    });
}

// Add comment to video
export async function addVideoComment(
    userId: string,
    sessionId: string,
    content: string
): Promise<{ id: string; content: string; createdAt: Date }> {
    const comment = await prisma.videoComment.create({
        data: { sessionId, userId, content },
    });

    return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
    };
}

// Get comments for a video
export async function getVideoComments(sessionId: string) {
    const comments = await prisma.videoComment.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return comments;
}
