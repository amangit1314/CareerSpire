import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { TestCase } from '@/types';
import { isEqual } from './compare';
import { TIME_LIMIT_MS, type TestResult } from './types';

export async function runPythonTests(code: string, testCases: TestCase[], entryName?: string | null): Promise<TestResult> {
  // Block dangerous Python imports/calls
  const dangerousPyPatterns = [
    /\bimport\s+os\b/,
    /\bimport\s+subprocess\b/,
    /\bimport\s+shutil\b/,
    /\bimport\s+socket\b/,
    /\bimport\s+http\b/,
    /\bimport\s+urllib\b/,
    /\bimport\s+requests\b/,
    /\bimport\s+pathlib\b/,
    /\bfrom\s+os\b/,
    /\bfrom\s+subprocess\b/,
    /\b__import__\b/,
    /\bexec\s*\(/,
    /\beval\s*\(/,
    /\bopen\s*\(/,
    /\bcompile\s*\(/,
    /\bglobals\s*\(\s*\)/,
  ];

  for (const pattern of dangerousPyPatterns) {
    if (pattern.test(code)) {
      throw new Error('Code contains forbidden imports/calls for security reasons.');
    }
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mocky-py-'));
  const userCodePath = path.join(tempDir, 'solution.py');
  const runnerPath = path.join(tempDir, 'runner.py');

  try {
    fs.writeFileSync(userCodePath, code);

    const runnerCode = `
import json
import sys
import solution
from solution import *

def normalize(val):
    if isinstance(val, float): return round(val, 6)
    return val

test_cases = ${JSON.stringify(testCases)}
results = []

for tc in test_cases:
    try:
        # Find entry point
        entry_name = "${entryName || ''}"
        target = None

        if entry_name and hasattr(solution, entry_name):
            target = getattr(solution, entry_name)
        else:
            # Fallback to Solution class or any function
            if hasattr(solution, 'Solution'):
                sol_class = getattr(solution, 'Solution')
                inst = sol_class()
                # find first non-private method
                methods = [m for m in dir(inst) if not m.startswith('__') and callable(getattr(inst, m))]
                if methods: target = getattr(inst, methods[0])

            if not target:
                for name in dir(solution):
                    if not name.startswith('__'):
                        attr = getattr(solution, name)
                        if callable(attr):
                            target = attr
                            break

        if not target:
            raise Exception("No callable function found in submission")

        # Prepare input
        inp = tc['input']
        if isinstance(inp, str) and inp.startswith('['):
            args = json.loads(inp)
        elif isinstance(inp, list):
            args = inp
        else:
            args = [inp]

        actual = target(*args)
        expected = tc.get('expectedOutput', tc.get('output', tc.get('expected', None)))
        results.append({"actual": actual, "expected": expected, "passed": True})
    except Exception as e:
        results.append({"error": str(e), "passed": False})

print(json.dumps(results))
`;
    fs.writeFileSync(runnerPath, runnerCode);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const proc = spawnSync(pythonCmd, [runnerPath], {
      cwd: tempDir,
      timeout: TIME_LIMIT_MS,
      encoding: 'utf8',
      env: { ...process.env, PYTHONPATH: tempDir }
    });

    if (proc.status !== 0 && !proc.stdout) {
      return {
        passed: 0,
        total: testCases.length,
        verdict: proc.error?.message?.includes('ETIMEDOUT') ? 'TLE' : 'RE',
        details: testCases.map(tc => ({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: null,
          passed: false,
          error: proc.stderr || proc.error?.message || 'Unknown execution error'
        }))
      };
    }

    let rawResults: Array<{ actual?: unknown; expected?: unknown; passed: boolean; error?: string }> = [];
    try {
      rawResults = JSON.parse(proc.stdout.trim());
    } catch {
      throw new Error("Failed to parse execution output: " + proc.stdout);
    }

    const details = testCases.map((tc, i) => {
      const res = rawResults[i];
      const expected = tc.expectedOutput ?? null;
      return {
        input: tc.input,
        expected,
        actual: res.actual,
        passed: res.passed && isEqual(res.actual, expected),
        error: res.error,
        stdout: proc.stdout
      };
    });

    const passedCount = details.filter(d => d.passed).length;
    return {
      passed: passedCount,
      total: details.length,
      verdict: passedCount === details.length ? 'AC' : (details.some(d => d.error) ? 'RE' : 'WA'),
      details
    };

  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
