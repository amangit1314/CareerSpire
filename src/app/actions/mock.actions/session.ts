'use server';

import { prisma } from '@/lib/prisma';
import { MockSessionStatus, QuestionType } from '@/types/enums';
import type { MockSession } from '@/types';
import { getSignedUrl } from '@/lib/supabase/storage';
import type { Question as PrismaQuestion } from '@prisma/client';
import { mapQuestion, mapMockResult, type PrismaMockResultWithQuestion } from './shared';

export async function getMockSessionAction(
  userId: string,
  sessionId: string
): Promise<MockSession> {
  const session = await prisma.mockSession.findFirst({
    where: { id: sessionId, userId },
    include: { results: { include: { question: true } } },
  });

  if (!session) throw new Error('Session not found');

  const dbQuestions = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
  });

  // Maintain order by questionIds
  const questions = session.questionIds
    .map((id) => dbQuestions.find((q) => q.id === id))
    .filter((q): q is PrismaQuestion => q !== undefined)
    .map(mapQuestion);

  return {
    id: session.id,
    userId: session.userId,
    questionIds: session.questionIds,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: session.interviewType as QuestionType,
    questions,
    hrQuestions: session.hrQuestions as unknown as MockSession['hrQuestions'],
    codingQuestions: session.codingQuestions as unknown as MockSession['codingQuestions'],
    videoRecordingUrl: session.videoRecordingUrl
      ? await getSignedUrl(session.videoRecordingUrl).catch(() => undefined)
      : undefined,
    isPublic: session.isPublic,
    results: (session.results as PrismaMockResultWithQuestion[]).map(mapMockResult),
  };
}
