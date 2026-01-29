import { Question, TestCase } from '@/types';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

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
  language: 'javascript' | 'python' | 'java' | 'cpp' = 'javascript'
): Promise<TestResult> {
  const testCases = (question.testCases || []) as any[];
  const results: TestResult['details'] = [];
  const lang = (language || 'javascript').toLowerCase() as any;

  if (lang === 'javascript') {
    return runJavaScriptTests(code, testCases, question.entryFunctionName);
  } else if (lang === 'python') {
    return runPythonTests(code, testCases, question.entryFunctionName);
  } else {
    testCases.forEach((tc) => {
      const expected = tc.expectedOutput ?? tc.output ?? tc.expected ?? tc.expected_output ?? null;
      results.push({
        input: tc.input,
        expected,
        actual: null,
        passed: false,
        error: `${language.toUpperCase()} execution not yet fully supported.`,
      });
    });
  }

  return {
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    details: results,
  };
}

async function runJavaScriptTests(userCode: string, testCases: any[], entryName?: string | null): Promise<TestResult> {
  const results: TestResult['details'] = [];

  try {
    const context = vm.createContext({ console, JSON, Array, Object, Math, Set, Map });

    // 1. First, define a safe bridge in the context
    // We pass userCode as a variable to avoid template interpolation issues in the script itself
    vm.runInContext(`const __userCodeString = ${JSON.stringify(userCode)};`, context);

    // 2. Execute user code
    vm.runInContext(userCode, context);

    // 3. Define and get the test bridge
    const bridgeText = `
      (input, entryPoint) => {
        let entry;
        try {
          if (entryPoint) {
            try {
              const val = eval(entryPoint);
              if (typeof val === 'function') {
                const prototypes = val.prototype ? Object.getOwnPropertyNames(val.prototype).filter(m => m !== 'constructor') : [];
                if (prototypes.length > 0) {
                  const instance = new val();
                  entry = instance[prototypes[0]].bind(instance);
                } else {
                  entry = val;
                }
              }
            } catch(e) {}
          }
          
          if (!entry) {
             // Fallback: search for any function in the global scope (var/function declarations)
             const globals = Object.keys(this);
             for (const key of globals) {
               if (typeof this[key] === 'function' && key !== 'eval' && key !== 'console') {
                 entry = this[key];
                 break;
               }
             }
          }
          
          if (!entry) {
             // Second fallback: search first function name in code and try to eval it (works for const/let)
             const m = __userCodeString.match(/(?:function|const|let|var)\\s+([a-zA-Z_$][\\w$]*)/);
             if (m && m[1]) {
                try {
                  const val = eval(m[1]);
                  if (typeof val === 'function') entry = val;
                } catch(e) {}
             }
          }

          if (!entry) throw new Error("Could not find a valid function to call. Please check your function name.");
          
          let args = [];
          if (typeof input === 'string') {
             const trimmed = input.trim();
             if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
               try { args = JSON.parse(input); } catch(e) { args = [input]; }
             } else if (trimmed.includes(',')) {
               try { args = eval('[' + input + ']'); } catch(e) { args = [input]; }
             } else {
               try { args = [JSON.parse(input)]; } catch(e) { args = [input]; }
             }
          } else if (Array.isArray(input)) {
             args = input;
          } else {
             args = [input];
          }
          
          return entry(...args);
        } catch (e) {
          throw e;
        }
      }
    `;

    const runTestFn = vm.runInContext(bridgeText, context);

    for (const tc of testCases) {
      const expected = tc.expectedOutput ?? tc.output ?? tc.expected ?? tc.expected_output ?? null;
      let parsedExpected = expected;

      if (typeof expected === 'string') {
        const trimmed = expected.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          try { parsedExpected = JSON.parse(expected); } catch { }
        }
      }

      try {
        const actual = runTestFn(tc.input, entryName);
        const passed = JSON.stringify(actual) === JSON.stringify(parsedExpected);
        results.push({
          input: tc.input,
          expected: parsedExpected,
          actual,
          passed,
        });
      } catch (err: any) {
        results.push({
          input: tc.input,
          expected: parsedExpected,
          actual: null,
          passed: false,
          error: err.message,
        });
      }
    }
  } catch (err: any) {
    testCases.forEach((tc) => {
      const expected = tc.expectedOutput ?? tc.output ?? tc.expected ?? tc.expected_output ?? null;
      results.push({
        input: tc.input,
        expected,
        actual: null,
        passed: false,
        error: `Setup Error: ${err.message}`,
      });
    });
  }

  return {
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    details: results,
  };
}

