import { z } from 'zod';
import { aiChat } from './ai';
import { Difficulty, QuestionType, ProgrammingLanguage, Framework, QuestionFormat, AnswerFormat } from '@/types/enums';

const FeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  codeQuality: z.number().min(0).max(100),
  timeComplexity: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  nextQuestion: z.string().optional(),
  correctedCode: z.string().optional(),
  codeExplanation: z.array(z.object({
    lineRange: z.string(),
    explanation: z.string(),
  })).optional(),
  approachSummary: z.string().optional(),
  isCodeCorrect: z.boolean().optional(),
  conversationalResponse: z.string().optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export async function generateFeedback(
  question: {
    title: string;
    description: string;
    topic: string;
    codeSnippet?: string | null;
    expectedAnswerFormat?: string;
  },
  userAnswer: string,
  testResults: { passed: number; total: number },
  timeSpent: number,
  history: { role: 'ai' | 'user'; content: string }[] = []
): Promise<Feedback> {
  const prompt = `You are an ELITE Senior Technical Interviewer and Tutor.
The user is practicing a specific interview question.
Your goal is to guide them, evaluate their submissions, and answer their questions about THIS topic/question only.

STRICT RULES:
1. If the user is ASKING for the answer, a hint, or has a general question about the concept, provide a detailed and helpful response in "conversationalResponse".
2. If the user SUBMITS a code or a conceptual answer, evaluate it and fill in "score", "strengths", "improvements", etc.
3. BE MINDFUL of the conversation history. If the user asks follow-up questions, answer them naturally.
4. If providing a direct answer/solution, always explain the reasoning and wrap code in Markdown.
5. You MUST respond with a JSON object.

### Current Question Context
Title: ${question.title}
Topic: ${question.topic}
Description: ${question.description}
${question.codeSnippet ? `Reference Code Snippet:\n\`\`\`\n${question.codeSnippet}\n\`\`\`` : ''}

${history.length > 0 ? `### Conversation History\n${history.slice(-6).map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.content}`).join('\n')}\n` : ''}
### User's Input
"${userAnswer}"

### Evaluation Goal
Is the user submitting a final answer, or just asking a question/seeking clarification/hint?
- If asking a question/hint/direct answer: Provide a helpful and encouraging response in "conversationalResponse". Answer their query directly and accurately.
- If submitting an answer: Evaluate it rigorously and provide feedback in the other fields.

Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.
{
  "score": 0-100,
  "codeQuality": 0-100,
  "timeComplexity": "O(...) or N/A",
  "strengths": ["..."],
  "improvements": ["..."],
  "isCodeCorrect": true/false,
  "approachSummary": "Summary of the ideal approach",
  "conversationalResponse": "Your direct message to the user if they are chatting/asking for help",
  "correctedCode": "The full corrected code or perfect theoretical explanation",
  "codeExplanation": [{"lineRange": "...", "explanation": "..."}]
}`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.1,
      responseFormat: 'json_object',
      maxTokens: 2000,
    });

    const content = JSON.parse(result.content);
    return FeedbackSchema.parse(content);
  } catch (error) {
    console.error('Feedback generation error:', error);
    const total = testResults.total || 1;
    return {
      score: Math.round((testResults.passed / total) * 100),
      codeQuality: 60,
      timeComplexity: 'Unknown',
      strengths: ['Code submitted successfully'],
      improvements: ['Review test cases and edge cases'],
      isCodeCorrect: testResults.passed === testResults.total,
      approachSummary: 'Unable to generate detailed feedback at this time.',
    };
  }
}


const AISchema = z.object({
  questions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(),
    difficulty: z.nativeEnum(Difficulty),
    type: z.nativeEnum(QuestionType),
    language: z.string().optional(),
    testCases: z.array(z.object({
      input: z.unknown(),
      expectedOutput: z.unknown(),
      isHidden: z.boolean().optional(),
    })).optional().default([]),
    expectedComplexity: z.string().optional(),
    hints: z.array(z.string()),
  })),
});

