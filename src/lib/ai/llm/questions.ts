import { z } from "zod";
import { aiChat } from "../index";
import {
  Difficulty,
  QuestionType,
  ProgrammingLanguage,
  Framework,
  QuestionFormat,
  AnswerFormat,
  HRQuestionCategory,
} from "@/types/enums";
import { normalizeEnum } from "./normalize";

const AISchema = z.object({
  questions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      topic: z.string(),
      difficulty: z.nativeEnum(Difficulty),
      type: z.nativeEnum(QuestionType),
      language: z.string().optional(),
      testCases: z
        .array(
          z.object({
            input: z.unknown(),
            expectedOutput: z.unknown(),
            isHidden: z.boolean().optional(),
          }),
        )
        .optional()
        .default([]),
      expectedComplexity: z.string().optional(),
      hints: z.array(z.string()),
    }),
  ),
});

export async function generateAIQuestions(options: {
  difficulty: string;
  type: string;
  count: number;
  topics: string[];
}): Promise<z.infer<typeof AISchema>["questions"]> {
  const prompt = `Generate ${options.count} ${options.difficulty} ${options.type} interview questions.
Topics to cover: ${options.topics.join(", ") || "Any common interview topics"}.

For each question, provide:
- Title
- Detailed Description
- Topic
- Difficulty (Must be one of: EASY, MEDIUM, HARD)
- Type (Must be one of: DSA, CODING, HR, APTITUDE)
- Expected Language (if applicable, e.g., JAVASCRIPT, PYTHON, JAVA)
- 3-5 Test Cases (with input/expectedOutput) - Required for CODING/DSA types. Can be empty for theory/conceptual questions.
- Expected Complexity (e.g. O(n))
- 2-3 Hints

Ensure the questions cover a mix of problem-solving and core language concepts (e.g. for JavaScript: hoisting, closures, event loop; for Python: tuples, decorators, classes), dynamically adapted to the requested topic.

Format the output as a valid JSON object with a "questions" array. Ensure strict JSON syntax.
Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.3,
      responseFormat: "json_object",
    });
    const content = JSON.parse(result.content);
    return AISchema.parse(content).questions;
  } catch (error) {
    console.error("Failed to generate AI questions:", error);
    return [];
  }
}

// ======== SCHEMAS ========

// DSA Schema
const DSAQuestionSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  statement: z.string(),
  definitions: z.string().optional(),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string(),
      }),
    )
    .min(2)
    .max(3),
  constraints: z.array(z.string()),
  expectedComplexity: z.object({
    time: z.string(),
    space: z.string().optional(),
  }),
  hints: z.array(z.string()).optional(),
  starterCode: z.string().optional(),
  entryFunctionName: z.string().optional(),
});

// CODING Schema
const CodingQuestionSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  question: z.string(),
  codeSnippet: z.string().nullable().optional(),
  language: z.preprocess(
    (val) => normalizeEnum(val, ProgrammingLanguage) || val,
    z.string(),
  ),
  framework: z.preprocess(
    (val) => normalizeEnum(val, Framework) || val,
    z.string().nullable(),
  ),
  difficulty: z.preprocess(
    (val) => normalizeEnum(val, Difficulty) || val,
    z.nativeEnum(Difficulty),
  ),
  questionFormat: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase() : val),
      z.nativeEnum(QuestionFormat),
    )
    .default(QuestionFormat.CODE_WRITING),
  expectedAnswerFormat: z.preprocess(
    (val) => (typeof val === "string" ? val.toUpperCase() : val),
    z.nativeEnum(AnswerFormat),
  ),
  followUps: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  expectedTimeMinutes: z.number(),
  entryFunctionName: z.string().optional(),
  starterCode: z.string().optional(),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string(),
      }),
    )
    .optional(),
  constraints: z.array(z.string()).optional(),
});

// HR Schema
const HRQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  category: z.preprocess(
    (val) => (typeof val === "string" ? val.toUpperCase() : val),
    z.nativeEnum(HRQuestionCategory),
  ),
  guidance: z.string(),
  expectedTimeMinutes: z.number(),
});

// ======== INFERRED TYPES ========
export type DSAQuestion = z.infer<typeof DSAQuestionSchema>;
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;
export type HRQuestion = z.infer<typeof HRQuestionSchema>;

// ======== CACHE ========
// Heterogeneous by design — stores DSAQuestion[]/CodingQuestion[]/HRQuestion[]
// under different keys. getCachedQuestions<T>() casts back to the caller's
// known type on read, same as before, just without the `any` escape hatch.
const questionCache = new Map<
  string,
  { questions: unknown[]; expires: number }
>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedQuestions<T = unknown>(key: string): T[] | null {
  const entry = questionCache.get(key);
  if (entry && entry.expires > Date.now()) {
    console.log(`[Cache] Serving cached questions for key: ${key}`);
    return entry.questions as T[];
  }
  if (entry) {
    questionCache.delete(key);
  }
  return null;
}

function setCachedQuestions<T>(key: string, questions: T[]) {
  questionCache.set(key, {
    questions,
    expires: Date.now() + CACHE_TTL,
  });
}

// ======== GENERATORS ========

export async function generateDSAQuestions(opts: {
  difficulty: Difficulty;
  count?: number;
}): Promise<DSAQuestion[]> {
  const count = opts.count ?? 4;
  const cacheKey = `dsa_${opts.difficulty}_${count}`;
  const cached = getCachedQuestions<DSAQuestion>(cacheKey);
  if (cached) return cached;

  const prompt = `
Generate ${count} DSA interview problems in strict JSON format.

Each problem must include:
- title
- tags
- problem statement
- optional definitions
- 2-3 examples (with input, output, and explanation)
- constraints
- expected complexity (time & optional space)
- optional hints
- entryFunctionName: The exact name of the core function to execute (e.g. "twoSum").
- starterCode: A professional boilerplate for the user to start with. Use standard LeetCode-style signatures for JavaScript.

Format example:
{
 "questions": [
   {
     "title": "...",
     "tags": ["array", "hashing"],
     "statement": "...",
     "definitions": "...",
     "examples": [
         { "input": "[2,7,11,15], 9", "output": "[0, 1]", "explanation": "..." }
     ],
     "constraints": ["..."],
     "expectedComplexity": { "time": "O(n)", "space": "O(1)" },
     "hints": ["...", "..."],
     "entryFunctionName": "twoSum",
     "starterCode": "function twoSum(nums, target) {\n    // Write your solution here\n};"
   }
 ]
}
ONLY RETURN JSON.
`;

  const result = await aiChat(prompt, {
    temperature: 0.3,
    responseFormat: "json_object",
  });
  let data: { questions?: unknown[] };
  try {
    data = JSON.parse(result.content);
  } catch (parseError) {
    console.error("[LLM] Failed to parse DSA questions JSON:", parseError);
    throw new Error("AI returned invalid response. Please try again.");
  }

  let questions;
  try {
    questions = z.array(DSAQuestionSchema).parse(data.questions);
  } catch (validationError) {
    console.error("[LLM] DSA questions failed validation:", validationError);
    throw new Error("AI generated invalid question format. Please try again.");
  }
  setCachedQuestions(cacheKey, questions);
  return questions;
}

export async function generateCodingQuestions(opts: {
  language: string;
  framework?: string | null;
  difficulty: Difficulty;
  count: number;
}): Promise<(CodingQuestion & { id: string })[]> {
  const cacheKey = `coding_${opts.language}_${opts.framework ?? "none"}_${opts.difficulty}_${opts.count}`;
  const cached = getCachedQuestions<CodingQuestion & { id: string }>(cacheKey);
  if (cached) return cached;

  // Split into 2 parallel batches if count is high
  const batchSize = Math.ceil(opts.count / 2);
  const batches = [batchSize, opts.count - batchSize].filter((c) => c > 0);

  console.log(
    `[LLM] Generating ${opts.count} Coding questions in ${batches.length} parallel batches...`,
  );

  const results = await Promise.all(
    batches.map(async (count) => {
      const prompt = `
You are a Senior Technical Interviewer at a top-tier tech company (Google, Meta, Netflix).
Your goal is to conduct a rigorous, professional, and insightful technical interview.
Generate ${count} high-quality interview questions.

Language: ${opts.language}
Framework: ${opts.framework ?? "None"}
Difficulty: ${opts.difficulty}

### Interview Structure Requirements:
Generate a diverse mix of the following types:
1. **Theory / Conceptual**: Deep dives into language internals (e.g., event loop, memory management, closures, prototypes).
   - expectedAnswerFormat: REASONING or SHORT_ANSWER
   - questionFormat: THEORY
2. **Output Prediction**: Provide a tricky, high-quality code snippet and ask what it logs/outputs and WHY.
   - expectedAnswerFormat: SHORT_ANSWER
   - questionFormat: OUTPUT_PREDICTION
   - codeSnippet: (The snippet to analyze)
3. **Debugging / Refactoring**: Identify bugs in a snippet or improve its performance/readability.
   - expectedAnswerFormat: CODE_SNIPPET
   - questionFormat: DEBUGGING
   - codeSnippet: (The buggy/unoptimized code)
4. **Practical Implementation**: Implement a specific pattern, utility, or component.
   - expectedAnswerFormat: CODE_SNIPPET
   - questionFormat: CODE_WRITING

### Rules:
- DO NOT generate generic LeetCode/DSA problems. Focus on the actual LANGUAGE and FRAMEWORK.
- For Output Prediction, ensure the code is realistic but demonstrates subtle language mechanics.
- The quality must be ELITE. Avoid surface-level questions.
- For each question include:
   - title (Short catchy title)
   - question (Detailed prompt)
   - codeSnippet (Required for OUTPUT_PREDICTION and DEBUGGING, else null)
   - language (Normalized, e.g. JAVASCRIPT)
   - framework (Normalized, e.g. REACT or null)
   - difficulty (EASY, MEDIUM, HARD)
   - questionFormat (THEORY, OUTPUT_PREDICTION, CODE_WRITING, DEBUGGING)
   - expectedAnswerFormat (SHORT_ANSWER, CODE_SNIPPET, REASONING)
   - followUps[] (2-3 expert follow-up questions)
   - tags[]
   - expectedTimeMinutes (realistic for a senior)
   - examples[] (2-3 examples with: input, output, explanation) - Required for all types
   - constraints[] (List of technical constraints)

Return ONLY JSON: { "questions": [...] }
`;
      const aiResult = await aiChat(prompt, {
        temperature: 0.3,
        responseFormat: "json_object",
      });
      let data: { questions?: unknown[] };
      try {
        data = JSON.parse(aiResult.content);
      } catch (parseError) {
        console.error(
          "[LLM] Failed to parse Coding questions JSON:",
          parseError,
        );
        return [];
      }
      try {
        return z.array(CodingQuestionSchema).parse(data.questions);
      } catch (validationError) {
        console.error(
          "[LLM] Coding questions failed validation:",
          validationError,
        );
        return [];
      }
    }),
  );

  const questions = results
    .flat()
    .map((q, i) => ({ ...q, id: `coding_${Date.now()}_${i}` }));
  setCachedQuestions(cacheKey, questions);
  return questions;
}

export async function generateHRQuestions(opts: {
  difficulty: Difficulty;
  count: number;
}): Promise<(HRQuestion & { id: string })[]> {
  const cacheKey = `hr_${opts.difficulty}_${opts.count}`;
  const cached = getCachedQuestions<HRQuestion & { id: string }>(cacheKey);
  if (cached) return cached;

  // Split into 2 batches
  const batchSize = Math.ceil(opts.count / 2);
  const batches = [batchSize, opts.count - batchSize].filter((c) => c > 0);

  console.log(
    `[LLM] Generating ${opts.count} HR questions in ${batches.length} parallel batches...`,
  );

  const results = await Promise.all(
    batches.map(async (count) => {
      const prompt = `
Generate ${count} HR/behavioral interview questions.

Mix categories:
- BEHAVIORAL
- REFLECTION
- PUZZLE
- MOTIVATION
- CONFLICT
- LEADERSHIP
- OWNERSHIP

For each include:
- question
- category
- guidance (e.g. STAR)
- expectedTimeMinutes
Return only JSON:
{ "questions": [ ... ] }
`;
      const aiResult = await aiChat(prompt, {
        temperature: 0.3,
        responseFormat: "json_object",
      });
      let data: { questions?: unknown[] };
      try {
        data = JSON.parse(aiResult.content);
      } catch (parseError) {
        console.error("[LLM] Failed to parse HR questions JSON:", parseError);
        return [];
      }
      try {
        return z.array(HRQuestionSchema).parse(data.questions);
      } catch (validationError) {
        console.error("[LLM] HR questions failed validation:", validationError);
        return [];
      }
    }),
  );

  const questions = results
    .flat()
    .map((q, i) => ({ ...q, id: `hr_${Date.now()}_${i}` }));
  setCachedQuestions(cacheKey, questions);
  return questions;
}
