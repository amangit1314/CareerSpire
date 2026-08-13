# Adaptive Interview Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After each answered question, an LLM-driven agent decides the topic/difficulty of the next question (DSA/CODING/HR), replacing today's fixed upfront batch with a linear, progressively-revealed interview.

**Architecture:** A new pure-ish module `src/lib/ai/interviewAgent.ts` owns two steps of a decide→act loop: `decideNextQuestion` (one small LLM call over a compact performance summary, with a deterministic rule-based fallback on timeout/failure) and `fetchOrGenerateQuestion` (tries the existing question bank first, falls back to the existing per-type generators). `mock.actions.ts` gets one new server action, `getNextQuestionAction`, that wires DB reads/writes around those two calls. Session creation (`startDSAMock`/`startCodingMock`/`startHRMock`) is trimmed to save only the first question; the rest arrive one at a time as the candidate progresses. The frontend sidebar becomes forward-only with read-only review of answered questions.

**Tech Stack:** TypeScript, Next.js server actions, Prisma, Zod, Vitest. No new dependencies.

## Global Constraints

- Total question count per session is unchanged: 3 DSA / 12 Coding / 7 HR (from `docs/superpowers/specs/2026-08-13-adaptive-interview-agent-design.md`).
- `interviewAgent.ts` must not import `prisma` directly — DB orchestration stays in `mock.actions.ts`, keeping the agent module testable without mocking Prisma.
- Every LLM call in this feature goes through the existing `aiChat` (with its timeout/fallback machinery from `src/lib/ai/index.ts`) — no bespoke retry/timeout logic anywhere in this plan.
- Follow existing test patterns: `vi.mock('@/lib/prisma', ...)` for DB (see `src/app/api/health/route.test.ts`), `vi.mock('./ai'/'./groq'/'./gemini', ...)` for LLM calls (see `src/lib/ai/index.test.ts`).

---

### Task 1: Topic-targeted question generation in `llm.ts`

**Files:**
- Modify: `src/lib/llm.ts:258-322` (`generateDSAQuestions`), `:324-407` (`generateCodingQuestions`), `:409-` (`generateHRQuestions`)
- Test: `src/lib/llm.test.ts` (new)

**Interfaces:**
- Produces: `generateDSAQuestions(opts: { difficulty: Difficulty; count?: number; topic?: string })`, `generateCodingQuestions(opts: { language: string; framework?: string | null; difficulty: Difficulty; count: number; topic?: string })`, `generateHRQuestions(opts: { difficulty: Difficulty; count: number; topic?: string })` — all backward compatible, `topic` optional and additive.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/llm.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('./ai', () => ({ aiChat: vi.fn() }));

import { aiChat } from './ai';
import { generateDSAQuestions, generateCodingQuestions, generateHRQuestions } from './llm';
import { Difficulty } from '@/types/enums';

