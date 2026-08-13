import vm from 'node:vm';
import type { TestCase } from '@/types';
import { isEqual } from './compare';
import { TIME_LIMIT_MS, type TestResult } from './types';

export async function runJavaScriptTests(userCode: string, testCases: TestCase[], entryName?: string | null): Promise<TestResult> {
  const results: TestResult['details'] = [];

  // Block common vm escape patterns before execution
  const dangerousPatterns = [
    /this\s*\.\s*constructor/i,
    /constructor\s*\(\s*['"]return/i,
    /\bprocess\b/,
    /\brequire\b/,
    /\bglobalThis\b/,
    /\b__proto__\b/,
    /\bprototype\b\s*\.\s*constructor/,
    /\bFunction\s*\(/,
    /\beval\s*\(/,
    /\bimport\s*\(/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(userCode)) {
      throw new Error('Code contains forbidden patterns for security reasons.');
    }
  }

  // NOTE: Node.js `vm` is NOT a true sandbox. The pattern checks above are a
  // defense-in-depth layer. For production, consider running user code in an
  // isolated subprocess with restricted permissions (e.g., Docker, Firecracker, or E2B).
  const context = vm.createContext(Object.create(null), {
    codeGeneration: { strings: false, wasm: false },
  });
  // Provide only safe globals
  context.console = {
    log: (..._args: unknown[]) => {},
    error: (..._args: unknown[]) => {},
  };
  context.Array = Array;
  context.Object = Object;
  context.Math = Math;
  context.String = String;
  context.Number = Number;
  context.Boolean = Boolean;
  context.JSON = JSON;
  context.Map = Map;
  context.Set = Set;
  context.parseInt = parseInt;
  context.parseFloat = parseFloat;
  context.isNaN = isNaN;
  context.isFinite = isFinite;
  context.undefined = undefined;
  context.NaN = NaN;
  context.Infinity = Infinity;

  try {
    // 1. Execute User Code to populate context
    vm.runInContext(userCode, context, { timeout: TIME_LIMIT_MS });

    // 2. Identify Entry Point
    let entryPoint: Function | null = null;

    if (entryName && typeof context[entryName] === 'function') {
      entryPoint = context[entryName];
    } else {
      // Fallback: search for user-defined functions (skip built-in context keys)
      const builtinKeys = new Set(['console', 'process', 'Buffer', 'require']);
      for (const key of Object.getOwnPropertyNames(context)) {
        if (!builtinKeys.has(key) && typeof context[key] === 'function') {
          entryPoint = context[key];
          break;
        }
      }
    }

    if (!entryPoint) throw new Error("No function found. Please define a function.");

    for (const tc of testCases) {
      const expected = tc.expectedOutput ?? null;
      let actual: unknown = null;

      try {
        // Handle input parsing (if it's a string, try to parse as JSON or args)
        let args: unknown[] = [];
        if (Array.isArray(tc.input)) {
          args = tc.input;
        } else if (typeof tc.input === 'string') {
          const trimmed = tc.input.trim();
          try {
            // Try wrapping the whole string as a JSON array of arguments
            // e.g. "[2,7,11,15], 9" → [[2,7,11,15], 9]
            // e.g. "[1,2,3]" → [[1,2,3]] (single array arg)
            // e.g. "5, 3" → [5, 3]
            const parsed = JSON.parse(`[${trimmed}]`);
            if (Array.isArray(parsed)) {
              args = parsed;
            } else {
              args = [parsed];
            }
          } catch {
            // If the whole string is a single JSON value (e.g. "[1,2,3]")
            try {
              const singleParsed = JSON.parse(trimmed);
              args = [singleParsed];
            } catch {
              args = [trimmed]; // Fallback to raw string
            }
          }
        } else {
          args = [tc.input];
        }

        actual = entryPoint(...args);
        console.log(`[JS-Runner] ${entryName || 'found'} executed. Input: ${JSON.stringify(args).substring(0, 50)}... Result:`, actual);

        results.push({
          input: tc.input,
          expected,
          actual,
          passed: isEqual(actual, expected)
        });
      } catch (err: unknown) {
        results.push({
          input: tc.input,
          expected,
          actual: null,
          passed: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
  } catch (err: unknown) {
    throw err;
  }

  const passedCount = results.filter(r => r.passed).length;
  return {
    passed: passedCount,
    total: results.length,
    verdict: passedCount === results.length ? 'AC' : (results.some(r => r.error) ? 'RE' : 'WA'),
    details: results
  };
}
