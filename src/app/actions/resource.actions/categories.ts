'use server';

import { prisma } from '@/lib/prisma';
import { CATEGORIES, type CategoryStats, type ResourcesPageData } from './shared';
import { getUserRoadmaps } from './roadmaps';

export async function getResourceCategories(userId?: string): Promise<CategoryStats[]> {
    const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
            const whereClause: Record<string, unknown> = {};
            if (cat.type) whereClause.type = cat.type;
            if (cat.language) whereClause.language = cat.language;
            if (cat.framework) whereClause.framework = cat.framework;

            const [total, userResults] = await Promise.all([
                prisma.question.count({ where: whereClause }),
                userId
                    ? prisma.mockResult.findMany({
                          where: {
                              session: { userId },
                              question: whereClause,
                          },
                          select: { questionId: true },
                      })
                    : Promise.resolve([]),
            ]);

            const attempted = new Set(userResults.map((r) => r.questionId)).size;

            return {
                category: cat.name,
                slug: cat.id,
                description: cat.description,
                stats: {
                    totalQuestions: total,
                    completedQuestions: attempted,
                    attemptedQuestions: attempted,
                },
            };
        }),
    );

    return results;
}

// ---------------------------------------------------------------------------
// Consolidated: fetch all resources page data in one round trip
// ---------------------------------------------------------------------------

export async function getResourcesPageData(userId?: string): Promise<ResourcesPageData> {
    const [categories, roadmaps] = await Promise.all([
        getResourceCategories(userId),
        getUserRoadmaps(userId),
    ]);
    return { categories, roadmaps };
}
