import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';
import type { ApiResponse } from '@/types';

interface GamificationStats {
    xp: number;
    currentStreak: number;
    longestStreak: number;
    badges: string[];
    totalMocksCompleted: number;
    avgScore: number;
    lastPracticeAt: Date | null;
}

export async function GET() {
    try {
        const userId = await requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                xp: true,
                currentStreak: true,
                longestStreak: true,
                badges: true,
                totalMocksCompleted: true,
                lastPracticeAt: true,
            },
        });

        if (!user) {
            return NextResponse.json<ApiResponse<never>>(
                { error: { message: 'User not found', code: 'NOT_FOUND', statusCode: 404 } },
                { status: 404 }
            );
        }

        // Calculate average score from mock results
        const avgScoreResult = await prisma.mockResult.aggregate({
            where: {
                session: { userId },
            },
            _avg: {
                score: true,
            },
        });

        const stats: GamificationStats = {
            xp: user.xp,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            badges: user.badges,
            totalMocksCompleted: user.totalMocksCompleted,
            avgScore: Math.round(avgScoreResult._avg.score || 0),
            lastPracticeAt: user.lastPracticeAt,
        };

        return NextResponse.json<ApiResponse<GamificationStats>>({
            data: stats,
        });
    } catch (error) {
        const errorResponse = createErrorResponse(error);
        return NextResponse.json<ApiResponse<never>>(errorResponse, {
            status: errorResponse.error.statusCode || 500,
        });
    }
}
