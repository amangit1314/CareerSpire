/**
 * Vars the app cannot function without. Missing any of these should fail
 * fast at startup with a clear message, not surface as a cryptic runtime
 * crash the first time a request touches the missing config.
 */
export const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
  'GOOGLE_AI_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Set these before starting the app — see docs/PRODUCTION_FEATURES.md#configuration.`
    );
  }
}
