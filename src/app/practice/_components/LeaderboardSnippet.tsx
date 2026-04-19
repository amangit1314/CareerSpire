'use client';

import Link from 'next/link';
import type { LeaderboardEntry } from '@/app/actions/practice.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Trophy, ArrowRight, Flame } from 'lucide-react';

export function LeaderboardSnippet({ entries }: { entries: LeaderboardEntry[] }) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary/15">
                        <Trophy className="h-3 w-3 text-primary" />
                    </div>
                    <h2 className={cn(dmSans.className, 'text-base sm:text-lg font-bold')}>
                        Top this week
                    </h2>
                </div>
                <Link
                    href="/practice/leaderboard"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                    Full board <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {entries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        No one has solved a problem this week yet. Be the first!
                    </p>
                </div>
            ) : (
                <ul className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-card">
                    {entries.slice(0, 5).map((e) => (
                        <li
                            key={e.userId}
                            className={cn(
                                'flex items-center gap-3 px-3 sm:px-4 py-2.5',
                                e.isYou && 'bg-primary/5',
                            )}
                        >
                            <span
                                className={cn(
                                    'shrink-0 w-6 text-center text-xs font-bold tabular-nums',
                                    e.rank === 1
                                        ? 'text-warning'
                                        : e.rank === 2
                                          ? 'text-foreground/80'
                                          : e.rank === 3
                                            ? 'text-destructive/70'
                                            : 'text-muted-foreground',
                                )}
                            >
                                #{e.rank}
                            </span>
                            <Avatar entry={e} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">
                                    {e.name ?? 'Anonymous'}
                                    {e.isYou && (
                                        <span className="ml-1.5 text-[0.625rem] uppercase tracking-wider text-primary font-bold">
                                            you
                                        </span>
                                    )}
                                </p>
                                <p className="text-[0.6875rem] text-muted-foreground">
                                    {e.problemsSolved} solved this week
                                </p>
                            </div>
                            {e.currentStreak > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[0.6875rem] text-warning shrink-0">
                                    <Flame className="h-3 w-3" />
                                    {e.currentStreak}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
    if (entry.image) {
        return (
            <div className="shrink-0 h-7 w-7 rounded-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.image} alt="" className="h-full w-full object-cover" />
            </div>
        );
    }
    const initial = entry.name?.[0]?.toUpperCase() ?? '?';
    return (
        <div className="shrink-0 h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
            {initial}
        </div>
    );
}
