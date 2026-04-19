import { Question, TestCase } from '@/types';
import vm from 'node:vm';
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface TestResult {
  passed: number;
  total: number;
  verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'UNKNOWN';
  details: Array<{
    input: unknown;
    expected: unknown;
    actual: unknown;
    passed: boolean;
    error?: string;
    stdout?: string;
  }>;
}

const TIME_LIMIT_MS = 3000;
const MEMORY_LIMIT_MB = 256;

/**
 * Normalizes values for comparison (handles floats, whitespace, deep equality)
 */
function isEqual(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true;

  // Handle floats with epsilon
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 1e-6;
  }

  // If one is string and other is number, try converting
  if (typeof actual === 'string' && typeof expected === 'number') {
    return Math.abs(parseFloat(actual) - expected) < 1e-6;
  }
  if (typeof actual === 'number' && typeof expected === 'string') {
    return Math.abs(actual - parseFloat(expected)) < 1e-6;
  }

  // Handle strings with whitespace normalization
  if (typeof actual === 'string' && typeof expected === 'string') {
    return actual.trim() === expected.trim();
  }

  // Handle Booleans from strings
  if (typeof actual === 'string' && typeof expected === 'boolean') {
    return actual.toLowerCase().trim() === expected.toString();
  }

  // Deep equality for objects/arrays via JSON
  try {
    const normalize = (val: unknown): string => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try { return JSON.stringify(JSON.parse(trimmed)); } catch { return trimmed; }
        }
        return trimmed;
      }
      return JSON.stringify(val);
    };

    const normActual = normalize(actual);
    const normExpected = normalize(expected);

    if (normActual === normExpected) return true;
  } catch {
    return false;
  }

  return false;
}

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

