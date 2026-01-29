'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty, QuestionType, MockSessionStatus, ProgrammingLanguage, Framework, QuestionFormat, AnswerFormat } from '@/types/enums';
import type { StartMockRequest, MockSession, SubmitSolutionRequest } from '@/types';
import { generateDSAQuestions, generateCodingQuestions, generateHRQuestions, generateFeedback, normalizeEnum } from '@/lib/llm';
import { AppError } from '@/lib/errors';
import { runTests } from '@/lib/code-runner';
import { getSignedUrl } from '@/lib/supabase/storage';
import type { MockResult } from '@/types';

export async function startMockAction(
  userId: string,
  data: StartMockRequest
): Promise<MockSession> {

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);

  // Validation
  if (data.type === 'CODING' && !data.language) {
    throw new AppError('Language is required for coding interview', 'INVALID_INPUT', 400);
  }
  if (data.framework && !data.language) {
    throw new AppError('Framework selection requires a language', 'INVALID_INPUT', 400);
  }

  // Free tier usage
  // if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining <= 0) {
  //   throw new AppError('No mocks remaining. Please upgrade your plan.', 'NO_MOCKS_REMAINING', 403);
  // }

  const difficulty =
    data.difficulty ||
    (user.level === 'FRESHER' ? Difficulty.EASY :
      user.level === 'INTERMEDIATE' ? Difficulty.MEDIUM : Difficulty.HARD);

  // Branch by type
  if (data.type === QuestionType.DSA) {
    return await startDSAMock(userId, difficulty, user);
  }

  if (data.type === QuestionType.CODING) {
    return await startCodingMock(userId, difficulty, data, user);
  }

  if (data.type === QuestionType.HR) {
    return await startHRMock(userId, difficulty, user);
  }

  throw new AppError('Unsupported mock type', 'INVALID_INPUT', 400);
}

async function startDSAMock(
  userId: string,
  difficulty: Difficulty,
  user: any
): Promise<MockSession> {

  let questions = await prisma.question.findMany({
    where: { type: QuestionType.DSA, difficulty: difficulty as any },
    take: 10,
  });

  if (questions.length < 3) {
    const aiQuestions = await generateDSAQuestions({ difficulty });
    for (const q of aiQuestions) {
      const saved = await prisma.question.create({
        data: {
          title: q.title,
          description: `${q.statement}\n\n### Examples\n${q.examples.map((ex: any, i: number) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`).join('\n\n')}\n\n### Constraints\n${q.constraints?.map((c: string) => `- ${c}`).join('\n') || 'None'}`,
          topic: q.tags[0] || 'DSA',
          difficulty: difficulty as any,
          type: 'DSA',
          tags: q.tags,
          testCases: q.examples.map((ex: any) => ({
            input: ex.input,
            expectedOutput: ex.output,
            isHidden: false
          })),
          expectedComplexity: q.expectedComplexity.time,
          hints: q.hints || [],
          starterCode: q.starterCode,
          entryFunctionName: q.entryPoint,
        } as any
      }).catch((err) => {
        console.error('Failed to save AI question:', err);
        return null;
      });
      if (saved) questions.push(saved);
    }
  }

  if (questions.length === 0) {
    throw new AppError('Failed to generate DSA questions', 'AI_GENERATION_FAILED', 503);
  }

  const selected = questions.sort(() => Math.random() - 0.5).slice(0, 3);

  const session = await prisma.mockSession.create({
    data: {
      userId,
      status: 'IN_PROGRESS',
      interviewType: 'DSA',
      questionIds: selected.map(q => q.id),
    },
  });

  if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
    });
  }

  return {
    id: session.id,
    userId,
    questionIds: selected.map(q => q.id),
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: QuestionType.DSA,
    questions: selected.map(q => ({
      ...q,
      difficulty: q.difficulty as unknown as Difficulty,
      type: q.type as unknown as QuestionType,
      language: q.language as unknown as ProgrammingLanguage | null,
      framework: q.framework as unknown as Framework | null,
      questionFormat: q.questionFormat as unknown as QuestionFormat,
      expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
      testCases: (q.testCases || []) as any[],
    })),
    results: [],
  };
}

