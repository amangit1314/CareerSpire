import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { TestCase } from '@/types';
import { isEqual } from './compare';
import { TIME_LIMIT_MS, type TestResult } from './types';

export async function runJavaTests(code: string, testCases: TestCase[], entryName?: string | null): Promise<TestResult> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mocky-java-'));

  try {
    // 1. Detect Class Name or default to Solution
    const classMatch = code.match(/class\s+([a-zA-Z_$][\w$]*)/);
    const className = classMatch ? classMatch[1] : 'Solution';
    const filePath = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(filePath, code);

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
    const details = testCases.map((tc) => {
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
