'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty, ProgrammingLanguage, QuestionType } from '@prisma/client';
import { AppError } from '@/lib/errors';

export enum Framework {
    REACT = 'REACT',
    ANGULAR = 'ANGULAR',
    VUE = 'VUE',
    NODE = 'NODE',
    FASTAPI = 'FASTAPI',
    DJANGO = 'DJANGO',
    SPRING_BOOT = 'SPRING_BOOT',
    NONE = 'NONE'
}

export type ResourceStats = {
    totalQuestions: number;
    completedQuestions: number;
    attemptedQuestions: number;
};

export type CategoryStats = {
    category: string;
    slug: string;
    description: string;
    stats: ResourceStats;
    icon?: string;
}

const CATEGORIES = [
    { id: 'dsa', name: 'Data Structures & Algorithms', type: QuestionType.DSA, description: 'Master core computer science concepts' },
    { id: 'javascript', name: 'JavaScript', language: ProgrammingLanguage.JAVASCRIPT, description: 'Deep dive into JS internals and patterns' },
    { id: 'typescript', name: 'TypeScript', language: ProgrammingLanguage.TYPESCRIPT, description: 'Learn static typing and advanced TS features' },
    { id: 'python', name: 'Python', language: ProgrammingLanguage.PYTHON, description: 'Pythonic coding and standard libraries' },
    { id: 'react', name: 'React', framework: Framework.REACT, description: 'Modern UI development with React' },
    { id: 'node', name: 'Node.js', framework: Framework.NODE, description: 'Server-side JavaScript runtime' },
];

export async function getResourceCategories(userId?: string): Promise<CategoryStats[]> {
    const categories: CategoryStats[] = [];

    for (const cat of CATEGORIES) {
        const whereClause: any = {};
        if (cat.type) whereClause.type = cat.type;
        if (cat.language) whereClause.language = cat.language;
        if (cat.framework) whereClause.framework = cat.framework;

        const total = await prisma.question.count({ where: whereClause });

        let completed = 0;
        let attempted = 0;

        if (userId) {
            // This is a simplified count. For more accuracy we'd join with MockResults
            // For now, let's just return 0s or implement basic counting if needed later
            // To implement correctly we need to query MockResults for this user and these questions
        }

        categories.push({
            category: cat.name,
            slug: cat.id,
            description: cat.description,
            stats: {
                totalQuestions: total,
                completedQuestions: completed,
                attemptedQuestions: attempted,
            }
        });
    }

    return categories;
}

export async function getQuestionsByCategory(categorySlug: string) {
    const category = CATEGORIES.find(c => c.id === categorySlug);
    if (!category) {
        throw new AppError('Category not found', 'NOT_FOUND', 404);
    }

    const whereClause: any = {};
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
        const { generateAIQuestions, generateTopicSyllabus, generateTopicGuide } = await import('@/lib/llm');
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
                            testCases: q.testCases,
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

export async function getTopicsForCategory(categorySlug: string) {
    const { generateTopicSyllabus } = await import('@/lib/llm');
    const topics = await generateTopicSyllabus(categorySlug);
    return topics;
}

export async function getTopicDetails(categorySlug: string, topicSlug: string) {
    const { generateTopicGuide, generateAIQuestions } = await import('@/lib/llm');

    // 1. Get Guide (Theory)
    const guide = await generateTopicGuide(categorySlug, topicSlug);

    // 2. Get Questions
    let questions = await prisma.question.findMany({
        where: {
            topic: { contains: topicSlug, mode: 'insensitive' }
        },
        take: 10
    });

    // 3. Generate questions if missing
    if (questions.length < 3) {
        const aiQuestions = await generateAIQuestions({
            difficulty: 'MEDIUM',
            type: 'CODING',
            count: 3,
            topics: [topicSlug] // Specific topic
        });

        // Save generated questions
        if (aiQuestions && aiQuestions.length > 0) {
            for (const q of aiQuestions) {
                try {
                    await prisma.question.create({
                        data: {
                            title: q.title,
                            description: q.description,
                            topic: topicSlug, // Enforce specific topic tag
                            difficulty: q.difficulty as Difficulty,
                            type: q.type as QuestionType,
                            testCases: q.testCases,
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
            // Re-fetch
            questions = await prisma.question.findMany({
                where: { topic: { contains: topicSlug, mode: 'insensitive' } },
                take: 10
            });
        }
    }

    return {
        guide,
        questions
    };
}