async function startCodingMock(
  userId: string,
  difficulty: Difficulty,
  data: StartMockRequest,
  user: any
): Promise<MockSession> {

  const count = 12;

  const aiQuestions = await generateCodingQuestions({
    language: data.language!,
    framework: data.framework || null,
    difficulty,
    count
  });

  console.log(`[MockAction] Final batching results: ${aiQuestions.length} Coding questions generated.`);

  const savedQuestions = [];
  for (const q of aiQuestions) {
    // Normalization check for DB
    const lang = normalizeEnum(q.language, ProgrammingLanguage) || data.language;
    const fw = normalizeEnum(q.framework, Framework) || data.framework || 'NONE';

    const saved = await prisma.question.create({
      data: {
        title: q.title || `${lang} ${fw !== 'NONE' ? fw : ''} Coding Task`,
        description: `${q.question}${q.examples && q.examples.length > 0 ? `\n\n### Examples\n${q.examples.map((ex: any, i: number) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`).join('\n\n')}` : ''}${q.constraints && q.constraints.length > 0 ? `\n\n### Constraints\n${q.constraints.map((c: string) => `- ${c}`).join('\n')}` : ''}`,
        topic: q.tags?.[0] || 'Coding',
        difficulty: (normalizeEnum(q.difficulty, Difficulty) || difficulty) as any,
        type: 'CODING',
        language: lang as any,
        framework: fw as any,
        questionFormat: q.questionFormat as any,
        expectedAnswerFormat: q.expectedAnswerFormat as any,
        codeSnippet: q.codeSnippet,
        tags: q.tags || [],
        hints: q.followUps || [],
        expectedTimeMinutes: q.expectedTimeMinutes || 10,
        source: 'AI'
      }
    }).catch(err => {
      console.error('[MockAction] Failed to save individual coding question:', err.message);
      return null;
    });
    if (saved) savedQuestions.push(saved);
  }

  console.log(`[MockAction] Successfully persisted ${savedQuestions.length}/${aiQuestions.length} questions to DB.`);

  if (savedQuestions.length === 0) {
    throw new AppError('The AI was unable to generate valid questions for this mock. Please try again or choose a different topic.', 'AI_GENERATION_FAILED', 503);
  }

  const session = await prisma.mockSession.create({
    data: {
      userId,
      status: 'IN_PROGRESS',
      interviewType: 'CODING',
      difficulty: difficulty as any,
      language: data.language as any,
      framework: data.framework as any,
      questionIds: savedQuestions.map(q => q.id),
    },
  });

  if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
    });
  }

  return {
    id: session.id,
    userId,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: QuestionType.CODING,
    questions: savedQuestions.map(q => ({
      ...q,
      difficulty: q.difficulty as unknown as Difficulty,
      type: q.type as unknown as QuestionType,
      language: q.language as unknown as ProgrammingLanguage | null,
      framework: q.framework as unknown as Framework | null,
      questionFormat: q.questionFormat as unknown as QuestionFormat,
      expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
      testCases: (q.testCases || []) as any[],
    })),
    results: [],
  };
}

async function startHRMock(
  userId: string,
  difficulty: Difficulty,
  user: any
): Promise<MockSession> {

  const count = 7;

  const aiQuestions = await generateHRQuestions({
    difficulty,
    count
  });

  console.log(`[MockAction] Final batching results: ${aiQuestions.length} HR questions generated.`);

  const savedQuestions = [];
  for (const q of aiQuestions) {
    const saved = await prisma.question.create({
      data: {
        title: `${q.category || 'Behavioral'} Question`,
        description: q.question,
        topic: q.category || 'HR',
        difficulty: difficulty as any,
        type: 'HR',
        hints: [q.guidance].filter(Boolean),
        expectedTimeMinutes: q.expectedTimeMinutes || 10,
        source: 'AI'
      }
    }).catch(err => {
      console.error('[MockAction] Failed to save individual HR question:', err.message);
      return null;
    });
    if (saved) savedQuestions.push(saved);
  }

  console.log(`[MockAction] Successfully persisted ${savedQuestions.length}/${aiQuestions.length} questions to DB.`);

  if (savedQuestions.length === 0) {
    throw new AppError('The AI was unable to generate behavioral questions. Please try again.', 'AI_GENERATION_FAILED', 503);
  }

  const session = await prisma.mockSession.create({
    data: {
      userId,
      status: 'IN_PROGRESS',
      interviewType: 'HR',
      difficulty: difficulty as any,
      questionIds: savedQuestions.map(q => q.id),
    },
  });

  if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
    });
  }

  return {
    id: session.id,
    userId,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: QuestionType.HR,
    questions: savedQuestions.map(q => ({
      ...q,
      difficulty: q.difficulty as unknown as Difficulty,
      type: q.type as unknown as QuestionType,
      language: q.language as unknown as ProgrammingLanguage | null,
      framework: q.framework as unknown as Framework | null,
      questionFormat: q.questionFormat as unknown as QuestionFormat,
      expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
      testCases: (q.testCases || []) as any[],
    })),
    results: [],
  };
}

