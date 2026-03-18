'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty } from '@/types/enums';
import { AppError } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

export async function createInterviewExperience(data: {
    userId: string;
    company: string;
    role: string;
    interviewType: string;
    difficulty: Difficulty;
    outcome: string;
    rounds: number;
    questions: any;
    tips: string;
}) {
    try {
        const experience = await prisma.interviewExperience.create({
            data: {
                userId: data.userId,
                company: data.company,
                role: data.role,
                interviewType: data.interviewType,
                difficulty: data.difficulty,
                outcome: data.outcome,
                rounds: data.rounds,
                questions: data.questions,
                tips: data.tips,
                isPublic: true,
            },
        });

        revalidatePath('/community');
        return experience;
    } catch (error) {
        console.error('Failed to create interview experience:', error);
        throw new AppError('Failed to save experience', 'DATABASE_ERROR', 500);
    }
}

export async function getRecentExperiences(limit: number = 6) {
    try {
        const experiences = await prisma.interviewExperience.findMany({
            where: { isPublic: true },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return experiences;
    } catch (error) {
        console.error('Failed to fetch experiences:', error);
        return [];
    }
}

export async function getCommunityStats() {
    try {
        const [videoCount, experienceCount, userCount, successCount] = await Promise.all([
            prisma.mockSession.count({ where: { isPublic: true } }),
            prisma.interviewExperience.count({ where: { isPublic: true } }),
            prisma.user.count(),
            prisma.interviewExperience.count({
                where: {
                    isPublic: true,
                    outcome: { in: ['offered', 'accepted'] }
                }
            })
        ]);

        const successRate = experienceCount > 0
            ? Math.round((successCount / experienceCount) * 100)
            : 0;

        return {
            videoCount,
            experienceCount,
            userCount,
            successRate
        };
    } catch (error) {
        console.error('Failed to fetch community stats:', error);
        return {
            videoCount: 0,
            experienceCount: 0,
            userCount: 0,
            successRate: 0
        };
    }
}
