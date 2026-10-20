// Types, enum, and static data shared across the resource.actions/ split.
// Deliberately NOT a 'use server' file — only async functions belong in
// those; this is the plain data/type layer they all import from.

import { QuestionType, ProgrammingLanguage } from "@prisma/client";
import { Framework } from "@/types/enums";

export { Framework };

export type ResourceStats = {
  totalQuestions: number;
  completedQuestions: number;
  attemptedQuestions: number;
};

export type CategoryStats = {
  category: string;
  slug: string;
  description: string;
  stats: ResourceStats;
  icon?: string;
};

export type UserRoadmap = {
  slug: string;
  name: string;
  totalQuestions: number;
  completedQuestions: number;
  tutorMessages: number;
  lastVisitedAt: Date;
  startedAt: Date;
  isPinned: boolean;
};

export interface ResourcesPageData {
  categories: CategoryStats[];
  roadmaps: UserRoadmap[];
}

export const CATEGORIES = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    type: QuestionType.DSA,
    description: "Master core computer science concepts",
  },
  {
    id: "javascript",
    name: "JavaScript",
    language: ProgrammingLanguage.JAVASCRIPT,
    description: "Deep dive into JS internals and patterns",
  },
  {
    id: "typescript",
    name: "TypeScript",
    language: ProgrammingLanguage.TYPESCRIPT,
    description: "Learn static typing and advanced TS features",
  },
  {
    id: "python",
    name: "Python",
    language: ProgrammingLanguage.PYTHON,
    description: "Pythonic coding and standard libraries",
  },
  {
    id: "react",
    name: "React",
    framework: Framework.REACT,
    description: "Modern UI development with React",
  },
  {
    id: "node",
    name: "Node.js",
    framework: Framework.NODE,
    description: "Server-side JavaScript runtime",
  },
];

/** Normalize a skill label into a consistent slug. */
export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-]/g, "");
}

/** Title-case display name from a slug. */
export function defaultDisplayName(raw: string): string {
  const cleaned = raw.trim().replace(/[-_]+/g, " ");
  return cleaned
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** True if this slug corresponds to a curated category (should NOT go in user roadmaps). */
export function isCuratedSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  return CATEGORIES.some(
    (c) =>
      c.id.toLowerCase() === normalized || c.name.toLowerCase() === normalized,
  );
}
