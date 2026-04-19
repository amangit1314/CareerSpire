/**
 * Picks a DSA problem and sets it as today's daily challenge.
 *
 * Strategy: choose a random DSA problem that hasn't been used as a daily
 * challenge in the last 30 days. If none qualify, pick any random DSA problem.
 *
 * Usage: npx tsx scripts/set-daily-challenge.ts
 */

import { prisma } from '../src/lib/prisma';

async function main() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Already set for today?
    const existing = await prisma.dailyChallenge.findUnique({
        where: { date: today },
    });
    if (existing) {
        console.log(`[daily] today (${today.toISOString().slice(0, 10)}) is already set → ${existing.questionId}`);
        await prisma.$disconnect();
        return;
    }

    // Problems used recently (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyUsed = await prisma.dailyChallenge.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        select: { questionId: true },
    });
    const excludeIds = recentlyUsed.map((r) => r.questionId);

    // Pick a fresh DSA problem
    const pool = await prisma.question.findMany({
        where: {
            type: 'DSA',
            id: { notIn: excludeIds },
        },
        select: { id: true, difficulty: true, title: true },
    });

    let chosen = pool[Math.floor(Math.random() * pool.length)];

    // Fallback: allow repeats if pool is empty
    if (!chosen) {
        const all = await prisma.question.findMany({
            where: { type: 'DSA' },
            select: { id: true, difficulty: true, title: true },
        });
        if (all.length === 0) {
            console.error('[daily] no DSA problems in DB — run seed-practice first');
            process.exit(1);
        }
        chosen = all[Math.floor(Math.random() * all.length)];
    }

    await prisma.dailyChallenge.create({
        data: {
            date: today,
            questionId: chosen.id,
            difficulty: chosen.difficulty,
        },
    });

    console.log(
        `[daily] ${today.toISOString().slice(0, 10)} → "${chosen.title}" (${chosen.difficulty})`,
    );
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
