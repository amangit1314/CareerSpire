'use server';

import { prisma } from '@/lib/prisma';
import { MockSessionStatus } from '@/types/enums';
import type { SubmitSolutionRequest, MockResult } from '@/types';
import { generateFeedback } from '@/lib/ai/llm';
import type { Feedback } from '@/lib/ai/llm';
import { AppError } from '@/lib/errors';
import { runTests } from '@/lib/code-runner';
import type { TestResult } from '@/lib/code-runner';
import type { MockResult as PrismaMockResult, Prisma } from '@prisma/client';
import { mapQuestion } from './shared';

export async function submitSolutionAction(
  userId: string,
  data: SubmitSolutionRequest
): Promise<MockResult> {
  const session = await prisma.mockSession.findFirst({
    where: { id: data.sessionId, userId },
  });
  if (!session) throw new AppError('Session not found', 'NOT_FOUND', 404);

  const questionRecord = await prisma.question.findUnique({
    where: { id: data.questionId },
  });
  if (!questionRecord) throw new AppError('Question not found', 'NOT_FOUND', 404);

  const question = mapQuestion(questionRecord);

  // Run tests (only for DSA/CODING with language)
  let testResults: TestResult = { passed: 0, total: 0, verdict: 'AC', details: [] };
  if (question.type === 'DSA' || (question.type === 'CODING' && (question.language || data.language))) {
    const lang = (data.language || question.language || 'JAVASCRIPT').toLowerCase() as 'javascript' | 'python' | 'java' | 'cpp';
    testResults = await runTests(data.code, question, lang);
  }

  // Generate feedback
  const feedback = await generateFeedback(
    {
      title: question.title,
      description: question.description,
      topic: question.topic,
      codeSnippet: question.codeSnippet,
      expectedAnswerFormat: question.expectedAnswerFormat,
    },
    data.code,
    { passed: testResults.passed, total: testResults.total },
    data.timeSpent || 0
  );

  // Calculate score
  const hasTests = testResults.total > 0;
  const testScore = hasTests
    ? (testResults.passed / testResults.total) * 40
    : (testResults.verdict === 'AC' ? 40 : 0);
  const codeQualityScore = (feedback.codeQuality / 100) * 30;
  const timeScore = Math.max(0, 20 - (data.timeSpent / 60) * 2);
  const finalScore = Math.round(testScore + codeQualityScore + timeScore);

  // Save result
  const result = await prisma.mockResult.create({
    data: {
      sessionId: data.sessionId,
      questionId: data.questionId,
      userCode: data.code,
      testResults: JSON.parse(JSON.stringify(testResults)) as Prisma.InputJsonValue,
      score: finalScore,
      feedback: JSON.parse(JSON.stringify(feedback)) as Prisma.InputJsonValue,
      timeSpent: data.timeSpent || 0,
    },
  });

  // Check completion
  const allResults = await prisma.mockResult.findMany({
    where: { sessionId: data.sessionId },
  });

  const totalQuestionsCount = session.questionIds?.length || 0;
  const isCompleted = allResults.length >= totalQuestionsCount && totalQuestionsCount > 0;

  if (isCompleted) {
    await handleMockCompletion(data.sessionId, userId, allResults, feedback);
  }

  return {
    id: result.id,
    sessionId: result.sessionId,
    questionId: result.questionId,
    userCode: result.userCode,
    testResults: result.testResults as unknown as MockResult['testResults'],
    score: result.score,
    feedback: result.feedback as unknown as MockResult['feedback'],
    timeSpent: result.timeSpent,
    submittedAt: result.submittedAt,
    question,
  };
}

/** Handle post-completion: status update, XP, notification */
async function handleMockCompletion(
  sessionId: string,
  userId: string,
  allResults: PrismaMockResult[],
  feedback: Feedback
): Promise<void> {
  await prisma.mockSession.update({
    where: { id: sessionId },
    data: { status: MockSessionStatus.COMPLETED, completedAt: new Date() },
  });

  const avgScore = Math.round(
    allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
  );

  // Award XP
  try {
    const { awardXP } = await import('../gamification.actions');
    const totalTime = allResults.reduce((sum, r) => sum + r.timeSpent, 0);
    const rewards = await awardXP(userId, avgScore, totalTime);
    console.log(`[Gamification] User ${userId} earned ${rewards.xpEarned} XP, badges: ${rewards.newBadges.join(', ')}`);
  } catch (err) {
    console.error('Failed to award XP:', err);
  }

  // Send notification
  try {
    const { sendMockResultNotification } = await import('../notification.actions');
    await sendMockResultNotification(userId, sessionId, avgScore, feedback.improvements.join('. '));
  } catch (err) {
    console.error('Failed to send mock result notification:', err);
  }
}
