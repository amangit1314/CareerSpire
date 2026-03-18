import { ApiError } from '@/types';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public fieldErrors?: Record<string, string[] | undefined>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    // Map common error messages to user-friendly ones and appropriate status codes
    const errorMaps: Array<{ pattern: string; message: string; statusCode: number; code: string }> = [
      { pattern: 'Unique constraint', message: 'This email is already registered.', statusCode: 400, code: 'EMAIL_EXISTS' },
      { pattern: 'Invalid credentials', message: 'The email or password you entered is incorrect.', statusCode: 401, code: 'INVALID_CREDENTIALS' },
      { pattern: 'Unauthorized', message: 'Unauthorized. Please log in.', statusCode: 403, code: 'UNAUTHORIZED' },
      { pattern: 'User not found', message: 'No account found with this email.', statusCode: 404, code: 'USER_NOT_FOUND' },
      { pattern: 'Token expired', message: 'Your session has expired. Please log in again.', statusCode: 401, code: 'TOKEN_EXPIRED' },
      { pattern: 'Rate limit exceeded', message: 'Too many requests. Please wait a moment.', statusCode: 429, code: 'RATE_LIMIT' },
      { pattern: 'No questions available', message: 'No questions found for the selected criteria.', statusCode: 404, code: 'NOT_FOUND' },
      { pattern: 'No mocks remaining', message: 'You have used all your free mock interviews.', statusCode: 403, code: 'FORBIDDEN' },
      { pattern: 'Session not found', message: 'The interview session could not be found.', statusCode: 404, code: 'NOT_FOUND' },
      { pattern: 'Question not found', message: 'The question could not be found.', statusCode: 404, code: 'NOT_FOUND' },
    ];

    for (const mapping of errorMaps) {
      if (error.message.includes(mapping.pattern)) {
        return {
          message: mapping.message,
          code: mapping.code,
          statusCode: mapping.statusCode,
        };
      }
    }

    return {
      message: error.message,
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  };
}

export function createErrorResponse(error: unknown): { error: ApiError } {
  const normalized = normalizeError(error);
  return { error: normalized };
}
