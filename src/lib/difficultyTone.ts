/**
 * Unified difficulty → color tokens used across practice, resources, and
 * mock pages. Returns Tailwind class fragments tied to the design system.
 */

export type DifficultyKey = 'easy' | 'medium' | 'hard';

export interface DifficultyTone {
    dot: string;
    text: string;
    bg: string;
    ring: string;
    label: string;
}

const TONES: Record<DifficultyKey, DifficultyTone> = {
    easy: {
        dot: 'bg-success',
        text: 'text-success',
        bg: 'bg-success/10',
        ring: 'ring-success/20',
        label: 'Easy',
    },
    medium: {
        dot: 'bg-warning',
        text: 'text-warning',
        bg: 'bg-warning/10',
        ring: 'ring-warning/20',
        label: 'Medium',
    },
    hard: {
        dot: 'bg-destructive',
        text: 'text-destructive',
        bg: 'bg-destructive/10',
        ring: 'ring-destructive/20',
        label: 'Hard',
    },
};

export function difficultyTone(raw: string | null | undefined): DifficultyTone {
    const key = (raw ?? '').toLowerCase() as DifficultyKey;
    return TONES[key] ?? TONES.easy;
}
