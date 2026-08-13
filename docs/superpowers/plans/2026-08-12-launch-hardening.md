# Launch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CareerSpire (Mocky) reliable and observable enough to launch by Sunday — fail loudly and recoverably instead of silently, and give the team visibility into prod errors and AI-call cost/latency for the first time.

**Architecture:** Additive only — no rewrites of existing auth/rate-limit/CSRF work (already solid). Add Next.js App Router error boundaries at the root and route-group levels, a boot-time env guard imported by the app entrypoint, a `/api/health` endpoint, Sentry wired through `@sentry/nextjs`'s standard three-config setup, a timeout+logging wrapper around the existing `aiChat`/`aiChatJSON` calls in `src/lib/ai/index.ts`, and a `Content-Security-Policy` header alongside the security headers already in `src/middleware.ts`.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5.9, Prisma 7 + Postgres (Supabase), `@sentry/nextjs`, existing `groq-sdk` / `@google/generative-ai`.

## Global Constraints

- Next.js version: 16.1.6 — use App Router conventions (`error.tsx`, `global-error.tsx`, `not-found.tsx`), not Pages Router.
- Do not touch `src/lib/rate-limit.ts`, `src/lib/csrf.ts`, or `src/app/api/auth/*` — already production-hardened, out of scope for this plan.
- Every new/modified file must pass `npm run build` (runs `prisma generate && next build`) before commit.
- No new required env vars without a fallback — if `SENTRY_DSN` is unset, Sentry must no-op, not crash the app (Sentry SDK does this by default; verify, don't assume).
- Deadline is Sunday — tasks are ordered by risk reduction per unit effort; if time runs out, later tasks (7, 8) are safe to defer, tasks 1–4 are not.

---

### Task 1: Boot-time environment variable validation

**Files:**
- Create: `src/lib/env.ts`
- Modify: `next.config.js` (import and call the validator at module load, so it runs at build/start, not per-request)
- Test: `src/lib/env.test.ts`

**Interfaces:**
- Produces: `validateEnv(): void` — throws `Error` listing every missing required var if any are absent; no-op if all present. Also exports `REQUIRED_ENV_VARS: readonly string[]` for the test to reuse.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/env.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv, REQUIRED_ENV_VARS } from './env';

describe('validateEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Start from a fully-populated env so each test controls exactly one variable
    for (const key of REQUIRED_ENV_VARS) {
      process.env[key] = 'test-value';
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('does not throw when all required vars are set', () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws listing every missing var when some are absent', () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;

    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
    expect(() => validateEnv()).toThrow(/JWT_SECRET/);
  });

  it('does not flag optional vars as missing', () => {
    delete process.env.SENTRY_DSN; // optional, not in REQUIRED_ENV_VARS
    expect(() => validateEnv()).not.toThrow();
  });
});
```

Note: this repo has no test runner configured yet (`package.json` only has `test:pipeline`). Install `vitest` as a dev dependency for this task: `npm install -D vitest`. Add a `"test": "vitest run"` script to `package.json`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/env.test.ts`
Expected: FAIL with "Cannot find module './env'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/env.ts

/**
 * Vars the app cannot function without. Missing any of these should fail
 * fast at startup with a clear message, not surface as a cryptic runtime
 * crash the first time a request touches the missing config.
 */
export const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
  'GOOGLE_AI_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Set these before starting the app — see docs/PRODUCTION_FEATURES.md#configuration.`
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/env.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Wire into app startup**

```javascript
// next.config.js — add at the very top, before nextConfig is defined
const { validateEnv } = require('./src/lib/env.ts');
```

