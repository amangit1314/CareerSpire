export enum UserLevel {
  FRESHER = 'FRESHER',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERIENCED = 'EXPERIENCED',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum QuestionType {
  DSA = 'DSA',
  CODING = 'CODING',
  HR = 'HR',
  APTITUDE = 'APTITUDE',
  VIDEO = 'VIDEO',
}

export enum ProgrammingLanguage {
  JAVASCRIPT = 'JAVASCRIPT',
  PYTHON = 'PYTHON',
  JAVA = 'JAVA',
  TYPESCRIPT = 'TYPESCRIPT',
}

export enum Framework {
  NONE = 'NONE',
  NODE = 'NODE',
  REACT = 'REACT',
  ANGULAR = 'ANGULAR',
  VUE = 'VUE',
  NEXT = 'NEXT',
  NEST = 'NEST',
  SPRING_BOOT = 'SPRING_BOOT',
  FASTAPI = 'FASTAPI',
  DJANGO = 'DJANGO',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
}

export enum MockSessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  MOCK_RESULT = 'MOCK_RESULT',
  PAYMENT = 'PAYMENT',
  REMINDER = 'REMINDER',
  SECURITY = 'SECURITY',
  // Was missing from this hand-written enum despite being in the Prisma
  // schema and already used at lib/practice/rewards.ts:221 — every
  // achievement notification's `type` field silently didn't match this
  // app-level type anywhere it was checked against it.
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export enum EmailStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}
export enum QuestionFormat {
  THEORY = 'THEORY',
  OUTPUT_PREDICTION = 'OUTPUT_PREDICTION',
  CODE_WRITING = 'CODE_WRITING',
  MCQ = 'MCQ',
  DEBUGGING = 'DEBUGGING',
  DSA = 'DSA',
}

export enum AnswerFormat {
  SHORT_ANSWER = 'SHORT_ANSWER',
  CODE_SNIPPET = 'CODE_SNIPPET',
  REASONING = 'REASONING',
  MCQ = 'MCQ',
}

export enum QuestionSource {
  AI = 'AI',
  CURATED = 'CURATED',
  COMMUNITY = 'COMMUNITY',
}
