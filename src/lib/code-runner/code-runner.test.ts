import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { runJavaScriptTests } from "./javascript";
import { runPythonTests } from "./python";
import { runJavaTests } from "./java";
import { Verdict } from "./types";
import type { TestCase } from "@/types";
import seeds from "../../../scripts/seed-questions.json";

// Same shape as scripts/seed-questions.json: input is the argument list,
// isHidden is false (JSON `false` is what used to crash the Python runner),
// and no entryFunctionName is set (what used to make JS call Array(...args)).
const twoSum: TestCase[] = [
  { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], isHidden: false },
  { input: [[3, 2, 4], 6], expectedOutput: [1, 2], isHidden: false },
] as TestCase[];

const has = (cmd: string, args: string[]) => spawnSync(cmd, args).status === 0;

describe("JavaScript runner", () => {
  const correct = `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
      if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
      seen.set(nums[i], i);
    }
  }`;

  it("runs the user function (not a built-in global) when no entry name is set", async () => {
    const r = await runJavaScriptTests(correct, twoSum, null);
    expect(r.verdict).toBe(Verdict.ACCEPTED);
    expect(r.passed).toBe(2);
  });

  it("still fails a wrong solution", async () => {
    const r = await runJavaScriptTests(
      "function f() { return [99, 99]; }",
      twoSum,
      null,
    );
    expect(r.verdict).toBe(Verdict.WRONG_ANSWER);
  });

  it("reports a runtime error when the code throws", async () => {
    const r = await runJavaScriptTests(
      'function f() { throw new Error("boom"); }',
      twoSum,
      null,
    );
    expect(r.verdict).toBe(Verdict.RUNTIME_ERROR);
  });
});

describe.skipIf(!has("python3", ["--version"]))("Python runner", () => {
  it("accepts a correct solution with JSON booleans in the test cases", async () => {
    const code = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
`;
    const r = await runPythonTests(code, twoSum, null);
    expect(r.verdict).toBe(Verdict.ACCEPTED);
    expect(r.passed).toBe(2);
  });

  it("fails a wrong solution", async () => {
    const r = await runPythonTests(
      "def f(nums, target):\n    return [9, 9]\n",
      twoSum,
      null,
    );
    expect(r.verdict).toBe(Verdict.WRONG_ANSWER);
  });

  it("honors an explicit entry function name", async () => {
    const code =
      "def helper():\n    return 0\n\ndef main_fn(nums, target):\n    return [0, 1] if target == 9 else [1, 2]\n";
    const r = await runPythonTests(code, twoSum, "main_fn");
    expect(r.verdict).toBe(Verdict.ACCEPTED);
  });
});

describe.skipIf(!has("javac", ["-version"]))("Java runner", () => {
  it("fails a wrong array solution and reports compile errors", async () => {
    const wrong =
      "public class Solution { public int[] f(int[] a, int t) { return new int[]{9, 9}; } }";
    expect((await runJavaTests(wrong, twoSum, null)).verdict).toBe(
      Verdict.WRONG_ANSWER,
    );
    const broken = "public class Solution { public int f( { } }";
    expect((await runJavaTests(broken, twoSum, null)).verdict).toBe(
      Verdict.COMPILE_ERROR,
    );
  });

  it("accepts a correct scalar-argument solution", async () => {
    const cases = [
      { input: [2, 3], expectedOutput: 5, isHidden: false },
      { input: [10, 4], expectedOutput: 14, isHidden: false },
    ] as TestCase[];
    const code =
      "public class Solution { public int add(int a, int b) { return a + b; } }";
    const r = await runJavaTests(code, cases, null);
    expect(r.verdict).toBe(Verdict.ACCEPTED);
  });

  it("accepts a correct array-argument solution (Two Sum shape)", async () => {
    const code = `import java.util.*;
public class Solution {
  public int[] twoSum(int[] nums, int target) {
    Map<Integer,Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
      Integer j = seen.get(target - nums[i]);
      if (j != null) return new int[]{j, i};
      seen.put(nums[i], i);
    }
    return new int[0];
  }
}`;
    const r = await runJavaTests(code, twoSum, null);
    expect(r.verdict).toBe(Verdict.ACCEPTED);
  });
});

describe("seeded questions", () => {
  // Array input = the argument list, so a single-array-argument problem must
  // be seeded as [[...]]. Bare arrays used to hand the function `-2` instead
  // of the array.
  const seed = (title: string) =>
    (seeds as Array<{ title: string; testCases: TestCase[] }>).find(
      (q) => q.title === title,
    )!.testCases;

  it("Maximum Subarray: a correct Kadane solution is accepted", async () => {
    const code = `function maxSubArray(nums) {
      let best = nums[0], cur = nums[0];
      for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); }
      return best;
    }`;
    const r = await runJavaScriptTests(code, seed("Maximum Subarray"), null);
    expect(r.verdict).toBe(Verdict.ACCEPTED);
  });

  it("Reverse Linked List: an array-reversing solution is accepted", async () => {
    const r = await runJavaScriptTests(
      "function rev(a) { return [...a].reverse(); }",
      seed("Reverse Linked List"),
      null,
    );
    expect(r.verdict).toBe(Verdict.ACCEPTED);
  });
});
