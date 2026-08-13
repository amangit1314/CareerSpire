/**
 * Per-user daily rate limit for AI Tutor conversations.
 *
 * v1 uses an in-memory Map — resets on server restart. Acceptable tradeoff
 * for MVP since:
 *   - worst case on restart = limit resets early (pro-user, not adversarial)
 *   - adversarial users (spamming) still get bounded by any single process lifetime
 *   - swap with Redis / DB table when horizontal scale requires it
 *
 * Contract is stable: consumers call `checkAndConsume` / `getUsage` and
 * never touch internal storage, so the storage layer can be swapped without
 * touching call sites.
 */

import type { SubscriptionTier } from '@prisma/client';

type Tier = SubscriptionTier | 'ANONYMOUS';

/** Daily message cap per subscription tier. Infinity = unlimited. */
const DAILY_LIMITS: Record<Tier, number> = {
    ANONYMOUS: 5,
    FREE: 10,
    STARTER: 150,
    PRO: 200, // soft cap to prevent abuse; effectively unlimited for real usage
};

export interface UsageStatus {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    /** ISO timestamp when the counter next resets (midnight UTC next day). */
    resetsAt: string;
}

interface UsageEntry {
    date: string; // YYYY-MM-DD
    count: number;
}

const store = new Map<string, UsageEntry>();

function todayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

function nextResetISO(): string {
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    return tomorrow.toISOString();
}

function limitFor(tier: Tier): number {
    return DAILY_LIMITS[tier] ?? DAILY_LIMITS.FREE;
}

/** Check if the user can send another message AND consume one slot if allowed. */
export function checkAndConsume(userId: string, tier: Tier = 'FREE'): UsageStatus {
    const limit = limitFor(tier);
    const today = todayKey();
    const existing = store.get(userId);
    const entry: UsageEntry =
        existing && existing.date === today ? existing : { date: today, count: 0 };

    // Unlimited tier: still track for observability, never block.
    if (!Number.isFinite(limit)) {
        entry.count += 1;
        store.set(userId, entry);
        return {
            allowed: true,
            used: entry.count,
            limit,
            remaining: Infinity,
            resetsAt: nextResetISO(),
        };
    }

    if (entry.count >= limit) {
        return {
            allowed: false,
            used: entry.count,
            limit,
            remaining: 0,
            resetsAt: nextResetISO(),
        };
    }

    entry.count += 1;
    store.set(userId, entry);
    return {
        allowed: true,
        used: entry.count,
        limit,
        remaining: limit - entry.count,
        resetsAt: nextResetISO(),
    };
}

/** Read-only inspection without consuming a slot. */
export function getUsage(userId: string, tier: Tier = 'FREE'): UsageStatus {
    const limit = limitFor(tier);
    const today = todayKey();
    const entry = store.get(userId);
    const used = entry && entry.date === today ? entry.count : 0;
    return {
        allowed: !Number.isFinite(limit) || used < limit,
        used,
        limit,
        remaining: Number.isFinite(limit) ? Math.max(0, limit - used) : Infinity,
        resetsAt: nextResetISO(),
    };
}
