"use server";

import { prisma } from "@/lib/prisma";
import { QuestionType } from "@/types/enums";
import { getCurrentUserId } from "@/lib/auth";
import { runTests, Verdict, type TestResult } from "@/lib/code-runner";
import { awardPracticeRewards } from "@/lib/practice/rewards";
import { applyCoinChange, COIN_SPEND, CoinReason } from "@/lib/practice/coins";
import type { Question, TestCase } from "@/types";
import { ProblemStatus } from "@prisma/client";
import type {
  ProblemLanguage,
  SubmissionSummary,
  SubmitResult,
} from "./shared";

// ---------------------------------------------------------------------------
// Read: submission history
// ---------------------------------------------------------------------------

export async function getSubmissionHistory(
  questionId: string,
): Promise<SubmissionSummary[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const rows = await prisma.practiceSubmission.findMany({
    where: { userId, questionId },
    orderBy: { submittedAt: "desc" },
    take: 25,
    select: {
      id: true,
      verdict: true,
      language: true,
      testsPassed: true,
      testsTotal: true,
      runtimeMs: true,
      submittedAt: true,
    },
  });
  return rows;
}

// ---------------------------------------------------------------------------
// Action: run against sample tests (no persistence)
// ---------------------------------------------------------------------------

export async function runProblem(
  questionId: string,
  code: string,
  language: ProblemLanguage,
): Promise<TestResult> {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q || q.type !== QuestionType.DSA) {
    return {
      passed: 0,
      total: 0,
      verdict: Verdict.UNKNOWN,
      details: [],
    };
  }

  // Run against VISIBLE test cases only (the "Run" button is for quick feedback).
  const visibleOnly = {
    ...q,
    testCases: Array.isArray(q.testCases)
      ? (q.testCases as unknown as TestCase[]).filter((t) => !t.isHidden)
      : [],
  } as unknown as Question;

  return runTests(code, visibleOnly, language);
}

// ---------------------------------------------------------------------------
// Action: submit (runs all tests, persists, updates progress, awards rewards)
// ---------------------------------------------------------------------------

export async function submitProblem(
  questionId: string,
  code: string,
  language: ProblemLanguage,
): Promise<SubmitResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("You need to sign in to submit.");
  }

  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q || q.type !== QuestionType.DSA) {
    throw new Error("Problem not found.");
  }

  // Run all tests (hidden included)
  const testResult = await runTests(code, q as unknown as Question, language);

  // Existing progress — to know if this is the first solve
  const prev = await prisma.userProblemProgress.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });
  const wasAlreadySolved = prev?.status === ProblemStatus.SOLVED;
  const isAccepted = testResult.verdict === Verdict.ACCEPTED;
  const isFirstSolve = isAccepted && !wasAlreadySolved;

  // Persist submission
  const submission = await prisma.practiceSubmission.create({
    data: {
      userId,
      questionId,
      code,
      language,
      verdict: testResult.verdict,
      testsPassed: testResult.passed,
      testsTotal: testResult.total,
    },
  });

  // Update progress (upsert)
  const nextStatus: ProblemStatus = isAccepted
    ? ProblemStatus.SOLVED
    : wasAlreadySolved
      ? ProblemStatus.SOLVED // once solved, stays solved even on later WA
      : ProblemStatus.ATTEMPTED;

  await prisma.userProblemProgress.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: {
      status: nextStatus,
      lastAttemptAt: new Date(),
      attemptCount: { increment: 1 },
      firstSolvedAt: isFirstSolve ? new Date() : (prev?.firstSolvedAt ?? null),
      bestSubmissionId:
        isAccepted && !wasAlreadySolved
          ? submission.id
          : (prev?.bestSubmissionId ?? null),
    },
    create: {
      userId,
      questionId,
      status: nextStatus,
      attemptCount: 1,
      firstSolvedAt: isAccepted ? new Date() : null,
      bestSubmissionId: isAccepted ? submission.id : null,
    },
  });

  // Rewards — only on AC
  let rewards: SubmitResult["rewards"] = null;
  if (isAccepted) {
    // Is this today's daily challenge?
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const daily = await prisma.dailyChallenge.findUnique({
      where: { date: today },
    });
    const isDailyChallenge = daily?.questionId === questionId;

    const r = await awardPracticeRewards({
      userId,
      questionId,
      difficulty: q.difficulty,
      isFirstSolve,
      isDailyChallenge,
    });
    rewards = {
      xpEarned: r.xpEarned,
      coinsEarned: r.coinsEarned,
      newBadges: r.newBadges,
      newStreak: r.newStreak,
      streakUpdated: r.streakUpdated,
      coinBalance: r.coinBalance,
      totalSolved: r.totalSolved,
    };
  }

  return {
    submissionId: submission.id,
    testResult,
    isFirstSolve,
    rewards,
  };
}

// ---------------------------------------------------------------------------
// Action: spend coins (hint reveal / solution unlock)
// ---------------------------------------------------------------------------

export async function spendCoinsForUnlock(
  reason: CoinReason.HINT_REVEAL | CoinReason.SOLUTION_UNLOCK,
  refId: string,
): Promise<{ newBalance: number }> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Auth required");

  const amount =
    reason === CoinReason.HINT_REVEAL
      ? COIN_SPEND.HINT_REVEAL
      : COIN_SPEND.SOLUTION_UNLOCK;

  return applyCoinChange({
    userId,
    amount: -amount,
    reason,
    refId,
  });
}
