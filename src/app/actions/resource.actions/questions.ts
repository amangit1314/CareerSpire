'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty, ProgrammingLanguage, QuestionType, type Prisma } from '@prisma/client';
import type { Question as AppQuestion } from '@/types';
import { AppError } from '@/lib/errors';
import { unstable_cache } from 'next/cache';
import { CATEGORIES, Framework } from './shared';

export async function getQuestionsByCategory(categorySlug: string) {
    const category = CATEGORIES.find(c => c.id === categorySlug);
    if (!category) {
        throw new AppError('Category not found', 'NOT_FOUND', 404);
    }

    const whereClause: Record<string, string> = {};
    if (category.type) whereClause.type = category.type;
    if (category.language) whereClause.language = category.language;
    if (category.framework) whereClause.framework = category.framework;

    const questions = await prisma.question.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            difficulty: true,
            topic: true,
            type: true,
            language: true,
            framework: true,
        },
        orderBy: {
            difficulty: 'asc',
        }
    });

    return {
        category: category.name,
        description: category.description,
        questions,
    };
}

export async function getOrGenerateQuestionsForSkill(skillSlug: string) {
    // 1. Try to find existing category first
    const existingCategory = CATEGORIES.find(c => c.id === skillSlug.toLowerCase());

    const topicQuery = existingCategory ? existingCategory.name : skillSlug; // Use name for better DB search if it's a known category

    // 2. Check DB
    let questions = await prisma.question.findMany({
        where: {
            OR: [
                { topic: { contains: topicQuery, mode: 'insensitive' } },
                { title: { contains: topicQuery, mode: 'insensitive' } },
                // If it's a known category, we might rely on the type/language filters from getQuestionsByCategory,
                // but this function is for generic "Skill" search.
                // Let's rely on topic tag primarily for dynamic skills.
            ]
        },
        take: 50
    });

    // 3. If not enough questions, generate with AI
    if (questions.length < 5) {
        console.log(`Not enough questions for ${skillSlug}. Generating with AI...`);
        const { generateAIQuestions } = await import('@/lib/ai/llm');
        const aiQuestions = await generateAIQuestions({
            difficulty: 'MEDIUM', // Default to mixed or handle multiple calls
            type: 'CODING',
            count: 5,
            topics: [skillSlug]
        });

        if (aiQuestions && aiQuestions.length > 0) {
            // Save to DB
            // We need to map AI question format to DB format
            // AI returns object matching AISchema, DB needs QuestionCreateInput
            for (const q of aiQuestions) {
                try {
                    await prisma.question.create({
                        data: {
                            title: q.title,
                            description: q.description,
                            topic: skillSlug, // Use the slug or cleaned name as topic
                            difficulty: q.difficulty as Difficulty, // Ensure cast or map
                            type: q.type as QuestionType,
                            testCases: q.testCases as Prisma.InputJsonValue,
                            hints: q.hints,
                            expectedComplexity: q.expectedComplexity,
                            // Defaults
                            language: q.language ? (q.language.toUpperCase() as ProgrammingLanguage) : undefined,
                            framework: Framework.NONE,
                        }
                    });
                } catch (e) {
                    console.error('Failed to save generated question:', e);
                }
            }

            // Re-fetch to include IDs and correct formatting
            questions = await prisma.question.findMany({
                where: { topic: skillSlug },
                take: 50
            });
        }
    }

    // If still empty (AI failed), return empty or throw
    if (questions.length === 0) {
        // Return empty structure, frontend handles "No questions found"
        return {
            category: skillSlug,
            description: `Practice questions for ${skillSlug}`,
            questions: []
        };
    }

    return {
        category: existingCategory ? existingCategory.name : skillSlug.charAt(0).toUpperCase() + skillSlug.slice(1),
        description: existingCategory ? existingCategory.description : `AI-generated practice questions for ${skillSlug}`,
        questions,
    };
}

