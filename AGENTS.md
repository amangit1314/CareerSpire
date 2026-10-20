# CareerSpire — Project Brain

AI mock-interview platform. This file holds live project state — decisions,
execution flow, known bugs. Deeper specs live in `docs/` (see "Reference docs"
at the bottom) — read those when the task actually touches that area; don't
duplicate them here.

---

## Known Bugs

None open. (Last one — "test cases always failing (null problem)" — fixed
2026-08-14, commit `c5343d5`. See Decisions Log below.)

---

## Execution Flow

A map of how a request moves through CareerSpire, kept close to the code
so it doesn't drift. Update this when you add a route group, a new
top-level lib, or change the shape of a core flow — not for every PR.

### 1. Entry point

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

### 2. Route groups (`src/app`)

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

### 3. API routes → Server Actions

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

### 4. AI provider layer (`src/lib/ai`)

- `src/lib/ai/index.ts` — public entry point other code imports.
- `src/lib/ai/llmClient.ts` — provider-agnostic wrapper: timeouts,
  structured metrics, retry/fallback across providers.
- `src/lib/ai/{gemini,groq,openrouter}.ts` — provider adapters.
- `src/lib/ai/llm/{questions,feedback,syllabus,normalize}.ts` — task-specific
  prompt/response handling built on top of `llmClient`.
- `src/lib/ai/models.ts` — model id / tier config.

Anything that calls an LLM goes through `llmClient`, not a provider SDK
directly — that's where timeouts and metrics are enforced (see
"Decisions Log" below, "harden AI provider wrapper").

### 5. Config

`src/config/` centralizes cross-cutting constants: `routes.ts` (`ROUTES`),
`site.ts` (`appUrl` — strips trailing slash; see inline comment for the
double-slash bug this fixed). Add here instead of inlining
`process.env.*` or route strings in feature code.

### 6. Data layer

Prisma (`src/lib/prisma`) — schema in `prisma/`. Server actions are the
only layer that talks to Prisma directly; API routes and feature
hooks/services never import `@/lib/prisma`.

### Recent AI-assisted changes

Dated bullets — append one line per session where Claude made a
structural change (new route, new lib boundary, config move). Not for
routine bugfixes.

- **2026-08-14** — Added decisions log + execution flow doc, and reorganized
  `docs/` into `architecture/`, `setup/`, `planning/`. No source changes.
- **2026-08-14** — Added `--inverse`/`--inverse-foreground` fixed (non-theme-
  flipping) tokens to `globals.css` for always-dark panels (CTA banners);
  fixed a real hydration mismatch in `useAuth` (`src/features/auth/hooks/
useAuth.ts`) by removing a `typeof window` SSR guard. See Decisions Log.
- **2026-08-14** — Added `docs/architecture/DESIGN_LANGUAGE.md` (UI taste
  audit + rules) and `.claude/skills/design-language/` (project skill
  enforcing it). Redesigned `src/app/page.tsx` hero/features/CTA to drop
  mesh-gradient blobs, badge pills, and icon-box soup per that doc.
- **2026-09-22** — Consolidated payment persistence onto Prisma (removed the
  dead Supabase `payments`/`user_profiles` write path in the webhook);
  wired up the three dead support forms (`report-issue`, `request-feature`,
  `feedback`) to a new `support.actions.ts` that emails submissions; marked
  GitHub/LinkedIn OAuth as cut from v1 in `docs/planning/AI-Interview-MVP-Plan.md`.
  See Decisions Log.

---

## Decisions Log

A running log of non-obvious engineering decisions: what was chosen, why,
and what was rejected. Newest entry on top. Append — don't rewrite history.

Purpose: six months from now, "why did I do it this way?" should be
answerable by scrolling this log, not by re-deriving the reasoning from
the diff.

Each entry should be small — one decision, not a session summary. Skip
anything the code already makes obvious (e.g. "used TypeScript").

### 2026-09-22 — Payment persistence split-brain fixed, dead support forms wired up, OAuth marked cut

**Context:** A research pass found `src/app/api/payment/webhook/route.ts`
writing paid Razorpay orders to a Supabase client `payments`/`user_profiles`
table (snake_case columns), while `billing.actions.ts` read billing history
via `prisma.payment.findMany` against the Prisma `Payment` model. Nothing
ever called `prisma.payment.create`/`update`, and `create-order/route.ts`
created a Razorpay order without writing any DB row at all — so a
successful payment never showed up in the app's own billing history, and
the subscription-tier-upgrade logic in the webhook (dead code, since it
wrote to a table nothing else read) never actually ran.

