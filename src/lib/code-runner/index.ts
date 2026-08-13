import type { Question, TestCase } from '@/types';
import { runJavaScriptTests } from './javascript';
import { runPythonTests } from './python';
import { runJavaTests } from './java';
import type { TestResult } from './types';

export type { TestResult } from './types';

export async function runTests(
  code: string,
  question: Question,
  language: 'javascript' | 'python' | 'java' | 'cpp' = 'javascript'
): Promise<TestResult> {
  const testCases = (question.testCases || []) as TestCase[];
  const lang = (language || 'javascript').toLowerCase();

  if (testCases.length === 0) {
    return {
      passed: 0,
      total: 0,
      verdict: 'AC' as const,
      details: [],
    };
  }

  try {
    switch (lang) {
      case 'javascript':
        return await runJavaScriptTests(code, testCases, question.entryFunctionName);
      case 'python':
        return await runPythonTests(code, testCases, question.entryFunctionName);
      case 'java':
        return await runJavaTests(code, testCases, question.entryFunctionName);
      default:
        throw new Error(`Language ${language} is not supported yet.`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      passed: 0,
      total: testCases.length,
      verdict: 'RE',
      details: testCases.map(tc => ({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: null,
        passed: false,
        error: errorMessage
      }))
    };
  }
}
