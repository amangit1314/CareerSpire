/**
 * Coin economy helpers for the Practice hub (SERVER-ONLY).
 *
 * Balance is cached on `User.coins`; every change is audited via
 * `CoinTransaction`. All writes happen inside a Prisma `$transaction` so
 * the cached balance can never drift from the ledger.
 *
 * Constants and types are re-exported from the shared module so existing
 * server-side imports continue to work unchanged.
 */

import { prisma } from '@/lib/prisma';

// Re-export everything from the shared (client-safe) module
export {
    COIN_EARN,
    COIN_SPEND,
    earnForDifficulty,
    reasonForDifficulty,
} from '@/lib/practiceCoins.shared';
export type { CoinReason, CoinChangeInput } from '@/lib/practiceCoins.shared';

import type { CoinChangeInput } from '@/lib/practiceCoins.shared';

export async function applyCoinChange(
    input: CoinChangeInput,
): Promise<{ newBalance: number }> {
    const { userId, amount, reason, refId } = input;

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { coins: true },
        });
        if (!user) throw new Error('User not found');

        const nextBalance = user.coins + amount;
        if (nextBalance < 0) {
            throw new Error('Insufficient coins');
        }

        await tx.coinTransaction.create({
            data: { userId, amount, reason, refId },
        });

        await tx.user.update({
            where: { id: userId },
            data: { coins: nextBalance },
        });

        return { newBalance: nextBalance };
    });
}

export async function getCoinBalance(userId: string): Promise<number> {
    const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true },
    });
    return u?.coins ?? 0;
}
