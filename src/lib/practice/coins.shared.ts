/**
 * Shared coin economy constants and types for the Practice hub.
 *
 * This file is safe to import from both server and client components
 * because it has NO server-only dependencies (no Prisma, no pg, etc.).
 */

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

export type CoinReason =
    | 'solve_easy'
    | 'solve_medium'
    | 'solve_hard'
    | 'first_solve_bonus'
    | 'daily_challenge'
    | 'streak_7'
    | 'streak_30'
    | 'hint_reveal'
    | 'solution_unlock';

export interface CoinChangeInput {
    userId: string;
    amount: number; // positive = earn; negative = spend
    reason: CoinReason;
    refId?: string; // questionId | submissionId
}

/** Pick the earn amount for a solve based on difficulty. */
export function earnForDifficulty(difficulty: string): number {
    switch (difficulty.toUpperCase()) {
        case 'EASY':
            return COIN_EARN.SOLVE_EASY;
        case 'MEDIUM':
            return COIN_EARN.SOLVE_MEDIUM;
        case 'HARD':
            return COIN_EARN.SOLVE_HARD;
        default:
            return COIN_EARN.SOLVE_EASY;
    }
}

export function reasonForDifficulty(difficulty: string): CoinReason {
    switch (difficulty.toUpperCase()) {
        case 'EASY':
            return 'solve_easy';
        case 'MEDIUM':
            return 'solve_medium';
        case 'HARD':
            return 'solve_hard';
        default:
            return 'solve_easy';
    }
}
