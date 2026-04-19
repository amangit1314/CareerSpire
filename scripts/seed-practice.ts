/**
 * Seed script — populates the Practice hub with LeetCode-style DSA problems
 * across a matrix of difficulties and topics.
 *
 * Uses the topic-aware `generateAIQuestions` (not the cached `generateDSAQuestions`)
 * so every topic gets its own generation. Saves into `Question` with `type=DSA`.
 *
 * Usage:  npx tsx --env-file=.env scripts/seed-practice.ts
 *
 * Idempotent: duplicates by title (case-insensitive) are skipped.
 */

import { prisma } from '../src/lib/prisma';
import { generateAIQuestions } from '../src/lib/llm';
import { Difficulty, QuestionType, ProgrammingLanguage } from '@prisma/client';

const MATRIX: Array<{ topic: string; difficulty: Difficulty; count: number }> = [
    { topic: 'arrays', difficulty: 'EASY', count: 3 },
    { topic: 'arrays', difficulty: 'MEDIUM', count: 2 },
    { topic: 'arrays', difficulty: 'HARD', count: 1 },

    { topic: 'strings', difficulty: 'EASY', count: 2 },
    { topic: 'strings', difficulty: 'MEDIUM', count: 2 },
    { topic: 'strings', difficulty: 'HARD', count: 1 },

    { topic: 'hash-tables', difficulty: 'EASY', count: 2 },
    { topic: 'hash-tables', difficulty: 'MEDIUM', count: 2 },

    { topic: 'two-pointers', difficulty: 'EASY', count: 2 },
    { topic: 'two-pointers', difficulty: 'MEDIUM', count: 2 },

    { topic: 'binary-search', difficulty: 'EASY', count: 2 },
    { topic: 'binary-search', difficulty: 'MEDIUM', count: 2 },
    { topic: 'binary-search', difficulty: 'HARD', count: 1 },

    { topic: 'dynamic-programming', difficulty: 'MEDIUM', count: 3 },
    { topic: 'dynamic-programming', difficulty: 'HARD', count: 2 },

    { topic: 'trees', difficulty: 'EASY', count: 2 },
    { topic: 'trees', difficulty: 'MEDIUM', count: 2 },
    { topic: 'trees', difficulty: 'HARD', count: 1 },

    { topic: 'graphs', difficulty: 'MEDIUM', count: 2 },
    { topic: 'graphs', difficulty: 'HARD', count: 1 },

    { topic: 'linked-lists', difficulty: 'EASY', count: 2 },
    { topic: 'linked-lists', difficulty: 'MEDIUM', count: 2 },

    { topic: 'stacks-queues', difficulty: 'EASY', count: 2 },
    { topic: 'stacks-queues', difficulty: 'MEDIUM', count: 2 },
];

async function main() {
    console.log('[seed-practice] starting…');
    let created = 0;
    let skipped = 0;

    for (const { topic, difficulty, count } of MATRIX) {
        console.log(
            `[seed-practice] ${count} ${difficulty} problem(s) for "${topic}"`,
        );

        let batch: unknown[];
        try {
            batch = await generateAIQuestions({
                difficulty,
                count,
                type: 'DSA',
                topics: [topic],
            });
        } catch (err) {
            console.error(`  generation failed: ${(err as Error).message}`);
            continue;
        }

        for (const raw of batch) {
            const q = raw as {
                title?: string;
                description?: string;
                topic?: string;
                difficulty?: string;
                testCases?: Array<{ input: unknown; expectedOutput: unknown; isHidden?: boolean }>;
                expectedComplexity?: string;
                hints?: string[];
                language?: string;
            };
            if (!q.title || !q.description) continue;

            const title = q.title.trim();
            const existing = await prisma.question.findFirst({
                where: { title: { equals: title, mode: 'insensitive' } },
                select: { id: true },
            });
            if (existing) {
                skipped++;
                continue;
            }

            const lang =
                q.language && q.language.toUpperCase() in ProgrammingLanguage
                    ? (q.language.toUpperCase() as ProgrammingLanguage)
                    : ProgrammingLanguage.JAVASCRIPT;

            await prisma.question.create({
                data: {
                    title,
                    description: q.description,
                    topic: (q.topic ?? topic).trim() || topic,
                    difficulty: (q.difficulty ?? difficulty) as Difficulty,
                    type: QuestionType.DSA,
                    language: lang,
                    tags: [topic, ...(difficulty === 'EASY' ? ['beginner'] : [])],
                    hints: Array.isArray(q.hints) ? q.hints : [],
                    testCases: Array.isArray(q.testCases)
                        ? q.testCases.slice(0, 6)
                        : [],
                    expectedComplexity: q.expectedComplexity ?? null,
                },
            });
            created++;
            console.log(`  ✓ ${title}`);
        }
    }

    console.log(
        `[seed-practice] done — created ${created}, skipped ${skipped} duplicates`,
    );
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
