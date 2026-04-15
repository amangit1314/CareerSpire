'use server';

import { prisma } from '@/lib/prisma';
import { MockSessionStatus, QuestionType, Difficulty, ProgrammingLanguage, Framework, QuestionFormat, AnswerFormat } from '@/types/enums';
import type { MockSession } from '@/types';
import { generateHRQuestions, generateCodingQuestions, generateFeedback } from '@/lib/llm';
import { aiChat } from '@/lib/ai';
import { AppError } from '@/lib/errors';
import { getSignedUrl } from '@/lib/supabase/storage';
import type { Question as PrismaQuestion, User as PrismaUser, Prisma } from '@prisma/client';

// ============ Interview Config ============

export type InterviewMode = 'technical' | 'non-technical' | 'mixed';
export type TechnicalFocus = 'language-concepts' | 'system-design' | 'dsa' | 'all';
export type NonTechnicalCategory = 'hr' | 'aptitude' | 'situational';

export interface VideoInterviewConfig {
    mode: InterviewMode;
    difficulty: Difficulty;
    // Technical options
    language?: ProgrammingLanguage;
    framework?: Framework;
    technicalFocus?: TechnicalFocus;
    // Non-technical options
    nonTechnicalCategory?: NonTechnicalCategory;
}

/** Round structure for the interview */
interface InterviewRound {
    name: string;
    type: 'hr' | 'technical' | 'system-design';
    count: number;
}

function getInterviewRounds(config: VideoInterviewConfig): InterviewRound[] {
    switch (config.mode) {
        case 'technical':
            return [
                { name: 'Intro', type: 'hr', count: 1 },
                { name: 'Technical', type: 'technical', count: config.difficulty === 'HARD' ? 5 : config.difficulty === 'EASY' ? 3 : 4 },
                { name: 'Wrap-up', type: 'hr', count: 1 },
            ];
        case 'non-technical':
            return [
                { name: 'Behavioral', type: 'hr', count: config.difficulty === 'HARD' ? 7 : config.difficulty === 'EASY' ? 3 : 5 },
            ];
        case 'mixed':
        default:
            return [
                { name: 'HR Intro', type: 'hr', count: 2 },
                { name: 'Technical Round', type: 'technical', count: config.difficulty === 'HARD' ? 4 : 3 },
                { name: 'System Design', type: 'system-design', count: config.difficulty === 'EASY' ? 1 : 2 },
                { name: 'HR Wrap-up', type: 'hr', count: 1 },
            ];
    }
}

// ============ Question Generators (Video-specific) ============

async function generateTechnicalVideoQuestions(
    config: VideoInterviewConfig,
    count: number
): Promise<Array<{ title: string; question: string; topic: string; hints: string[]; expectedTimeMinutes: number }>> {
    const lang = config.language || 'JAVASCRIPT';
    const fw = config.framework && config.framework !== 'NONE' ? config.framework : null;
    const focus = config.technicalFocus || 'all';

    const focusInstruction = focus === 'dsa'
        ? 'Focus on data structures and algorithms. Ask the candidate to explain their approach verbally.'
        : focus === 'system-design'
            ? 'Focus on system design. Ask about architecture, scalability, trade-offs.'
            : focus === 'language-concepts'
                ? `Focus on ${lang}${fw ? ` / ${fw}` : ''} internals, gotchas, and best practices.`
                : `Mix of ${lang}${fw ? ` / ${fw}` : ''} concepts, problem-solving, and practical scenarios.`;

    const prompt = `You are a Senior Technical Interviewer at a top tech company.
Generate ${count} technical interview questions for a VIDEO interview (verbal answers only, no code editor).

Language: ${lang}
${fw ? `Framework: ${fw}` : ''}
Difficulty: ${config.difficulty}
${focusInstruction}

These are VERBAL questions — the candidate explains their thinking out loud. Questions should be:
- Conceptual depth (explain how X works under the hood)
- Trade-off analysis (when would you use X vs Y?)
- Problem-solving walkthrough (how would you approach building X?)
- Debugging scenario (here's a bug description, how would you diagnose it?)

Return JSON: { "questions": [{ "title": "short title", "question": "full question text the AI interviewer will read aloud", "topic": "topic area", "hints": ["hint1"], "expectedTimeMinutes": 3 }] }
Return ONLY valid JSON.`;

    try {
        const result = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
        const data = JSON.parse(result.content);
        return data.questions || [];
    } catch (err) {
        console.error('[VideoAction] Failed to generate technical questions:', err);
        return [];
    }
}

async function generateSystemDesignQuestions(
    config: VideoInterviewConfig,
    count: number
): Promise<Array<{ title: string; question: string; topic: string; hints: string[]; expectedTimeMinutes: number }>> {
    const prompt = `You are a Principal Engineer interviewing a candidate.
Generate ${count} system design interview questions for a VIDEO interview (verbal discussion).

Difficulty: ${config.difficulty}
${config.language ? `Context: The candidate works with ${config.language}${config.framework && config.framework !== 'NONE' ? ` / ${config.framework}` : ''}.` : ''}

Questions should ask the candidate to:
- Design a system (e.g., "Design a real-time notification system")
- Discuss trade-offs, scaling, database choices
- Walk through their architecture decisions verbally

Return JSON: { "questions": [{ "title": "short title", "question": "full question for AI to read aloud", "topic": "System Design", "hints": ["Think about scalability"], "expectedTimeMinutes": 5 }] }
Return ONLY valid JSON.`;

    try {
        const result = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
        const data = JSON.parse(result.content);
        return data.questions || [];
    } catch (err) {
        console.error('[VideoAction] Failed to generate system design questions:', err);
        return [];
    }
}

// ============ Start Video Interview ============

export async function startVideoMock(
    userId: string,
    config: VideoInterviewConfig
): Promise<MockSession> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);

    if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining <= 0) {
        throw new AppError('No mocks remaining. Please upgrade your plan.', 'NO_MOCKS_REMAINING', 403);
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
            ...(videoUrl ? { videoRecordingUrl: videoUrl } : {}),
            ...(thumbnailUrl ? { videoThumbnailUrl: thumbnailUrl } : {}),
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

// Evaluate a video answer transcript with AI
export async function submitVideoAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    transcript: string,
    timeSpent: number
): Promise<{ score: number; feedback: any }> {
    const session: any = await prisma.mockSession.findFirst({
        where: { id: sessionId, userId },
    });
    if (!session) throw new AppError('Session not found', 'NOT_FOUND', 404);

    const question = await prisma.question.findUnique({
        where: { id: questionId },
    });
    if (!question) throw new AppError('Question not found', 'NOT_FOUND', 404);

    const feedback = await generateFeedback(
        {
            title: question.title,
            description: question.description,
            topic: question.topic,
            expectedAnswerFormat: 'SHORT_ANSWER',
        },
        transcript || '(No response given)',
        { passed: 0, total: 0 },
        timeSpent
    );

    const score = feedback.score ?? Math.round(feedback.codeQuality * 0.7);

    await prisma.mockResult.create({
        data: {
            sessionId,
            questionId,
            userCode: transcript || '(No response)',
            testResults: { passed: 0, total: 0, details: [] },
            score,
            feedback: feedback as any,
            timeSpent,
        },
    });

    return { score, feedback };
}