Separately, `report-issue`, `request-feature`, and `feedback`
((support) route group) were plain server components with a `<Button>`
and no `onClick`/`onSubmit` at all — visually complete forms that silently
did nothing on submit. And `docs/planning/AI-Interview-MVP-Plan.md` still
specified GitHub/LinkedIn OAuth via NextAuth as an open MVP requirement,
even though only email/password auth was ever built.

**Decision:**

- Consolidated payment persistence on Prisma (the pattern used everywhere
  else in this app): `create-order/route.ts` now writes a `Payment` row
  (status `PENDING`) right after creating the Razorpay order, keyed by
  `razorpayOrderId`, with `subscriptionTier` set from the matched plan
  (`null` for mock/voice PAYG packs — those aren't a tier upgrade).
  `webhook/route.ts` now does `prisma.payment.update` (matched by
  `razorpayOrderId`) to `COMPLETED`/`FAILED` on `payment.captured` /
  `payment.failed`, and — only when the payment row carries a
  `subscriptionTier` (i.e. a plan purchase, not a pack) — bumps
  `user.subscriptionTier` + `user.subscriptionEndsAt` (+1 month). Removed
  the dead Supabase write path entirely (grepped first — nothing else
  referenced the `payments`/`user_profiles` Supabase tables). Signature
  verification was factored into an exported `verifyRazorpaySignature()`
  so it's unit-testable without live Razorpay keys; added
  `webhook/route.test.ts` mocking `@/lib/prisma` and `@/lib/razorpay`
  (same pattern as `api/health/route.test.ts`) covering: bad/missing
  signature, plan purchase → tier bump, pack purchase → no tier bump,
  and `payment.failed` → `FAILED` status with no user update.
- Wired the three support pages to a new `src/app/actions/support.actions.ts`
  (`submitReportIssueAction`, `submitRequestFeatureAction`,
  `submitFeedbackAction`), reusing the existing `sendEmail()` util
  (`src/lib/supabase/email.ts`) to email submissions to the app's own
  `CONTACT_EMAIL` inbox. No new DB table or admin UI — an email is a real,
  working submission path and that's the requested scope.
- Added a dated note to `AI-Interview-MVP-Plan.md` marking OAuth as
  explicitly deferred/cut from v1, instead of building it.

**Why:** "Consolidate on Prisma" matches the pattern used by every other
write path in this app (`billing.actions.ts` already reads Prisma) —
introducing a second persistence layer just for payments was the actual
bug, not a deliberate split. PAYG packs (`mock_*`/`voice_*`) intentionally
do _not_ get a subscription-tier bump — they have no tier — but there's
also no code anywhere that credits `freeMocksRemaining`/
`videoMocksRemaining` on a pack purchase; that gap predates this change,
is out of scope for "fix the split-brain," and is flagged here rather
than silently left for someone to assume it's handled.

**Verify:** `tsc --noEmit` clean; `webhook/route.test.ts` covers the
signature/branching logic without a live Razorpay key. `create-order`'s
new Prisma write has no dedicated test (thin, matches the existing
untested style of that route) — flagged as a gap, not silently skipped.

**Library/tool:** None new — Prisma and `sendEmail()` were already in the
project.

---

### 2026-08-14 — Theme-inversion CTA bug + fixed `--inverse` tokens

**Context:** User screenshotted the landing page CTA in dark mode — the
"See Pricing" outline button was near-invisible. Root cause: the CTA card
used `bg-foreground` (a token that flips lightness between themes) while
the outline button relied on `text-background`/`border-background` for
contrast. Individually each pairing is self-consistent, but the button's
`bg-transparent` override meant it depended on the _card's_ background for
contrast rather than defining its own — and this is exactly the kind of
pairing that's easy to get right in one theme and silently wrong in the
other without rendering both to check.

**Decision:** Added `--inverse` / `--inverse-foreground` CSS variables in
`globals.css`, defined once in `:root` and deliberately **not**
redeclared under `.dark`, so they never flip. The CTA card and its buttons
now reference these fixed tokens instead of `background`/`foreground`,
making the panel always render as a dark surface regardless of site theme
— matching the CTA-banner pattern already used by Linear/Vercel-style
sites (an intentional break from the page's own theme, not a bug).

**Why:** The alternative — auditing every `bg-foreground`/`text-background`
pairing by hand for contrast math — doesn't scale and doesn't survive the
next person copy-pasting the pattern. A dedicated fixed-token pair makes
the "always-dark panel" case impossible to get theme-inverted by
construction. Verified via a real headless-browser render (Playwright) in
both themes, not just OKLCH lightness math — the math alone said the
original code _should_ have worked, so trusting it without rendering would
have shipped the same bug again in a different form.

**Library/tool:** Playwright (dev-only, scratchpad) — no project
dependency added.

---

### 2026-08-14 — Hero-section anti-pattern cleanup (6 files)

**Context:** Following the CTA bug, user asked for a platform-wide UI
audit. Grepped `src/app/(user|product|platform|company/about|auth)` for
the two anti-patterns already documented in `DESIGN_LANGUAGE.md`
(mesh-gradient blobs, badge pills) — found in 17 files, confirmed by grep
not guesswork. User scoped this pass to hero sections only.

**Decision:** Removed mesh-gradient/blur-blob divs and converted badge
pills to plain uppercase labels (e.g. `text-xs uppercase tracking-wider
font-semibold text-primary`, no pill wrapper) in `about`, `features`,
`practice/leaderboard`, `community` hero, `resources` hero, `mock/video`.
Used the plain-label pattern already present in `practice/leaderboard`
(which never had the pill in the first place) as the reference, rather
than inventing a new pattern.

**Why:** Consistent with `DESIGN_LANGUAGE.md`'s existing rule ("the fix is
usually _remove_ something, not add a decoration"). Deliberately did not
touch icon-in-box soup or ad-hoc button overrides also present in some of
these files — those weren't part of the audit the user approved for this
pass; flagging them here so the next touch doesn't have to re-discover
them.

**Library/tool:** None new.

---

### 2026-08-14 — `useAuth` hydration mismatch fix

**Context:** Playwright console capture on `/profile` (post-signup, using
a throwaway test account) surfaced a real React hydration-mismatch error
— server rendered the full profile content, client's first paint rendered
the loading `<Skeleton>` instead, so React discarded the SSR output and
re-rendered from scratch on every visit.

**Decision:** Removed `enabled: typeof window !== 'undefined'` from the
`useQuery` call in `src/features/auth/hooks/useAuth.ts`.

**Why:** That guard is React's own textbook example of what causes this
exact class of bug. On the server, the guard disabled the query, so
TanStack Query resolved `isLoading: false` — the page rendered its
real-content branch. On the client's first paint (pre-hydration), `window`
already exists, the query enables and starts fetching, `isLoading` flips
`true` — the page rendered the skeleton branch instead. Removing the guard
means both environments enter the query in the same `isPending` state, so
first paint matches on both sides. Verified: hydration error gone from the
console after the fix, `tsc`/`next build` clean.

**Library/tool:** None new — this is TanStack Query's default behavior
once the redundant guard is removed.

---

### 2026-08-14 — Resolved all 9 remaining set-state-in-effect lint errors

**Context:** `npm run lint` had 9 `react-hooks/set-state-in-effect`
errors left over from earlier fixes, deliberately deferred rather than
blind-fixed since most touch live business logic.

**Decision:** Went through each individually. One
(`ProblemList.tsx`'s page-reset-on-filter-change) was a genuine React
anti-pattern per React's own docs — attempted the documented fix (adjust
state during render via a ref comparison), but this toolchain's
`react-hooks/refs` rule flags ref access during render regardless of the
documented safe case, so reverted to the plain effect + suppression
comment for consistency with the rest of the codebase. The other 8 are
legitimate idiomatic patterns — loading flags before a fetch (5
instances), a hydration-safe client-mount guard, and 2 tab/threshold
tracking effects — all suppressed with `eslint-disable-next-line` plus a
comment explaining specifically _why_ each one is safe, not a blanket
"trust me."

**Why:** Per the user's own workflow rules, business-logic-touching code
isn't something to silently restructure — but leaving 9 hard errors in
place also meant the newly-added pre-commit hook would block any future
edit to those 6 files. Suppressing with real, per-case rationale gets
`npm run lint` to a clean 0-errors state without either silently
rewriting live interview/session logic or leaving a trap for the next
commit.

**Result:** `npm run lint`: 9 errors → 0. `tsc`/`next build` clean.

---

### 2026-08-14 — Design-language cleanup round 2 + a real payments bug found along the way

**Context:** Finishing the anti-pattern audit from earlier: 10 files still
flagged for mesh-gradient blobs / badge pills, plus `features/page.tsx`'s
deferred icon-box soup and ad-hoc buttons.

**Decision:** Re-read all 10 flagged files individually rather than
pattern-matching the grep hits. 4 were false positives — functional
status/difficulty tags the user had already approved elsewhere — left
untouched. Real fixes applied to 6 files (`pricing`, `community/
experiences/new`, 4 `mock/video/[id]` screens). `features/page.tsx`:
replaced the 6-color-per-card icon-box soup with one consistent treatment,
removed ad-hoc button overrides in favor of `Button`'s own variant system.

**Bonus find while verifying `/pricing` in-browser:** the CSP header
(`src/middleware.ts`) completely blocked Razorpay's checkout —
`script-src` had no Razorpay domain at all. Fixed by allowlisting
`https://*.razorpay.com` across `script-src`, `connect-src`, `img-src`,
and adding a `frame-src` directive (missing entirely before). Confirmed
via actually loading the checkout flow in a headless browser and
iterating on what CSP blocked — checkout.js alone wasn't enough; it pulls
a secondary risk-detection bundle from `cdn.razorpay.com`, which is why
the fix uses a wildcard subdomain rather than allowlisting
`checkout.razorpay.com` alone.

**Why:** Don't pattern-match blindly, verify each flagged instance is
actually the anti-pattern before touching it. The CSP fix wasn't planned;
it surfaced only because verification was done by actually rendering the
page in a browser and reading the console.

**Library/tool:** None new.

---

### 2026-08-14 — Documentation infrastructure setup

**Context:** No standing record of _why_ past architectural choices were
made — only the _what_, visible in the diff. No single map of how a
request flows through the app.

**Decision:** Added this decisions log and the execution-flow map above,
and reorganized `docs/` into topic subfolders (`architecture/`, `setup/`,
`planning/`). Added a standing rule: before implementing a non-trivial
feature, quiz the user on the affected code area first, score the
answers, then implement, then log the decision here.

**Why:** The alternative — relying on git log / commit messages — answers
"what changed" but not "why this approach over the others." A
quiz-before-implement gate forces the design-first workflow (see global
CLAUDE.md) to actually happen instead of being aspirational.

**Library/tool:** None — plain markdown, no tooling.

---

### 2026-08-14 — Landing page redesign + design-language doc/skill

**Context:** Landing page (`src/app/page.tsx`) was diagnosed the day
before as reading like "AI slop" — mesh-gradient blobs, an "AI-Powered X"
badge pill, and icon-in-colored-box bento cards. Grep confirmed these
patterns repeat across 9+ files app-wide, not just this page.

**Decision:** Wrote `docs/architecture/DESIGN_LANGUAGE.md` (audit of what
exists vs. what "product-grade" means here) and
`.claude/skills/design-language/` (project skill that loads the doc before
any UI work) before touching the page itself. Then applied the rules to
the landing page. Left a `TODO(screenshot)` marker in the hero instead of
faking a placeholder — real product screenshots are pending from the user.

**Why:** The design tokens were already solid — the problem was
page-level composition, not the foundation. Writing the doc/skill first
means the next UI touch moves in one direction instead of adding more
inconsistent one-off patterns.

**Library/tool:** None new — reused existing `framer-motion`/`gsap`/shadcn
stack already installed.

---

## Reference docs (not duplicated here — read on demand)

- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/DESIGN_LANGUAGE.md`
- `docs/architecture/FLOW.md` (folded above)
- `docs/planning/AI_ENGINEERING_ROADMAP.md`
- `docs/planning/AI-Interview-MVP-Plan.md`
- `docs/planning/PRODUCTION_FEATURES.md`
- `docs/setup/MIGRATION.md`
- `docs/setup/SETUP.md`

A `design-language` project skill already enforces `DESIGN_LANGUAGE.md`'s
rules automatically before UI work — no action needed, it's active.

<!-- BEGIN:ui-quality-rule -->

## Hard Rule: UI Quality (projects with a UI)

1. `design-language.md` at the project root is the UI source of truth (tokens, type, spacing,
   components, accessibility, motion, kill list, known debt). If missing, create it from the
   real tokens, never invented values. Read it before any UI change; update it in the same
   change whenever a token, pattern or rule changes.
2. Any UI design, build or review uses the `ui-ux-pro-max` skill and its pre-delivery checks
   (contrast 4.5:1, visible focus, 40px+ touch targets, keyboard parity, loading/error/empty
   states, reduced motion).
3. Keep code minimal: use the `ponytail` skill on every change.
4. UI that breaks `design-language.md` is not done; deliberate exceptions are recorded there.
<!-- END:ui-quality-rule -->
