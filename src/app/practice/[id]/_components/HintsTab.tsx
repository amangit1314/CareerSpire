'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { spendCoinsForUnlock } from '@/app/actions/practice.actions';
import { COIN_SPEND } from '@/lib/practiceCoins.shared';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Lightbulb, Eye, Lock, Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface HintsTabProps {
    questionId: string;
    hints: string[];
    /** Current user coin balance (for gating). null = anonymous */
    coinBalance: number | null;
    onCoinsChanged?: (newBalance: number) => void;
}

export function HintsTab({
    questionId,
    hints,
    coinBalance,
    onCoinsChanged,
}: HintsTabProps) {
    // The first hint is always free; subsequent ones cost coins.
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const [pending, startTransition] = useTransition();
    const [localBalance, setLocalBalance] = useState<number | null>(coinBalance);

    const reveal = (index: number) => {
        if (index === 0) {
            setRevealed((prev) => new Set([...prev, 0]));
            return;
        }

        if (localBalance === null) {
            toast.error('Sign in to unlock more hints');
            return;
        }
        if (localBalance < COIN_SPEND.HINT_REVEAL) {
            toast.error(
                `Need ${COIN_SPEND.HINT_REVEAL} coins. Solve problems to earn more.`,
            );
            return;
        }

        // Optimistic
        setRevealed((prev) => new Set([...prev, index]));
        setLocalBalance((b) => (b !== null ? b - COIN_SPEND.HINT_REVEAL : null));
        onCoinsChanged?.((localBalance ?? 0) - COIN_SPEND.HINT_REVEAL);

        startTransition(() => {
            spendCoinsForUnlock('hint_reveal', questionId)
                .then(({ newBalance }) => {
                    setLocalBalance(newBalance);
                    onCoinsChanged?.(newBalance);
                })
                .catch((err) => {
                    // Rollback
                    setRevealed((prev) => {
                        const next = new Set(prev);
                        next.delete(index);
                        return next;
                    });
                    setLocalBalance((b) =>
                        b !== null ? b + COIN_SPEND.HINT_REVEAL : null,
                    );
                    toast.error(err?.message ?? 'Could not unlock hint');
                });
        });
    };

    if (hints.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-xs text-muted-foreground">
                    No hints for this problem.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    <h4 className={cn(dmSans.className, 'text-sm font-bold')}>Hints</h4>
                </div>
                {localBalance !== null && (
                    <span className="inline-flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
                        <Coins className="h-3 w-3 text-primary" />
                        <span className="tabular-nums">{localBalance}</span>
                    </span>
                )}
            </div>

            <ul className="space-y-2">
                {hints.map((hint, i) => {
                    const isRevealed = revealed.has(i);
                    const isFree = i === 0;
                    if (isRevealed) {
                        return (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg border border-warning/20 bg-warning/5 p-3"
                            >
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-warning/15 text-warning text-[0.625rem] font-bold mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-xs text-foreground/90 leading-relaxed">
                                        {hint}
                                    </p>
                                </div>
                            </motion.li>
                        );
                    }
                    return (
                        <li key={i}>
                            <button
                                type="button"
                                onClick={() => reveal(i)}
                                disabled={pending}
                                className={cn(
                                    'w-full text-left rounded-lg border border-dashed p-3 transition-all',
                                    'flex items-center justify-between gap-2',
                                    'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer group',
                                    pending && 'opacity-60 cursor-wait',
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-muted-foreground text-[0.625rem] font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {isFree ? 'Hint 1 (free)' : `Hint ${i + 1}`}
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[0.6875rem]">
                                    {isFree ? (
                                        <>
                                            <Eye className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                            Reveal
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-3 w-3 text-muted-foreground" />
                                            <span className="inline-flex items-center gap-0.5 text-primary font-semibold">
                                                <Coins className="h-2.5 w-2.5" />
                                                {COIN_SPEND.HINT_REVEAL}
                                            </span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            {pending && (
                <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Unlocking…
                </p>
            )}
        </div>
    );
}
