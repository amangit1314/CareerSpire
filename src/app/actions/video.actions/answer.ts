"use server";

import { prisma } from "@/lib/prisma";
import { generateFeedback, type Feedback } from "@/lib/ai/llm";
import { AppError } from "@/lib/errors";
import { ErrorCode } from "@/types/enums";
import type { Prisma } from "@prisma/client";

// Evaluate a video answer transcript with AI
export async function submitVideoAnswer(
  userId: string,
  sessionId: string,
  questionId: string,
  transcript: string,
  timeSpent: number,
): Promise<{ score: number; feedback: Feedback }> {
  const session = await prisma.mockSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session)
    throw new AppError("Session not found", ErrorCode.NOT_FOUND, 404);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question)
    throw new AppError("Question not found", ErrorCode.NOT_FOUND, 404);

  const feedback = await generateFeedback(
    {
      title: question.title,
      description: question.description,
      topic: question.topic,
      expectedAnswerFormat: "SHORT_ANSWER",
    },
    transcript || "(No response given)",
    { passed: 0, total: 0 },
    timeSpent,
  );

  const score = feedback.score ?? Math.round(feedback.codeQuality * 0.7);

  await prisma.mockResult.create({
    data: {
      sessionId,
      questionId,
      userCode: transcript || "(No response)",
      testResults: { passed: 0, total: 0, details: [] },
      score,
      feedback: feedback as unknown as Prisma.InputJsonValue,
      timeSpent,
    },
  });

  return { score, feedback };
}