This won't work directly since `next.config.js` is CommonJS and `env.ts` is a TS ES module. Instead, call `validateEnv()` from `src/instrumentation.ts` (Next.js's supported startup hook, runs once when the server starts, before any request is handled):

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    validateEnv();
  }
}
```

Skip the `next.config.js` edit from this step — `instrumentation.ts` is the correct hook and needs no config change beyond the file existing (Next.js 16 picks it up automatically).

- [ ] **Step 6: Verify manually**

Run: `DATABASE_URL= npm run dev` (blank out one required var)
Expected: server startup fails immediately with the "Missing required environment variable(s): DATABASE_URL" message, not a downstream Prisma error later.

Then run `npm run dev` normally and confirm it starts clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/env.ts src/lib/env.test.ts src/instrumentation.ts package.json package-lock.json
git commit -m "feat: fail fast on missing required env vars at boot

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 2: Global error boundaries and not-found page

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/global-error.tsx`
- Create: `src/app/not-found.tsx`
- Test: manual (App Router error boundaries can't be unit tested meaningfully without a browser; verified via Step 4 below)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing other tasks depend on — these are terminal UI, but Task 4 (Sentry) modifies `error.tsx` and `global-error.tsx` to also report the caught error, so leave a clear `// Sentry.captureException` insertion point comment.

- [ ] **Step 1: Create the route-level error boundary**

```tsx
// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry hookup lands here in Task 4 — Sentry.captureException(error)
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        This page hit an unexpected error. It's been logged — try again, or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the root-level error boundary**

`error.tsx` only catches errors below the root layout — a crash in the root layout itself needs `global-error.tsx`, which must render its own `<html>`/`<body>` since it replaces the entire tree.

```tsx
// src/app/global-error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry hookup lands here in Task 4 — Sentry.captureException(error)
    console.error('[global-error-boundary]', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ maxWidth: '28rem', color: '#666' }}>
            The app hit an unexpected error loading this page. It's been logged.
          </p>
          <button
            onClick={reset}
            style={{ borderRadius: '0.375rem', background: '#111', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

Inline styles are deliberate here, not a shortcut to fix later — `global-error.tsx` replaces the root layout, so it can't rely on the app's global CSS having loaded.

- [ ] **Step 3: Create the not-found page**

```tsx
// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Go home
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Verify manually**

Run: `npm run dev`, then visit `http://localhost:3000/this-route-does-not-exist` — expect the new not-found page, not Next's default 404.

To trigger `error.tsx`: temporarily add `throw new Error('test')` at the top of any page component (e.g. `src/app/(user)/dashboard/page.tsx`), reload, confirm the error boundary renders instead of a blank/crashed page, then remove the throw.

- [ ] **Step 5: Commit**

```bash
git add src/app/error.tsx src/app/global-error.tsx src/app/not-found.tsx
git commit -m "feat: add global error boundaries and not-found page

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 3: Health check endpoint

**Files:**
- Create: `src/app/api/health/route.ts`
- Test: `src/app/api/health/route.test.ts`

**Interfaces:**
- Produces: `GET /api/health` → `200 { status: 'ok', db: 'ok', timestamp: string }` when the DB is reachable, `503 { status: 'error', db: 'error', timestamp: string }` when it isn't. This is what Task 6's uptime-monitoring note points at.

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/api/health/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { prisma } from '@/lib/prisma';

describe('GET /api/health', () => {
  it('returns 200 and ok status when the DB responds', async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ '?column?': 1 }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.db).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
  });

  it('returns 503 when the DB query throws', async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('connection refused'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('error');
    expect(body.db).toBe('error');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/health/route.test.ts`
Expected: FAIL with "Cannot find module './route'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'ok', db: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('[health] DB check failed:', error);
    return NextResponse.json(
      { status: 'error', db: 'error', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/health/route.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Verify manually and confirm it's not behind auth**

`/api/health` isn't in `apiPublicRoutes` in `src/middleware.ts`, so it'll currently 401 for unauthenticated callers — which defeats the point (uptime monitors don't have a login session). Add it:

```typescript
// src/middleware.ts — modify the apiPublicRoutes array
const apiPublicRoutes = ['/api/auth/signup', '/api/auth/signin', '/api/health'];
```

Run: `npm run dev`, then `curl -i http://localhost:3000/api/health` (no cookies) — expect `200` with the JSON body, not a `401`.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/health/route.ts src/app/api/health/route.test.ts src/middleware.ts
git commit -m "feat: add public /api/health endpoint for uptime monitoring

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 4: Sentry error tracking

**Files:**
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Create: `sentry.edge.config.ts`
- Modify: `next.config.js` (wrap export with `withSentryConfig`)
- Modify: `src/instrumentation.ts` (register Sentry's instrumentation hook per Sentry's Next.js docs)
- Modify: `src/app/error.tsx`, `src/app/global-error.tsx` (call `Sentry.captureException` at the insertion points left in Task 2)
- Test: manual (Sentry SDK behavior isn't worth unit-testing; verified via Step 5 below)

**Interfaces:**
- Consumes: `src/app/error.tsx` and `src/app/global-error.tsx` from Task 2 (the `// Sentry hookup lands here` comments).
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Install `@sentry/nextjs` and hand-write the config (no interactive wizard)**

No Sentry account exists yet and nobody is available to complete the wizard's interactive org/project login — so skip `npx @sentry/wizard` entirely and set this up by hand, matching Sentry's documented manual Next.js setup. This means `SENTRY_DSN` will be unset for now and Sentry stays fully wired but dormant (no-ops cleanly per Step 3) until a real DSN is added later — no code changes needed at that point, just setting the env var.

Run: `npm install @sentry/nextjs`

Then check the installed version's exact API before writing the config files — the shape below is current for recent `@sentry/nextjs` (v8+) but confirm against `node_modules/@sentry/nextjs/build/types/index.d.ts` or the package's README before committing, since a mismatch here fails silently (Sentry just never reports) rather than throwing:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
```

```javascript
// next.config.js — wrap the existing export
const { withSentryConfig } = require('@sentry/nextjs');

// ...existing nextConfig object unchanged above this line...

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN, // no token yet — skip source map upload rather than fail the build
});
```

The original `next.config.js` uses `export default nextConfig` (ES module syntax) — check which module syntax the file actually uses before applying the wrap above and match it (`export default withSentryConfig(...)` if ESM). Read the current file first; don't assume.

- [ ] **Step 2: Wire `src/instrumentation.ts`**

Extend Task 1's `instrumentation.ts` to also load the server/edge Sentry config. Confirm `validateEnv()` still runs and runs *before* Sentry's init (so a missing-env-var failure surfaces as our clear error message, not a Sentry init crash):

```typescript
// src/instrumentation.ts — expected shape after the wizard, confirm/fix ordering
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    validateEnv();

    const Sentry = await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
```

- [ ] **Step 3: Confirm `SENTRY_DSN` is optional, not required**

`SENTRY_DSN` must NOT be added to `REQUIRED_ENV_VARS` in `src/lib/env.ts` (leave that file untouched). Confirm the Sentry SDK no-ops cleanly with an empty/undefined DSN — this is default SDK behavior, but verify it: run `npm run dev` with no `SENTRY_DSN` set (the actual current state) and confirm the app starts with no Sentry-related crash or unhandled exception, just silence or a benign SDK log line. Capture the real terminal output in the report, not just an assertion that it "should" work.

- [ ] **Step 4: Wire error boundaries to report**

```tsx
// src/app/error.tsx — replace the console.error insertion point
import * as Sentry from '@sentry/nextjs';
// ...
useEffect(() => {
  Sentry.captureException(error);
}, [error]);
```

```tsx
// src/app/global-error.tsx — same replacement
import * as Sentry from '@sentry/nextjs';
// ...
useEffect(() => {
  Sentry.captureException(error);
}, [error]);
```

- [ ] **Step 5: Verify what's verifiable without a live DSN**

There is no Sentry account/DSN available right now, so the dashboard-delivery check from a real account cannot be done in this task. Instead verify what's checkable without one:
- `npm run build` succeeds with the `withSentryConfig` wrap in place (confirms the wrapping doesn't break the build even with no auth token — `disableSourceMapUpload` should make this a clean skip, not a failure; capture the actual build output).
- `npm run dev` starts cleanly with `SENTRY_DSN` unset (already covered in Step 3, but re-confirm after the full wiring is in place, not just the bare `Sentry.init` call).
- Grep the diff to confirm `error.tsx` and `global-error.tsx` both call `Sentry.captureException(error)` (Step 4) and that this doesn't throw even with no DSN configured — Sentry's SDK is documented to silently drop events with no DSN rather than error.

Record in the report, clearly, that dashboard-delivery is unverified pending a real Sentry account/DSN — this is a known, accepted gap for this task, not something to paper over.

- [ ] **Step 6: Commit**

```bash
git add sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts next.config.js src/instrumentation.ts src/app/error.tsx src/app/global-error.tsx package.json package-lock.json
git commit -m "feat: wire up Sentry error tracking across client/server/edge

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 5: Timeout and structured logging for AI provider calls

**Files:**
- Modify: `src/lib/ai/index.ts`
- Test: `src/lib/ai/index.test.ts`

**Interfaces:**
- Consumes: existing `groqChat` from `src/lib/ai/groq.ts`, `geminiChat` from `src/lib/ai/gemini.ts` (both unchanged).
- Produces: `aiChat` and `aiChatJSON` keep their existing exported signatures (no breaking change for `video.actions.ts` / `question-bank.ts` callers) but now: (a) abort a provider call after 20s instead of hanging until the platform's own function timeout, and (b) log one structured line per call with `provider`, `durationMs`, `success`, and (for `aiChatJSON`) `promptChars` as a rough proxy for token cost.

This is the same blind spot the AI roadmap doc flagged — "tutorRouter's routing heuristic has never actually been measured." This task doesn't fix the routing itself, but it makes the data to evaluate it start accumulating from today.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./groq', () => ({ groqChat: vi.fn() }));
vi.mock('./gemini', () => ({ geminiChat: vi.fn() }));

import { groqChat } from './groq';
import { geminiChat } from './gemini';
import { aiChat, AICallError } from './index';

describe('aiChat timeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aborts a hung Groq call and falls back to Gemini', async () => {
    vi.mocked(groqChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );
    vi.mocked(geminiChat).mockResolvedValue('gemini response');

    const resultPromise = aiChat('test prompt', { timeoutMs: 50 });
    const result = await resultPromise;

    expect(result.provider).toBe('gemini');
    expect(result.content).toBe('gemini response');
  }, 10_000);

  it('throws AICallError when both providers time out', async () => {
    vi.mocked(groqChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );
    vi.mocked(geminiChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );

    await expect(aiChat('test prompt', { timeoutMs: 50 })).rejects.toThrow(AICallError);
  }, 10_000);

  it('logs a structured line with provider, durationMs, and success', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(groqChat).mockResolvedValue('groq response');

    await aiChat('test prompt');

    const structuredLog = logSpy.mock.calls.find(([line]) =>
      typeof line === 'string' && line.startsWith('[AI_METRICS]')
    );
    expect(structuredLog).toBeDefined();
    const payload = JSON.parse((structuredLog![0] as string).replace('[AI_METRICS] ', ''));
    expect(payload.provider).toBe('groq');
    expect(payload.success).toBe(true);
    expect(typeof payload.durationMs).toBe('number');

    logSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ai/index.test.ts`
Expected: FAIL — `timeoutMs` option doesn't exist yet, calls never abort, no `[AI_METRICS]` log line.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/ai/index.ts — full replacement
import { groqChat, type GroqChatOptions } from './groq';
import { geminiChat } from './gemini';

export interface AIChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
  /** Force a specific provider instead of auto-fallback */
  provider?: 'groq' | 'gemini';
  /** Use Gemini for final report generation (as per spec) */
  useGemini?: boolean;
  /** Abort a single provider call after this many ms. Default 20000. */
  timeoutMs?: number;
}

export interface AIResult {
  content: string;
  provider: 'groq' | 'gemini';
}

const DEFAULT_TIMEOUT_MS = 20_000;

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests');
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status: number }).status === 429;
  }
  return false;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

function logMetrics(provider: 'groq' | 'gemini', durationMs: number, success: boolean, promptChars: number) {
  // Deliberately a plain console.log line, not a dashboard call — cheapest
  // possible observability win. Structured so it's greppable/parseable from
  // Vercel logs (or any log drain) later without changing this call site.
  console.log(
    `[AI_METRICS] ${JSON.stringify({ provider, durationMs, success, promptChars, timestamp: new Date().toISOString() })}`
  );
}

/**
 * Unified AI caller — tries Groq first, falls back to Gemini on 429, failure,
 * or timeout. Never exposes raw errors to the caller — returns a typed error
 * object. Every call is time-boxed so a hung upstream provider can't hang
 * the whole request until the platform's own function timeout.
 */
export async function aiChat(
  prompt: string,
  options: AIChatOptions = {}
): Promise<AIResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (options.useGemini || options.provider === 'gemini') {
    return callGemini(prompt, options, timeoutMs);
  }

  if (options.provider === 'groq') {
    return callGroq(prompt, options, timeoutMs);
  }

  try {
    return await callGroq(prompt, options, timeoutMs);
  } catch (groqError) {
    const isRate = isRateLimitError(groqError);
    console.warn(
      `[AI] Groq ${isRate ? 'rate limited (429)' : 'failed'}: ${groqError instanceof Error ? groqError.message : 'Unknown error'}. Falling back to Gemini.`
    );

    try {
      return await callGemini(prompt, options, timeoutMs);
    } catch (geminiError) {
      console.error(
        `[AI] Gemini fallback also failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`
      );
      throw new AICallError(
        'Both Groq and Gemini failed. Please try again later.',
        'both',
        false
      );
    }
  }
}

async function callGroq(prompt: string, options: AIChatOptions, timeoutMs: number): Promise<AIResult> {
  const startedAt = Date.now();
  try {
    const content = await withTimeout(
      groqChat(prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        responseFormat: options.responseFormat,
      }),
      timeoutMs,
      'Groq'
    );
    logMetrics('groq', Date.now() - startedAt, true, prompt.length);
    console.log('[AI] Response from: Groq (llama-3.3-70b-versatile)');
    return { content, provider: 'groq' };
  } catch (error) {
    logMetrics('groq', Date.now() - startedAt, false, prompt.length);
    throw error;
  }
}

async function callGemini(prompt: string, options: AIChatOptions, timeoutMs: number): Promise<AIResult> {
  const startedAt = Date.now();
  try {
    const content = await withTimeout(
      geminiChat(prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        responseFormat: options.responseFormat,
      }),
      timeoutMs,
      'Gemini'
    );
    logMetrics('gemini', Date.now() - startedAt, true, prompt.length);
    console.log('[AI] Response from: Gemini (gemini-2.0-flash)');
    return { content, provider: 'gemini' };
  } catch (error) {
    logMetrics('gemini', Date.now() - startedAt, false, prompt.length);
    throw error;
  }
}

/**
 * Convenience: call AI and parse the response as JSON.
 * Retries once on parse failure before throwing.
 */
export async function aiChatJSON<T = unknown>(
  prompt: string,
  options: Omit<AIChatOptions, 'responseFormat'> = {}
): Promise<{ data: T; provider: 'groq' | 'gemini' }> {
  const jsonPrompt = prompt + '\n\nReturn ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.';

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await aiChat(jsonPrompt, { ...options, responseFormat: 'json_object' });
      const data = JSON.parse(result.content) as T;
      return { data, provider: result.provider };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) {
        console.warn('[AI] JSON parse failed, retrying once...');
      }
    }
  }

  throw new AICallError(
    `Failed to get valid JSON from AI: ${lastError?.message}`,
    'unknown',
    false
  );
}

export class AICallError extends Error {
  provider: string;
  isRateLimit: boolean;

  constructor(message: string, provider: string, isRateLimit: boolean) {
    super(message);
    this.name = 'AICallError';
    this.provider = provider;
    this.isRateLimit = isRateLimit;
  }
}
```

Note: `GroqChatOptions` import is kept even though unused directly by name in this diff, matching the original file's import — remove it only if `npm run lint` flags it as unused.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ai/index.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Run the full existing pipeline test to confirm no regression**

Run: `npm run test:pipeline`
Expected: passes as it did before this change (this script predates the plan — it's the repo's existing check, not one this plan adds).

- [ ] **Step 6: Commit**

```bash
git add src/lib/ai/index.ts src/lib/ai/index.test.ts
git commit -m "feat: add timeout and structured cost/latency logging to AI calls

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 6: Content-Security-Policy header

**Files:**
- Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Add a CSP alongside the existing security headers**

```typescript
// src/middleware.ts — inside addSecurityHeaders, after the existing headers.set calls
response.headers.set(
  'Content-Security-Policy',
  [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js dev/hydration requires these; tighten post-launch with nonces
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io",
    "frame-ancestors 'none'",
  ].join('; ')
);
```

The `'unsafe-inline'`/`'unsafe-eval'` on `script-src` are a known, deliberate loosening — Next.js's inline hydration scripts need it without a nonce-based setup, which is more than a Sunday deadline allows. Note this explicitly as a post-launch tightening item rather than silently shipping a weaker CSP than the rest of the header set implies.

- [ ] **Step 2: Verify manually**

Run: `npm run dev`, open the app in a browser, open DevTools console — confirm no CSP violation errors on normal navigation (login, dashboard, a mock session). If Sentry reporting breaks after Task 4, add its ingest host to `connect-src` (already included above as `https://*.ingest.sentry.io` — adjust to the exact host Sentry's config shows if different).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Content-Security-Policy header

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 7: Verify Supabase automatic backups are enabled

**Files:** none — this is a dashboard verification, not a code change.

- [ ] **Step 1: Check backup status**

In the Supabase dashboard for this project: Settings → Database → Backups. Confirm daily backups are enabled (on by default for all paid tiers; free tier has no automatic backups — if this project is on free tier, this is a real gap to flag, not assume-and-move-on).

- [ ] **Step 2: Record the finding**

Add one line to `docs/PRODUCTION_FEATURES.md` under the Deployment Checklist, checking or annotating the "Set up database backups" box with what was actually found (e.g. "✅ Confirmed — Pro tier, daily backups, 7-day retention" or "⚠️ Free tier — no automatic backups; manual `pg_dump` cron recommended before launch").

- [ ] **Step 3: Commit**

```bash
git add docs/PRODUCTION_FEATURES.md
git commit -m "docs: confirm Supabase backup status for launch checklist

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

### Task 8: AI-call failure states in the UI

**Files:**
- Read first: `src/app/actions/video.actions.ts`, `src/lib/question-bank.ts` (both call `aiChat`/`aiChatJSON` from Task 5)
- Modify: whichever client components call these actions and currently don't render a distinct error state for a thrown `AICallError` (identify via the `Read first` files — trace their callers with `grep -rn "generateVideoQuestions\|questionBank" src/app --include=*.tsx` or the actual exported function names in those two files)

**Interfaces:**
- Consumes: `AICallError` from `src/lib/ai/index.ts` (Task 5) — `error.isRateLimit` and `error.message` are the fields worth branching UI copy on.

- [ ] **Step 1: Trace the actual call sites**

This task's exact file list can't be finalized without reading the two source files and their callers first (deliberately left open rather than guessed) — the engineer picking this up should:

```bash
grep -n "export" src/app/actions/video.actions.ts src/lib/question-bank.ts
grep -rln "<name of each exported function found above>" src/app --include="*.tsx"
```

- [ ] **Step 2: For each caller found, confirm it has a catch/error UI branch**

The pattern to apply at each site (adapt to the component's existing error-state convention — most already use a `useState<string | null>` for error display per the skeleton/loading components in `src/components/skeletons`):

```tsx
try {
  const result = await someActionCallingAiChat(...);
  // ...
} catch (err) {
  const message =
    err instanceof Error && err.name === 'AICallError'
      ? 'Our AI provider is temporarily unavailable. Please try again in a moment.'
      : 'Something went wrong generating this. Please try again.';
  setError(message);
}
```

- [ ] **Step 3: Verify manually**

Temporarily force a failure (e.g. set `GROQ_API_KEY=invalid` and `GOOGLE_AI_API_KEY=invalid` in `.env.local` to make both providers fail) and confirm each traced call site shows the friendly error message instead of an unhandled promise rejection or a stuck loading spinner. Restore the real keys afterward.

- [ ] **Step 4: Commit**

```bash
git add <files modified in Step 2>
git commit -m "feat: surface AI provider failures as user-facing error states

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

---

## Deferred (explicitly out of scope for Sunday)

Recorded here so they aren't silently dropped — revisit post-launch:

- Redis-backed rate limiting (current Postgres-backed limiter is already correct for launch scale; Redis is a scale optimization, not a correctness fix)
- CDN configuration for static assets
- Load testing
- Full security audit beyond the CSP header added in Task 6
- Tightening the CSP's `script-src` to remove `'unsafe-inline'`/`'unsafe-eval'` via nonces
- The AI-engineering roadmap work (RAG grounding, agent loop, eval harness) — gated on `repo-rag` shipping per `docs/AI_ENGINEERING_ROADMAP.md`, unrelated to this hardening pass