describe('topic-targeted question generation', () => {
  it('generateDSAQuestions includes the topic in the prompt when provided', async () => {
    vi.mocked(aiChat).mockResolvedValue({
      content: JSON.stringify({
        questions: [{
          title: 'Two Sum',
          tags: ['array'],
          statement: 'Find two numbers that sum to target',
          examples: [
            { input: '[2,7,11,15], 9', output: '[0,1]', explanation: 'nums[0]+nums[1]=9' },
            { input: '[3,2,4], 6', output: '[1,2]', explanation: 'nums[1]+nums[2]=6' },
          ],
          constraints: ['2 <= nums.length'],
          expectedComplexity: { time: 'O(n)' },
        }],
      }),
      provider: 'groq',
    });

    await generateDSAQuestions({ difficulty: Difficulty.MEDIUM, count: 1, topic: 'Hash Maps' });

    const promptArg = vi.mocked(aiChat).mock.calls[0][0] as string;
    expect(promptArg).toContain('Hash Maps');
  });

  it('generateCodingQuestions includes the topic in the prompt when provided', async () => {
    vi.mocked(aiChat).mockResolvedValue({
      content: JSON.stringify({
        questions: [{
          question: 'Explain closures',
          language: 'JAVASCRIPT',
          framework: null,
          difficulty: 'MEDIUM',
          questionFormat: 'THEORY',
          expectedAnswerFormat: 'SHORT_ANSWER',
          followUps: [],
          tags: ['closures'],
          expectedTimeMinutes: 5,
        }],
      }),
      provider: 'groq',
    });

    await generateCodingQuestions({ language: 'JAVASCRIPT', difficulty: Difficulty.MEDIUM, count: 1, topic: 'Closures' });

    const promptArg = vi.mocked(aiChat).mock.calls[0][0] as string;
    expect(promptArg).toContain('Closures');
  });

  it('generateHRQuestions includes the topic in the prompt when provided', async () => {
    vi.mocked(aiChat).mockResolvedValue({
      content: JSON.stringify({
        questions: [{
          question: 'Tell me about a conflict you resolved',
          category: 'CONFLICT',
          guidance: 'Look for STAR structure',
          expectedTimeMinutes: 5,
        }],
      }),
      provider: 'groq',
    });

    await generateHRQuestions({ difficulty: Difficulty.MEDIUM, count: 1, topic: 'Conflict Resolution' });

    const promptArg = vi.mocked(aiChat).mock.calls[0][0] as string;
    expect(promptArg).toContain('Conflict Resolution');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/llm.test.ts`
Expected: FAIL — prompts don't yet contain the topic strings (topic isn't wired in).

- [ ] **Step 3: Add `topic` param and prompt injection**

In `generateDSAQuestions` (`src/lib/llm.ts:258`), change the signature and cache key, and inject the topic line into the prompt:

```typescript
export async function generateDSAQuestions(opts: {
  difficulty: Difficulty,
  count?: number,
  topic?: string
}): Promise<DSAQuestion[]> {
  const count = opts.count ?? 4;
  const cacheKey = `dsa_${opts.difficulty}_${count}_${opts.topic ?? 'any'}`;
  const cached = getCachedQuestions<DSAQuestion>(cacheKey);
  if (cached) return cached;

  const prompt = `
Generate ${count} DSA interview problems in strict JSON format.
${opts.topic ? `Focus specifically on this topic: ${opts.topic}.` : ''}
```

(leave the rest of the prompt and function body unchanged).

In `generateCodingQuestions` (`src/lib/llm.ts:324`), change the signature, cache key, and inject the topic line inside the per-batch prompt (right after the `Difficulty: ${opts.difficulty}` line):

```typescript
export async function generateCodingQuestions(opts: {
  language: string;
  framework?: string | null;
  difficulty: Difficulty;
  count: number;
  topic?: string;
}): Promise<(CodingQuestion & { id: string })[]> {
  const cacheKey = `coding_${opts.language}_${opts.framework ?? 'none'}_${opts.difficulty}_${opts.count}_${opts.topic ?? 'any'}`;
  const cached = getCachedQuestions<CodingQuestion & { id: string }>(cacheKey);
  if (cached) return cached;
  // ... unchanged batching logic ...
```

and inside the prompt template literal, after `Difficulty: ${opts.difficulty}`:

```typescript
Difficulty: ${opts.difficulty}
${opts.topic ? `Focus specifically on this topic: ${opts.topic}.` : ''}
```

In `generateHRQuestions` (`src/lib/llm.ts:409`), same pattern:

```typescript
export async function generateHRQuestions(opts: {
  difficulty: Difficulty;
  count: number;
  topic?: string;
}): Promise<(HRQuestion & { id: string })[]> {
  const cacheKey = `hr_${opts.difficulty}_${opts.count}_${opts.topic ?? 'any'}`;
  const cached = getCachedQuestions<HRQuestion & { id: string }>(cacheKey);
  if (cached) return cached;
  // ... unchanged batching logic ...
```

and inside the prompt template literal, right after `Generate ${count} HR/behavioral interview questions.`:

```typescript
Generate ${count} HR/behavioral interview questions.
${opts.topic ? `Focus specifically on this category/theme: ${opts.topic}.` : ''}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/llm.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Run full test suite and typecheck**

Run: `npx vitest run && npx tsc --noEmit -p .`
Expected: all existing tests still pass, no type errors (the new `topic` param is optional so no call sites break).

- [ ] **Step 6: Commit**

```bash
git add src/lib/llm.ts src/lib/llm.test.ts
git commit -m "feat: add optional topic targeting to question generators"
```

---

### Task 2: Rule-based fallback in `interviewAgent.ts`

**Files:**
- Create: `src/lib/ai/interviewAgent.ts`
- Test: `src/lib/ai/interviewAgent.test.ts` (new)

**Interfaces:**
- Consumes: `Difficulty`, `QuestionType` from `@/types/enums`.
- Produces: `export interface PerformanceEntry { topic: string; difficulty: Difficulty; score: number }`, `export interface NextQuestionDecision { topic: string; difficulty: Difficulty; reasoning: string }`, `export function ruleBasedNextQuestion(entries: PerformanceEntry[]): NextQuestionDecision`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/ai/interviewAgent.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ruleBasedNextQuestion, type PerformanceEntry } from './interviewAgent';
import { Difficulty } from '@/types/enums';

describe('ruleBasedNextQuestion', () => {
  it('lowers difficulty and keeps the topic after a weak score', () => {
    const entries: PerformanceEntry[] = [
      { topic: 'Arrays', difficulty: Difficulty.MEDIUM, score: 30 },
    ];
    const decision = ruleBasedNextQuestion(entries);
    expect(decision.topic).toBe('Arrays');
    expect(decision.difficulty).toBe(Difficulty.EASY);
  });

  it('raises difficulty and picks a different topic after a strong score', () => {
    const entries: PerformanceEntry[] = [
      { topic: 'Arrays', difficulty: Difficulty.EASY, score: 40 },
      { topic: 'Closures', difficulty: Difficulty.MEDIUM, score: 90 },
    ];
    const decision = ruleBasedNextQuestion(entries);
    expect(decision.difficulty).toBe(Difficulty.HARD);
    expect(decision.topic).toBe('Arrays');
  });

  it('holds steady on a middling score', () => {
    const entries: PerformanceEntry[] = [
      { topic: 'Recursion', difficulty: Difficulty.MEDIUM, score: 65 },
    ];
    const decision = ruleBasedNextQuestion(entries);
    expect(decision.topic).toBe('Recursion');
    expect(decision.difficulty).toBe(Difficulty.MEDIUM);
  });

  it('clamps difficulty at the boundaries', () => {
    const easyEntries: PerformanceEntry[] = [{ topic: 'Loops', difficulty: Difficulty.EASY, score: 20 }];
    expect(ruleBasedNextQuestion(easyEntries).difficulty).toBe(Difficulty.EASY);

    const hardEntries: PerformanceEntry[] = [{ topic: 'Loops', difficulty: Difficulty.HARD, score: 95 }];
    expect(ruleBasedNextQuestion(hardEntries).difficulty).toBe(Difficulty.HARD);
  });

  it('falls back to the same topic when no other distinct topic has been seen', () => {
    const entries: PerformanceEntry[] = [
      { topic: 'Arrays', difficulty: Difficulty.MEDIUM, score: 85 },
    ];
    expect(ruleBasedNextQuestion(entries).topic).toBe('Arrays');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/ai/interviewAgent.test.ts`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Implement `ruleBasedNextQuestion`**

Create `src/lib/ai/interviewAgent.ts`:

```typescript
import { Difficulty, QuestionType } from '@/types/enums';

export interface PerformanceEntry {
  topic: string;
  difficulty: Difficulty;
  score: number;
}

export interface NextQuestionDecision {
  topic: string;
  difficulty: Difficulty;
  reasoning: string;
}

const DIFFICULTY_ORDER: Difficulty[] = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

function clampDifficultyIndex(index: number): number {
  return Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, index));
}

/**
 * Deterministic fallback used when the LLM-driven decision fails or times out.
 * Never blocks the candidate: always returns a valid decision from the data
 * already in hand (no bank/DB access, no network calls).
 */
export function ruleBasedNextQuestion(entries: PerformanceEntry[]): NextQuestionDecision {
  const last = entries[entries.length - 1];
  const lastDifficultyIndex = DIFFICULTY_ORDER.indexOf(last.difficulty);

  if (last.score < 50) {
    const difficulty = DIFFICULTY_ORDER[clampDifficultyIndex(lastDifficultyIndex - 1)];
    return {
      topic: last.topic,
      difficulty,
      reasoning: `Rule-based fallback: weak score (${last.score}) on ${last.topic}, staying on topic at a lower difficulty.`,
    };
  }

  if (last.score > 80) {
    const difficulty = DIFFICULTY_ORDER[clampDifficultyIndex(lastDifficultyIndex + 1)];
    const otherTopic = entries.map((e) => e.topic).find((t) => t !== last.topic);
    return {
      topic: otherTopic ?? last.topic,
      difficulty,
      reasoning: `Rule-based fallback: strong score (${last.score}) on ${last.topic}, raising difficulty${otherTopic ? ' and switching topic' : ''}.`,
    };
  }

  return {
    topic: last.topic,
    difficulty: last.difficulty,
    reasoning: `Rule-based fallback: middling score (${last.score}) on ${last.topic}, holding steady.`,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/ai/interviewAgent.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/interviewAgent.ts src/lib/ai/interviewAgent.test.ts
git commit -m "feat: add rule-based next-question fallback"
```

---

### Task 3: LLM-driven `decideNextQuestion`

**Files:**
- Modify: `src/lib/ai/interviewAgent.ts`
- Test: `src/lib/ai/interviewAgent.test.ts`

**Interfaces:**
- Consumes: `aiChat` from `./index` (signature: `aiChat(prompt: string, options?: { responseFormat?: 'json_object'; temperature?: number; maxTokens?: number; timeoutMs?: number }): Promise<{ content: string; provider: 'groq' | 'gemini' }>`), `ruleBasedNextQuestion` from Task 2.
- Produces: `export async function decideNextQuestion(entries: PerformanceEntry[], sessionType: QuestionType, opts?: { timeoutMs?: number }): Promise<NextQuestionDecision>`.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/ai/interviewAgent.test.ts`:

```typescript
vi.mock('./index', () => ({ aiChat: vi.fn() }));

import { aiChat } from './index';
import { decideNextQuestion } from './interviewAgent';
import { QuestionType } from '@/types/enums';
import { vi } from 'vitest';

describe('decideNextQuestion', () => {
  it('returns the parsed LLM decision on success', async () => {
    vi.mocked(aiChat).mockResolvedValue({
      content: JSON.stringify({ topic: 'Graphs', difficulty: 'HARD', reasoning: 'strong performance so far' }),
      provider: 'groq',
    });

    const entries: PerformanceEntry[] = [{ topic: 'Arrays', difficulty: Difficulty.MEDIUM, score: 90 }];
    const decision = await decideNextQuestion(entries, QuestionType.DSA);

    expect(decision).toEqual({ topic: 'Graphs', difficulty: Difficulty.HARD, reasoning: 'strong performance so far' });
  });

  it('falls back to the rule-based decision when aiChat throws', async () => {
    vi.mocked(aiChat).mockRejectedValue(new Error('Both Groq and Gemini failed'));

    const entries: PerformanceEntry[] = [{ topic: 'Arrays', difficulty: Difficulty.MEDIUM, score: 20 }];
    const decision = await decideNextQuestion(entries, QuestionType.DSA);

    expect(decision.topic).toBe('Arrays');
    expect(decision.difficulty).toBe(Difficulty.EASY);
    expect(decision.reasoning).toContain('Rule-based fallback');
  });

  it('falls back to the rule-based decision when the LLM returns invalid JSON', async () => {
    vi.mocked(aiChat).mockResolvedValue({ content: 'not json', provider: 'groq' });

    const entries: PerformanceEntry[] = [{ topic: 'Arrays', difficulty: Difficulty.MEDIUM, score: 65 }];
    const decision = await decideNextQuestion(entries, QuestionType.DSA);

    expect(decision.reasoning).toContain('Rule-based fallback');
  });
});
```

(Add `import { describe, it, expect, vi } from 'vitest';` already exists at the top from Task 2 — just add `vi` if not already imported, and move the `vi.mock('./index', ...)` call to the top of the file alongside any other mocks, since `vi.mock` calls are hoisted and must be module-level.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/ai/interviewAgent.test.ts`
Expected: FAIL — `decideNextQuestion` is not exported yet.

- [ ] **Step 3: Implement `decideNextQuestion`**

Add to `src/lib/ai/interviewAgent.ts`:

```typescript
import { z } from 'zod';
import { aiChat } from './index';

const NextQuestionDecisionSchema = z.object({
  topic: z.string().min(1),
  difficulty: z.nativeEnum(Difficulty),
  reasoning: z.string(),
});

function buildDecisionPrompt(entries: PerformanceEntry[], sessionType: QuestionType): string {
  const history = entries
    .map((e, i) => `${i + 1}. topic="${e.topic}", difficulty=${e.difficulty}, score=${e.score}/100`)
    .join('\n');

  return `You are an adaptive technical interviewer choosing the NEXT question for a ${sessionType} mock interview.

Candidate's performance so far:
${history}

Decide the topic and difficulty for the next question. Go easier after a weak answer (score < 50). Go harder, and prefer a new topic, after a strong answer (score > 80). Otherwise hold roughly steady.

Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.
{
  "topic": "the topic for the next question",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "reasoning": "one sentence explaining the choice"
}`;
}

/**
 * The agent's decision step. Never throws — falls back to the deterministic
 * rule-based decision on any failure (timeout, provider outage, invalid
 * JSON) so a flaky LLM call never blocks the candidate mid-session.
 */
export async function decideNextQuestion(
  entries: PerformanceEntry[],
  sessionType: QuestionType,
  opts: { timeoutMs?: number } = {}
): Promise<NextQuestionDecision> {
  try {
    const prompt = buildDecisionPrompt(entries, sessionType);
    const result = await aiChat(prompt, {
      responseFormat: 'json_object',
      temperature: 0.2,
      maxTokens: 300,
      timeoutMs: opts.timeoutMs,
    });
    return NextQuestionDecisionSchema.parse(JSON.parse(result.content));
  } catch (error) {
    console.warn(
      `[InterviewAgent] decideNextQuestion failed, using rule-based fallback: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return ruleBasedNextQuestion(entries);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/ai/interviewAgent.test.ts`
Expected: PASS (8 tests total: 5 from Task 2 + 3 new)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/interviewAgent.ts src/lib/ai/interviewAgent.test.ts
git commit -m "feat: add LLM-driven next-question decision with rule-based fallback"
```

---

### Task 4: `fetchOrGenerateQuestion` tool step

**Files:**
- Modify: `src/lib/ai/interviewAgent.ts`
- Test: `src/lib/ai/interviewAgent.test.ts`

**Interfaces:**
- Consumes: `getQuestionsFromBank(skill: string): Promise<BankQuestion[] | null>` and `type BankQuestion` from `@/lib/question-bank`; `generateDSAQuestions`, `generateCodingQuestions`, `generateHRQuestions` from `@/lib/llm` (Task 1 signatures).
- Produces: `export async function fetchOrGenerateQuestion(decision: NextQuestionDecision, sessionType: QuestionType, bankKey: string, opts?: { language?: string | null; framework?: string | null }): Promise<BankQuestion>`.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/ai/interviewAgent.test.ts`:

```typescript
vi.mock('@/lib/question-bank', () => ({ getQuestionsFromBank: vi.fn() }));
vi.mock('@/lib/llm', () => ({
  generateDSAQuestions: vi.fn(),
  generateCodingQuestions: vi.fn(),
  generateHRQuestions: vi.fn(),
}));

import { getQuestionsFromBank } from '@/lib/question-bank';
import { generateDSAQuestions as genDSA, generateCodingQuestions as genCoding, generateHRQuestions as genHR } from '@/lib/llm';
import { fetchOrGenerateQuestion, type NextQuestionDecision } from './interviewAgent';
// NextQuestionDecision wasn't needed as an explicit import in earlier tasks' tests
// (object literals were compared with toEqual there) — this task's tests annotate
// decision variables directly, so it needs to be added to this import line.

describe('fetchOrGenerateQuestion', () => {
  it('returns a matching question from the bank when one exists', async () => {
    vi.mocked(getQuestionsFromBank).mockResolvedValue([
      { question: 'Reverse a linked list', topic: 'Linked Lists', difficulty: 'MEDIUM' },
      { question: 'Two Sum', topic: 'Arrays', difficulty: 'EASY' },
    ]);

    const decision: NextQuestionDecision = { topic: 'Linked Lists', difficulty: Difficulty.MEDIUM, reasoning: 'x' };
    const result = await fetchOrGenerateQuestion(decision, QuestionType.DSA, 'DSA');

    expect(result.question).toBe('Reverse a linked list');
    expect(genDSA).not.toHaveBeenCalled();
  });

  it('generates fresh when the bank has no topic/difficulty match', async () => {
    vi.mocked(getQuestionsFromBank).mockResolvedValue([
      { question: 'Two Sum', topic: 'Arrays', difficulty: 'EASY' },
    ]);
    vi.mocked(genDSA).mockResolvedValue([{
      title: 'Graph BFS',
      tags: ['graphs'],
      statement: 'Traverse the graph breadth-first',
      examples: [
        { input: '[[1,2]]', output: '[0,1,2]', explanation: 'bfs order' },
        { input: '[[0]]', output: '[0]', explanation: 'single node' },
      ],
      constraints: ['nodes <= 1000'],
      expectedComplexity: { time: 'O(V+E)' },
      entryFunctionName: 'bfs',
      starterCode: 'function bfs(graph) {}',
    }]);

    const decision: NextQuestionDecision = { topic: 'Graphs', difficulty: Difficulty.HARD, reasoning: 'x' };
    const result = await fetchOrGenerateQuestion(decision, QuestionType.DSA, 'DSA');

    expect(genDSA).toHaveBeenCalledWith({ difficulty: Difficulty.HARD, count: 1, topic: 'Graphs' });
    expect(result.question).toContain('Traverse the graph breadth-first');
    expect(result.entryFunctionName).toBe('bfs');
  });

  it('generates fresh for CODING using the session language/framework', async () => {
    vi.mocked(getQuestionsFromBank).mockResolvedValue(null);
    vi.mocked(genCoding).mockResolvedValue([{
      question: 'Explain the event loop',
      language: 'JAVASCRIPT',
      framework: null,
      difficulty: Difficulty.MEDIUM,
      questionFormat: 'THEORY',
      expectedAnswerFormat: 'SHORT_ANSWER',
      followUps: [],
      tags: ['event-loop'],
      expectedTimeMinutes: 5,
      id: 'x',
    }] as never);

    const decision: NextQuestionDecision = { topic: 'Event Loop', difficulty: Difficulty.MEDIUM, reasoning: 'x' };
    const result = await fetchOrGenerateQuestion(decision, QuestionType.CODING, 'JAVASCRIPT', { language: 'JAVASCRIPT', framework: null });

    expect(genCoding).toHaveBeenCalledWith({ language: 'JAVASCRIPT', framework: null, difficulty: Difficulty.MEDIUM, count: 1, topic: 'Event Loop' });
    expect(result.question).toContain('Explain the event loop');
  });

  it('generates fresh for HR', async () => {
    vi.mocked(getQuestionsFromBank).mockResolvedValue(null);
    vi.mocked(genHR).mockResolvedValue([{
      question: 'Describe a time you led a project',
      category: 'LEADERSHIP',
      guidance: 'Look for ownership',
      expectedTimeMinutes: 5,
      id: 'x',
    }] as never);

    const decision: NextQuestionDecision = { topic: 'Leadership', difficulty: Difficulty.MEDIUM, reasoning: 'x' };
    const result = await fetchOrGenerateQuestion(decision, QuestionType.HR, 'HR');

    expect(genHR).toHaveBeenCalledWith({ difficulty: Difficulty.MEDIUM, count: 1, topic: 'Leadership' });
    expect(result.question).toBe('Describe a time you led a project');
    expect(result.answer_guide).toBe('Look for ownership');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/ai/interviewAgent.test.ts`
Expected: FAIL — `fetchOrGenerateQuestion` not exported yet.

- [ ] **Step 3: Implement `fetchOrGenerateQuestion`**

Add to `src/lib/ai/interviewAgent.ts`:

```typescript
import { getQuestionsFromBank, type BankQuestion } from '@/lib/question-bank';
import { generateDSAQuestions, generateCodingQuestions, generateHRQuestions, type DSAQuestion, type CodingQuestion } from '@/lib/llm';

// Mirrors the private formatDSADescription/formatCodingDescription helpers in
// mock.actions.ts. Duplicated (not imported) because that file has 'use server'
// at the top, which requires every export to be an async server action.
function formatDSAQuestionText(q: DSAQuestion): string {
  const examples = q.examples
    .map((ex, i) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`)
    .join('\n\n');
  const constraints = q.constraints?.map((c) => `- ${c}`).join('\n') || 'None';
  return `${q.statement}\n\n### Examples\n${examples}\n\n### Constraints\n${constraints}`;
}

function formatCodingQuestionText(q: CodingQuestion): string {
  let desc = q.question;
  if (q.examples?.length) {
    desc += `\n\n### Examples\n${q.examples.map((ex, i) => `**Example ${i + 1}:**\n- **Input:** ${ex.input}\n- **Output:** ${ex.output}\n- **Explanation:** ${ex.explanation}`).join('\n\n')}`;
  }
  if (q.constraints?.length) {
    desc += `\n\n### Constraints\n${q.constraints.map((c) => `- ${c}`).join('\n')}`;
  }
  return desc;
}

async function generateSingleQuestion(
  decision: NextQuestionDecision,
  sessionType: QuestionType,
  opts: { language?: string | null; framework?: string | null }
): Promise<BankQuestion> {
  if (sessionType === QuestionType.DSA) {
    const [q] = await generateDSAQuestions({ difficulty: decision.difficulty, count: 1, topic: decision.topic });
    if (!q) throw new Error('generateDSAQuestions returned no questions');
    return {
      question: formatDSAQuestionText(q),
      topic: decision.topic,
      difficulty: decision.difficulty,
      examples: q.examples,
      entryFunctionName: q.entryFunctionName,
      starterCode: q.starterCode,
    };
  }

  if (sessionType === QuestionType.CODING) {
    const [q] = await generateCodingQuestions({
      language: opts.language || 'JAVASCRIPT',
      framework: opts.framework,
      difficulty: decision.difficulty,
      count: 1,
      topic: decision.topic,
    });
    if (!q) throw new Error('generateCodingQuestions returned no questions');
    return {
      question: formatCodingQuestionText(q),
      topic: decision.topic,
      difficulty: decision.difficulty,
      examples: q.examples,
      entryFunctionName: q.entryFunctionName,
      starterCode: q.starterCode,
    };
  }

  const [q] = await generateHRQuestions({ difficulty: decision.difficulty, count: 1, topic: decision.topic });
  if (!q) throw new Error('generateHRQuestions returned no questions');
  return {
    question: q.question,
    answer_guide: q.guidance,
    topic: decision.topic,
    difficulty: decision.difficulty,
  };
}

/**
 * The agent's tool step. Prefers the existing question bank (free, instant);
 * only calls out to the LLM generators when the bank has no topic+difficulty
 * match for this decision.
 */
export async function fetchOrGenerateQuestion(
  decision: NextQuestionDecision,
  sessionType: QuestionType,
  bankKey: string,
  opts: { language?: string | null; framework?: string | null } = {}
): Promise<BankQuestion> {
  const pool = await getQuestionsFromBank(bankKey);
  const matches = (pool ?? []).filter(
    (q) =>
      q.topic?.toLowerCase() === decision.topic.toLowerCase() &&
      q.difficulty?.toLowerCase() === decision.difficulty.toLowerCase()
  );

  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)];
  }

  return generateSingleQuestion(decision, sessionType, opts);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/ai/interviewAgent.test.ts`
Expected: PASS (12 tests total)

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ai/interviewAgent.ts src/lib/ai/interviewAgent.test.ts
git commit -m "feat: add bank-first, generate-fallback tool step to interview agent"
```

---

### Task 5: `getNextQuestionAction` in `mock.actions.ts`

**Files:**
- Modify: `src/app/actions/mock.actions.ts`
- Test: `src/app/actions/mock.actions.test.ts` (new)

**Interfaces:**
- Consumes: `decideNextQuestion`, `fetchOrGenerateQuestion`, `type PerformanceEntry` from `@/lib/ai/interviewAgent` (Tasks 3-4); existing private `saveBankQuestionsToDb`, `mapQuestion` in this same file (no import needed, already in scope).
- Produces: `export async function getNextQuestionAction(userId: string, sessionId: string): Promise<AppQuestion>`.

- [ ] **Step 1: Write the failing test**

Create `src/app/actions/mock.actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mockSession: { findFirst: vi.fn(), update: vi.fn() },
    mockResult: { findMany: vi.fn() },
    question: { create: vi.fn() },
  },
}));
vi.mock('@/lib/ai/interviewAgent', () => ({
  decideNextQuestion: vi.fn(),
  fetchOrGenerateQuestion: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { decideNextQuestion, fetchOrGenerateQuestion } from '@/lib/ai/interviewAgent';
import { getNextQuestionAction } from './mock.actions';
import { Difficulty, QuestionType } from '@/types/enums';

describe('getNextQuestionAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('decides, fetches, saves, and appends the next question', async () => {
    vi.mocked(prisma.mockSession.findFirst).mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      interviewType: QuestionType.DSA,
      questionIds: ['q1'],
      language: null,
      framework: null,
    } as never);
    vi.mocked(prisma.mockResult.findMany).mockResolvedValue([
      { score: 40, question: { topic: 'Arrays', difficulty: Difficulty.MEDIUM } },
    ] as never);
    vi.mocked(decideNextQuestion).mockResolvedValue({
      topic: 'Arrays',
      difficulty: Difficulty.EASY,
      reasoning: 'weak score',
    });
    vi.mocked(fetchOrGenerateQuestion).mockResolvedValue({
      question: 'Reverse an array',
      topic: 'Arrays',
      difficulty: 'EASY',
    });
    vi.mocked(prisma.question.create).mockResolvedValue({
      id: 'q2',
      title: 'Reverse an array',
      description: 'Reverse an array',
      topic: 'Arrays',
      difficulty: Difficulty.EASY,
      type: QuestionType.DSA,
      testCases: [],
      hints: [],
      tags: [],
    } as never);

    const result = await getNextQuestionAction('user-1', 'session-1');

    expect(decideNextQuestion).toHaveBeenCalledWith(
      [{ topic: 'Arrays', difficulty: Difficulty.MEDIUM, score: 40 }],
      QuestionType.DSA
    );
    expect(fetchOrGenerateQuestion).toHaveBeenCalledWith(
      { topic: 'Arrays', difficulty: Difficulty.EASY, reasoning: 'weak score' },
      QuestionType.DSA,
      'DSA',
      { language: null, framework: null }
    );
    expect(prisma.mockSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { questionIds: ['q1', 'q2'] },
    });
    expect(result.id).toBe('q2');
  });

  it('throws SESSION_COMPLETE when the session already has the target question count', async () => {
    vi.mocked(prisma.mockSession.findFirst).mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      interviewType: QuestionType.DSA,
      questionIds: ['q1', 'q2', 'q3'],
      language: null,
      framework: null,
    } as never);

    await expect(getNextQuestionAction('user-1', 'session-1')).rejects.toThrow('This session has no more questions');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/actions/mock.actions.test.ts`
Expected: FAIL — `getNextQuestionAction` not exported yet.

- [ ] **Step 3: Implement `getNextQuestionAction`**

Add near the top of `src/app/actions/mock.actions.ts`, after the existing imports:

```typescript
import { decideNextQuestion, fetchOrGenerateQuestion, type PerformanceEntry } from '@/lib/ai/interviewAgent';
```

Add a constant and the new action (place after `getMockSessionAction`, before `submitSolutionAction`):

```typescript
const TARGET_QUESTION_COUNT: Record<string, number> = {
  DSA: 3,
  CODING: 12,
  HR: 7,
};

/** Agent-driven: pick and persist the next question for an in-progress session. */
export async function getNextQuestionAction(
  userId: string,
  sessionId: string
): Promise<AppQuestion> {
  const session = await prisma.mockSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw new AppError('Session not found', 'NOT_FOUND', 404);

  const targetCount = TARGET_QUESTION_COUNT[session.interviewType];
  if (!targetCount || session.questionIds.length >= targetCount) {
    throw new AppError('This session has no more questions', 'SESSION_COMPLETE', 400);
  }

  const results = await prisma.mockResult.findMany({
    where: { sessionId },
    include: { question: true },
    orderBy: { submittedAt: 'asc' },
  });

  const entries: PerformanceEntry[] = results
    .filter((r) => r.question)
    .map((r) => ({
      topic: r.question!.topic,
      difficulty: r.question!.difficulty as unknown as Difficulty,
      score: r.score,
    }));

  if (entries.length === 0) {
    throw new AppError('Cannot fetch the next question before the first is answered', 'INVALID_STATE', 400);
  }

  const decision = await decideNextQuestion(entries, session.interviewType as QuestionType);

  const bankKey =
    session.interviewType === QuestionType.DSA
      ? 'DSA'
      : session.interviewType === QuestionType.CODING && session.framework && session.framework !== 'NONE'
        ? `${session.language} ${session.framework}`
        : session.language || 'HR';

  const bankQuestion = await fetchOrGenerateQuestion(
    decision,
    session.interviewType as QuestionType,
    bankKey,
    { language: session.language, framework: session.framework }
  );

  const [saved] = await saveBankQuestionsToDb(
    [bankQuestion],
    session.interviewType as QuestionType,
    decision.difficulty,
    { language: session.language, framework: session.framework }
  );

  if (!saved) throw new AppError('Failed to save the generated question', 'AI_GENERATION_FAILED', 503);

  await prisma.mockSession.update({
    where: { id: sessionId },
    data: { questionIds: [...session.questionIds, saved.id] },
  });

  return mapQuestion(saved);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/actions/mock.actions.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/mock.actions.ts src/app/actions/mock.actions.test.ts
git commit -m "feat: add getNextQuestionAction for agent-driven question selection"
```

---

### Task 6: Trim session creation to one initial question

**Files:**
- Modify: `src/app/actions/mock.actions.ts:242,289,332,387,444` (the five `createMockSession` call sites in `startDSAMock`, `startCodingMock`, `startHRMock`)
- Test: `src/app/actions/mock.actions.test.ts`

**Interfaces:**
- Consumes: nothing new — this task only changes which slice of an already-produced array is passed to the existing `createMockSession`.
- Produces: `startMockAction(...)` now always creates a session with `questionIds.length === 1`, regardless of type.

- [ ] **Step 1: Write the failing test**

Add to `src/app/actions/mock.actions.test.ts` (extend the mocked `prisma` object at the top of the file with `user: { findUnique: vi.fn(), update: vi.fn() }`, `mockSession: { ...existing, create: vi.fn() }`, `question: { ...existing, findMany: vi.fn() }`, `skillQuestionBank: { findFirst: vi.fn() }`):

```typescript
vi.mock('@/lib/llm', () => ({
  generateDSAQuestions: vi.fn(),
  generateCodingQuestions: vi.fn(),
  generateHRQuestions: vi.fn(),
  normalizeEnum: vi.fn((val) => val),
}));
vi.mock('@/lib/code-runner', () => ({ runTests: vi.fn() }));
vi.mock('@/lib/supabase/storage', () => ({ getSignedUrl: vi.fn() }));
vi.mock('@/lib/question-bank', () => ({
  getQuestionsFromBank: vi.fn().mockResolvedValue(null),
  generateAndCacheQuestionBank: vi.fn(),
}));

import { generateDSAQuestions } from '@/lib/llm';
import { startMockAction } from './mock.actions';
import { UserLevel } from '@/types/enums';

describe('startMockAction question count', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a DSA session with exactly one initial question', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      level: UserLevel.INTERMEDIATE,
      subscriptionTier: 'FREE',
      freeMocksRemaining: 3,
    } as never);
    vi.mocked(prisma.question.findMany).mockResolvedValue([]);
    vi.mocked(generateDSAQuestions).mockResolvedValue([
      {
        title: 'Two Sum', tags: ['array'], statement: 'Find two numbers',
        examples: [
          { input: '[2,7], 9', output: '[0,1]', explanation: 'x' },
          { input: '[1,2], 3', output: '[0,1]', explanation: 'y' },
        ],
        constraints: [], expectedComplexity: { time: 'O(n)' },
      },
      {
        title: 'Reverse List', tags: ['list'], statement: 'Reverse it',
        examples: [
          { input: '[1,2]', output: '[2,1]', explanation: 'x' },
          { input: '[3]', output: '[3]', explanation: 'y' },
        ],
        constraints: [], expectedComplexity: { time: 'O(n)' },
      },
    ] as never);
    vi.mocked(prisma.question.create).mockImplementation(({ data }: never) =>
      Promise.resolve({ id: `q-${Math.random()}`, ...data })
    );
    vi.mocked(prisma.mockSession.create).mockImplementation(({ data }: never) =>
      Promise.resolve({ id: 'session-1', startedAt: new Date(), completedAt: null, ...data })
    );
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const session = await startMockAction('user-1', { type: 'DSA' } as never);

    expect(session.questionIds).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/actions/mock.actions.test.ts`
Expected: FAIL — `session.questionIds` currently has 2 entries (both generated questions), not 1.

- [ ] **Step 3: Slice to one question at each `createMockSession` call site**

In `startDSAMock`, line ~242:
```typescript
return createMockSession(userId, QuestionType.DSA, savedFromBank.slice(0, 1), user);
```
and line ~289:
```typescript
return createMockSession(userId, QuestionType.DSA, selected.slice(0, 1), user);
```

In `startCodingMock`, line ~332:
```typescript
return createMockSession(userId, QuestionType.CODING, savedFromBank.slice(0, 1), user, sessionOpts);
```
and line ~387:
```typescript
return createMockSession(userId, QuestionType.CODING, savedQuestions.slice(0, 1), user, sessionOpts);
```

In `startHRMock`, line ~444:
```typescript
return createMockSession(userId, QuestionType.HR, savedQuestions.slice(0, 1), user);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/actions/mock.actions.test.ts`
Expected: PASS (all tests in the file, including Task 5's)

- [ ] **Step 5: Run full suite and typecheck**

Run: `npx vitest run && npx tsc --noEmit -p .`
Expected: everything passes, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/mock.actions.ts src/app/actions/mock.actions.test.ts
git commit -m "feat: start mock sessions with one question, agent fills in the rest"
```

---

### Task 7: Linear, progressively-revealed frontend flow

**Files:**
- Modify: `src/app/mock/[id]/page.tsx`

**Interfaces:**
- Consumes: `getNextQuestionAction(userId: string, sessionId: string): Promise<AppQuestion>` (Task 5) via the existing server-action-calling convention in this file (check how `submitSolutionAction`/`getMockSessionAction` are currently invoked from this component — likely a client wrapper in `src/lib/api-client.ts` or similar; match that pattern exactly rather than calling the server action directly from a client component).

No automated test: this repo has no component-level test infra (only `*.test.ts` files exist under `src/lib` and `src/app/api`, none under `src/app/**/page.tsx`). Verify manually per Step 4.

- [ ] **Step 1: Locate the existing client-side call pattern**

Run: `grep -n "submitSolutionAction\|getMockSessionAction" src/app/mock/\[id\]/page.tsx`

Confirm whether these are called directly (server actions can be called from client components in Next.js) or through a wrapper. Use the same pattern for `getNextQuestionAction`.

- [ ] **Step 2: Restrict `handleQuestionSelect` to answered-or-current indices**

In `src/app/mock/[id]/page.tsx`, modify `handleQuestionSelect` (around line 265):

```typescript
const handleQuestionSelect = (idx: number) => {
  if (idx === currentQuestionIndex) return;
  if (idx > currentQuestionIndex) return; // can't jump ahead — future questions don't exist yet

  // If user has written code and hasn't submitted, show confirmation
  if (hasUnsavedProgress) {
    const confirmed = window.confirm(
      '⚠️ Switching questions will reset your current progress.\n\nYour code for this question will be lost. Are you sure you want to continue?'
    );
    if (!confirmed) return;
  }

  setCurrentQuestionIndex(idx);
};
```

- [ ] **Step 3: Fetch the next question on submit instead of just advancing the index**

Find the submit handler (around line 236-255, where `currentQuestionIndex` is incremented after a successful submission). Change it so that after a successful submit, it calls `getNextQuestionAction(userId, session.id)`, appends the result to local `session.questions` state, and only then advances `currentQuestionIndex`. If the action throws `SESSION_COMPLETE`, treat that the same as reaching the end of the question list today (existing completion UI).

Since the exact local state shape (`session` from a query hook vs local `useState`) needs to be read directly from the file rather than guessed, the implementer should:
1. Read the current submit handler in full.
2. Wrap the existing "advance to next index" logic with a call to `getNextQuestionAction`, using the same error-handling/loading-state conventions already used elsewhere in this file (e.g. how `submitSolutionAction`'s loading/error state is handled).
3. On `SESSION_COMPLETE`, skip fetching and proceed to the existing completion flow unchanged.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, start a new DSA mock, submit an answer, confirm:
- A new question appears after submit (not from a pre-loaded batch).
- The sidebar shows the answered question as clickable/read-only and does not show any question beyond the current one.
- Clicking the answered question shows it without allowing re-submission (existing read-only rendering for submitted questions — verify this already works, since `submittedResult` state already gates the editor per the existing code).
- After 3 questions (DSA), the session completes as before.

- [ ] **Step 5: Commit**

```bash
git add src/app/mock/\[id\]/page.tsx
git commit -m "feat: progressive question reveal in the mock interview UI"
```

---

## Post-plan note for the roadmap doc

`docs/AI_ENGINEERING_ROADMAP.md` still says "no tool use — code is eyeballed by the model." That's stale (see Task-independent correction noted in the design spec's "Problem" section) and should be fixed in a follow-up doc edit — not included as a task here since it's a one-line doc correction unrelated to any task's tests.
