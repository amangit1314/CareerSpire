'use client';

import Link from 'next/link';
import type { CommunityStats } from '@/app/actions/community.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Plus, Video as VideoIcon, Users } from 'lucide-react';

interface CommunityHeroProps {
    stats: CommunityStats;
}

export function CommunityHero({ stats }: CommunityHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8">
            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
            />

            <div className="relative max-w-3xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[0.6875rem] font-semibold uppercase tracking-wider ring-1 ring-primary/20 mb-3">
                    <Users className="h-3 w-3" />
                    Community
                </span>

                <h1
                    className={cn(
                        dmSans.className,
                        'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                    )}
                >
                    Learn from people who just interviewed.
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Real interview experiences, mock recordings, and hard-won tips —
                    shared by candidates just like you.
                </p>

                {/* CTA pair */}
                <div className="flex flex-wrap gap-2 mt-5">
                    <Link
                        href="/community/experiences/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Share an experience
                    </Link>
                    <Link
                        href="/mock/video"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                        <VideoIcon className="h-4 w-4 text-primary" />
                        Record a video mock
                    </Link>
                </div>
            </div>

            {/* Activity ribbon — inline, typographic, no boxes */}
            <ActivityRibbon stats={stats} />
        </section>
    );
}

function ActivityRibbon({ stats }: { stats: CommunityStats }) {
    return (
        <div className="relative mt-6 pt-5 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {/* Live pulse */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2" aria-hidden>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-muted-foreground">
                        Live
                    </span>
                </div>

                {/* Inline stats — number + label on separate lines for density */}
                <InlineStat value={stats.newThisWeek} label="new this week" emphasize />
                <Separator />
                <InlineStat value={stats.offersReported} label="offers reported" />
                <Separator />
                <InlineStat value={stats.memberCount} label="members" />

                {/* Trending companies, inline */}
                {stats.topCompanies.length > 0 && (
                    <>
                        <Separator />
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-muted-foreground mr-0.5">
                                Trending
                            </span>
                            {stats.topCompanies.slice(0, 4).map((c) => (
                                <Link
                                    key={c.name}
                                    href={`/community?company=${encodeURIComponent(c.name)}`}
                                    className="text-xs font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                                >
                                    {c.name}
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function InlineStat({
    value,
    label,
    emphasize,
}: {
    value: number;
    label: string;
    emphasize?: boolean;
}) {
    return (
        <div className="flex items-baseline gap-1.5">
            <span
                className={cn(
                    dmSans.className,
                    'font-bold tabular-nums leading-none',
                    emphasize ? 'text-primary text-lg sm:text-xl' : 'text-foreground text-base sm:text-lg',
                )}
            >
                {formatValue(value)}
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

function formatValue(v: number): string {
    if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return v.toString();
}
