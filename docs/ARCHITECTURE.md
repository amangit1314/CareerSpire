# CareerSpire — Architecture Guide

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (company)/                # Static company pages (about, roadmap, etc.)
│   ├── (legal)/                  # Legal pages (privacy, terms, etc.)
│   ├── (platform)/               # Public platform pages (pricing, features)
│   ├── (support)/                # Support pages (FAQ, feedback)
│   ├── (user)/                   # Authenticated user pages (dashboard, profile)
│   ├── api/                      # API routes
│   │   ├── auth/                 # POST /signup, /signin, /signout, /refresh; GET /me
│   │   ├── dashboard/            # GET /dashboard
│   │   ├── docs/                 # GET /docs — OpenAPI spec JSON
│   │   ├── mock/                 # POST /start, /submit; GET /:id
│   │   ├── notifications/        # GET /, PUT /:id/read, POST /read-all
│   │   ├── payment/              # POST /create-order, /webhook
│   │   └── question-bank/        # POST /search
│   ├── actions/                  # Server Actions (business logic)
│   │   ├── mock.actions.ts       # Mock session lifecycle
│   │   ├── auth.actions.ts       # Auth operations
│   │   ├── dashboard.actions.ts  # Dashboard aggregation
│   │   ├── gamification.actions  # XP, streaks, badges
│   │   ├── notification.actions  # Notification creation + dispatch
│   │   └── resource.actions.ts   # Learning resources + tutor
│   ├── auth/                     # Auth pages (login, signup)
│   ├── community/                # Community features (experiences, videos)
│   ├── docs/                     # Swagger UI page
│   ├── mock/                     # Mock interview pages
│   ├── question-bank/            # Question bank search UI
│   └── resources/                # Learning resources pages
│
├── components/                   # Shared React components
│   ├── ui/                       # shadcn/ui primitives (Button, Card, etc.)
│   ├── Navbar.tsx                # Global navigation
│   ├── Footer.tsx                # Global footer
│   ├── StatsCard.tsx             # Dashboard stat cards
│   └── skeletons/                # Loading skeleton components
│
├── hooks/                        # React hooks
│   ├── useAuth.ts                # Auth state + token refresh
│   ├── useDashboard.ts           # Dashboard data (TanStack Query)
│   └── useNotifications.ts       # Notification state
│
├── lib/                          # Core libraries
│   ├── ai/                       # AI provider integration
│   │   ├── groq.ts               # Groq client (llama-3.3-70b-versatile)
│   │   ├── gemini.ts             # Google AI client (gemini-2.0-flash)
│   │   └── index.ts              # Unified caller with auto-fallback
│   ├── supabase/                 # Supabase integrations
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── email.ts              # Email dispatch
│   │   └── storage.ts            # File storage + signed URLs
│   ├── api-manager.ts            # Axios client with interceptors
│   ├── auth.ts                   # JWT token generation + verification
│   ├── auth-edge.ts              # Edge-compatible auth helpers
│   ├── cache.ts                  # Generic in-memory cache
│   ├── code-runner.ts            # Sandboxed code execution (JS/Python/Java)
│   ├── cors.ts                   # CORS headers
│   ├── env.ts                    # Environment variable validation
│   ├── errors.ts                 # AppError class + error response factory
│   ├── llm.ts                    # AI prompt templates + question generators
│   ├── llmClient.ts              # Legacy LLM wrapper (delegates to ai/)
│   ├── prisma.ts                 # Prisma client singleton
│   ├── question-bank.ts          # SkillQuestionBank cache logic
│   ├── rate-limit.ts             # In-memory rate limiting
│   ├── razorpay.ts               # Razorpay client
│   ├── swagger.ts                # OpenAPI spec definition
│   └── utils.ts                  # General utilities
│
├── services/                     # Client-side service layer
│   ├── auth.service.ts           # Auth API calls
│   ├── dashboard.service.ts      # Dashboard API calls
│   ├── mock.service.ts           # Mock session API calls
│   └── notification.service.ts   # Notification API calls
│
├── types/                        # TypeScript types
│   ├── enums.ts                  # All application enums
│   ├── index.ts                  # Barrel export + all interfaces
│   └── global.d.ts               # Global type augmentations
│
├── instrumentation.ts            # Next.js instrumentation (env validation)
└── middleware.ts                  # Edge middleware (auth token check)
```

## Architecture Decisions

### 1. AI Provider Strategy
- **Primary**: Groq (llama-3.3-70b-versatile) — FREE, fast inference
- **Fallback**: Google Gemini Flash — FREE, auto-fallback on Groq 429
- **Report generation**: Always Gemini Flash (richer output)
- **Pattern**: `lib/ai/index.ts` exports `aiChat()` — single entry point for all AI calls

### 2. Question Bank Cache (Core Differentiator)
```
User searches "React" → DB lookup (case-insensitive)
  → Found? Return from cache (instant, free)
  → Not found? Generate via AI → save to SkillQuestionBank → return
```
- `lib/question-bank.ts` — shared logic used by API route + mock session creation
- `hitCount` tracks cache utilization
- Mock sessions pull from cache before generating fresh questions

### 3. Authentication
- Custom JWT (NOT NextAuth) — access token 6h + refresh token 7d
- Both tokens in HTTP-only cookies
- Token rotation on refresh, sessions stored in DB with revocation
- bcryptjs 12 rounds for password hashing

### 4. Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (login/signup) | 5 | 15 min |
| Mock start | 10 | 1 hour |
| Mock submit | 20 | 1 min |
| Question bank search | 5 | 24 hours |
| General API | 60 | 1 min |

### 5. Code Execution Sandbox
- JavaScript: `node:vm` with isolated context, 3s timeout
- Python: temp directory + `spawnSync`, 3s timeout
- Java: compile + run in temp dir, 3s timeout
- Entry function detection: explicit `entryFunctionName` or fallback search

### 6. Scoring Formula
```
testScore (40%) = tests_passed / tests_total * 40
codeQuality (30%) = ai_code_quality / 100 * 30
timeScore (20%) = max(0, 20 - timeSpent_minutes * 2)
finalScore = round(testScore + codeQuality + timeScore)
```

## API Documentation
- **JSON spec**: `GET /api/docs`
- **Swagger UI**: `/docs`

## Key Patterns
- **Server Actions** (`app/actions/`) for all business logic
- **API Routes** (`app/api/`) as thin HTTP handlers (auth + rate limit + delegate to actions)
- **Services** (`services/`) for client-side API calls via `apiManager`
- **Hooks** (`hooks/`) for React state with TanStack Query
- All AI calls go through `lib/ai/index.ts` — never direct fetch to providers
- All question generation checks `SkillQuestionBank` cache before calling AI
