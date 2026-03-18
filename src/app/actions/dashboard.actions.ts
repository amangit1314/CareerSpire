'use server';

import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import type { DashboardStats } from '@/types';
import { SubscriptionTier } from '@/types/enums';

export async function getDashboardStatsAction(userId: string): Promise<DashboardStats> {
  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get all sessions
  const sessions = await prisma.mockSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  // Get all results
  const allResults = await prisma.mockResult.findMany({
    where: {
      sessionId: { in: sessions.map((s) => s.id) },
    },
    include: {
      question: true,
    },
  });

  // Calculate stats
  const totalMocks = sessions.length;
  const completedMocks = sessions.filter((s) => s.status === 'COMPLETED').length;

  const scores = allResults.map((r) => r.score);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  // Weak topics
  const topicScores: Record<string, number[]> = {};
  allResults.forEach((result) => {
    const topic = result.question.topic;
    if (!topicScores[topic]) {
      topicScores[topic] = [];
    }
    topicScores[topic].push(result.score);
  });

  const topicAverages = Object.entries(topicScores).map(([topic, scores]) => ({
    topic,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  const weakTopics = topicAverages
    .sort((a, b) => a.average - b.average)
    .slice(0, 3)
    .map((t) => t.topic);

  // Recent mocks
  const recentMocks = sessions.slice(0, 5).map((session) => {
    const sessionResults = allResults.filter((r) => r.sessionId === session.id);
    const sessionScore =
      sessionResults.length > 0
        ? Math.round(
          sessionResults.reduce((sum, r) => sum + r.score, 0) / sessionResults.length
        )
        : 0;

    return {
      id: session.id,
      score: sessionScore,
      date: session.startedAt,
      questions: session.questionIds.length,
    };
  });

  // Score trend
  const trendData = sessions
    .slice(0, 10)
    .reverse()
    .map((session) => {
      const sessionResults = allResults.filter((r) => r.sessionId === session.id);
      const sessionScore =
        sessionResults.length > 0
          ? Math.round(
            sessionResults.reduce((sum, r) => sum + r.score, 0) / sessionResults.length
          )
          : 0;

      return {
        date: format(session.startedAt, 'MMM dd'),
        score: sessionScore,
      };
    });

  return {
    totalMocks,
    completedMocks,
    averageScore,
    weakTopics,
    recentMocks,
    scoreTrend: trendData,
    freeMocksRemaining: user.freeMocksRemaining,
    subscriptionTier: user.subscriptionTier as SubscriptionTier | null,
  };
}
