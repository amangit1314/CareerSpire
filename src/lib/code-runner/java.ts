import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { TestCase } from "@/types";
import { isEqual } from "./compare";
import { TIME_LIMIT_MS, Verdict, type TestResult } from "./types";

// Same convention as the JS runner: an array input is the argument list, a
// string is parsed as comma-separated JSON args, anything else is one arg.
function toArgs(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try {
      return JSON.parse(`[${input.trim()}]`);
    } catch {
      return [input];
    }
  }
  return [input];
}

export async function runJavaTests(
  code: string,
  testCases: TestCase[],
  entryName?: string | null,
): Promise<TestResult> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mocky-java-"));

  try {
    // 1. Detect Class Name or default to Solution
    const classMatch = code.match(/class\s+([a-zA-Z_$][\w$]*)/);
    const className = classMatch ? classMatch[1] : "Solution";
    const filePath = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(filePath, code);

    // Args arrive as one JSON array per line and results go back as JSON, so
    // array/list parameters and return values work (the earlier comma-split
    // version could only take scalars). No backslashes in the Java source on
    // purpose: this lives in a JS template literal, so 92 is used for '\'.
    const simpleRunner = `
import java.util.*;
import java.lang.reflect.*;

public class Runner {
    static String s;
    static int p;

    static void ws() { while (p < s.length() && Character.isWhitespace(s.charAt(p))) p++; }

    static Object parse() {
        ws();
        char c = s.charAt(p);
        if (c == '[') {
            p++;
            List<Object> l = new ArrayList<>();
            ws();
            if (s.charAt(p) == ']') { p++; return l; }
            while (true) {
                l.add(parse());
                ws();
                if (s.charAt(p++) == ']') return l;
            }
        }
        if (c == '"') {
            p++;
            StringBuilder b = new StringBuilder();
            while (s.charAt(p) != '"') {
                char d = s.charAt(p++);
                if (d == 92) { char e = s.charAt(p++); b.append(e == 'n' ? '\\n' : e); } else b.append(d);
            }
            p++;
            return b.toString();
        }
        int st = p;
        while (p < s.length() && ",]} ".indexOf(s.charAt(p)) < 0) p++;
        String t = s.substring(st, p);
        if (t.equals("true")) return true;
        if (t.equals("false")) return false;
        if (t.equals("null")) return null;
        if (t.contains(".") || t.contains("e") || t.contains("E")) return Double.parseDouble(t);
        return Long.parseLong(t);
    }

    @SuppressWarnings("unchecked")
    static Object convert(Object v, Class<?> t) {
        if (v == null) return null;
        if (t == int.class || t == Integer.class) return ((Number) v).intValue();
        if (t == long.class || t == Long.class) return ((Number) v).longValue();
        if (t == double.class || t == Double.class) return ((Number) v).doubleValue();
        if (t == boolean.class || t == Boolean.class) return (Boolean) v;
        if (t == String.class) return v.toString();
        if (t == char.class || t == Character.class) return v.toString().charAt(0);
        if (t.isArray()) {
            List<Object> l = (List<Object>) v;
            Class<?> comp = t.getComponentType();
            Object arr = Array.newInstance(comp, l.size());
            for (int i = 0; i < l.size(); i++) Array.set(arr, i, convert(l.get(i), comp));
            return arr;
        }
        if (v instanceof List) {
            List<Object> out = new ArrayList<>();
            for (Object o : (List<Object>) v) {
                if (o instanceof Long && (Long) o >= Integer.MIN_VALUE && (Long) o <= Integer.MAX_VALUE) out.add(((Long) o).intValue());
                else out.add(o);
            }
            return out;
        }
        return v;
    }

    static String toJson(Object o) {
        if (o == null) return "null";
        if (o instanceof String || o instanceof Character) {
            String str = o.toString();
            return "\\"" + str.replace(String.valueOf((char) 92), String.valueOf((char) 92) + (char) 92).replace("\\"", String.valueOf((char) 92) + "\\"") + "\\"";
        }
        if (o instanceof Boolean || o instanceof Number) return o.toString();
        StringBuilder b = new StringBuilder("[");
        if (o.getClass().isArray()) {
            for (int i = 0; i < Array.getLength(o); i++) { if (i > 0) b.append(","); b.append(toJson(Array.get(o, i))); }
            return b.append("]").toString();
        }
        if (o instanceof Iterable) {
            boolean first = true;
            for (Object e : (Iterable<?>) o) { if (!first) b.append(","); first = false; b.append(toJson(e)); }
            return b.append("]").toString();
        }
        return toJson(o.toString());
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws Exception {
        String entry = args.length > 0 ? args[0] : "";
        ${className} sol = new ${className}();
        Method target = null;
        for (Method m : sol.getClass().getDeclaredMethods()) {
            if (m.getName().equals("main") || (m.getModifiers() & Modifier.PUBLIC) == 0) continue;
            if (!entry.isEmpty() && !m.getName().equals(entry)) continue;
            target = m;
            break;
        }
        if (target == null) {
            System.out.println("ERR: No public method found");
            return;
        }

        Class<?>[] paramTypes = target.getParameterTypes();
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextLine()) {
            String line = sc.nextLine();
            if (line.isEmpty()) continue;
            try {
                s = line;
                p = 0;
                List<Object> given = (List<Object>) parse();
                Object[] callArgs = new Object[paramTypes.length];
                for (int i = 0; i < paramTypes.length; i++) {
                    callArgs[i] = convert(i < given.size() ? given.get(i) : null, paramTypes[i]);
                }
                System.out.println("RES:" + toJson(target.invoke(sol, callArgs)));
            } catch (Exception e) {
                System.out.println("ERR:" + (e.getCause() != null ? e.getCause() : e));
            }
        }
    }
}
`;
    fs.writeFileSync(path.join(tempDir, "Runner.java"), simpleRunner);

    // Compile
    const compile = spawnSync("javac", [`${className}.java`, "Runner.java"], {
      cwd: tempDir,
      encoding: "utf8",
    });
    if (compile.status !== 0) {
      return {
        passed: 0,
        total: testCases.length,
        verdict: Verdict.COMPILE_ERROR,
        details: testCases.map((tc) => ({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: null,
          passed: false,
          error: compile.stderr,
        })),
      };
    }

    const run = spawnSync("java", ["Runner", entryName ?? ""], {
      cwd: tempDir,
      input: testCases.map((tc) => JSON.stringify(toArgs(tc.input))).join("\n"),
      timeout: TIME_LIMIT_MS,
      encoding: "utf8",
    });

    const lines = run.stdout.split("\n");
    const details = testCases.map((tc) => {
      const line = lines.find(
        (l) => l.startsWith("RES:") || l.startsWith("ERR:"),
      );
      if (line) lines.splice(lines.indexOf(line), 1);

      const expected = tc.expectedOutput ?? null;
      if (!line)
        return {
          input: tc.input,
          expected,
          actual: null,
          passed: false,
          error: "No output",
        };

      if (line.startsWith("ERR:")) {
        return {
          input: tc.input,
          expected,
          actual: null,
          passed: false,
          error: line.substring(4),
        };
      } else {
        const raw = line.substring(4);
        let actual: unknown = raw;
        try {
          actual = JSON.parse(raw);
        } catch {
          /* keep raw text */
        }
        return {
          input: tc.input,
          expected,
          actual,
          passed: isEqual(actual, expected),
        };
      }
    });

    const passedCount = details.filter((d) => d.passed).length;
    return {
      passed: passedCount,
      total: details.length,
      verdict:
        passedCount === details.length
          ? Verdict.ACCEPTED
          : details.some((d) => d.error)
            ? Verdict.RUNTIME_ERROR
            : Verdict.WRONG_ANSWER,
      details,
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
