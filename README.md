# CareerSpire

**Practice technical interviews. Identify your weak spots. Improve with structured feedback.**

CareerSpire is an AI-assisted interview preparation platform for developers preparing for technical interviews. It brings mock interviews, coding practice, learning resources, progress tracking, and community experiences into one workspace.

The project is being developed toward a focused, measurable interview-training product: **assess → practice → improve → reassess**.

[**Try CareerSpire**](https://careerspire.vercel.app/) · [Report a bug](https://github.com/amangit1314/CareerSpire/issues/new) · [Request a feature](https://github.com/amangit1314/CareerSpire/issues/new)

> **Project status:** Active development. Features and deployment readiness may vary. Review the setup instructions and verify critical flows before using this project in a production environment.

---

## Contents

- [What CareerSpire Offers](#what-careerspire-offers)
- [Product Areas](#product-areas)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Available Commands](#available-commands)
- [Testing and Quality](#testing-and-quality)
- [Security and Reliability](#security-and-reliability)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development Workflow](#development-workflow)
- [Roadmap Direction](#roadmap-direction)
- [Contributing](#contributing)
- [Support](#support)

---

## What CareerSpire Offers

CareerSpire combines interview simulation with coding practice and learning tools.

- **AI-assisted mock interviews** — Practice DSA, coding, and HR interview questions.
- **Interactive coding environment** — Write and edit code in a Monaco-based editor, with supported test execution and feedback.
- **Practice hub** — Work through coding problems, submit solutions, review test results, and track progress.
- **Question bank** — Explore interview questions by topic, difficulty, type, language, and framework.
- **Learning resources** — Study technical topics, follow learning paths, and use the AI-assisted tutor.
- **Performance tracking** — Review mock history, scores, and progress analytics.
- **Video interview experiences** — Practice video interviews and explore shared interview experiences.
- **Gamification** — Track practice activity, XP, coins, streaks, badges, and achievements.
- **Account and billing management** — Manage your account, review billing information, and access configured plans and credit features.
- **Notifications and support** — Access in-app notifications, notification preferences, and feedback or support forms.

The aim is not simply to generate questions. It is to help candidates turn interview attempts into specific, repeatable practice.

## Product Areas

| Area                | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| Mock Interviews     | Simulate technical and HR interview sessions         |
| Practice            | Solve coding problems and evaluate submissions       |
| Question Bank       | Browse and search interview questions                |
| Resources           | Learn concepts and explore structured learning paths |
| Dashboard           | Review interview history and performance             |
| Community           | Explore interview experiences and video content      |
| Profile and Billing | Manage account information and payment history       |
| Support             | Submit feedback, bug reports, and feature requests   |

Availability of individual capabilities depends on the current implementation and environment configuration.

---

## Technology Stack

| Layer                           | Technologies                                                 |
| ------------------------------- | ------------------------------------------------------------ |
| Frontend                        | Next.js App Router, React, TypeScript                        |
| UI and styling                  | Tailwind CSS, shared UI components, Lucide icons             |
| Client-side data                | TanStack Query                                               |
| Backend                         | Next.js Route Handlers and Server Actions                    |
| Database                        | PostgreSQL                                                   |
| ORM                             | Prisma                                                       |
| Authentication                  | Custom JWT-based authentication, HTTP-only cookies, bcryptjs |
| AI providers                    | Groq, Google Gemini, OpenRouter                              |
| Coding editor                   | Monaco Editor                                                |
| Payments                        | Razorpay                                                     |
| Storage and supporting services | Supabase Storage and configured Supabase integrations        |
| Validation                      | Zod and typed domain models                                  |
| Testing                         | Vitest                                                       |
| Code quality                    | ESLint, Prettier, Husky, lint-staged                         |

The application uses a modular Next.js architecture rather than requiring a separate backend service for every feature.

---

## Architecture

CareerSpire follows a feature-oriented architecture with explicit boundaries between the UI, business logic, API layer, AI integration, and database.

```text
Browser
  │
  ▼
Next.js App Router
  │
  ├── Public pages and authenticated product pages
  │
  ├── Feature hooks and client-side services
  │
  ▼
Route Handlers
  │
  ├── Authentication and request validation
  ├── Rate limiting
  └── API response handling
  │
  ▼
Server Actions
  │
  ├── Interview and practice workflows
  ├── Dashboard and notifications
  ├── Community and resource operations
  └── Billing-related business logic
  │
  ├───────────────┐
  ▼               ▼
Prisma         Shared AI Layer
  │               │
  ▼               ├── Groq
PostgreSQL        ├── Gemini
                  └── OpenRouter
```

### Architectural principles

- Keep Route Handlers focused on HTTP concerns.
- Keep business logic in Server Actions and their supporting modules.
- Use the shared Prisma layer for database access.
- Route LLM calls through the shared AI integration rather than calling provider SDKs directly from feature code.
- Keep validation, authentication, authorization, and rate limits at the appropriate server boundaries.
- Reuse the established design system rather than introducing unrelated UI patterns.
- Document meaningful architectural decisions in `docs/DECISIONS.md`.

The diagram is a conceptual overview; individual features may use different paths according to their requirements.

---

## Getting Started

### Prerequisites

Install the following before starting development:

- Node.js compatible with the project's Next.js version
- npm
- Git
- A PostgreSQL database
- A Supabase project for the configured storage and supporting integrations
- A Groq API key
- Additional provider credentials for any optional integrations you intend to use

### 1. Clone the repository

```bash
git clone https://github.com/amangit1314/CareerSpire.git
cd CareerSpire
```

### 2. Install dependencies

```bash
npm ci
```

This installs dependencies from the committed lockfile and runs the package's configured installation lifecycle scripts.

### 3. Configure environment variables

Create a `.env.local` file in the project root and configure the required values described below.

Never commit `.env.local` or any real API keys, database credentials, or signing secrets.

### 4. Configure the database

Set `DATABASE_URL` to your PostgreSQL connection string. Review the Prisma configuration and existing migrations before modifying the schema or initializing a database.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply migrations using the workflow appropriate to your environment:

- For local development, use the repository's configured Prisma development migration workflow.
- For an existing production database, review migration history and use the deployment migration workflow.

**Do not run an initial migration against an existing database without checking its current schema and migration history first.**

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Some features require correctly configured AI, database, storage, email, or payment services before they will work.

---

## Environment Configuration

The application validates required environment variables at startup. Optional variables enable additional providers and integrations.

### Required variables

| Variable                        | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `DATABASE_URL`                  | PostgreSQL connection string          |
| `JWT_SECRET`                    | Secret used for access-token signing  |
| `JWT_REFRESH_SECRET`            | Secret used for refresh-token signing |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anonymous key         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side Supabase service-role key |
| `GROQ_API_KEY`                  | Groq AI provider credentials          |

### Optional variables

| Variable              | Purpose                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Public application URL; defaults to localhost in the current configuration |
| `GOOGLE_AI_API_KEY`   | Enables the Gemini fallback provider                                       |
| `OPENROUTER_API_KEY`  | Enables the OpenRouter fallback provider                                   |
| `RAZORPAY_KEY_ID`     | Razorpay payment integration                                               |
| `RAZORPAY_KEY_SECRET` | Server-side Razorpay credentials                                           |

Example local configuration:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-strong-random-secret"
JWT_REFRESH_SECRET="replace-with-another-strong-random-secret"

NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

GROQ_API_KEY="YOUR_GROQ_API_KEY"

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_AI_API_KEY=""
OPENROUTER_API_KEY=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

This is a configuration template, not a ready-to-use environment file. Replace the placeholders with valid credentials. Keep service-role keys, JWT secrets, and Razorpay secrets server-side; never expose them through `NEXT_PUBLIC_*` variables.

Consult `src/lib/env.ts` for the current required and optional variable definitions. Check the relevant integration code for any additional provider-specific configuration.

---

## Available Commands

These commands are defined in `package.json`.

| Command                   | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | Start the Next.js development server with Turbopack |
| `npm run build`           | Generate Prisma Client and build the application    |
| `npm run start`           | Start the production server                         |
| `npm run lint`            | Run ESLint                                          |
| `npm test`                | Run the Vitest test suite                           |
| `npm run test:pipeline`   | Run the pipeline test runner                        |
| `npm run verify:platform` | Run the platform verification script                |

For a production build:

```bash
npm run build
```

For tests:

```bash
npm test
```

For linting:

```bash
npm run lint
```

A successful command is evidence for that specific check; it does not by itself establish that every user flow or production integration is working.

---

## Testing and Quality

CareerSpire uses Vitest for automated tests and ESLint for static code-quality checks. The repository also configures Husky and lint-staged to run checks against staged files before a commit.

Recommended verification before merging changes:

1. Run the relevant unit tests.
2. Run ESLint.
3. Verify TypeScript and production-build behavior.
4. Test the affected user flow locally.
5. Check authentication and ownership boundaries for server-side changes.
6. Test payment or credit-related changes with appropriate sandbox credentials.
7. Review the final diff and any database migration.

When adding a regression test, prefer testing the behavior that failed rather than only testing internal implementation details.

---

## Security and Reliability

The application includes several security and reliability mechanisms:

- JWT-based authentication with refresh-token handling.
- HTTP-only authentication cookies and session revocation support.
- Route protection through middleware and server-side authentication helpers.
- Password hashing using bcryptjs.
- Rate limiting for supported API operations.
- Input validation and structured API error handling.
- Prisma-based database access.
- Content Security Policy and other security headers.
- Signed URLs for supported media operations.
- Timeouts and provider fallback behavior in the shared AI layer.

These mechanisms do not eliminate the need for security review. Before a public release, independently verify authorization boundaries, rate-limit behavior in the deployment environment, secret management, data retention, payment webhooks, and the complete purchase-to-entitlement lifecycle.

In particular, confirm that each purchased plan or credit pack grants the correct entitlement before accepting real payments.

---

## Project Structure

The main application code lives under `src/`.

```text
CareerSpire/
├── .github/                     # Issue and pull request templates
├── docs/
│   ├── architecture/            # Architecture, execution flow, design language
│   ├── planning/                # MVP and product plans
│   └── setup/                   # Setup and migration guides
├── prisma/                      # Prisma schema and migrations
├── scripts/                     # Seeding, verification, and test utilities
├── src/
│   ├── app/
│   │   ├── (company)/           # Company and informational pages
│   │   ├── (legal)/             # Legal pages
│   │   ├── (platform)/          # Features and pricing
│   │   ├── (product)/           # Practice, resources, community, interviews
│   │   ├── (support)/           # FAQs and support flows
│   │   ├── (user)/              # Dashboard and profile
│   │   ├── actions/             # Server Actions and business logic
│   │   ├── api/                 # Route Handlers
│   │   └── auth/                # Authentication pages
│   ├── components/              # Shared React components
│   ├── config/                  # Application configuration
│   ├── features/                # Feature-specific hooks and services
│   ├── hooks/                   # Shared React hooks
│   ├── lib/
│   │   ├── ai/                  # AI providers and shared AI integration
│   │   ├── code-runner/         # Code execution and testing support
│   │   └── ...                  # Auth, database, payments, utilities
│   └── types/                   # Domain types, interfaces, and enums
├── AGENTS.md                    # Shared AI-agent project instructions
├── CLAUDE.md                    # Claude Code entry point
├── CHANGELOG.md                 # Release history
├── package.json
├── package-lock.json
└── README.md
```

This is a high-level map, not an exhaustive file listing. Refer to the actual source tree for current module names and boundaries.

---

## Documentation

The `docs/` directory is the reference for project architecture, implementation decisions, planning, and setup.

| Document                                                                             | Purpose                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------- |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)             | Architecture and module responsibilities      |
| [`docs/architecture/FLOW.md`](docs/architecture/FLOW.md)                             | Request execution and AI flow                 |
| [`docs/architecture/DESIGN_LANGUAGE.md`](docs/architecture/DESIGN_LANGUAGE.md)       | UI and design-system principles               |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)                                             | Architectural decisions and their rationale   |
| [`docs/planning/AI-Interview-MVP-Plan.md`](docs/planning/AI-Interview-MVP-Plan.md)   | MVP scope and interview product requirements  |
| [`docs/planning/AI_ENGINEERING_ROADMAP.md`](docs/planning/AI_ENGINEERING_ROADMAP.md) | AI engineering roadmap                        |
| [`docs/planning/PRODUCTION_FEATURES.md`](docs/planning/PRODUCTION_FEATURES.md)       | Production-related features and configuration |
| [`docs/setup/SETUP.md`](docs/setup/SETUP.md)                                         | Development setup guidance                    |
| [`docs/setup/MIGRATION.md`](docs/setup/MIGRATION.md)                                 | Migration context and guidance                |
| [`AGENTS.md`](AGENTS.md)                                                             | Current project state and AI-agent workflow   |
| [`CLAUDE.md`](CLAUDE.md)                                                             | Claude Code project entry point               |

**For AI-assisted development:** read `AGENTS.md` first, then consult the relevant architecture and planning documents before making changes. Inspect the implementation instead of assuming that every planned feature has already shipped.

---

## Development Workflow

CareerSpire is currently maintained as a solo-developer project.

The repository uses GitHub Issues, labels, pull request templates, and a project board to keep work organized.

A practical workflow is:

1. Create an issue that describes a user problem or engineering task.
2. Define clear acceptance criteria.
3. Create a focused branch for the change.
4. Implement the smallest coherent solution.
5. Run the relevant checks and inspect the diff.
6. Open a pull request and link the issue when appropriate.
7. Merge only after the change is reviewed and verified.
8. Update documentation and the changelog when needed.

Prefer small, reviewable changes over large, unrelated refactors. Avoid adding new infrastructure or agent frameworks until a specific product or reliability requirement justifies them.

---

## Roadmap Direction

The long-term direction is to make CareerSpire a measurable interview-training product rather than a generic AI chatbot.

The current product strategy emphasizes:

- A structured interview experience.
- Useful, evidence-based feedback.
- Targeted practice based on weaknesses.
- Progress tracking across repeated attempts.
- Reliable billing and entitlement handling.
- Consistent assessment quality and dependable AI fallbacks.

Future capabilities should be prioritized against user value, reliability, and evidence from candidate usage. Items in planning documents are proposals unless verified in the code and tested.

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

Before contributing:

1. Read the relevant documentation.
2. Check existing issues to avoid duplicate work.
3. Keep changes scoped to a clear objective.
4. Add tests for meaningful behavior changes.
5. Update documentation when implementation or workflows change.
6. Never commit credentials, user data, or generated secrets.

Use the repository's [Issues](https://github.com/amangit1314/CareerSpire/issues) page to report problems or propose improvements.

---

## Support

- **Bug reports:** [Open an issue](https://github.com/amangit1314/CareerSpire/issues/new)
- **Feature requests:** [Open an issue](https://github.com/amangit1314/CareerSpire/issues/new)
- **Project source:** [github.com/amangit1314/CareerSpire](https://github.com/amangit1314/CareerSpire)
- **Live application:** [careerspire.vercel.app](https://careerspire.vercel.app/)

---

## License

Check the repository for the applicable license before redistributing or using this project under a particular license.
