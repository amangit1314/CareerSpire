'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    getLeaderboard,
    type LeaderboardEntry,
} from '@/app/actions/practice.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Trophy, ArrowLeft, Flame, Loader2, Crown, Medal } from 'lucide-react';

type Scope = 'all' | 'weekly';

export default function LeaderboardPage() {
    const [scope, setScope] = useState<Scope>('all');
    const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        setEntries(null);
        getLeaderboard(scope, 100).then((e) => {
            if (!cancelled) setEntries(e);
        });
        return () => {
            cancelled = true;
        };
    }, [scope]);

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                <Link
                    href="/practice"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Practice
                </Link>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8">
                    <div
                        className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
                        aria-hidden
                    />
                    <div className="relative flex items-center gap-3">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary">
                                Leaderboard
                            </span>
                            <h1
                                className={cn(
                                    dmSans.className,
                                    'text-2xl sm:text-3xl font-bold tracking-tight',
                                )}
                            >
                                Top performers
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Scope tabs */}
                <div className="flex items-center gap-1">
                    {([
                        { v: 'all', label: 'All-time' },
                        { v: 'weekly', label: 'This week' },
                    ] as { v: Scope; label: string }[]).map((t) => (
                        <button
                            key={t.v}
                            type="button"
                            onClick={() => setScope(t.v)}
                            className={cn(
                                'text-xs font-semibold px-3 py-2 rounded-md transition-colors cursor-pointer',
                                scope === t.v
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {entries === null ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading…
                    </div>
                ) : entries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                        <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className={cn(dmSans.className, 'font-semibold mb-1')}>
                            No one&apos;s on the board yet
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Be the first to solve a problem and claim #1.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-border overflow-hidden bg-card">
                        <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-2.5 text-[0.6875rem] uppercase tracking-wider font-semibold text-muted-foreground border-b border-border bg-muted/30">
                            <span>Rank</span>
                            <span>User</span>
                            <span className="hidden sm:inline text-right">
                                {scope === 'weekly' ? 'Solved (week)' : 'Total solved'}
                            </span>
                            <span className="text-right">
                                {scope === 'weekly' ? 'Streak' : 'XP'}
                            </span>
                        </div>
                        <ul className="divide-y divide-border">
                            {entries.map((e) => (
                                <Row key={e.userId} entry={e} scope={scope} />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function Row({ entry, scope }: { entry: LeaderboardEntry; scope: Scope }) {
    return (
        <li
            className={cn(
                'grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-3 items-center',
                entry.isYou && 'bg-primary/5',
            )}
        >
            <span
                className={cn(
                    'text-sm font-bold tabular-nums inline-flex items-center gap-1',
                    entry.rank === 1
                        ? 'text-warning'
                        : entry.rank === 2
                          ? 'text-foreground/80'
                          : entry.rank === 3
                            ? 'text-destructive/70'
                            : 'text-muted-foreground',
                )}
            >
                {entry.rank === 1 ? (
                    <Crown className="h-3.5 w-3.5" />
                ) : entry.rank === 2 || entry.rank === 3 ? (
                    <Medal className="h-3.5 w-3.5" />
                ) : null}
                #{entry.rank}
            </span>
            <div className="flex items-center gap-3 min-w-0">
                <Avatar entry={entry} />
                <span className={cn(dmSans.className, 'text-sm font-semibold truncate')}>
                    {entry.name ?? 'Anonymous'}
                    {entry.isYou && (
                        <span className="ml-1.5 text-[0.625rem] uppercase tracking-wider text-primary font-bold">
                            you
                        </span>
                    )}
                </span>
            </div>
            <span className="hidden sm:inline text-sm text-right tabular-nums text-muted-foreground">
                {entry.problemsSolved}
            </span>
            <span className="text-right text-sm tabular-nums font-semibold inline-flex items-center gap-1 justify-end">
                {scope === 'weekly' && entry.currentStreak > 0 ? (
                    <>
                        <Flame className="h-3 w-3 text-warning" />
                        {entry.currentStreak}
                    </>
                ) : scope === 'all' ? (
                    <span className="text-primary">{entry.xp}</span>
                ) : (
                    '—'
                )}
            </span>
        </li>
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
