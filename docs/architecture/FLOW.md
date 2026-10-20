# Execution Flow

A map of how a request moves through CareerSpire, kept close to the code
so it doesn't drift. Update this when you add a route group, a new
top-level lib, or change the shape of a core flow — not for every PR.

## 1. Entry point

Next.js App Router. Every request hits `src/middleware.ts` first
(matcher excludes `_next/static`, `_next/image`, `favicon.ico`):

1. Skip auth for `_next`, `/api/auth/signup|signin|refresh`, `/api/csrf`, `/api/health`.
2. If the path is in `publicRoutes`/`publicExactRoutes` (`src/middleware.ts`), skip auth.
3. Otherwise require `access_token` cookie → `verifyAccessToken` (`src/lib/auth-edge.ts`).
   - Missing token → redirect to `/auth/login` (page) or 401 JSON (API).
   - Expired token → attempt silent refresh via `POST /api/auth/refresh` using
     the `refresh_token` cookie, then retry; failure clears both cookies.
4. `addSecurityHeaders()` stamps CSP/HSTS/X-Frame-Options on every response.

Route strings live in `src/config/routes.ts` (`ROUTES`) — don't hardcode
`/auth/login` etc. elsewhere.

## 2. Route groups (`src/app`)

Pages are split into route groups by audience, not by feature — each
group is its own segment with no shared layout beyond `src/app/layout.tsx`:

| Group        | Contents                                                        |
| ------------ | --------------------------------------------------------------- |
| `(company)`  | about, changelog, cookies, funding, press-kit, privacy, roadmap |
| `(legal)`    | policy/terms pages                                              |
| `(platform)` | pricing, features                                               |
| `(product)`  | practice, question-bank, resources, community                   |
| `(support)`  | docs, faqs, feedback, report-issue, request-feature             |
| `(user)`     | dashboard, profile — behind auth                                |
| `auth`       | login, signup, forgot/reset password — public                   |
| `api`        | route handlers, see below                                       |

## 3. API routes → Server Actions

Route handlers under `src/app/api/**/route.ts` are thin: auth check, rate
limit, delegate to a **Server Action**, shape the `ApiResponse`. Business
logic lives in `src/app/actions/*.actions/` (actions with more than one
concern are split into a folder — `index.ts` + one file per operation +
`shared.ts` for helpers used across them, e.g. `mock.actions/`,
`practice.actions/`, `video.actions/`, `resource.actions/`).

Example — starting a mock interview:

```
POST /api/mock/start  (src/app/api/mock/start/route.ts)
  → requireAuth()                         (src/lib/auth.ts)
  → checkRateLimit(userId, MOCK_START)    (src/lib/rate-limit.ts)
  → startMockAction(userId, body)         (src/app/actions/mock.actions/start.ts)
      → validates input, resolves difficulty from user.level
      → dispatches by QuestionType (DSA / CODING / HR)
      → generate*Questions()              (src/lib/ai/llm/*.ts)
      → question bank cache/read          (src/lib/practice/question-bank.ts)
      → createMockSession() (shared.ts)   → prisma write
  → ApiResponse<StartMockResponse> back to client
```

Client side, `src/features/mock/hooks/useMock.ts` calls
`src/features/mock/services/mock.service.ts`, which hits the `/api/mock/*`
routes — the feature module never imports Prisma or server actions
directly.

## 4. AI provider layer (`src/lib/ai`)

- `src/lib/ai/index.ts` — public entry point other code imports.
- `src/lib/ai/llmClient.ts` — provider-agnostic wrapper: timeouts,
  structured metrics, retry/fallback across providers.
- `src/lib/ai/{gemini,groq,openrouter}.ts` — provider adapters.
- `src/lib/ai/llm/{questions,feedback,syllabus,normalize}.ts` — task-specific
  prompt/response handling built on top of `llmClient`.
- `src/lib/ai/models.ts` — model id / tier config.

Anything that calls an LLM goes through `llmClient`, not a provider SDK
directly — that's where timeouts and metrics are enforced (see
`docs/DECISIONS.md`, "harden AI provider wrapper").

## 5. Config

`src/config/` centralizes cross-cutting constants: `routes.ts` (`ROUTES`),
`site.ts` (`appUrl` — strips trailing slash; see inline comment for the
double-slash bug this fixed). Add here instead of inlining
`process.env.*` or route strings in feature code.

## 6. Data layer

Prisma (`src/lib/prisma`) — schema in `prisma/`. Server actions are the
only layer that talks to Prisma directly; API routes and feature
hooks/services never import `@/lib/prisma`.

## Recent AI-assisted changes

Dated bullets — append one line per session where Claude made a
structural change (new route, new lib boundary, config move). Not for
routine bugfixes.

- **2026-08-14** — Added `docs/DECISIONS.md`, this file, and reorganized
  `docs/` into `architecture/`, `setup/`, `planning/`. No source changes.
- **2026-08-14** — Added `--inverse`/`--inverse-foreground` fixed (non-theme-
  flipping) tokens to `globals.css` for always-dark panels (CTA banners);
  fixed a real hydration mismatch in `useAuth` (`src/features/auth/hooks/
useAuth.ts`) by removing a `typeof window` SSR guard. See DECISIONS.md.
- **2026-08-14** — Added `docs/architecture/DESIGN_LANGUAGE.md` (UI taste
  audit + rules) and `.claude/skills/design-language/` (project skill
  enforcing it). Redesigned `src/app/page.tsx` hero/features/CTA to drop
  mesh-gradient blobs, badge pills, and icon-box soup per that doc.
