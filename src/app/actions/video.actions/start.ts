'use server';

import { prisma } from '@/lib/prisma';
import { MockSessionStatus, QuestionType, Difficulty, ProgrammingLanguage, Framework, QuestionFormat, AnswerFormat, SubscriptionTier } from '@/types/enums';
import type { MockSession } from '@/types';
import { generateHRQuestions } from '@/lib/ai/llm';
import { AppError } from '@/lib/errors';
import type { Question as PrismaQuestion, Prisma } from '@prisma/client';
import {
    type VideoInterviewConfig,
    getInterviewRounds,
    generateTechnicalVideoQuestions,
    generateSystemDesignQuestions,
} from './shared';

export async function startVideoMock(
    userId: string,
    config: VideoInterviewConfig
): Promise<MockSession> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);

    // Video interviews have their OWN quota, separate from regular mocks
    if (user.subscriptionTier === 'FREE') {
        if (user.videoMocksRemaining <= 0) {
            throw new AppError('No video interview credits remaining. Buy a voice pack or upgrade your plan.', 'NO_VIDEO_MOCKS_REMAINING', 403);
        }
    } else {
        // Paid tier — enforce video-specific monthly quota
        const { getPlanByTier } = await import('@/lib/pricing');
        const plan = getPlanByTier(user.subscriptionTier as SubscriptionTier);
        if (user.videoMocksUsedThisCycle >= plan.videoMocksPerMonth) {
            throw new AppError(
                `You've used all ${plan.videoMocksPerMonth} video mocks this month. Buy a voice pack or upgrade.`,
                'NO_VIDEO_MOCKS_REMAINING',
                403,
            );
        }
    }

    const rounds = getInterviewRounds(config);
    const allSavedQuestions: PrismaQuestion[] = [];
    const roundMetadata: Array<{ name: string; type: string; startIndex: number; count: number }> = [];

    // Generate questions for each round in parallel
    const roundResults = await Promise.all(rounds.map(async (round) => {
        switch (round.type) {
            case 'hr': {
                const hrQuestions = await generateHRQuestions({ difficulty: config.difficulty, count: round.count });
                return hrQuestions.map((q: { category?: string; question: string; guidance?: string; expectedTimeMinutes?: number }) => ({
                    title: `${q.category || 'Behavioral'} Question`,
                    description: q.question,
                    topic: q.category || 'HR',
                    type: 'VIDEO' as const,
                    hints: [q.guidance].filter((h): h is string => Boolean(h)),
                    expectedTimeMinutes: q.expectedTimeMinutes || 3,
                    roundName: round.name,
                }));
            }
            case 'technical': {
                const techQuestions = await generateTechnicalVideoQuestions(config, round.count);
                return techQuestions.map(q => ({
                    title: q.title,
                    description: q.question,
                    topic: q.topic || config.language || 'Technical',
                    type: 'VIDEO' as const,
                    hints: q.hints || [],
                    expectedTimeMinutes: q.expectedTimeMinutes || 3,
                    roundName: round.name,
                }));
            }
            case 'system-design': {
                const sdQuestions = await generateSystemDesignQuestions(config, round.count);
                return sdQuestions.map(q => ({
                    title: q.title,
                    description: q.question,
                    topic: 'System Design',
                    type: 'VIDEO' as const,
                    hints: q.hints || [],
                    expectedTimeMinutes: q.expectedTimeMinutes || 5,
                    roundName: round.name,
                }));
            }
        }
    }));

    // Save all questions to DB in order
    let questionIndex = 0;
    for (let i = 0; i < rounds.length; i++) {
        const roundQuestions = roundResults[i];
        const startIndex = questionIndex;

        for (const q of roundQuestions) {
            const saved = await prisma.question.create({
                data: {
                    title: q.title,
                    description: q.description,
                    topic: q.topic,
                    difficulty: config.difficulty,
                    type: 'VIDEO',
                    hints: q.hints,
                    expectedTimeMinutes: q.expectedTimeMinutes,
                    source: 'AI',
                    ...(config.language && { language: config.language }),
                    ...(config.framework && config.framework !== 'NONE' && { framework: config.framework }),
                },
            }).catch((err: unknown) => {
                console.error('[VideoAction] Failed to save question:', err instanceof Error ? err.message : err);
                return null;
            });
            if (saved) {
                allSavedQuestions.push(saved);
                questionIndex++;
            }
        }

        roundMetadata.push({
            name: rounds[i].name,
            type: rounds[i].type,
            startIndex,
            count: questionIndex - startIndex,
        });
    }

    if (allSavedQuestions.length === 0) {
        throw new AppError('Failed to generate interview questions. Please try again.', 'AI_GENERATION_FAILED', 503);
    }

    // Store round metadata + config in the session's codingQuestions JSON field (reused for metadata)
    const interviewMeta = {
        mode: config.mode,
        language: config.language || null,
        framework: config.framework || null,
        technicalFocus: config.technicalFocus || null,
        rounds: roundMetadata,
    };

    const session = await prisma.mockSession.create({
        data: {
            userId,
            status: MockSessionStatus.IN_PROGRESS,
            interviewType: QuestionType.VIDEO,
            difficulty: config.difficulty,
            questionIds: allSavedQuestions.map(q => q.id),
            codingQuestions: interviewMeta as unknown as Prisma.InputJsonValue,
            ...(config.language && { language: config.language }),
            ...(config.framework && config.framework !== 'NONE' && { framework: config.framework }),
        },
    });

    // Deduct video mock credit (separate from regular mock quota)
    if (user.subscriptionTier === 'FREE') {
        await prisma.user.update({
            where: { id: userId },
            data: { videoMocksRemaining: Math.max(0, user.videoMocksRemaining - 1) },
        });
    } else {
        await prisma.user.update({
            where: { id: userId },
            data: { videoMocksUsedThisCycle: user.videoMocksUsedThisCycle + 1 },
        });
    }

    return {
        id: session.id,
        userId,
        questionIds: allSavedQuestions.map(q => q.id),
        status: session.status as MockSessionStatus,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        type: QuestionType.VIDEO,
        questions: allSavedQuestions.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            topic: q.topic,
            difficulty: q.difficulty as unknown as Difficulty,
            type: q.type as unknown as QuestionType,
            language: q.language as unknown as ProgrammingLanguage | null,
            framework: q.framework as unknown as Framework | null,
            questionFormat: q.questionFormat as unknown as QuestionFormat,
            expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
            testCases: [],
            expectedComplexity: q.expectedComplexity,
            hints: q.hints,
            expectedTimeMinutes: q.expectedTimeMinutes,
            createdAt: q.createdAt,
        })),
        codingQuestions: [interviewMeta] as unknown as MockSession['codingQuestions'],
        results: [],
    };
}
