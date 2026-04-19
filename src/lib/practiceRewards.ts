/**
 * Orchestrates all rewards triggered by a successful Practice submission:
 *  - XP award (with high/perfect-score bonus)
 *  - Coin award (difficulty-based + first-solve bonus + daily-challenge bonus)
 *  - Streak update (reuses `User.lastPracticeAt` + `currentStreak`)
 *  - Badge check (problems_10 / problems_50 / problems_100, streak badges)
 *  - Notification ("First solve!", milestone)
 *
 * Only called on AC (accepted) submissions — losing attempts don't reward.
 */

import { prisma } from '@/lib/prisma';
import {
    applyCoinChange,
    COIN_EARN,
    earnForDifficulty,
    reasonForDifficulty,
} from './practiceCoins';

const XP_PER_DIFFICULTY: Record<string, number> = {
    EASY: 25,
    MEDIUM: 50,
    HARD: 100,
};

const PROBLEM_BADGES = [
    { id: 'problems_10', threshold: 10 },
    { id: 'problems_50', threshold: 50 },
    { id: 'problems_100', threshold: 100 },
];

const STREAK_BADGES = [
    { id: 'practice_streak_7', threshold: 7 },
    { id: 'practice_streak_30', threshold: 30 },
];

export interface PracticeRewardInput {
    userId: string;
    questionId: string;
    difficulty: string;
    isFirstSolve: boolean;
    isDailyChallenge: boolean;
}

export interface PracticeRewardResult {
    xpEarned: number;
    coinsEarned: number;
    newBadges: string[];
    newStreak: number;
    streakUpdated: boolean;
    coinBalance: number;
    totalXp: number;
    totalSolved: number;
}

export async function awardPracticeRewards(
    input: PracticeRewardInput,
): Promise<PracticeRewardResult> {
    const { userId, questionId, difficulty, isFirstSolve, isDailyChallenge } = input;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            xp: true,
            coins: true,
            currentStreak: true,
            longestStreak: true,
            lastPracticeAt: true,
            badges: true,
            problemsSolvedCount: true,
        },
    });
    if (!user) throw new Error('User not found');

    // 1. XP calculation
    const baseXp = XP_PER_DIFFICULTY[difficulty.toUpperCase()] ?? 25;
    const dailyBonus = isDailyChallenge ? 50 : 0;

    // 2. Streak calculation (practice counts toward the same streak as mocks)
    const now = new Date();
    const last = user.lastPracticeAt;
    let newStreak = user.currentStreak;
    let streakUpdated = false;

    if (!last) {
        newStreak = 1;
        streakUpdated = true;
    } else {
        const hoursAgo = (now.getTime() - last.getTime()) / 3_600_000;
        if (hoursAgo < 24) {
            // same 24h window — no change
        } else if (hoursAgo < 48) {
            newStreak += 1;
            streakUpdated = true;
        } else {
            newStreak = 1;
            streakUpdated = true;
        }
    }
    const newLongest = Math.max(user.longestStreak, newStreak);

    const streakBonusXp = streakUpdated ? 10 * newStreak : 0;
    const totalXp = baseXp + dailyBonus + streakBonusXp;

    // 3. Update user row (xp, streak, problemsSolvedCount++, lastPracticeAt)
    //    Increment problemsSolvedCount only on first-ever solve of this problem.
    const nextSolvedCount =
        user.problemsSolvedCount + (isFirstSolve ? 1 : 0);

    const newBadges: string[] = [];
    // Problem count badges (only on first solve)
    if (isFirstSolve) {
        for (const b of PROBLEM_BADGES) {
            if (
                nextSolvedCount >= b.threshold &&
                !user.badges.includes(b.id)
            ) {
                newBadges.push(b.id);
            }
        }
    }
    // Streak badges
    for (const b of STREAK_BADGES) {
        if (newStreak >= b.threshold && !user.badges.includes(b.id)) {
            newBadges.push(b.id);
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: user.xp + totalXp,
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastPracticeAt: now,
            problemsSolvedCount: nextSolvedCount,
            badges: [...user.badges, ...newBadges],
        },
    });

    // 4. Coin awards — use the ledger helper for transactional safety.
    //    Each reward is a separate ledger entry (clean audit trail).
    let coinsEarned = 0;
    let coinBalance = user.coins;

    if (isFirstSolve) {
        const solveAmount = earnForDifficulty(difficulty);
        const { newBalance } = await applyCoinChange({
            userId,
            amount: solveAmount,
            reason: reasonForDifficulty(difficulty),
            refId: questionId,
        });
        coinsEarned += solveAmount;
        coinBalance = newBalance;

        // First-solve bonus stacked on top
        const { newBalance: b2 } = await applyCoinChange({
            userId,
            amount: COIN_EARN.FIRST_SOLVE_BONUS,
            reason: 'first_solve_bonus',
            refId: questionId,
        });
        coinsEarned += COIN_EARN.FIRST_SOLVE_BONUS;
        coinBalance = b2;
    }

    if (isDailyChallenge && isFirstSolve) {
        const { newBalance } = await applyCoinChange({
            userId,
            amount: COIN_EARN.DAILY_CHALLENGE,
            reason: 'daily_challenge',
            refId: questionId,
        });
        coinsEarned += COIN_EARN.DAILY_CHALLENGE;
        coinBalance = newBalance;
    }

    // Streak milestone coin bonuses (once per hit of threshold)
    if (streakUpdated && newStreak === 7) {
        const { newBalance } = await applyCoinChange({
            userId,
            amount: COIN_EARN.STREAK_7,
            reason: 'streak_7',
        });
        coinsEarned += COIN_EARN.STREAK_7;
        coinBalance = newBalance;
    }
    if (streakUpdated && newStreak === 30) {
        const { newBalance } = await applyCoinChange({
            userId,
            amount: COIN_EARN.STREAK_30,
            reason: 'streak_30',
        });
        coinsEarned += COIN_EARN.STREAK_30;
        coinBalance = newBalance;
    }

    // 5. Notification — fire and forget (don't block user's result view)
    if (newBadges.length > 0) {
        void notifyBadges(userId, newBadges);
    }

    return {
        xpEarned: totalXp,
        coinsEarned,
        newBadges,
        newStreak,
        streakUpdated,
        coinBalance,
        totalXp: user.xp + totalXp,
        totalSolved: nextSolvedCount,
    };
}

async function notifyBadges(userId: string, badges: string[]): Promise<void> {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type: 'ACHIEVEMENT',
                title:
                    badges.length === 1
                        ? 'Achievement unlocked!'
                        : `${badges.length} achievements unlocked!`,
                body: badges.map(formatBadgeName).join(', '),
                meta: { badges },
            },
        });
    } catch (error) {
        console.error('notifyBadges failed:', error);
    }
}

function formatBadgeName(id: string): string {
    const labels: Record<string, string> = {
        problems_10: '10 problems solved',
        problems_50: '50 problems solved',
        problems_100: '100 problems solved — veteran',
        practice_streak_7: '7-day practice streak',
        practice_streak_30: '30-day practice streak',
    };
    return labels[id] ?? id;
}
