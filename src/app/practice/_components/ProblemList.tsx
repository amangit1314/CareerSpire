'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ProblemListItem } from '@/app/actions/practice.actions';
import { difficultyTone } from '@/lib/difficultyTone';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleDashed, Circle, Bookmark, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export function ProblemList({ problems }: { problems: ProblemListItem[] }) {
    const [page, setPage] = useState(0);

    // Reset to first page when problem list changes (e.g. filters applied)
    useEffect(() => setPage(0), [problems]);

    if (problems.length === 0) return null;

    const totalPages = Math.ceil(problems.length / PAGE_SIZE);
    const start = page * PAGE_SIZE;
    const visible = problems.slice(start, start + PAGE_SIZE);

    const goTo = (p: number) => {
        setPage(Math.max(0, Math.min(p, totalPages - 1)));
        // Scroll to top of list
        document.getElementById('problem-list-top')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    return (
        <div>
            <div id="problem-list-top" />
            <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
                {visible.map((p) => (
                    <li key={p.id}>
                        <Row problem={p} />
                    </li>
                ))}
            </ul>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {start + 1}–{Math.min(start + PAGE_SIZE, problems.length)} of {problems.length}
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => goTo(page - 1)}
                            disabled={page === 0}
                            aria-label="Previous page"
                            className={cn(
                                'inline-flex items-center justify-center h-8 w-8 rounded-lg',
                                'border border-border text-sm',
                                'hover:bg-primary/5 hover:border-primary/30',
                                'disabled:opacity-30 disabled:cursor-not-allowed',
                                'transition-colors cursor-pointer',
                            )}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                className={cn(
                                    'inline-flex items-center justify-center h-8 min-w-8 px-1 rounded-lg',
                                    'text-xs font-semibold tabular-nums',
                                    'transition-colors cursor-pointer',
                                    i === page
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border border-border hover:bg-primary/5 hover:border-primary/30',
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => goTo(page + 1)}
                            disabled={page === totalPages - 1}
                            aria-label="Next page"
                            className={cn(
                                'inline-flex items-center justify-center h-8 w-8 rounded-lg',
                                'border border-border text-sm',
                                'hover:bg-primary/5 hover:border-primary/30',
                                'disabled:opacity-30 disabled:cursor-not-allowed',
                                'transition-colors cursor-pointer',
                            )}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ problem }: { problem: ProblemListItem }) {
    const tone = difficultyTone(problem.difficulty);
    const StatusIcon =
        problem.userStatus === 'SOLVED'
            ? CheckCircle2
            : problem.userStatus === 'ATTEMPTED'
              ? CircleDashed
              : Circle;
    const statusColor =
        problem.userStatus === 'SOLVED'
            ? 'text-success'
            : problem.userStatus === 'ATTEMPTED'
              ? 'text-warning'
              : 'text-muted-foreground/40';

    return (
        <Link
            href={`/practice/${problem.id}`}
            className={cn(
                'flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3',
                'hover:bg-primary/5 transition-colors cursor-pointer',
                'focus:outline-none focus-visible:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
            )}
        >
            {/* Status icon */}
            <StatusIcon className={cn('h-4 w-4 shrink-0', statusColor)} />

            {/* Title + tags */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={cn(
                            dmSans.className,
                            'text-sm sm:text-base font-semibold truncate',
                        )}
                    >
                        {problem.title}
                    </span>
                    {problem.isBookmarked && (
                        <Bookmark className="h-3 w-3 text-primary fill-primary shrink-0" />
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {problem.tags.slice(0, 3).map((t) => (
                        <span
                            key={t}
                            className="text-[0.625rem] text-muted-foreground font-medium"
                        >
                            #{t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Difficulty chip */}
            <span
                className={cn(
                    'hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ring-1 shrink-0',
                    tone.bg,
                    tone.text,
                    tone.ring,
                )}
            >
                {tone.label}
            </span>

            {/* Solved count */}
            <div className="hidden md:flex items-center gap-1 text-[0.6875rem] text-muted-foreground shrink-0 tabular-nums w-20 justify-end">
                <Users className="h-3 w-3" />
                {problem.solvedCount}
            </div>
        </Link>
    );
}
