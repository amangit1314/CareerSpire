import { Question, TestCase } from '@/types';

export interface TestResult {
  passed: number;
  total: number;
  details: Array<{
    input: any;
    expected: any;
    actual: any;
    passed: boolean;
    error?: string;
  }>;
}

export async function runTests(
  code: string,
  question: Question,
  language: 'javascript' | 'python' = 'javascript'
): Promise<TestResult> {
  const testCases = question.testCases;
  const results: TestResult['details'] = [];

  if (language === 'javascript') {
    try {
      // Extract function name from question (assume it's in the description)
      const functionMatch = code.match(/function\s+(\w+)|const\s+(\w+)\s*=|export\s+(?:default\s+)?function\s+(\w+)/);
      const functionName = functionMatch?.[1] || functionMatch?.[2] || functionMatch?.[3] || 'solution';

      // Create a safe execution context
      const wrappedCode = `
        ${code}
        if (typeof module !== 'undefined' && module.exports) {
          module.exports = ${functionName};
        }
      `;

      // Run each test case
      for (const testCase of testCases) {
        try {
          // Simple eval in server context (for MVP; use proper sandboxing in production)
          const func = new Function('return ' + wrappedCode)();
          const result = func(testCase.input);
          
          const passed = JSON.stringify(result) === JSON.stringify(testCase.expectedOutput);
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result,
            passed,
          });
        } catch (error: any) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: null,
            passed: false,
            error: error.message,
          });
        }
      }
    } catch (error: any) {
      // If code doesn't parse, all tests fail
      testCases.forEach((tc) => {
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: null,
          passed: false,
          error: error.message || 'Code execution error',
        });
      });
    }
  } else if (language === 'python') {
    // For Python, you'd need a Python runtime (like Pyodide or a server-side Python executor)
    // For MVP, return placeholder
    testCases.forEach((tc) => {
      results.push({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: null,
        passed: false,
        error: 'Python execution not yet implemented',
      });
    });
  }

  return {
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    details: results,
  };
}
