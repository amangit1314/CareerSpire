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
