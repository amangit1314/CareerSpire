import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEnv, REQUIRED_ENV_VARS } from './env';

describe('validateEnv', () => {
  const originalEnv = { ...process.env };
  const originalWarn = console.warn;

  beforeEach(() => {
    // Start from a fully-populated env so each test controls exactly one variable
    for (const key of REQUIRED_ENV_VARS) {
      process.env[key] = 'test-value';
    }
    // Set optional vars so tests can control them
    process.env.RAZORPAY_KEY_ID = 'test-value';
    process.env.RAZORPAY_KEY_SECRET = 'test-value';
    process.env.NEXT_PUBLIC_APP_URL = 'test-value';
    console.warn = vi.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    console.warn = originalWarn;
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

  it('includes JWT_REFRESH_SECRET in required vars that crash if missing', () => {
    delete process.env.JWT_REFRESH_SECRET;
    expect(() => validateEnv()).toThrow(/JWT_REFRESH_SECRET/);
  });

  it('warns about missing optional vars without throwing', () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    expect(() => validateEnv()).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing optional environment variables')
    );
  });

  it('warns specifically about RAZORPAY and NEXT_PUBLIC_APP_URL', () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.NEXT_PUBLIC_APP_URL;

    validateEnv();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringMatching(/RAZORPAY_KEY_ID.*RAZORPAY_KEY_SECRET.*NEXT_PUBLIC_APP_URL/)
    );
  });

  it('does not warn if all optional vars are set', () => {
    validateEnv();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not flag vars unrelated to required or optional lists', () => {
    delete process.env.SENTRY_DSN; // not in any list
    expect(() => validateEnv()).not.toThrow();
    expect(console.warn).not.toHaveBeenCalled();
  });
});
