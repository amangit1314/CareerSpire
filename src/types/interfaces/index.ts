// Barrel: re-exports all interface groups so any file can keep doing
// `import { X } from '@/types'` (via ../index.ts) regardless of which
// domain file X actually lives in. Split by domain to stay under the
// project's 500-line-per-file ceiling — see core.ts, practice.ts,
// video.ts, community.ts.
export * from "./core";
export * from "./practice";
export * from "./video";
export * from "./community";
