'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty, QuestionType, MockSessionStatus, ProgrammingLanguage, Framework, QuestionFormat, AnswerFormat } from '@/types/enums';
import type { StartMockRequest, MockSession, SubmitSolutionRequest } from '@/types';
import { generateDSAQuestions, generateCodingQuestions, generateHRQuestions, generateFeedback, normalizeEnum } from '@/lib/llm';
import { AppError } from '@/lib/errors';
import { runTests } from '@/lib/code-runner';
import { getSignedUrl } from '@/lib/supabase/storage';
import { generateAndCacheQuestionBank, getQuestionsFromBank } from '@/lib/question-bank';
import type { MockResult } from '@/types';

// ============ Shared Helpers (DRY) ============

/** Map a Prisma question record to the typed Question shape */
function mapQuestion(q: any) {
  return {
    ...q,
    difficulty: q.difficulty as unknown as Difficulty,
    type: q.type as unknown as QuestionType,
    language: q.language as unknown as ProgrammingLanguage | null,
    framework: q.framework as unknown as Framework | null,
    questionFormat: q.questionFormat as unknown as QuestionFormat,
    expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
    testCases: (q.testCases || []) as any[],
  };
}

/** Map a Prisma mock result + nested question to the typed MockResult shape */
function mapMockResult(r: any): MockResult {
  return {
    id: r.id,
    sessionId: r.sessionId,
    questionId: r.questionId,
    userCode: r.userCode,
    testResults: r.testResults as any,
    score: r.score,
    feedback: r.feedback as any,
    timeSpent: r.timeSpent,
    submittedAt: r.submittedAt,
    ...(r.question && { question: mapQuestion(r.question) }),
  };
}

/** Deduct one free mock if user is on free tier */
async function deductFreeMock(userId: string, user: any): Promise<void> {
  if (user.subscriptionTier === 'FREE' && user.freeMocksRemaining > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
    });
  }
}

/** Create a MockSession and return the typed response */
async function createMockSession(
  userId: string,
  interviewType: string,
  questions: any[],
  user: any,
  opts?: { difficulty?: Difficulty; language?: any; framework?: any }
): Promise<MockSession> {
  const session = await prisma.mockSession.create({
    data: {
      userId,
      status: 'IN_PROGRESS',
      interviewType,
      questionIds: questions.map((q: any) => q.id),
      ...(opts?.difficulty && { difficulty: opts.difficulty as any }),
      ...(opts?.language && { language: opts.language as any }),
      ...(opts?.framework && { framework: opts.framework as any }),
    },
  });

  await deductFreeMock(userId, user);

  return {
    id: session.id,
    userId,
    questionIds: questions.map((q: any) => q.id),
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: interviewType as QuestionType,
    questions: questions.map(mapQuestion),
    results: [],
  };
}

/** Filter cached questions by difficulty, pick random subset */
function selectFromPool(questions: any[], difficulty: Difficulty, count: number): any[] {
  const byDifficulty = questions.filter(
    (q: any) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
  );
  const pool = byDifficulty.length >= count ? byDifficulty : questions;
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

/** Save question bank items as Question records in DB, returns saved records */
async function saveBankQuestionsToDb(
  questions: any[],
  type: string,
  difficulty: Difficulty,
  opts?: { language?: any; framework?: any }
): Promise<any[]> {
  const saved = [];
  for (const q of questions) {
    const record = await prisma.question.create({
      data: {
        title: q.question?.substring(0, 100) || `${type} Question`,
        description: q.question || q.answer_guide || '',
        topic: q.topic || type,
        difficulty: difficulty as any,
        type,
        ...(opts?.language && { language: opts.language as any }),
        ...(opts?.framework && { framework: opts.framework as any || 'NONE' }),
        tags: [q.topic].filter(Boolean),
        hints: [],
        expectedTimeMinutes: 10,
        source: 'AI',
      } as any,
    }).catch(() => null);
    if (record) saved.push(record);
  }
  return saved;
}

// ============ Start Mock ============

export async function startMockAction(
  userId: string,
  data: StartMockRequest
): Promise<MockSession> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);

  if (data.type === 'CODING' && !data.language) {
    throw new AppError('Language is required for coding interview', 'INVALID_INPUT', 400);
  }
  if (data.framework && !data.language) {
    throw new AppError('Framework selection requires a language', 'INVALID_INPUT', 400);
  }

  const difficulty =
    data.difficulty ||
    (user.level === 'FRESHER' ? Difficulty.EASY :
      user.level === 'INTERMEDIATE' ? Difficulty.MEDIUM : Difficulty.HARD);

  switch (data.type) {
    case QuestionType.DSA:
      return startDSAMock(userId, difficulty, user);
    case QuestionType.CODING:
      return startCodingMock(userId, difficulty, data, user);
    case QuestionType.HR:
      return startHRMock(userId, difficulty, user);
    default:
      throw new AppError('Unsupported mock type', 'INVALID_INPUT', 400);
  }
}

