'use client';

import type { UserPracticeStats } from '@/app/actions/practice.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Flame, CheckCircle2, Coins, Trophy, Users } from 'lucide-react';

interface PracticeHeroProps {
    stats: UserPracticeStats;
}

export function PracticeHero({ stats }: PracticeHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8">
            <div
                className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
            />
            <div className="relative max-w-3xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[0.6875rem] font-semibold uppercase tracking-wider ring-1 ring-primary/20 mb-3">
                    <Users className="h-3 w-3" />
                    Practice Hub
                </span>
                <h1
                    className={cn(
                        dmSans.className,
                        'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                    )}
                >
                    Solve problems. Build a streak. Climb the board.
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Battle-tested DSA problems with an AI-powered sandbox, instant
                    test feedback, and daily challenges that actually matter.
                </p>
            </div>

            <div className="relative mt-6 pt-5 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Stat icon={Flame} label="streak" value={`${stats.currentStreak}d`} tone="warning" />
                    <Separator />
                    <Stat icon={CheckCircle2} label="solved" value={stats.problemsSolved} tone="success" />
                    <Separator />
                    <Stat icon={Coins} label="coins" value={stats.coins} tone="primary" />
                    <Separator />
                    {stats.isAnonymous ? (
                        <span className="text-xs text-muted-foreground italic">
                            Sign in to track your progress & climb the leaderboard
                        </span>
                    ) : (
                        <Stat
                            icon={Trophy}
                            label={stats.rank ? `rank · ${stats.xp} XP` : 'ranked'}
                            value={stats.rank ? `#${stats.rank}` : '—'}
                            tone="muted"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Flame;
    label: string;
    value: number | string;
    tone: 'primary' | 'success' | 'warning' | 'muted';
}) {
    const toneMap = {
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        muted: 'text-muted-foreground',
    };
    return (
        <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', toneMap[tone])} />
            <span
                className={cn(
                    dmSans.className,
                    'text-base sm:text-lg font-bold tabular-nums leading-none',
                )}
            >
                {typeof value === 'number' && value >= 1000
                    ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
                    : value}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

function Separator() {
    return (
        <span className="hidden sm:inline-block h-4 w-px bg-border" aria-hidden />
    );
}
