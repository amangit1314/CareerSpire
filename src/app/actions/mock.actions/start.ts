"use server";

import { prisma } from "@/lib/prisma";
import {
  Difficulty,
  QuestionType,
  ProgrammingLanguage,
  Framework,
  QuestionFormat,
  AnswerFormat,
  UserLevel,
  ErrorCode,
} from "@/types/enums";
import type { StartMockRequest, MockSession } from "@/types";
import {
  generateDSAQuestions,
  generateCodingQuestions,
  generateHRQuestions,
  normalizeEnum,
} from "@/lib/ai/llm";
import { AppError } from "@/lib/errors";
import {
  generateAndCacheQuestionBank,
  getQuestionsFromBank,
} from "@/lib/practice/question-bank";
import type { User as PrismaUser, Prisma } from "@prisma/client";
import {
  createMockSession,
  selectFromPool,
  saveBankQuestionsToDb,
  formatDSADescription,
  formatCodingDescription,
} from "./shared";

export async function startMockAction(
  userId: string,
  data: StartMockRequest,
): Promise<MockSession> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user)
    throw new AppError("User not found", ErrorCode.USER_NOT_FOUND, 404);

  if (data.type === QuestionType.CODING && !data.language) {
    throw new AppError(
      "Language is required for coding interview",
      ErrorCode.INVALID_INPUT,
      400,
    );
  }
  if (data.framework && !data.language) {
    throw new AppError(
      "Framework selection requires a language",
      ErrorCode.INVALID_INPUT,
      400,
    );
  }

  const difficulty =
    data.difficulty ||
    (user.level === UserLevel.FRESHER
      ? Difficulty.EASY
      : user.level === UserLevel.INTERMEDIATE
        ? Difficulty.MEDIUM
        : Difficulty.HARD);

  switch (data.type) {
    case QuestionType.DSA:
      return startDSAMock(userId, difficulty, user);
    case QuestionType.CODING:
      return startCodingMock(userId, difficulty, data, user);
    case QuestionType.HR:
      return startHRMock(userId, difficulty, user);
    default:
      throw new AppError("Unsupported mock type", ErrorCode.INVALID_INPUT, 400);
  }
}

// ============ DSA Mock ============

async function startDSAMock(
  userId: string,
  difficulty: Difficulty,
  user: PrismaUser,
): Promise<MockSession> {
  const QUESTION_COUNT = 3;

  // 1. Check SkillQuestionBank cache
  const cachedQuestions = await getQuestionsFromBank("DSA");
  if (cachedQuestions && cachedQuestions.length >= 15) {
    const selected = selectFromPool(
      cachedQuestions,
      difficulty,
      QUESTION_COUNT,
    );
    const savedFromBank = await saveBankQuestionsToDb(
      selected,
      QuestionType.DSA,
      difficulty,
    );

    if (savedFromBank.length >= QUESTION_COUNT) {
      console.log(
        `[MockAction] Used ${savedFromBank.length} questions from SkillQuestionBank for DSA mock`,
      );
      return createMockSession(userId, QuestionType.DSA, savedFromBank, user);
    }
  }

  // 2. Fallback: existing DB questions
  let questions = await prisma.question.findMany({
    where: { type: QuestionType.DSA, difficulty },
    take: 10,
  });

  if (questions.length < QUESTION_COUNT) {
    // Generate fresh + async cache for future users
    generateAndCacheQuestionBank("DSA", "programming");

    const aiQuestions = await generateDSAQuestions({ difficulty });
    for (const q of aiQuestions) {
      const saved = await prisma.question
        .create({
          data: {
            title: q.title,
            description: formatDSADescription(q),
            topic: q.tags[0] || "DSA",
            difficulty,
            type: QuestionType.DSA,
            tags: q.tags,
            testCases: q.examples.map(
              (ex: { input: string; output: string }) => ({
                input: ex.input,
                expectedOutput: ex.output,
                isHidden: false,
              }),
            ) as Prisma.InputJsonValue,
            expectedComplexity: q.expectedComplexity.time,
            hints: q.hints || [],
            starterCode: q.starterCode,
            entryFunctionName: q.entryFunctionName,
          },
        })
        .catch((err: unknown) => {
          console.error("Failed to save AI question:", err);
          return null;
        });
      if (saved) questions.push(saved);
    }
  }

  if (questions.length === 0) {
    throw new AppError(
      "Failed to generate DSA questions",
      ErrorCode.AI_GENERATION_FAILED,
      503,
    );
  }

  const selected = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, QUESTION_COUNT);
  return createMockSession(userId, QuestionType.DSA, selected, user);
}

// ============ Coding Mock ============

