/**
 * Shared coin economy constants and types for the Practice hub.
 *
 * This file is safe to import from both server and client components
 * because it has NO server-only dependencies (no Prisma, no pg, etc.).
 */

import { Difficulty, CoinReason } from "@/types/enums";
import type { CoinChangeInput } from "@/types/interfaces";

export { CoinReason };
export type { CoinChangeInput };

export const COIN_EARN = {
  SOLVE_EASY: 10,
  SOLVE_MEDIUM: 20,
  SOLVE_HARD: 50,
  FIRST_SOLVE_BONUS: 30,
  DAILY_CHALLENGE: 100,
  STREAK_7: 50,
  STREAK_30: 200,
} as const;

export const COIN_SPEND = {
  HINT_REVEAL: 5,
  SOLUTION_UNLOCK: 50,
} as const;

/** Pick the earn amount for a solve based on difficulty. */
export function earnForDifficulty(difficulty: string): number {
  switch (difficulty.toUpperCase()) {
    case Difficulty.EASY:
      return COIN_EARN.SOLVE_EASY;
    case Difficulty.MEDIUM:
      return COIN_EARN.SOLVE_MEDIUM;
    case Difficulty.HARD:
      return COIN_EARN.SOLVE_HARD;
    default:
      return COIN_EARN.SOLVE_EASY;
  }
}

export function reasonForDifficulty(difficulty: string): CoinReason {
  switch (difficulty.toUpperCase()) {
    case Difficulty.EASY:
      return CoinReason.SOLVE_EASY;
    case Difficulty.MEDIUM:
      return CoinReason.SOLVE_MEDIUM;
    case Difficulty.HARD:
      return CoinReason.SOLVE_HARD;
    default:
      return CoinReason.SOLVE_EASY;
  }
}
