'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    UserRoadmap,
    toggleRoadmapPin,
    archiveRoadmap,
} from '@/app/actions/resource.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
    Sparkles,
    ArrowRight,
    Clock,
    Pin,
    PinOff,
    Archive,
    MessageCircle,
    MoreVertical,
} from 'lucide-react';

interface UserRoadmapsProps {
    roadmaps: UserRoadmap[];
}

function formatRelative(date: Date | null): string {
    if (!date) return 'Not started';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export function UserRoadmaps({ roadmaps: initial }: UserRoadmapsProps) {
    const [roadmaps, setRoadmaps] = useState(initial);

    if (roadmaps.length === 0) return null;

    const updateLocal = (slug: string, patch: Partial<UserRoadmap> | null) => {
        setRoadmaps((prev) => {
            if (patch === null) return prev.filter((r) => r.slug !== slug);
            const next = prev.map((r) => (r.slug === slug ? { ...r, ...patch } : r));
            // Re-sort: pinned first, then by lastVisitedAt desc
            return next.sort((a, b) => {
                if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                return new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime();
            });
        });
    };

    return (
        <section aria-labelledby="your-roadmaps-heading">
            <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary/15">
                            <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary">
                            Continue where you left off
                        </span>
                    </div>
                    <h2
                        id="your-roadmaps-heading"
                        className={cn(dmSans.className, 'text-xl sm:text-2xl font-bold')}
                    >
                        Your Roadmaps
                    </h2>
                </div>
                <p className="hidden sm:block text-xs text-muted-foreground">
                    {roadmaps.length} custom {roadmaps.length === 1 ? 'track' : 'tracks'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {roadmaps.map((r) => (
                    <RoadmapCard
                        key={r.slug}
                        roadmap={r}
                        onPinToggle={(slug, nextPinned) =>
                            updateLocal(slug, { isPinned: nextPinned })
                        }
                        onArchive={(slug) => updateLocal(slug, null)}
                    />
                ))}
            </div>
        </section>
    );
}

function RoadmapCard({
    roadmap,
    onPinToggle,
    onArchive,
}: {
    roadmap: UserRoadmap;
    onPinToggle: (slug: string, nextPinned: boolean) => void;
    onArchive: (slug: string) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [, startTransition] = useTransition();

    const pct =
        roadmap.totalQuestions > 0
            ? Math.min(100, Math.round((roadmap.completedQuestions / roadmap.totalQuestions) * 100))
            : 0;

    const handlePin = () => {
        const nextPinned = !roadmap.isPinned;
        setMenuOpen(false);
        onPinToggle(roadmap.slug, nextPinned);
        startTransition(() => {
            toggleRoadmapPin(roadmap.slug).catch(() => {
                // Rollback on failure
                onPinToggle(roadmap.slug, !nextPinned);
            });
        });
    };

    const handleArchive = () => {
        setMenuOpen(false);
        onArchive(roadmap.slug);
        startTransition(() => {
            archiveRoadmap(roadmap.slug).catch(() => {
                // Ideally we'd restore, but the parent state has it removed.
                // For simplicity in v1, we log and the user can re-visit to un-archive.
                console.error('Failed to archive roadmap');
            });
        });
    };

    return (
        <div
            className={cn(
                'group relative rounded-xl',
                'bg-card border',
                'transition-all',
                roadmap.isPinned
                    ? 'border-primary/30 shadow-sm shadow-primary/5'
                    : 'border-border',
                'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
            )}
        >
            {/* Pin indicator */}
            {roadmap.isPinned && (
                <span className="absolute -top-1.5 left-3 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[0.625rem] font-semibold shadow-sm">
                    <Pin className="h-2.5 w-2.5" />
                    Pinned
                </span>
            )}

            {/* Overflow menu */}
            <div className="absolute top-2 right-2 z-10">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen((o) => !o);
                    }}
                    aria-label="Roadmap options"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                >
                    <MoreVertical className="h-3.5 w-3.5" />
                </button>
                {menuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-20 min-w-[10rem] rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={handlePin}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer"
                            >
                                {roadmap.isPinned ? (
                                    <>
                                        <PinOff className="h-3.5 w-3.5" /> Unpin
                                    </>
                                ) : (
                                    <>
                                        <Pin className="h-3.5 w-3.5" /> Pin to top
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleArchive}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted text-destructive transition-colors cursor-pointer"
                            >
                                <Archive className="h-3.5 w-3.5" /> Archive
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Link
                href={`/resources/${encodeURIComponent(roadmap.slug)}`}
                className={cn(
                    'block p-4 sm:p-5 cursor-pointer rounded-xl',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
            >
                {/* Subtle corner accent on hover */}
                <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-tr-xl rounded-bl-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    aria-hidden
                />

                <div className="relative flex items-start justify-between gap-3 mb-3 pr-6">
                    <div className="min-w-0 flex-1">
                        <h3
                            className={cn(
                                dmSans.className,
                                'text-base sm:text-lg font-bold truncate',
                            )}
                        >
                            {roadmap.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelative(roadmap.lastVisitedAt)}</span>
                        </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[0.6875rem] font-semibold ring-1 ring-primary/20">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI
                    </span>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground tabular-nums">
                            {roadmap.completedQuestions}/{roadmap.totalQuestions || '—'}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                <div className="relative mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[0.6875rem] text-muted-foreground">
                        <span>{pct}% done</span>
                        {roadmap.tutorMessages > 0 && (
                            <span className="inline-flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {roadmap.tutorMessages}
                            </span>
                        )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                </div>
            </Link>
        </div>
    );
}