async function startCodingMock(
  userId: string,
  difficulty: Difficulty,
  data: StartMockRequest,
  user: PrismaUser,
): Promise<MockSession> {
  const QUESTION_COUNT = 12;
  const sessionOpts = {
    difficulty,
    language: data.language,
    framework: data.framework,
  };

  const skillName =
    data.framework && data.framework !== Framework.NONE
      ? `${data.language} ${data.framework}`
      : data.language || "Coding";

  // 1. Check SkillQuestionBank cache
  const cachedQuestions = await getQuestionsFromBank(skillName);
  if (cachedQuestions && cachedQuestions.length >= 15) {
    const selected = selectFromPool(
      cachedQuestions,
      difficulty,
      QUESTION_COUNT,
    );
    const savedFromBank = await saveBankQuestionsToDb(
      selected,
      QuestionType.CODING,
      difficulty,
      {
        language: data.language,
        framework: data.framework,
      },
    );

    if (savedFromBank.length >= 5) {
      console.log(
        `[MockAction] Used ${savedFromBank.length} questions from SkillQuestionBank for Coding mock`,
      );
      return createMockSession(
        userId,
        QuestionType.CODING,
        savedFromBank,
        user,
        sessionOpts,
      );
    }
  }

  // 2. Fallback: generate fresh + async cache
  generateAndCacheQuestionBank(skillName, "programming");

  const aiQuestions = await generateCodingQuestions({
    language: data.language!,
    framework: data.framework || null,
    difficulty,
    count: QUESTION_COUNT,
  });

  console.log(`[MockAction] Generated ${aiQuestions.length} Coding questions.`);

  const savedQuestions = [];
  for (const q of aiQuestions) {
    const lang =
      normalizeEnum(q.language, ProgrammingLanguage) || data.language;
    const fw =
      normalizeEnum(q.framework, Framework) || data.framework || Framework.NONE;

    const saved = await prisma.question
      .create({
        data: {
          title:
            q.title || `${lang} ${fw !== Framework.NONE ? fw : ""} Coding Task`,
          description: formatCodingDescription(q),
          topic: q.tags?.[0] || "Coding",
          difficulty: normalizeEnum(q.difficulty, Difficulty) || difficulty,
          type: QuestionType.CODING,
          language: lang as ProgrammingLanguage,
          framework: fw as Framework,
          questionFormat: q.questionFormat as QuestionFormat,
          expectedAnswerFormat: q.expectedAnswerFormat as AnswerFormat,
          codeSnippet: q.codeSnippet,
          tags: q.tags || [],
          hints: q.followUps || [],
          testCases: (q.examples || []).map(
            (ex: {
              input: string;
              output?: string;
              expectedOutput?: string;
            }) => ({
              input: ex.input,
              expectedOutput: ex.output || ex.expectedOutput,
              isHidden: false,
            }),
          ) as Prisma.InputJsonValue,
          entryFunctionName: q.entryFunctionName || null,
          expectedTimeMinutes: q.expectedTimeMinutes || 10,
          source: "AI",
        },
      })
      .catch((err: unknown) => {
        console.error(
          "[MockAction] Failed to save coding question:",
          err instanceof Error ? err.message : err,
        );
        return null;
      });
    if (saved) savedQuestions.push(saved);
  }

  if (savedQuestions.length === 0) {
    throw new AppError(
      "AI unable to generate valid questions. Please try again.",
      ErrorCode.AI_GENERATION_FAILED,
      503,
    );
  }

  return createMockSession(
    userId,
    QuestionType.CODING,
    savedQuestions,
    user,
    sessionOpts,
  );
}

// ============ HR Mock ============

async function startHRMock(
  userId: string,
  difficulty: Difficulty,
  user: PrismaUser,
): Promise<MockSession> {
  const QUESTION_COUNT = 7;

  const aiQuestions = await generateHRQuestions({
    difficulty,
    count: QUESTION_COUNT,
  });

  console.log(`[MockAction] Generated ${aiQuestions.length} HR questions.`);

  const savedQuestions = [];
  for (const q of aiQuestions) {
    const saved = await prisma.question
      .create({
        data: {
          title: `${q.category || "Behavioral"} Question`,
          description: q.question,
          topic: q.category || "HR",
          difficulty,
          type: "HR" as QuestionType,
          hints: [q.guidance].filter(Boolean),
          expectedTimeMinutes: q.expectedTimeMinutes || 10,
          source: "AI",
        },
      })
      .catch((err: unknown) => {
        console.error(
          "[MockAction] Failed to save HR question:",
          err instanceof Error ? err.message : err,
        );
        return null;
      });
    if (saved) savedQuestions.push(saved);
  }

  if (savedQuestions.length === 0) {
    throw new AppError(
      "AI unable to generate behavioral questions. Please try again.",
      ErrorCode.AI_GENERATION_FAILED,
      503,
    );
  }

  return createMockSession(userId, QuestionType.HR, savedQuestions, user);
}
