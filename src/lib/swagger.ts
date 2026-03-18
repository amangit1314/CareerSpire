import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CareerSpire API',
    version: '1.0.0',
    description:
      'AI-powered mock interview & skill learning platform API. ' +
      'Groq (llama-3.3-70b) for generation/evaluation, Gemini Flash for reports.',
    contact: {
      name: 'CareerSpire',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Current environment',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from /api/auth/signin (HTTP-only cookie, auto-attached)',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              statusCode: { type: 'integer' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          level: { type: 'string', enum: ['FRESHER', 'INTERMEDIATE', 'EXPERIENCED'] },
          freeMocksRemaining: { type: 'integer' },
          subscriptionTier: { type: 'string', enum: ['FREE', 'STARTER', 'PRO'], nullable: true },
          xp: { type: 'integer' },
          currentStreak: { type: 'integer' },
          badges: { type: 'array', items: { type: 'string' } },
        },
      },
      MockSession: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['IN_PROGRESS', 'COMPLETED'] },
          type: { type: 'string', enum: ['DSA', 'CODING', 'HR', 'APTITUDE', 'VIDEO'] },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } },
          results: { type: 'array', items: { $ref: '#/components/schemas/MockResult' } },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          topic: { type: 'string' },
          difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
          type: { type: 'string', enum: ['DSA', 'CODING', 'HR', 'APTITUDE'] },
          testCases: { type: 'array', items: { type: 'object' } },
          hints: { type: 'array', items: { type: 'string' } },
        },
      },
      MockResult: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          questionId: { type: 'string', format: 'uuid' },
          userCode: { type: 'string' },
          score: { type: 'integer', minimum: 0, maximum: 100 },
          testResults: {
            type: 'object',
            properties: {
              passed: { type: 'integer' },
              total: { type: 'integer' },
              verdict: { type: 'string', enum: ['AC', 'WA', 'TLE', 'RE', 'CE'] },
            },
          },
          feedback: { $ref: '#/components/schemas/Feedback' },
          timeSpent: { type: 'integer', description: 'Time spent in seconds' },
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          score: { type: 'integer' },
          codeQuality: { type: 'integer' },
          timeComplexity: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
          correctedCode: { type: 'string', nullable: true },
          approachSummary: { type: 'string', nullable: true },
        },
      },
      QuestionBankResult: {
        type: 'object',
        properties: {
          skill: { type: 'string' },
          niche: { type: 'string', enum: ['programming', 'hr', 'government'] },
          topics: { type: 'array', items: { type: 'string' } },
          questions: { type: 'array', items: { type: 'object' } },
          fromCache: { type: 'boolean' },
          hitCount: { type: 'integer' },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalMocks: { type: 'integer' },
          completedMocks: { type: 'integer' },
          averageScore: { type: 'number' },
          weakTopics: { type: 'array', items: { type: 'string' } },
          freeMocksRemaining: { type: 'integer' },
          subscriptionTier: { type: 'string', nullable: true },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'integer', description: 'Amount in paise' },
          currency: { type: 'string', default: 'INR' },
          status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED'] },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication & session management' },
    { name: 'Mock', description: 'Mock interview sessions' },
    { name: 'Question Bank', description: 'AI-cached question bank' },
    { name: 'Dashboard', description: 'User dashboard & stats' },
    { name: 'Notifications', description: 'In-app notifications' },
    { name: 'Payments', description: 'Razorpay payment integration' },
  ],
  paths: {
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Account created. Sets HTTP-only JWT cookies.' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/api/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in with email/password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Signed in. Sets HTTP-only JWT cookies.' },
          '401': { description: 'Invalid credentials' },
          '429': { description: 'Rate limited (5 attempts / 15 min)' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        responses: {
          '200': {
            description: 'Current user profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token using refresh token cookie',
        responses: {
          '200': { description: 'Token refreshed. New cookies set.' },
          '401': { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/api/auth/signout': {
      post: {
        tags: ['Auth'],
        summary: 'Sign out and revoke session',
        responses: { '200': { description: 'Signed out. Cookies cleared.' } },
      },
    },
    '/api/mock/start': {
      post: {
        tags: ['Mock'],
        summary: 'Start a new mock interview session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['DSA', 'CODING', 'HR'] },
                  difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                  language: { type: 'string', enum: ['JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'JAVA'], nullable: true },
                  framework: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Mock session created with AI-generated questions',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MockSession' } } },
          },
          '403': { description: 'No mocks remaining' },
          '429': { description: 'Rate limited (10/hr)' },
        },
      },
    },
    '/api/mock/submit': {
      post: {
        tags: ['Mock'],
        summary: 'Submit answer for a question in an active session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'questionId', 'code'],
                properties: {
                  sessionId: { type: 'string', format: 'uuid' },
                  questionId: { type: 'string', format: 'uuid' },
                  code: { type: 'string' },
                  language: { type: 'string' },
                  timeSpent: { type: 'integer', description: 'Seconds spent' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Answer evaluated with test results + AI feedback',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MockResult' } } },
          },
          '404': { description: 'Session or question not found' },
          '429': { description: 'Rate limited (20/min)' },
        },
      },
    },
    '/api/mock/{id}': {
      get: {
        tags: ['Mock'],
        summary: 'Get mock session by ID with questions and results',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/MockSession' } } } },
          '404': { description: 'Session not found' },
        },
      },
    },
    '/api/question-bank/search': {
      post: {
        tags: ['Question Bank'],
        summary: 'Search or generate a skill question bank (cached)',
        description:
          'First request generates 30+ questions via AI and caches in DB. ' +
          'Subsequent requests for the same skill return instantly from cache.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['skill', 'niche'],
                properties: {
                  skill: { type: 'string', example: 'React' },
                  niche: { type: 'string', enum: ['programming', 'hr', 'government'] },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Questions served from cache',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/QuestionBankResult' } } },
          },
          '201': {
            description: 'Questions generated by AI and cached',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/QuestionBankResult' } } },
          },
          '429': { description: 'Rate limited (5/day on free plan)' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get user dashboard stats',
        responses: {
          '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardStats' } } } },
        },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List user notifications',
        parameters: [
          { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Pagination cursor' },
        ],
        responses: { '200': { description: 'List of notifications' } },
      },
    },
    '/api/payment/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create a Razorpay order for subscription or PAYG pack',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['plan'],
                properties: {
                  plan: { type: 'string', enum: ['pro', 'placement', 'payg_mock', 'payg_voice'] },
                  interval: { type: 'string', enum: ['monthly', 'yearly'] },
                  quantity: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Razorpay order created' },
        },
      },
    },
    '/api/payment/webhook': {
      post: {
        tags: ['Payments'],
        summary: 'Razorpay webhook handler',
        description: 'Verifies signature, updates user plan/credits on payment.captured',
        responses: { '200': { description: 'Webhook processed' } },
      },
    },
  },
};

export function getSwaggerSpec() {
  return swaggerJsdoc({
    definition: swaggerDefinition,
    apis: [], // We define paths inline above
  });
}
