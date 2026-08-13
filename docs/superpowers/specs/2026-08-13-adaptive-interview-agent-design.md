# Adaptive Interview Agent — Design

Written 2026-08-13. Step 2 of `docs/AI_ENGINEERING_ROADMAP.md` ("turn the interview
conductor into an agent loop"), brought forward on the user's confirmation that
`repo-rag` has shipped and this roadmap's own gate is cleared.

## Problem

`startMockAction` currently generates every question in a session (3 DSA / 12 Coding / 7
HR) in one batch, before the candidate has answered anything. `mock/[id]/page.tsx` shows
all of them in a sidebar and lets the candidate jump to any question in any order
(`handleQuestionSelect`). Grading is real (actual test execution in `code-runner.ts`,
LLM feedback with a numeric score) but nothing about question 2 depends on how question 1
went — it's a fixed worksheet, not an interview. This is the "fixed pipeline, no adaptive
next-step decision" gap named in the roadmap.

Note: the roadmap also claimed "no tool use — code is eyeballed by the model." That's
inaccurate as of reading `code-runner.ts` for this design — `runTests()` genuinely
executes submissions (VM sandbox / subprocess) and feeds real pass/fail counts into
`generateFeedback`. That claim in the roadmap doc is stale and should be corrected there
separately; it does not block this design.

## Goal

After each answered question, an agent decides the topic and difficulty of the *next*
question based on how the session has gone so far, across all three mock types (DSA,
CODING, HR). Total question count per session stays exactly what it is today — only the
selection of topic/difficulty per step becomes adaptive. Stop condition and session length
are explicitly out of scope for this round.

## UX change (accepted trade-off)

The sidebar becomes progressive/linear instead of free-jump:
- Answered questions remain visible and clickable, **read-only** (view past answer/feedback,
  cannot re-submit).
- The current question is active.
- Future questions do not exist yet — they aren't generated until reached, so there's
  nothing to grey out or hide.

This is a deliberate product change, not a side effect: free-jump-to-any-question and
"next question depends on your answer" cannot both be true for the same question set.
Linear flow also matches how a real interview actually works, which is the point of the
whole exercise.

## Architecture

New module: `src/lib/ai/interviewAgent.ts`

```
summarizeSessionPerformance(sessionId)
  → reads existing MockResult + Question rows (no new tables) into
    { topic, difficulty, score }[]

decideNextQuestion(summary, sessionType)
  → one aiChat() call, JSON mode, short prompt, small maxTokens
  → returns { topic: string, difficulty: Difficulty, reasoning: string }
  → wrapped in the existing timeoutMs/fallback machinery (src/lib/ai/index.ts);
    on timeout or throw, fall back to a plain rule-based heuristic:
      score < 50 → same topic, one difficulty level down
      score > 80 → new topic (least-covered so far), one difficulty level up
      otherwise → same topic, same difficulty
    so a flaky LLM call never blocks the candidate mid-session

fetchOrGenerateQuestion(topic, difficulty, type)
  → tool step, deterministic:
    1. getQuestionsFromBank(topic) filtered to difficulty — reuse, no new code
    2. if pool has no match: generateDSAQuestions / generateCodingQuestions /
       generateHRQuestions (existing functions), parameterized by the chosen
       topic/difficulty instead of the session defaults
```

This is a decide → act → observe loop: the LLM call only ever produces the *decision*
(topic/difficulty/reasoning), never the question content directly. Content comes from the
existing bank-first, generate-as-fallback path you already have, which keeps the common
case cheap (bank hit = zero extra generation calls) and keeps a hard boundary between "the
agent's judgment" and "the tool's output" — the reasoning is inspectable/loggable
independent of whether the tool hit cache or generated fresh.

## Data flow

1. `startMockAction` (`mock.actions.ts`) changes to create the session with **one**
   question (topic/difficulty chosen exactly as today — user-level default), not a full
   batch. `session.questionIds` starts as a 1-element array.
2. Candidate answers → `submitSolutionAction` runs unchanged (real test execution +
   `generateFeedback`) → `MockResult` saved.
3. New `getNextQuestionAction(sessionId)`: runs `summarizeSessionPerformance` →
   `decideNextQuestion` → `fetchOrGenerateQuestion`, saves the new `Question` row, appends
   its id to `session.questionIds`, returns it to the client.
4. Repeat until `session.questionIds.length` reaches today's fixed per-type count (3 DSA /
   12 Coding / 7 HR), then complete exactly as today (`handleMockCompletion` unchanged).

## Frontend change

`src/app/mock/[id]/page.tsx`: `handleQuestionSelect` restricted to indices `<=`
highest-answered index (no jump-ahead). After submit, instead of just incrementing
`currentQuestionIndex` locally, call `getNextQuestionAction` and append the returned
question to local state before advancing. Sidebar rendering logic otherwise unchanged
(same list, same map over `session.questions`).

## Error handling

- `decideNextQuestion` failure → rule-based fallback (above), logged distinctly from the
  normal path so fallback-rate is visible in `[AI_METRICS]` logs (reuse the existing
  `logMetrics` pattern from `src/lib/ai/index.ts`, tagged with a `source: 'agent-decision'`
  field or similar).
- `fetchOrGenerateQuestion` bank-miss-then-generation-failure → surface the same
  `AppError('AI_GENERATION_FAILED', 503)` pattern already used in `startDSAMock`/
  `startCodingMock`/`startHRMock`.
- Every LLM call in this path already goes through `aiChat`'s existing Groq→Gemini
  fallback and timeout — no new resilience plumbing needed there.

## Testing

- `decideNextQuestion`: unit tests with mocked `aiChat` — verify prompt shape, JSON
  parsing, and that the rule-based fallback fires correctly on timeout/throw (mirrors the
  pattern already used in `src/lib/ai/index.test.ts`).
- `fetchOrGenerateQuestion`: unit tests with mocked `getQuestionsFromBank` and the
  `generate*Questions` functions — bank-hit path and generation-fallback path both
  covered.
- One test exercising `getNextQuestionAction` end-to-end against a fake session/result
  set, confirming `questionIds` grows by exactly one and the count-based completion check
  still fires at the right length.
- `code-runner.ts` and `generateFeedback` are untouched — no new tests needed there.

## Out of scope for this round

- Stop condition / dynamic session length (roadmap Step 2's other half — separate design
  if wanted later).
- RAG-grounded question generation (roadmap Step 1 — separate, not a prerequisite for this
  design since `fetchOrGenerateQuestion` reuses existing generation as-is).
- Eval harness (roadmap Step 3).
- Correcting the stale "no tool use" claim in `AI_ENGINEERING_ROADMAP.md` itself.
