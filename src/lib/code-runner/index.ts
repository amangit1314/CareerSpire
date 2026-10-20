import type { Question, TestCase } from "@/types";
import { runJavaScriptTests } from "./javascript";
import { runPythonTests } from "./python";
import { runJavaTests } from "./java";
import { Verdict, type TestResult } from "./types";
import { ProblemLanguage } from "@/types/enums";

export { Verdict } from "./types";
export type { TestResult } from "./types";

export async function runTests(
  code: string,
  question: Question,
  // 'cpp' isn't a ProblemLanguage member yet — it's not runnable
  // (tracked as a Q3 2026 roadmap item), so it stays a bare string literal
  // here rather than joining the enum.
  language: ProblemLanguage | "cpp" = ProblemLanguage.JAVASCRIPT,
): Promise<TestResult> {
  const testCases = (question.testCases || []) as TestCase[];
  const lang = (language || ProblemLanguage.JAVASCRIPT).toLowerCase();

  if (testCases.length === 0) {
    return {
      passed: 0,
      total: 0,
      verdict: Verdict.ACCEPTED,
      details: [],
    };
  }

  try {
    switch (lang) {
      case ProblemLanguage.JAVASCRIPT:
        return await runJavaScriptTests(
          code,
          testCases,
          question.entryFunctionName,
        );
      case ProblemLanguage.PYTHON:
        return await runPythonTests(
          code,
          testCases,
          question.entryFunctionName,
        );
      case ProblemLanguage.JAVA:
        return await runJavaTests(code, testCases, question.entryFunctionName);
      default:
        throw new Error(`Language ${language} is not supported yet.`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return {
      passed: 0,
      total: testCases.length,
      verdict: Verdict.RUNTIME_ERROR,
      details: testCases.map((tc) => ({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: null,
        passed: false,
        error: errorMessage,
      })),
    };
  }
}
