// Client-side Sentry init. As of @sentry/nextjs v9+/Next.js 15.3+, this replaces the
// older `sentry.client.config.ts` convention — Next.js now loads `instrumentation-client.ts`
// (root or src/) automatically, before hydration. See Task 4 brief for the old shape;
// this file was updated after checking the installed SDK version (10.70.0) against
// current Sentry/Next.js docs, since the brief's example predates this rename.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});

// Required by the installed SDK to instrument App Router navigations — without
// this export, every build prints an "ACTION REQUIRED" warning.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
