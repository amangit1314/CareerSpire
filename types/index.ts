
import {
  UserLevel,
  Difficulty,
  QuestionType,
  ProgrammingLanguage,
  SubscriptionTier,
  MockSessionStatus,
  PaymentStatus,
  NotificationType,
  Framework,
  QuestionFormat,
  AnswerFormat,
  QuestionSource
} from './enums';

export {
  UserLevel,
  Difficulty,
  QuestionType,
  ProgrammingLanguage,
  SubscriptionTier,
  MockSessionStatus,
  PaymentStatus,
  NotificationType,
  Framework,
  QuestionFormat,
  AnswerFormat,
  QuestionSource
};

// Base types
export interface TestCase {
  input: unknown;
  expectedOutput: unknown;
  isHidden?: boolean;
}

export interface TestResult {
  passed: number;
  total: number;
  details: Array<{
    input: unknown;
    expected: unknown;
    actual: unknown;
    passed: boolean;
    error?: string;
  }>;
}

export interface Feedback {
  codeQuality: number;
  timeComplexity: string;
  strengths: string[];
  improvements: string[];
  nextQuestion?: string;
  // AI-generated corrected code with comments
  correctedCode?: string;
  codeExplanation?: Array<{
    lineRange: string;
    explanation: string;
  }>;
  approachSummary?: string;
  isCodeCorrect?: boolean;
}

// Domain entities
export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  level: UserLevel;
  freeMocksRemaining: number;
  subscriptionTier: SubscriptionTier | null;
  subscriptionEndsAt: Date | null;
  weakTopics: string[];

  // Gamification
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeAt: Date | null;
  badges: string[];
  totalMocksCompleted: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  meta?: Record<string, any>;
  readAt: Date | null;
  createdAt: Date;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  language: ProgrammingLanguage | null;
  framework: Framework | null;
  questionFormat: QuestionFormat;
  expectedAnswerFormat: AnswerFormat;
  codeSnippet?: string | null;
  testCases: TestCase[];
  expectedComplexity: string | null;
  hints: string[];
  createdAt: Date;
}

export interface MockSession {
  id: string;
  userId: string;
  questionIds?: string[];
  status: MockSessionStatus;
  startedAt: Date;
  completedAt: Date | null;
  type?: QuestionType;
  difficulty?: Difficulty;
  language?: ProgrammingLanguage | null;
  framework?: Framework | null;
  questions?: Question[];
  results?: MockResult[];
  codingQuestions?: CodingQuestion[];
  hrQuestions?: HRQuestion[];
  // Video interview fields
  videoRecordingUrl?: string | null;
  isPublic?: boolean;
}

export interface CodingQuestion {
  question: string;
  language: string;
  framework: string | null;
  difficulty: string;
  expectedAnswerFormat: string;
  followUps: string[];
  tags: string[];
  expectedTimeMinutes: number;
}

export interface HRQuestion {
  question: string;
  category: string;
  guidance: string;
  expectedTimeMinutes: number;
}

export interface MockResult {
  id: string;
  sessionId: string;
  questionId: string;
  userCode: string;
  testResults: TestResult;
  score: number;
  feedback: Feedback;
  timeSpent: number;
  submittedAt: Date;
  question?: Question;
}

export interface Payment {
  id: string;
  userId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  subscriptionTier: SubscriptionTier | null;
  createdAt: Date;
}


export interface NotificationPreference {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestEnabled: boolean;
}

export interface EmailLog {
  id: string;
  userId?: string | null;
  notificationId?: string | null;
  to: string;
  subject: string;
  status: string;
  providerMessageId?: string | null;
  error?: string | null;
  createdAt: Date;
}

export interface MediaObject {
  id: string;
  userId: string;
  bucket: string;
  path: string;
  contentType: string;
  size: number;
  signedUrlExpires?: Date | null;
  createdAt: Date;
}

// API Request/Response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError | string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
  };
}

// Mock Interview types
export interface StartMockRequest {
  type?: QuestionType;
  difficulty?: Difficulty;
  language?: ProgrammingLanguage | null;
  framework?: Framework | null;
}

export interface StartMockResponse {
  session: MockSession;
}

export interface SubmitSolutionRequest {
  sessionId: string;
  questionId: string;
  code: string;
  timeSpent: number;
}

export interface SubmitSolutionResponse {
  result: MockResult;
}

// Notifications API
export interface NotificationListResponse {
  notifications: Notification[];
  nextCursor?: string | null;
}

export interface NotificationPreferenceRequest {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  digestEnabled?: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalMocks: number;
  completedMocks: number;
  averageScore: number;
  weakTopics: string[];
  recentMocks: Array<{
    id: string;
    score: number;
    date: Date;
    questions: number;
  }>;
  scoreTrend: Array<{
    date: string;
    score: number;
  }>;
  freeMocksRemaining: number;
  subscriptionTier: SubscriptionTier | null;
}

// Utility types
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Generic API error
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