async function runPythonTests(code: string, testCases: any[], entryName?: string | null): Promise<TestResult> {
  const results: TestResult['details'] = [];
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const userCodePath = path.join(tempDir, `user_code_${timestamp}.py`);
  const runnerPath = path.join(tempDir, `runner_${timestamp}.py`);

  try {
    fs.writeFileSync(userCodePath, code);

    for (const tc of testCases) {
      const expected = tc.expectedOutput ?? tc.output ?? tc.expected ?? tc.expected_output ?? null;
      let parsedExpected = expected;

      if (typeof expected === 'string') {
        const trimmed = expected.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          try { parsedExpected = JSON.parse(expected); } catch { }
        }
      }

      const runnerCode = `
import json
import sys
import ast

def run_test():
    try:
        # User Code
        ${code.split('\n').map(line => '        ' + line).join('\n')}
        
        # Test Input
        input_val = ${JSON.stringify(tc.input)}
        
        # Parse inputs
        args = []
        try:
            if isinstance(input_val, str):
                trimmed = input_val.strip()
                if trimmed.startswith('[') and trimmed.endswith(']'):
                    args = json.loads(input_val)
                elif ',' in trimmed:
                    args = ast.literal_eval("[" + input_val + "]")
                else:
                    try:
                        args = [json.loads(input_val)]
                    except:
                        args = [input_val]
            elif isinstance(input_val, list):
                args = input_val
            else:
                args = [input_val]
        except:
            args = [input_val]

        target_fn = None
        lcls = locals()
        
        # 1. Try explicit entry point
        entry_pt = "${entryName || ''}"
        if entry_pt and entry_pt in lcls:
            obj = lcls[entry_pt]
            if callable(obj): target_fn = obj
            elif hasattr(obj, '__class__'):
               try:
                  instance = obj() if isinstance(obj, type) else obj
                  methods = [m for m in dir(instance) if not m.startswith('__') and callable(getattr(instance, m))]
                  if methods: target_fn = getattr(instance, methods[0])
               except: pass

        # 2. Try Solution class
        if not target_fn and 'Solution' in lcls:
            sol = lcls['Solution']()
            methods = [m for m in dir(sol) if not m.startswith('__') and callable(getattr(sol, m))]
            if methods: target_fn = getattr(sol, methods[0])
        
        # 3. Try any function
        if not target_fn:
            for name, obj in lcls.items():
                if callable(obj) and name not in ['json', 'sys', 'ast', 'run_test']:
                    target_fn = obj
                    break

        if not target_fn: return {"error": "No function found."}

        result = target_fn(*args)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

print(json.dumps(run_test()))
`;
      fs.writeFileSync(runnerPath, runnerCode);

      try {
        const output = execSync(`python3 "${runnerPath}"`, { encoding: 'utf8', timeout: 3000 });
        const data = JSON.parse(output.trim() || '{}');

        if (data.error) {
          results.push({
            input: tc.input,
            expected: parsedExpected,
            actual: null,
            passed: false,
            error: data.error,
          });
        } else {
          const actual = data.result;
          const passed = JSON.stringify(actual) === JSON.stringify(parsedExpected);
          results.push({
            input: tc.input,
            expected: parsedExpected,
            actual,
            passed,
          });
        }
      } catch (err: any) {
        results.push({
          input: tc.input,
          expected: parsedExpected,
          actual: null,
          passed: false,
          error: err.message || 'Python execution error',
        });
      }
    }
  } catch (err: any) {
    testCases.forEach((tc) => {
      const expected = tc.expectedOutput ?? tc.output ?? tc.expected ?? tc.expected_output ?? null;
      results.push({
        input: tc.input,
        expected,
        actual: null,
        passed: false,
        error: `Execution Setup Error: ${err.message}`,
      });
    });
  } finally {
    if (fs.existsSync(userCodePath)) try { fs.unlinkSync(userCodePath); } catch (e) { }
    if (fs.existsSync(runnerPath)) try { fs.unlinkSync(runnerPath); } catch (e) { }
  }

  return {
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    details: results,
  };
}