// ============ DSA Mock ============

async function startDSAMock(
  userId: string,
  difficulty: Difficulty,
  user: any
): Promise<MockSession> {
  const QUESTION_COUNT = 3;

  // 1. Check SkillQuestionBank cache
  const cachedQuestions = await getQuestionsFromBank('DSA');
  if (cachedQuestions && cachedQuestions.length >= 15) {
    const selected = selectFromPool(cachedQuestions, difficulty, QUESTION_COUNT);
    const savedFromBank = await saveBankQuestionsToDb(selected, 'DSA', difficulty);

    if (savedFromBank.length >= QUESTION_COUNT) {
      console.log(`[MockAction] Used ${savedFromBank.length} questions from SkillQuestionBank for DSA mock`);
      return createMockSession(userId, 'DSA', savedFromBank, user);
    }
  }

  // 2. Fallback: existing DB questions
  let questions = await prisma.question.findMany({
    where: { type: QuestionType.DSA, difficulty: difficulty as any },
    take: 10,
  });

  if (questions.length < QUESTION_COUNT) {
    // Generate fresh + async cache for future users
    generateAndCacheQuestionBank('DSA', 'programming');

    const aiQuestions = await generateDSAQuestions({ difficulty });
    for (const q of aiQuestions) {
      const saved = await prisma.question.create({
        data: {
          title: q.title,
          description: formatDSADescription(q),
          topic: q.tags[0] || 'DSA',
          difficulty: difficulty as any,
          type: 'DSA',
          tags: q.tags,
          testCases: q.examples.map((ex: any) => ({
            input: ex.input,
            expectedOutput: ex.output,
            isHidden: false,
          })),
          expectedComplexity: q.expectedComplexity.time,
          hints: q.hints || [],
          starterCode: q.starterCode,
          entryFunctionName: q.entryFunctionName,
        } as any,
      }).catch((err: any) => {
        console.error('Failed to save AI question:', err);
        return null;
      });
      if (saved) questions.push(saved);
    }
  }

  if (questions.length === 0) {
    throw new AppError('Failed to generate DSA questions', 'AI_GENERATION_FAILED', 503);
  }

  const selected = questions.sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT);
  return createMockSession(userId, 'DSA', selected, user);
}

function formatDSADescription(q: any): string {
  const examples = q.examples
    .map((ex: any, i: number) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`)
    .join('\n\n');
  const constraints = q.constraints?.map((c: string) => `- ${c}`).join('\n') || 'None';
  return `${q.statement}\n\n### Examples\n${examples}\n\n### Constraints\n${constraints}`;
}

// ============ Coding Mock ============

async function startCodingMock(
  userId: string,
  difficulty: Difficulty,
  data: StartMockRequest,
  user: any
): Promise<MockSession> {
  const QUESTION_COUNT = 12;
  const sessionOpts = { difficulty, language: data.language, framework: data.framework };

  const skillName = data.framework && data.framework !== 'NONE'
    ? `${data.language} ${data.framework}`
    : data.language || 'Coding';

  // 1. Check SkillQuestionBank cache
  const cachedQuestions = await getQuestionsFromBank(skillName);
  if (cachedQuestions && cachedQuestions.length >= 15) {
    const selected = selectFromPool(cachedQuestions, difficulty, QUESTION_COUNT);
    const savedFromBank = await saveBankQuestionsToDb(selected, 'CODING', difficulty, {
      language: data.language,
      framework: data.framework,
    });

    if (savedFromBank.length >= 5) {
      console.log(`[MockAction] Used ${savedFromBank.length} questions from SkillQuestionBank for Coding mock`);
      return createMockSession(userId, 'CODING', savedFromBank, user, sessionOpts);
    }
  }

  // 2. Fallback: generate fresh + async cache
  generateAndCacheQuestionBank(skillName, 'programming');

  const aiQuestions = await generateCodingQuestions({
    language: data.language!,
    framework: data.framework || null,
    difficulty,
    count: QUESTION_COUNT,
  });

  console.log(`[MockAction] Generated ${aiQuestions.length} Coding questions.`);

  const savedQuestions = [];
  for (const q of aiQuestions) {
    const lang = normalizeEnum(q.language, ProgrammingLanguage) || data.language;
    const fw = normalizeEnum(q.framework, Framework) || data.framework || 'NONE';

    const saved = await prisma.question.create({
      data: {
        title: q.title || `${lang} ${fw !== 'NONE' ? fw : ''} Coding Task`,
        description: formatCodingDescription(q),
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
        source: 'AI',
      },
    }).catch((err: any) => {
      console.error('[MockAction] Failed to save coding question:', err.message);
      return null;
    });
    if (saved) savedQuestions.push(saved);
  }

  if (savedQuestions.length === 0) {
    throw new AppError('AI unable to generate valid questions. Please try again.', 'AI_GENERATION_FAILED', 503);
  }

  return createMockSession(userId, 'CODING', savedQuestions, user, sessionOpts);
}

function formatCodingDescription(q: any): string {
  let desc = q.question;
  if (q.examples?.length > 0) {
    desc += `\n\n### Examples\n${q.examples.map((ex: any, i: number) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`).join('\n\n')}`;
  }
  if (q.constraints?.length > 0) {
    desc += `\n\n### Constraints\n${q.constraints.map((c: string) => `- ${c}`).join('\n')}`;
  }
  return desc;
}

