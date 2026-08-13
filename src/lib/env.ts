/**
 * Vars the app cannot function without. Missing any of these should fail
 * fast at startup with a clear message, not surface as a cryptic runtime
 * crash the first time a request touches the missing config.
 */
export const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
] as const;

/**
 * Optional vars that should warn if missing, but don't crash the app.
 * Some features may be limited if these are not configured.
 *
 * GOOGLE_AI_API_KEY and OPENROUTER_API_KEY are both optional: aiChat()'s
 * fallback chain is Groq -> Gemini (skipped if this key is absent) ->
 * OpenRouter. Groq alone is enough to boot; losing both fallbacks just
 * narrows the safety net, so it warns rather than crashes.
 */
const OPTIONAL_ENV_VARS = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'GOOGLE_AI_API_KEY',
  'OPENROUTER_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Set these before starting the app — see docs/PRODUCTION_FEATURES.md#configuration.`
    );
  }

  // Warn about missing optional vars, but don't crash
  const missingOptional = OPTIONAL_ENV_VARS.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `[ENV] Missing optional environment variables: ${missingOptional.join(', ')}. ` +
        `Some features may be limited without these — see docs/PRODUCTION_FEATURES.md#configuration.`
    );
  }
}
