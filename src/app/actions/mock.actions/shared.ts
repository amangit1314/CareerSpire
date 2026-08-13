// Internal helpers shared across the mock.actions/ split. Not a 'use server'
// file — none of these are called directly from client components (they
// were file-private in the original mock.actions.ts too), so they stay
// plain functions that the 'use server' action files import.

import { prisma } from '@/lib/prisma';
import { Difficulty, QuestionType, MockSessionStatus, ProgrammingLanguage, Framework, QuestionFormat, AnswerFormat, SubscriptionTier } from '@/types/enums';
import type { MockSession, TestCase, Question as AppQuestion, MockResult } from '@/types';
import { AppError } from '@/lib/errors';
import type { BankQuestion } from '@/lib/practice/question-bank';
import type {
  User as PrismaUser,
  Question as PrismaQuestion,
  MockResult as PrismaMockResult,
  Prisma,
} from '@prisma/client';

// Prisma MockResult with nested question included
export type PrismaMockResultWithQuestion = PrismaMockResult & {
  question?: PrismaQuestion;
};

/** Map a Prisma question record to the typed Question shape */
export function mapQuestion(q: PrismaQuestion): AppQuestion {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    topic: q.topic,
    difficulty: q.difficulty as unknown as Difficulty,
    type: q.type as unknown as QuestionType,
    language: q.language as unknown as ProgrammingLanguage | null,
    framework: q.framework as unknown as Framework | null,
    questionFormat: q.questionFormat as unknown as QuestionFormat,
    expectedAnswerFormat: q.expectedAnswerFormat as unknown as AnswerFormat,
    codeSnippet: q.codeSnippet,
    starterCode: q.starterCode,
    entryFunctionName: q.entryFunctionName,
    testCases: (q.testCases as TestCase[] | null) || [],
    expectedComplexity: q.expectedComplexity,
    hints: q.hints,
    expectedTimeMinutes: q.expectedTimeMinutes,
    createdAt: q.createdAt,
  };
}

/** Map a Prisma mock result + nested question to the typed MockResult shape */
export function mapMockResult(r: PrismaMockResultWithQuestion): MockResult {
  return {
    id: r.id,
    sessionId: r.sessionId,
    questionId: r.questionId,
    userCode: r.userCode,
    testResults: r.testResults as unknown as MockResult['testResults'],
    score: r.score,
    feedback: r.feedback as unknown as MockResult['feedback'],
    timeSpent: r.timeSpent,
    submittedAt: r.submittedAt,
    ...(r.question && { question: mapQuestion(r.question) }),
  };
}

/** Check mock quota and deduct one mock credit */
export async function checkAndDeductMock(userId: string, user: PrismaUser): Promise<void> {
  if (user.subscriptionTier === 'FREE') {
    if (user.freeMocksRemaining <= 0) {
      throw new AppError('No mocks remaining. Buy a mock pack or upgrade your plan.', 'NO_MOCKS_REMAINING', 403);
    }
    await prisma.user.update({
      where: { id: userId },
      data: { freeMocksRemaining: user.freeMocksRemaining - 1 },
    });
  } else {
    // Paid tier — enforce monthly quota
    const { getPlanByTier } = await import('@/lib/pricing');
    const plan = getPlanByTier(user.subscriptionTier as SubscriptionTier);
    if (user.mocksUsedThisCycle >= plan.mocksPerMonth) {
      throw new AppError(
        `You've used all ${plan.mocksPerMonth} mocks this month. Buy a mock pack or upgrade.`,
        'NO_MOCKS_REMAINING',
        403,
      );
    }
    await prisma.user.update({
      where: { id: userId },
      data: { mocksUsedThisCycle: user.mocksUsedThisCycle + 1 },
    });
  }
}

/** Create a MockSession and return the typed response */
export async function createMockSession(
  userId: string,
  interviewType: QuestionType,
  questions: PrismaQuestion[],
  user: PrismaUser,
  opts?: { difficulty?: Difficulty; language?: ProgrammingLanguage | null; framework?: Framework | null }
): Promise<MockSession> {
  const questionIds = questions.map((q) => q.id);

  const session = await prisma.mockSession.create({
    data: {
      userId,
      status: 'IN_PROGRESS',
      interviewType,
      questionIds,
      ...(opts?.difficulty && { difficulty: opts.difficulty }),
      ...(opts?.language && { language: opts.language }),
      ...(opts?.framework && { framework: opts.framework }),
    },
  });

  await checkAndDeductMock(userId, user);

  return {
    id: session.id,
    userId,
    questionIds,
    status: session.status as MockSessionStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    type: interviewType,
    questions: questions.map(mapQuestion),
    results: [],
  };
}

/** Filter cached questions by difficulty, pick random subset */
export function selectFromPool(questions: BankQuestion[], difficulty: Difficulty, count: number): BankQuestion[] {
  const byDifficulty = questions.filter(
    (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
  );
  const pool = byDifficulty.length >= count ? byDifficulty : questions;
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

/** Convert bank question examples/testCases to JSON-compatible array for Prisma */
export function extractTestCases(q: BankQuestion): Prisma.InputJsonValue {
  const existing = q.testCases || q.test_cases || [];
  if (existing.length > 0) {
    return JSON.parse(JSON.stringify(existing)) as Prisma.InputJsonValue;
  }

  const fromExamples = (q.examples || []).map((ex) => ({
    input: ex.input,
    expectedOutput: ex.output,
    isHidden: false,
  }));
  return fromExamples as unknown as Prisma.InputJsonValue;
}

/** Save question bank items as Question records in DB, returns saved records */
export async function saveBankQuestionsToDb(
  questions: BankQuestion[],
  type: QuestionType,
  difficulty: Difficulty,
  opts?: { language?: ProgrammingLanguage | null; framework?: Framework | null }
): Promise<PrismaQuestion[]> {
  const saved: PrismaQuestion[] = [];
  for (const q of questions) {
    const record = await prisma.question.create({
      data: {
        title: q.question?.substring(0, 100) || `${type} Question`,
        description: q.question || q.answer_guide || '',
        topic: q.topic || type,
        difficulty: difficulty,
        type,
        ...(opts?.language && { language: opts.language }),
        ...(opts?.framework && { framework: opts.framework || 'NONE' }),
        tags: [q.topic].filter((t): t is string => Boolean(t)),
        hints: [],
        testCases: extractTestCases(q),
        entryFunctionName: q.entryFunctionName || q.entry_function_name || null,
        starterCode: q.starterCode || q.starter_code || null,
        expectedTimeMinutes: 10,
        source: 'AI',
      },
    }).catch(() => null);
    if (record) saved.push(record);
  }
  return saved;
}

export interface DSAQuestion {
  statement: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints?: string[];
}

export function formatDSADescription(q: DSAQuestion): string {
  const examples = q.examples
    .map((ex, i) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`)
    .join('\n\n');
  const constraints = q.constraints?.map((c) => `- ${c}`).join('\n') || 'None';
  return `${q.statement}\n\n### Examples\n${examples}\n\n### Constraints\n${constraints}`;
}

export interface CodingQuestionInput {
  question: string;
  examples?: Array<{ input: string; output: string; explanation: string }>;
  constraints?: string[];
}

export function formatCodingDescription(q: CodingQuestionInput): string {
  let desc = q.question;
  if (q.examples?.length) {
    desc += `\n\n### Examples\n${q.examples.map((ex, i) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`).join('\n\n')}`;
  }
  if (q.constraints?.length) {
    desc += `\n\n### Constraints\n${q.constraints.map((c) => `- ${c}`).join('\n')}`;
  }
  return desc;
}
