'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty, QuestionType, MockSessionStatus } from '@/types/enums';
import type { StartMockRequest, MockSession, SubmitSolutionRequest, MockResult } from '@/types';
import { generateAIQuestions, generateFeedback } from '@/lib/llm';
import { AppError } from '@/lib/errors';
import { runTests } from '@/lib/code-runner';

export async function startMockAction(
  userId: string,
  data: StartMockRequest
): Promise<MockSession> {
  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Check if user has mocks remaining
  if (user.freeMocksRemaining <= 0 && user.subscriptionTier === 'FREE') {
    throw new AppError('No mocks remaining. Please upgrade your plan.', 'NO_MOCKS_REMAINING', 403);
  }

  // Determine difficulty based on user level
  const difficulty = data.difficulty ||
    (user.level === 'FRESHER' ? Difficulty.EASY :
      user.level === 'INTERMEDIATE' ? Difficulty.MEDIUM : Difficulty.HARD);

  // Build query
  const where: any = {
    difficulty,
  };

  if (data.type) {
    where.type = data.type;
  }

  // 1. Try to get questions from DB
  let questions = await prisma.question.findMany({
    where,
    take: 10,
  });

  // 2. If no questions, generate with AI
  if (questions.length < 3) {
    console.log(`startMockAction: Not enough questions (${questions.length}). Generating with AI...`);
    try {
      // Set a lower timeout for generation to avoid hanging the entire request
      const aiQuestions = await generateAIQuestions({
        difficulty,
        type: data.type || QuestionType.CODING,
        count: 5,
        topics: user.weakTopics,
      });

      if (aiQuestions && aiQuestions.length > 0) {
        console.log(`startMockAction: AI generated ${aiQuestions.length} questions. Saving to DB...`);

        // Save AI questions to DB for future use - handle each one individually to avoid total failure on timeout
        const savedBatch = [];
        for (const q of aiQuestions) {
          try {
            const saved = await prisma.question.create({
              data: {
                title: q.title,
                description: q.description,
                topic: q.topic,
                difficulty: q.difficulty as any,
                type: q.type as any,
                language: q.language as any,
                testCases: q.testCases as any,
                expectedComplexity: q.expectedComplexity,
                hints: q.hints,
              },
            });
            savedBatch.push(saved);
          } catch (dbError) {
            console.error(`startMockAction: Failed to save individual AI question "${q.title}":`, dbError instanceof Error ? dbError.message : 'Connection Error');
            // If we can't save it, we can't use it in a session (since sessions reference DB IDs)
            // But we continue to try others
          }
        }

        if (savedBatch.length > 0) {
          questions = [...questions, ...savedBatch];
        }
      }
    } catch (error) {
      console.error('startMockAction: AI Generation process failed:', error);
    }
  }

  if (questions.length === 0) {
    throw new AppError(
      'We had trouble generating questions for this interview. Please try a different topic or try again in a moment.',
      'AI_GENERATION_FAILED',
      503 // Service Unavailable
    );
  }

  const selected = questions.sort(() => Math.random() - 0.5).slice(0, 3);

  const session = await prisma.mockSession.create({
    data: {
      userId,
      questionIds: selected.map((q) => q.id),
      status: MockSessionStatus.IN_PROGRESS,
    },
  });

  // Decrement free mocks if on free tier
  if (user.freeMocksRemaining > 0 && user.subscriptionTier === 'FREE') {
    await prisma.user.update({
      where: { id: userId },
      data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
    });
  }

  return {
    id: session.id,
    userId: session.userId,
    questionIds: session.questionIds,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    questions: selected.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      topic: q.topic,
      difficulty: q.difficulty as Difficulty,
      type: q.type as QuestionType,
      language: q.language as any,
      testCases: q.testCases as any,
      expectedComplexity: q.expectedComplexity,
      hints: q.hints,
      createdAt: q.createdAt,
    })),
  };
}

export async function getMockSessionAction(
  userId: string,
  sessionId: string
): Promise<MockSession> {
  const session = await prisma.mockSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      results: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Get questions
  const questions = await prisma.question.findMany({
    where: {
      id: { in: session.questionIds },
    },
  });

  return {
    id: session.id,
    userId: session.userId,
    questionIds: session.questionIds,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    questions: questions.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      topic: q.topic,
      difficulty: q.difficulty as Difficulty,
      type: q.type as QuestionType,
      language: q.language as any,
      testCases: q.testCases as any,
      expectedComplexity: q.expectedComplexity,
      hints: q.hints,
      createdAt: q.createdAt,
    })),
    results: session.results.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      questionId: r.questionId,
      userCode: r.userCode,
      testResults: r.testResults as any,
      score: r.score,
      feedback: r.feedback as any,
      timeSpent: r.timeSpent,
      submittedAt: r.submittedAt,
      question: {
        id: r.question.id,
        title: r.question.title,
        description: r.question.description,
        topic: r.question.topic,
        difficulty: r.question.difficulty as Difficulty,
        type: r.question.type as QuestionType,
        language: r.question.language as any,
        testCases: r.question.testCases as any,
        expectedComplexity: r.question.expectedComplexity,
        hints: r.question.hints,
        createdAt: r.question.createdAt,
      },
    })),
  };
}

