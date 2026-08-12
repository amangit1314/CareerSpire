export async function register() {
  // Validate environment variables on server startup
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env');
    validateEnv();

    // validateEnv() runs first so a missing-env-var failure surfaces as our own
    // clear error, not buried inside a Sentry init crash.
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Recommended by Sentry's current Next.js docs: captures server-side errors
// (e.g. React Server Component render errors) that don't flow through
// error.tsx/global-error.tsx. Not in the brief's example instrumentation.ts,
// but it's core error-capture wiring the SDK expects here, not an extra feature.
export async function onRequestError(
  ...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>
) {
  const Sentry = await import('@sentry/nextjs');
  Sentry.captureRequestError(...args);
}
