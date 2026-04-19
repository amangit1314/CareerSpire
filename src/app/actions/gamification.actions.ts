'use server';

import { prisma } from '@/lib/prisma';

// XP rewards for different actions
const XP_REWARDS = {
    MOCK_COMPLETED: 50,
    PERFECT_SCORE: 100,
    HIGH_SCORE: 25, // Score >= 80
    STREAK_BONUS: 10, // Per day of streak
    FIRST_MOCK: 100,
};

// Badge check stats shape
interface BadgeCheckStats {
    totalMocksCompleted: number;
    longestStreak: number;
    hasPerfectScore: boolean;
    hasSpeedRun: boolean;
    dsaCount: number;
}

// Badge definitions
const BADGE_DEFINITIONS: Record<string, { check: (stats: BadgeCheckStats) => boolean }> = {
    first_mock: { check: (stats) => stats.totalMocksCompleted >= 1 },
    streak_3: { check: (stats) => stats.longestStreak >= 3 },
    streak_7: { check: (stats) => stats.longestStreak >= 7 },
    streak_30: { check: (stats) => stats.longestStreak >= 30 },
    perfect_score: { check: (stats) => stats.hasPerfectScore },
    speed_demon: { check: (stats) => stats.hasSpeedRun },
    dsa_master: { check: (stats) => stats.dsaCount >= 10 },
    mock_veteran: { check: (stats) => stats.totalMocksCompleted >= 50 },
};

export async function awardXP(userId: string, score: number, timeSpent: number): Promise<{
    xpEarned: number;
    newBadges: string[];
    streakUpdated: boolean;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            xp: true,
            currentStreak: true,
            longestStreak: true,
            lastPracticeAt: true,
            badges: true,
            totalMocksCompleted: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    let xpEarned = XP_REWARDS.MOCK_COMPLETED;
    const newBadges: string[] = [];

    // Bonus XP for high/perfect scores
    if (score === 100) {
        xpEarned += XP_REWARDS.PERFECT_SCORE;
    } else if (score >= 80) {
        xpEarned += XP_REWARDS.HIGH_SCORE;
    }

    // First mock bonus
    if (user.totalMocksCompleted === 0) {
        xpEarned += XP_REWARDS.FIRST_MOCK;
        if (!user.badges.includes('first_mock')) {
            newBadges.push('first_mock');
        }
    }

    // Calculate streak
    const now = new Date();
    const lastPractice = user.lastPracticeAt;
    let newStreak = user.currentStreak;
    let streakUpdated = false;

    if (lastPractice) {
        const hoursSinceLastPractice = (now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastPractice < 24) {
            // Same day, keep streak
        } else if (hoursSinceLastPractice < 48) {
            // Next day, increment streak
            newStreak += 1;
            streakUpdated = true;
            xpEarned += XP_REWARDS.STREAK_BONUS * newStreak;
        } else {
            // Streak broken
            newStreak = 1;
            streakUpdated = true;
        }
    } else {
        newStreak = 1;
        streakUpdated = true;
    }

    // Check for streak badges
    if (newStreak >= 3 && !user.badges.includes('streak_3')) {
        newBadges.push('streak_3');
    }
    if (newStreak >= 7 && !user.badges.includes('streak_7')) {
        newBadges.push('streak_7');
    }
    if (newStreak >= 30 && !user.badges.includes('streak_30')) {
        newBadges.push('streak_30');
    }

    // Check for perfect score badge
    if (score === 100 && !user.badges.includes('perfect_score')) {
        newBadges.push('perfect_score');
    }

    // Check for speed demon badge (under 10 minutes = 600 seconds)
    if (timeSpent < 600 && !user.badges.includes('speed_demon')) {
        newBadges.push('speed_demon');
    }

    // Update user
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: user.xp + xpEarned,
            currentStreak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
            lastPracticeAt: now,
            badges: [...user.badges, ...newBadges],
            totalMocksCompleted: user.totalMocksCompleted + 1,
        },
    });

    return {
        xpEarned,
        newBadges,
        streakUpdated,
    };
}