export async function generateAIQuestions(
  options: { difficulty: string; type: string; count: number; topics: string[] }
): Promise<z.infer<typeof AISchema>['questions']> {
  const prompt = `Generate ${options.count} ${options.difficulty} ${options.type} interview questions.
Topics to cover: ${options.topics.join(', ') || 'Any common interview topics'}.

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
      responseFormat: 'json_object',
    });
    const content = JSON.parse(result.content);
    return AISchema.parse(content).questions;
  } catch (error) {
    console.error('Failed to generate AI questions:', error);
    return [];
  }
}

// ======== UTILS ========

export function normalizeEnum<T extends Record<string, string>>(val: unknown, enumObj: T): T[keyof T] | undefined {
  if (typeof val !== 'string') return undefined;
  const upper = val.toUpperCase().trim();

  // Handle common aliases
  const aliasMap: Record<string, string> = { JS: 'JAVASCRIPT', TS: 'TYPESCRIPT', PY: 'PYTHON' };
  const aliasKey = aliasMap[upper];
  if (aliasKey && aliasKey in enumObj) return enumObj[aliasKey as keyof T];

  // Direct match
  const match = Object.values(enumObj).find(e => e.toUpperCase() === upper);
  return match as T[keyof T];
}

// ======== SCHEMAS ========

// DSA Schema
const DSAQuestionSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  statement: z.string(),
  definitions: z.string().optional(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string()
  })).min(2).max(3),
  constraints: z.array(z.string()),
  expectedComplexity: z.object({
    time: z.string(),
    space: z.string().optional()
  }),
  hints: z.array(z.string()).optional(),
  starterCode: z.string().optional(),
  entryFunctionName: z.string().optional()
});

// CODING Schema
const CodingQuestionSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  question: z.string(),
  codeSnippet: z.string().nullable().optional(),
  language: z.preprocess((val) => normalizeEnum(val, ProgrammingLanguage) || val, z.string()),
  framework: z.preprocess((val) => normalizeEnum(val, Framework) || val, z.string().nullable()),
  difficulty: z.preprocess((val) => normalizeEnum(val, Difficulty) || val, z.nativeEnum(Difficulty)),
  questionFormat: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : val, z.nativeEnum(QuestionFormat)).default(QuestionFormat.CODE_WRITING),
  expectedAnswerFormat: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : val, z.nativeEnum(AnswerFormat)),
  followUps: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  expectedTimeMinutes: z.number(),
  entryFunctionName: z.string().optional(),
  starterCode: z.string().optional(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string()
  })).optional(),
  constraints: z.array(z.string()).optional()
});

// HR Schema
const HRQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  category: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : val, z.enum(["BEHAVIORAL", "REFLECTION", "PUZZLE", "MOTIVATION", "CONFLICT", "LEADERSHIP", "OWNERSHIP"])),
  guidance: z.string(),
  expectedTimeMinutes: z.number()
});

// ======== INFERRED TYPES ========
export type DSAQuestion = z.infer<typeof DSAQuestionSchema>;
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;
export type HRQuestion = z.infer<typeof HRQuestionSchema>;

// ======== CACHE ========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const questionCache = new Map<string, { questions: any[]; expires: number }>();
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
    expires: Date.now() + CACHE_TTL
  });
}

// ======== GENERATORS ========

export async function generateDSAQuestions(opts: {
  difficulty: Difficulty,
  count?: number
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

  const result = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
  let data: { questions?: unknown[] };
  try {
    data = JSON.parse(result.content);
  } catch (parseError) {
    console.error('[LLM] Failed to parse DSA questions JSON:', parseError);
    throw new Error('AI returned invalid response. Please try again.');
  }

  let questions;
  try {
    questions = z.array(DSAQuestionSchema).parse(data.questions);
  } catch (validationError) {
    console.error('[LLM] DSA questions failed validation:', validationError);
    throw new Error('AI generated invalid question format. Please try again.');
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
  const cacheKey = `coding_${opts.language}_${opts.framework ?? 'none'}_${opts.difficulty}_${opts.count}`;
  const cached = getCachedQuestions<CodingQuestion & { id: string }>(cacheKey);
  if (cached) return cached;

  // Split into 2 parallel batches if count is high
  const batchSize = Math.ceil(opts.count / 2);
  const batches = [batchSize, opts.count - batchSize].filter(c => c > 0);

  console.log(`[LLM] Generating ${opts.count} Coding questions in ${batches.length} parallel batches...`);

  const results = await Promise.all(batches.map(async (count) => {
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
    const aiResult = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
    let data: { questions?: unknown[] };
    try {
      data = JSON.parse(aiResult.content);
    } catch (parseError) {
      console.error('[LLM] Failed to parse Coding questions JSON:', parseError);
      return [];
    }
    try {
      return z.array(CodingQuestionSchema).parse(data.questions);
    } catch (validationError) {
      console.error('[LLM] Coding questions failed validation:', validationError);
      return [];
    }
  }));

  const questions = results.flat().map((q, i) => ({ ...q, id: `coding_${Date.now()}_${i}` }));
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
  const batches = [batchSize, opts.count - batchSize].filter(c => c > 0);

  console.log(`[LLM] Generating ${opts.count} HR questions in ${batches.length} parallel batches...`);

  const results = await Promise.all(batches.map(async (count) => {
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
    const aiResult = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
    let data: { questions?: unknown[] };
    try {
      data = JSON.parse(aiResult.content);
    } catch (parseError) {
      console.error('[LLM] Failed to parse HR questions JSON:', parseError);
      return [];
    }
    try {
      return z.array(HRQuestionSchema).parse(data.questions);
    } catch (validationError) {
      console.error('[LLM] HR questions failed validation:', validationError);
      return [];
    }
  }));

  const questions = results.flat().map((q, i) => ({ ...q, id: `hr_${Date.now()}_${i}` }));
  setCachedQuestions(cacheKey, questions);
  return questions;
}


// --------------------------------------------------------------------------------------------

const SyllabusSchema = z.object({
  topics: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  }))
});

export async function generateTopicSyllabus(skill: string): Promise<z.infer<typeof SyllabusSchema>['topics']> {
  const prompt = `Generate a comprehensive study syllabus for "${skill}".
List 9-12 essential topics (chapters) that cover everything from basics to advanced concepts.
For example, if skill is "JavaScript", include topics like "Variables & Scope", "Hoisting", "Closures", "Promises", "Event Loop", etc.

For each topic provide:
- id (slug-friendly, e.g., "hoisting")
- title (Display name)
- description (Short summary of what is covered)
- difficulty (Beginner, Intermediate, or Advanced)

Format as JSON object with "topics" array.
Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.`;

  try {
    const result = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
    const content = JSON.parse(result.content);
    return SyllabusSchema.parse(content).topics;
  } catch (error) {
    console.error('Failed to generate syllabus:', error);
    return [
      { id: 'basics', title: `${skill} Basics`, description: 'Core concepts', difficulty: 'Beginner' },
      { id: 'advanced', title: `Advanced ${skill}`, description: 'Deep dive features', difficulty: 'Advanced' }
    ];
  }
}

const GuideSchema = z.object({
  title: z.string(),
  content: z.string(), // Markdown content
  keyTakeaways: z.array(z.string()),
});

export async function generateTopicGuide(skill: string, topic: string): Promise<z.infer<typeof GuideSchema>> {
  const prompt = `Create a comprehensive deep-dive study guide for the topic "${topic}" in the context of "${skill}".

The output should include:
1. A clear, in-depth explanation of the concept (using Markdown).
2. Code examples demonstrating the concept (using Markdown code blocks).
3. Common pitfalls or interview "gotchas".
4. Real-world use cases.

Format as JSON:
{
  "title": "Topic Title",
  "content": "Full markdown content string...",
  "keyTakeaways": ["point 1", "point 2", ...]
}
Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.`;

  try {
    const result = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object' });
    const content = JSON.parse(result.content);
    return GuideSchema.parse(content);
  } catch (error) {
    console.error('Failed to generate guide:', error);
    return {
      title: topic,
      content: `Failed to generate guide for **${topic}**. Please try again later.`,
      keyTakeaways: []
    };
  }
}