export async function getMockSessionAction(
  userId: string,
  sessionId: string
): Promise<MockSession> {
  const session: any = await prisma.mockSession.findFirst({
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

  // Handle different interview types - Now unified as all types save questions to DB
  const dbQuestions = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
  });

  // Maintain order by questionIds
  const questions = session.questionIds
    .map((id: string) => dbQuestions.find((q: any) => q.id === id))
    .filter(Boolean)
    .map((q: any) => ({
      ...q,
      difficulty: q.difficulty as unknown as Difficulty,
      type: q.type as unknown as QuestionType,
      language: q.language as unknown as ProgrammingLanguage | null,
      framework: q.framework as unknown as Framework | null,
      questionFormat: q.questionFormat as unknown as QuestionFormat,
      expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
      codeSnippet: q.codeSnippet,
      testCases: (q.testCases || []) as any[],
    }));

  return {
    id: session.id,
    userId: session.userId,
    questionIds: session.questionIds,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: session.interviewType as QuestionType,
    questions,
    hrQuestions: session.hrQuestions as any,
    codingQuestions: session.codingQuestions as any,
    videoRecordingUrl: session.videoRecordingUrl ? await getSignedUrl(session.videoRecordingUrl).catch(() => undefined) : undefined,
    isPublic: session.isPublic,
    results: session.results.map((r: any) => ({
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
        framework: r.question.framework as any,
        questionFormat: r.question.questionFormat as QuestionFormat,
        expectedAnswerFormat: r.question.expectedAnswerFormat as AnswerFormat,
        codeSnippet: r.question.codeSnippet,
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
  const session: any = await prisma.mockSession.findFirst({
    where: {
      id: data.sessionId,
      userId,
    },
  });

  if (!session) {
    throw new AppError('Session not found', 'NOT_FOUND', 404);
  }

  // Get question from DB (all types now save there)
  const questionRecord = await prisma.question.findUnique({
    where: { id: data.questionId },
  });

  if (!questionRecord) {
    throw new AppError('Question not found', 'NOT_FOUND', 404);
  }

  const question = {
    ...questionRecord,
    difficulty: questionRecord.difficulty as unknown as Difficulty,
    type: questionRecord.type as unknown as QuestionType,
    language: questionRecord.language as unknown as ProgrammingLanguage | null,
    framework: questionRecord.framework as unknown as Framework | null,
    questionFormat: questionRecord.questionFormat as unknown as QuestionFormat,
    expectedAnswerFormat: questionRecord.expectedAnswerFormat as unknown as AnswerFormat,
    testCases: (questionRecord.testCases || []) as any[],
  };

  if (!question) {
    throw new AppError('Question not found', 'NOT_FOUND', 404);
  }

  // Run tests (only for DSA/CODING with language)
  let testResults: any = { passed: 0, total: 1, details: [] };
  if (question.type === 'DSA' || (question.type === 'CODING' && (question.language || data.language))) {
    // Use user-selected language if available, otherwise fallback to question language
    const lang = (data.language || question.language || 'JAVASCRIPT').toLowerCase();

    testResults = await runTests(
      data.code,
      question,
      lang as any
    );
  }

  // Generate feedback using LLM
  const feedback = await generateFeedback(
    {
      title: question.title,
      description: question.description,
      topic: question.topic,
      codeSnippet: question.codeSnippet,
      expectedAnswerFormat: question.expectedAnswerFormat,
    },
    data.code,
    {
      passed: testResults.passed,
      total: testResults.total,
    },
    data.timeSpent || 0
  );

  // Calculate score
  const testScore = (testResults.passed / (testResults.total || 1)) * 40;
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
  });

  // Check if all questions are done
  const allResults = await prisma.mockResult.findMany({
    where: { sessionId: data.sessionId },
  });

  let totalQuestionsCount = 0;
  if (session.interviewType === 'DSA') {
    totalQuestionsCount = session.questionIds.length;
  } else if (session.interviewType === 'CODING') {
    totalQuestionsCount = (session.codingQuestions as any[] || []).length;
  } else if (session.interviewType === 'HR') {
    totalQuestionsCount = (session.hrQuestions as any[] || []).length;
  }

  const isCompleted = allResults.length >= totalQuestionsCount && totalQuestionsCount > 0;

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
      id: question.id,
      title: question.title,
      description: question.description,
      topic: question.topic,
      difficulty: question.difficulty as Difficulty,
      type: question.type as QuestionType,
      language: question.language as any,
      framework: question.framework as any,
      questionFormat: question.questionFormat as QuestionFormat,
      expectedAnswerFormat: question.expectedAnswerFormat as AnswerFormat,
      codeSnippet: question.codeSnippet,
      testCases: question.testCases as any,
      expectedComplexity: question.expectedComplexity,
      hints: question.hints,
      createdAt: (question as any).createdAt || new Date(),
    },
  };
}