// ============ HR Mock ============

async function startHRMock(
  userId: string,
  difficulty: Difficulty,
  user: any
): Promise<MockSession> {
  const QUESTION_COUNT = 7;

  const aiQuestions = await generateHRQuestions({ difficulty, count: QUESTION_COUNT });

  console.log(`[MockAction] Generated ${aiQuestions.length} HR questions.`);

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
        source: 'AI',
      },
    }).catch((err: any) => {
      console.error('[MockAction] Failed to save HR question:', err.message);
      return null;
    });
    if (saved) savedQuestions.push(saved);
  }

  if (savedQuestions.length === 0) {
    throw new AppError('AI unable to generate behavioral questions. Please try again.', 'AI_GENERATION_FAILED', 503);
  }

  return createMockSession(userId, 'HR', savedQuestions, user);
}

// ============ Get Session ============

export async function getMockSessionAction(
  userId: string,
  sessionId: string
): Promise<MockSession> {
  const session: any = await prisma.mockSession.findFirst({
    where: { id: sessionId, userId },
    include: { results: { include: { question: true } } },
  });

  if (!session) throw new Error('Session not found');

  const dbQuestions = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
  });

  // Maintain order by questionIds
  const questions = session.questionIds
    .map((id: string) => dbQuestions.find((q: any) => q.id === id))
    .filter(Boolean)
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
    hrQuestions: session.hrQuestions as any,
    codingQuestions: session.codingQuestions as any,
    videoRecordingUrl: session.videoRecordingUrl
      ? await getSignedUrl(session.videoRecordingUrl).catch(() => undefined)
      : undefined,
    isPublic: session.isPublic,
    results: session.results.map(mapMockResult),
  };
}

// ============ Submit Solution ============

export async function submitSolutionAction(
  userId: string,
  data: SubmitSolutionRequest
): Promise<MockResult> {
  const session: any = await prisma.mockSession.findFirst({
    where: { id: data.sessionId, userId },
  });
  if (!session) throw new AppError('Session not found', 'NOT_FOUND', 404);

  const questionRecord = await prisma.question.findUnique({
    where: { id: data.questionId },
  });
  if (!questionRecord) throw new AppError('Question not found', 'NOT_FOUND', 404);

  const question = mapQuestion(questionRecord);

  // Run tests (only for DSA/CODING with language)
  let testResults: any = { passed: 0, total: 0, verdict: 'AC', details: [] };
  if (question.type === 'DSA' || (question.type === 'CODING' && (question.language || data.language))) {
    const lang = (data.language || question.language || 'JAVASCRIPT').toLowerCase();
    testResults = await runTests(data.code, question, lang as any);
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
      testResults: testResults as any,
      score: finalScore,
      feedback: feedback as any,
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
    testResults: result.testResults as any,
    score: result.score,
    feedback: result.feedback as any,
    timeSpent: result.timeSpent,
    submittedAt: result.submittedAt,
    question: mapQuestion(question),
  };
}

/** Handle post-completion: status update, XP, notification */
async function handleMockCompletion(
  sessionId: string,
  userId: string,
  allResults: any[],
  feedback: any
): Promise<void> {
  await prisma.mockSession.update({
    where: { id: sessionId },
    data: { status: MockSessionStatus.COMPLETED, completedAt: new Date() },
  });

  const avgScore = Math.round(
    allResults.reduce((sum: number, r: any) => sum + r.score, 0) / allResults.length
  );

  // Award XP
  try {
    const { awardXP } = await import('./gamification.actions');
    const totalTime = allResults.reduce((sum: number, r: any) => sum + r.timeSpent, 0);
    const rewards = await awardXP(userId, avgScore, totalTime);
    console.log(`[Gamification] User ${userId} earned ${rewards.xpEarned} XP, badges: ${rewards.newBadges.join(', ')}`);
  } catch (err) {
    console.error('Failed to award XP:', err);
  }

  // Send notification
  try {
    const { sendMockResultNotification } = await import('./notification.actions');
    await sendMockResultNotification(userId, sessionId, avgScore, feedback.improvements.join('. '));
  } catch (err) {
    console.error('Failed to send mock result notification:', err);
  }
}
