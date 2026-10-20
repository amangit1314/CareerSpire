"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ProblemStatus } from "@prisma/client";
import { Verdict } from "@/lib/code-runner";
import { getPracticeFacets } from "./problems";
import { LeaderboardScope } from "./shared";
import type {
  LeaderboardEntry,
  DailyChallengeInfo,
  UserPracticeStats,
  PracticePageData,
} from "./shared";

// ---------------------------------------------------------------------------
// Read: leaderboard
// ---------------------------------------------------------------------------

export async function getLeaderboard(
  scope: LeaderboardScope = LeaderboardScope.ALL_TIME,
  limit: number = 50,
): Promise<LeaderboardEntry[]> {
  const currentUserId = await getCurrentUserId();

  if (scope === LeaderboardScope.ALL_TIME) {
    const users = await prisma.user.findMany({
      orderBy: [{ xp: "desc" }, { problemsSolvedCount: "desc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        problemsSolvedCount: true,
        currentStreak: true,
      },
    });
    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      image: u.image,
      xp: u.xp,
      problemsSolved: u.problemsSolvedCount,
      currentStreak: u.currentStreak,
      isYou: u.id === currentUserId,
    }));
  }

  // Weekly = aggregate AC submissions in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekly = await prisma.practiceSubmission.groupBy({
    by: ["userId"],
    where: { submittedAt: { gte: weekAgo }, verdict: Verdict.ACCEPTED },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  if (weekly.length === 0) return [];

  const userRows = await prisma.user.findMany({
    where: { id: { in: weekly.map((w) => w.userId) } },
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      problemsSolvedCount: true,
      currentStreak: true,
    },
  });
  const byId = new Map(userRows.map((u) => [u.id, u]));

  return weekly.map((w, i) => {
    const u = byId.get(w.userId);
    return {
      rank: i + 1,
      userId: w.userId,
      name: u?.name ?? null,
      image: u?.image ?? null,
      xp: u?.xp ?? 0,
      problemsSolved: w._count.id, // weekly solves
      currentStreak: u?.currentStreak ?? 0,
      isYou: w.userId === currentUserId,
    };
  });
}

// ---------------------------------------------------------------------------
// Read: daily challenge
// ---------------------------------------------------------------------------

export async function getDailyChallenge(): Promise<DailyChallengeInfo | null> {
  const userId = await getCurrentUserId();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const challenge = await prisma.dailyChallenge.findUnique({
    where: { date: today },
  });
  if (!challenge) return null;

  const q = await prisma.question.findUnique({
    where: { id: challenge.questionId },
    select: { id: true, title: true, difficulty: true, tags: true },
  });
  if (!q) return null;

  let solved = false;
  if (userId) {
    const p = await prisma.userProblemProgress.findUnique({
      where: { userId_questionId: { userId, questionId: q.id } },
      select: { status: true, firstSolvedAt: true },
    });
    // Counted as "solved today" if status is SOLVED AND firstSolvedAt is today OR solved today
    solved =
      p?.status === ProblemStatus.SOLVED &&
      !!p.firstSolvedAt &&
      p.firstSolvedAt >= today;
  }

  return {
    date: today.toISOString().slice(0, 10),
    questionId: q.id,
    title: q.title,
    difficulty: q.difficulty,
    tags: q.tags,
    solved,
  };
}

// ---------------------------------------------------------------------------
// Read: user practice stats (for hero ribbon)
// ---------------------------------------------------------------------------

export async function getUserPracticeStats(): Promise<UserPracticeStats> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      isAnonymous: true,
      xp: 0,
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      problemsSolved: 0,
      rank: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      coins: true,
      currentStreak: true,
      longestStreak: true,
      problemsSolvedCount: true,
    },
  });
  if (!user) {
    return {
      isAnonymous: false,
      xp: 0,
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      problemsSolved: 0,
      rank: null,
    };
  }

  // Rank = 1 + count of users with strictly more XP
  const higher = await prisma.user.count({
    where: { xp: { gt: user.xp } },
  });

  return {
    isAnonymous: false,
    xp: user.xp,
    coins: user.coins,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    problemsSolved: user.problemsSolvedCount,
    rank: higher + 1,
  };
}

// ---------------------------------------------------------------------------
// Consolidated: fetch all static practice page data in one round trip
// ---------------------------------------------------------------------------

export async function getPracticePageData(): Promise<PracticePageData> {
  const [facets, stats, daily, leaderboard] = await Promise.all([
    getPracticeFacets(),
    getUserPracticeStats(),
    getDailyChallenge(),
    getLeaderboard(LeaderboardScope.WEEKLY, 5),
  ]);
  return { facets, stats, daily, leaderboard };
}