async function runJavaScriptTests(userCode: string, testCases: TestCase[], entryName?: string | null): Promise<TestResult> {
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
      let error: string | undefined;

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

async function runPythonTests(code: string, testCases: TestCase[], entryName?: string | null): Promise<TestResult> {
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

async function runJavaTests(code: string, testCases: TestCase[], entryName?: string | null): Promise<TestResult> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mocky-java-'));

  try {
    // 1. Detect Class Name or default to Solution
    const classMatch = code.match(/class\s+([a-zA-Z_$][\w$]*)/);
    const className = classMatch ? classMatch[1] : 'Solution';
    const filePath = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(filePath, code);

    // 2. Create Runner
    const runnerCode = `
import java.util.*;
import com.google.gson.*;

public class Runner {
    public static void main(String[] args) {
        Gson gson = new Gson();
        List<Map<String, Object>> results = new ArrayList<>();
        ${className} solution = new ${className}();
        
        // This is a simplified runner for MVP. 
        // In a real system, we'd use reflection to call the method based on entryName.
        try {
            // Simplified: Expecting a single method to test
            java.lang.reflect.Method[] methods = solution.getClass().getDeclaredMethods();
            java.lang.reflect.Method target = null;
            for (var m : methods) {
                if (!m.getName().equals("main") && !java.lang.reflect.Modifier.isPrivate(m.getModifiers())) {
                    target = m;
                    break;
                }
            }
            
            if (target == null) throw new Exception("No target method found");

            String jsonInput = System.getProperty("testCases");
            JsonArray cases = JsonParser.parseString(jsonInput).getAsJsonArray();

            for (JsonElement el : cases) {
                JsonObject tc = el.getAsJsonObject();
                JsonElement inp = tc.get("input");
                
                Object[] callArgs;
                if (inp.isJsonArray()) {
                    JsonArray arr = inp.getAsJsonArray();
                    callArgs = new Object[arr.size()];
                    for(int i=0; i<arr.size(); i++) {
                       // Very rough type mapping for MVP
                       JsonElement v = arr.get(i);
                       if (v.isJsonPrimitive()) {
                           if (v.getAsJsonPrimitive().isNumber()) callArgs[i] = v.getAsInt();
                           else if (v.getAsJsonPrimitive().isBoolean()) callArgs[i] = v.getAsBoolean();
                           else callArgs[i] = v.getAsString();
                       }
                    }
                } else {
                    callArgs = new Object[]{ gson.fromJson(inp, Object.class) };
                }

                try {
                    Object result = target.invoke(solution, callArgs);
                    Map<String, Object> r = new HashMap<>();
                    r.put("actual", result);
                    r.put("passed", true);
                    results.add(r);
                } catch (Exception e) {
                    Map<String, Object> r = new HashMap<>();
                    r.put("error", e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
                    r.put("passed", false);
                    results.add(r);
                }
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        System.out.println("RESULT_START" + gson.toJson(results) + "RESULT_END");
    }
}
`;
    // Note: Java runner needs Gson for easy JSON handling in this mock
    // For MVP without external deps, we'd use a simpler format, but let's assume standard libs or provide a simple JSON util.
    // Actually, let's keep it simpler for now to avoid needing Gson in the environment.

    // REVISED SIMPLE JAVA RUNNER (No external deps) v2
    const simpleRunner = `
import java.util.*;
import java.lang.reflect.*;

public class Runner {
    public static void main(String[] args) throws Exception {
        ${className} sol = new ${className}();
        Method[] methods = sol.getClass().getDeclaredMethods();
        Method target = null;
        for (Method m : methods) {
            if (!m.getName().equals("main") && (m.getModifiers() & Modifier.PUBLIC) != 0) {
                target = m;
                break;
            }
        }
        
        if (target == null) {
            System.out.println("ERR: No public method found");
            return;
        }

        Class<?>[] paramTypes = target.getParameterTypes();
        Scanner sc = new Scanner(System.in);
        while(sc.hasNextLine()) {
            String line = sc.nextLine();
            if (line.isEmpty()) continue;
            try {
                Object[] callArgs = new Object[paramTypes.length];
                // Very basic split for demo/MVP: split by comma if not in brackets
                String[] tokens = line.split(",(?![^\\\\[]*])"); 
                
                for (int i = 0; i < paramTypes.length; i++) {
                    String t = (i < tokens.length) ? tokens[i].trim() : "";
                    if (paramTypes[i] == int.class || paramTypes[i] == Integer.class) {
                        callArgs[i] = Integer.parseInt(t);
                    } else if (paramTypes[i] == double.class || paramTypes[i] == Double.class) {
                        callArgs[i] = Double.parseDouble(t);
                    } else if (paramTypes[i] == boolean.class || paramTypes[i] == Boolean.class) {
                        callArgs[i] = Boolean.parseBoolean(t);
                    } else {
                        callArgs[i] = t;
                    }
                }
                
                Object result = target.invoke(sol, callArgs);
                System.out.println("RES:" + result);
            } catch (Exception e) {
                System.out.println("ERR:" + (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
            }
        }
    }
}
`;
    fs.writeFileSync(path.join(tempDir, 'Runner.java'), simpleRunner);

    // Compile
    const compile = spawnSync('javac', [`${className}.java`, 'Runner.java'], { cwd: tempDir, encoding: 'utf8' });
    if (compile.status !== 0) {
      return {
        passed: 0,
        total: testCases.length,
        verdict: 'CE',
        details: testCases.map(tc => ({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: null,
          passed: false,
          error: compile.stderr
        }))
      };
    }

    const run = spawnSync('java', ['Runner'], {
      cwd: tempDir,
      input: testCases.map(tc => {
        if (Array.isArray(tc.input)) return tc.input.join(',');
        return typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);
      }).join('\n'),
      timeout: TIME_LIMIT_MS,
      encoding: 'utf8'
    });

    const lines = run.stdout.split('\n');
    const details = testCases.map((tc, i) => {
      const line = lines.find(l => l.startsWith('RES:') || l.startsWith('ERR:'));
      if (line) lines.splice(lines.indexOf(line), 1);

      const expected = tc.expectedOutput ?? null;
      if (!line) return { input: tc.input, expected, actual: null, passed: false, error: 'No output' };

      if (line.startsWith('ERR:')) {
        return { input: tc.input, expected, actual: null, passed: false, error: line.substring(4) };
      } else {
        const actual = line.substring(4);
        return { input: tc.input, expected, actual, passed: isEqual(actual, expected) };
      }
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