export const getTopicsForCategory = unstable_cache(
    async (categorySlug: string) => {
        const { generateTopicSyllabus } = await import('@/lib/ai/llm');
        const topics = await generateTopicSyllabus(categorySlug);
        return topics;
    },
    ['topics-syllabus'],
    { revalidate: 86400, tags: ['syllabus'] }
);

const getCachedTopicGuide = unstable_cache(
    async (categorySlug: string, topicSlug: string) => {
        const { generateTopicGuide } = await import('@/lib/ai/llm');
        return await generateTopicGuide(categorySlug, topicSlug);
    },
    ['topic-guide'],
    { revalidate: 86400, tags: ['guide'] }
);

export async function getTopicDetails(categorySlug: string, topicSlug: string) {
    const { generateAIQuestions } = await import('@/lib/ai/llm');

    // 1. Get Syllabus to find topic difficulty
    const syllabus = await getTopicsForCategory(categorySlug);
    const topicInfo = syllabus.find(t => t.id === topicSlug);

    // Map 'Beginner' -> 'EASY', 'Intermediate' -> 'MEDIUM', 'Advanced' -> 'HARD'
    const syllabusDifficulty = topicInfo?.difficulty || 'Intermediate';
    const mappedDifficulty =
        syllabusDifficulty === 'Beginner' ? 'EASY' :
            syllabusDifficulty === 'Advanced' ? 'HARD' : 'MEDIUM';

    // 2. Get Guide (Theory) - Cached
    const guide = await getCachedTopicGuide(categorySlug, topicSlug);

    // 3. Get Questions (Look for exact topic match first for uniqueness)
    let questions = await prisma.question.findMany({
        where: {
            topic: { equals: topicSlug, mode: 'insensitive' }
        },
        take: 10
    });

    // 4. Generate questions if missing or not enough unique ones
    if (questions.length < 3) {
        console.log(`Generating fresh questions for topic: ${topicSlug} with difficulty: ${mappedDifficulty}`);
        const aiQuestions = await generateAIQuestions({
            difficulty: mappedDifficulty,
            type: 'CODING',
            count: 3,
            topics: [`${categorySlug}: ${topicSlug}`] // Contextual prompt
        });

        // Save generated questions
        if (aiQuestions && aiQuestions.length > 0) {
            for (const q of aiQuestions) {
                try {
                    await prisma.question.create({
                        data: {
                            title: q.title,
                            description: q.description,
                            topic: topicSlug, // Tag with the specific topic slug
                            difficulty: (q.difficulty as Difficulty) || mappedDifficulty as Difficulty,
                            type: (q.type as QuestionType) || 'CODING',
                            testCases: q.testCases as Prisma.InputJsonValue,
                            hints: q.hints,
                            expectedComplexity: q.expectedComplexity,
                            language: q.language ? (q.language.toUpperCase() as ProgrammingLanguage) : undefined,
                            framework: Framework.NONE,
                        }
                    });
                } catch (e) {
                    console.error('Failed to save generated question:', e);
                }
            }
            // Re-fetch using exact match
            questions = await prisma.question.findMany({
                where: { topic: { equals: topicSlug, mode: 'insensitive' } },
                take: 10
            });
        }
    }

    return {
        guide,
        // Prisma's generated enums (Difficulty, QuestionType, etc.) and the
        // app's own src/types/enums.ts equivalents are nominally different
        // types with identical string values — cast at this boundary so
        // downstream components (typed against the app's Question type)
        // accept it, rather than field-by-field casts for all 6 enum props.
        questions: questions as unknown as AppQuestion[],
    };
}

export async function getQuestionDetails(questionId: string) {
    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) return null;
        // See comment in getTopicDetails above — same Prisma/app enum boundary cast.
        return question as unknown as AppQuestion;
    } catch (error) {
        console.error('Failed to fetch question details:', error);
        return null;
    }
}
