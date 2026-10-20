// Barrel: re-exports all UI-copy constant groups so any file can keep
// doing `import { X } from '@/config/content'` regardless of which
// domain file X actually lives in. Split by domain to stay under the
// project's 500-line-per-file ceiling — see auth.ts, dashboard.ts,
// practice.ts, mock.ts.
export * from "./auth";
export * from "./dashboard";
export * from "./practice";
export * from "./mock";
export * from "./community";
export * from "./resources";
export * from "./marketing";
export * from "./layout";