export async function submitSolutionAction(
  userId: string,
  data: SubmitSolutionRequest
): Promise<MockResult> {
  // Verify session belongs to user
  const session = await prisma.mockSession.findFirst({
    where: {
      id: data.sessionId,
      userId,
    },
  });

  if (!session) {
    throw new AppError('Session not found', 'NOT_FOUND', 404);
  }

  // Get question
  const question = await prisma.question.findUnique({
    where: { id: data.questionId },
  });

  if (!question) {
    throw new AppError('Question not found', 'NOT_FOUND', 404);
  }

  // Run tests
  const testResults = await runTests(
    data.code,
    {
      id: question.id,
      title: question.title,
      description: question.description,
      topic: question.topic,
      difficulty: question.difficulty as Difficulty,
      type: question.type as QuestionType,
      language: question.language as any,
      testCases: question.testCases as any,
      expectedComplexity: question.expectedComplexity,
      hints: question.hints,
      createdAt: question.createdAt,
    },
    question.language === 'PYTHON' ? 'python' : 'javascript'
  );

  // Generate feedback using LLM
  const feedback = await generateFeedback(
    {
      title: question.title,
      description: question.description,
      topic: question.topic,
    },
    data.code,
    {
      passed: testResults.passed,
      total: testResults.total,
    },
    data.timeSpent || 0
  );

  // Calculate score
  const testScore = (testResults.passed / testResults.total) * 40;
  const codeQualityScore = (feedback.codeQuality / 100) * 30;
  const timeScore = Math.max(0, 20 - (data.timeSpent / 60) * 2);
  const finalScore = Math.round(testScore + codeQualityScore + timeScore);

  // Save result
  const result = await prisma.mockResult.create({
    data: {
      sessionId: data.sessionId,
      questionId: data.questionId,
      userCode: data.code,
      testResults: testResults as any,
      score: finalScore,
      feedback: feedback as any,
      timeSpent: data.timeSpent || 0,
    },
    include: {
      question: true,
    },
  });

  // Check if all questions are done
  const allResults = await prisma.mockResult.findMany({
    where: { sessionId: data.sessionId },
  });

  const isCompleted = allResults.length >= session.questionIds.length;

  if (isCompleted) {
    await prisma.mockSession.update({
      where: { id: data.sessionId },
      data: {
        status: MockSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Award XP and update gamification stats
    try {
      const { awardXP } = await import('./gamification.actions');
      const avgScore = Math.round(
        allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
      );
      const totalTime = allResults.reduce((sum, r) => sum + r.timeSpent, 0);
      const rewards = await awardXP(userId, avgScore, totalTime);
      console.log(`[Gamification] User ${userId} earned ${rewards.xpEarned} XP, badges: ${rewards.newBadges.join(', ')}`);
    } catch (gamifError) {
      console.error('Failed to award XP:', gamifError);
    }

    // Send notification when mock is completed
    try {
      const { sendMockResultNotification } = await import('./notification.actions');
      const avgScore = Math.round(
        allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
      );
      await sendMockResultNotification(
        userId,
        data.sessionId,
        avgScore,
        feedback.improvements.join('. ')
      );
    } catch (notifError) {
      console.error('Failed to send mock result notification:', notifError);
    }
  }

  return {
    id: result.id,
    sessionId: result.sessionId,
    questionId: result.questionId,
    userCode: result.userCode,
    testResults: result.testResults as any,
    score: result.score,
    feedback: result.feedback as any,
    timeSpent: result.timeSpent,
    submittedAt: result.submittedAt,
    question: {
      id: result.question.id,
      title: result.question.title,
      description: result.question.description,
      topic: result.question.topic,
      difficulty: result.question.difficulty as Difficulty,
      type: result.question.type as QuestionType,
      language: result.question.language as any,
      testCases: result.question.testCases as any,
      expectedComplexity: result.question.expectedComplexity,
      hints: result.question.hints,
      createdAt: result.question.createdAt,
    },
  };
}
