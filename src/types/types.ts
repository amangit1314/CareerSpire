// All `type` aliases and their small runtime-const companions, centralized
// here so any file can `import { X } from '@/types'` (re-exported via
// index.ts). Interfaces live in interfaces.ts; enums in enums.ts.

// ---------------------------------------------------------------------------
// Practice hub filter sentinels — "show everything" / "bookmarked" values
// that aren't part of the `Difficulty` or Prisma `ProblemStatus` enums,
// specific to the filter UI's own concept. Named as types (`AnyDifficulty`
// etc.) so interfaces.ts can reference them without depending on the const's
// inferred literal type directly.
// ---------------------------------------------------------------------------

export const ANY_DIFFICULTY = "all" as const;
export type AnyDifficulty = typeof ANY_DIFFICULTY;

export const ANY_STATUS = "all" as const;
export type AnyStatus = typeof ANY_STATUS;

export const BOOKMARKED_STATUS = "BOOKMARKED" as const;
export type BookmarkedStatus = typeof BOOKMARKED_STATUS;

// ---------------------------------------------------------------------------
// Generic utility types
// ---------------------------------------------------------------------------

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
