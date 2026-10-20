export enum UserLevel {
  FRESHER = "FRESHER",
  INTERMEDIATE = "INTERMEDIATE",
  EXPERIENCED = "EXPERIENCED",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

/** AI-generated syllabus topic difficulty (src/lib/ai/llm/syllabus.ts) —
 * distinct wording from `Difficulty` because it labels a learning-curve
 * stage, not a question's difficulty; mapped to `Difficulty` when a topic's
 * questions are generated (src/app/actions/resource.actions/questions.ts). */
export enum SyllabusDifficulty {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

export enum QuestionType {
  DSA = "DSA",
  CODING = "CODING",
  HR = "HR",
  APTITUDE = "APTITUDE",
  VIDEO = "VIDEO",
}

export enum ProgrammingLanguage {
  JAVASCRIPT = "JAVASCRIPT",
  PYTHON = "PYTHON",
  JAVA = "JAVA",
  TYPESCRIPT = "TYPESCRIPT",
}

export enum Framework {
  NONE = "NONE",
  NODE = "NODE",
  REACT = "REACT",
  ANGULAR = "ANGULAR",
  VUE = "VUE",
  NEXT = "NEXT",
  NEST = "NEST",
  SPRING_BOOT = "SPRING_BOOT",
  FASTAPI = "FASTAPI",
  DJANGO = "DJANGO",
}

export enum SubscriptionTier {
  FREE = "FREE",
  STARTER = "STARTER",
  PRO = "PRO",
}

export enum MockSessionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum NotificationType {
  SYSTEM = "SYSTEM",
  MOCK_RESULT = "MOCK_RESULT",
  PAYMENT = "PAYMENT",
  REMINDER = "REMINDER",
  SECURITY = "SECURITY",
  // Was missing from this hand-written enum despite being in the Prisma
  // schema and already used at lib/practice/rewards.ts:221 — every
  // achievement notification's `type` field silently didn't match this
  // app-level type anywhere it was checked against it.
  ACHIEVEMENT = "ACHIEVEMENT",
}

export enum EmailStatus {
  QUEUED = "QUEUED",
  SENT = "SENT",
  FAILED = "FAILED",
}
export enum QuestionFormat {
  THEORY = "THEORY",
  OUTPUT_PREDICTION = "OUTPUT_PREDICTION",
  CODE_WRITING = "CODE_WRITING",
  MCQ = "MCQ",
  DEBUGGING = "DEBUGGING",
  DSA = "DSA",
}

export enum AnswerFormat {
  SHORT_ANSWER = "SHORT_ANSWER",
  CODE_SNIPPET = "CODE_SNIPPET",
  REASONING = "REASONING",
  MCQ = "MCQ",
}

export enum QuestionSource {
  AI = "AI",
  CURATED = "CURATED",
  COMMUNITY = "COMMUNITY",
}

/** Practice hub's code editor language — lowercase ids (Monaco/judge
 * convention), distinct from `ProgrammingLanguage` above (uppercase,
 * schema-backed, no lowercase values). */
export enum ProblemLanguage {
  JAVASCRIPT = "javascript",
  PYTHON = "python",
  JAVA = "java",
}

/** Judge verdict, same vocabulary as Codeforces/LeetCode-style online judges. */
export enum Verdict {
  ACCEPTED = "AC",
  WRONG_ANSWER = "WA",
  TIME_LIMIT_EXCEEDED = "TLE",
  RUNTIME_ERROR = "RE",
  COMPILE_ERROR = "CE",
  UNKNOWN = "UNKNOWN",
}

/** Reasons a coin balance changes — earns (solves, streaks, bonuses) and
 * spends (hint reveal, solution unlock). */
export enum CoinReason {
  SOLVE_EASY = "solve_easy",
  SOLVE_MEDIUM = "solve_medium",
  SOLVE_HARD = "solve_hard",
  FIRST_SOLVE_BONUS = "first_solve_bonus",
  DAILY_CHALLENGE = "daily_challenge",
  STREAK_7 = "streak_7",
  STREAK_30 = "streak_30",
  HINT_REVEAL = "hint_reveal",
  SOLUTION_UNLOCK = "solution_unlock",
}

export enum LeaderboardScope {
  ALL_TIME = "all",
  WEEKLY = "weekly",
}

export enum InterviewMode {
  TECHNICAL = "technical",
  NON_TECHNICAL = "non-technical",
  MIXED = "mixed",
}

export enum TechnicalFocus {
  LANGUAGE_CONCEPTS = "language-concepts",
  SYSTEM_DESIGN = "system-design",
  DSA = "dsa",
  ALL = "all",
}

export enum NonTechnicalCategory {
  HR = "hr",
  APTITUDE = "aptitude",
  SITUATIONAL = "situational",
}

export enum InterviewRoundType {
  HR = "hr",
  TECHNICAL = "technical",
  SYSTEM_DESIGN = "system-design",
}

/** Step outcome for the internal dev/QA test-simulation engine
 * (src/lib/testing/engine.ts) — not user-facing. */
export enum WorkflowStepStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

/** Community video-wall sort order (src/app/(product)/community/videos/). */
export enum VideoSortOption {
  RECENT = "recent",
  POPULAR = "popular",
  TRENDING = "trending",
}

/** Community feed content-type filter (src/app/(product)/community/). */
export enum CommunityContentType {
  ALL = "all",
  EXPERIENCES = "experiences",
  VIDEOS = "videos",
}

/** Interview experience outcome — both the filter value and the reported
 * outcome on a shared experience. GHOSTED/ACCEPTED are reportable outcomes
 * (used e.g. for feed card styling) but aren't exposed as filter options,
 * so ALL/OFFERED/REJECTED/PENDING remain the only values CommunityFilters
 * offers. */
export enum CommunityOutcome {
  ALL = "all",
  OFFERED = "offered",
  REJECTED = "rejected",
  PENDING = "pending",
  GHOSTED = "ghosted",
  ACCEPTED = "accepted",
}

/** `AppError.code` values thrown by server actions/lib (src/lib/errors.ts).
 * Scoped to errors WE construct — the API-response boundary (api-manager.ts,
 * ApiError) stays a bare `string` since it also carries codes we don't own
 * (axios error codes, third-party response shapes). */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  CSRF_VALIDATION_FAILED = "CSRF_VALIDATION_FAILED",
  // Auth
  EMAIL_EXISTS = "EMAIL_EXISTS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  INVALID_TOKEN = "INVALID_TOKEN",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  SIGNUP_ERROR = "SIGNUP_ERROR",
  SIGNIN_ERROR = "SIGNIN_ERROR",
  FORGOT_PASSWORD_ERROR = "FORGOT_PASSWORD_ERROR",
  RESET_PASSWORD_ERROR = "RESET_PASSWORD_ERROR",
  CHANGE_PASSWORD_ERROR = "CHANGE_PASSWORD_ERROR",
  DELETE_ACCOUNT_ERROR = "DELETE_ACCOUNT_ERROR",
  // Mock / video interviews
  NO_MOCKS_REMAINING = "NO_MOCKS_REMAINING",
  NO_VIDEO_MOCKS_REMAINING = "NO_VIDEO_MOCKS_REMAINING",
  AI_GENERATION_FAILED = "AI_GENERATION_FAILED",
  // Media / notifications
  MEDIA_UPLOAD_ERROR = "MEDIA_UPLOAD_ERROR",
  NOTIFICATIONS_DISABLED = "NOTIFICATIONS_DISABLED",
  NOTIFICATION_ERROR = "NOTIFICATION_ERROR",
}

/** AI-generated HR/behavioral question category (src/lib/ai/llm/questions.ts). */
export enum HRQuestionCategory {
  BEHAVIORAL = "BEHAVIORAL",
  REFLECTION = "REFLECTION",
  PUZZLE = "PUZZLE",
  MOTIVATION = "MOTIVATION",
  CONFLICT = "CONFLICT",
  LEADERSHIP = "LEADERSHIP",
  OWNERSHIP = "OWNERSHIP",
}
