'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    getPracticeProblems,
    getPracticePageData,
    type ProblemListItem,
    type UserPracticeStats,
    type DailyChallengeInfo,
    type LeaderboardEntry,
} from '@/app/actions/practice.actions';
import { PracticeHero } from './_components/PracticeHero';
import { DailyChallengeBanner } from './_components/DailyChallengeBanner';
import { ProblemFilters, type PracticeFilterState } from './_components/ProblemFilters';
import { ProblemList } from './_components/ProblemList';
import { LeaderboardSnippet } from './_components/LeaderboardSnippet';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Inbox, Loader2 } from 'lucide-react';

const EMPTY_FILTERS: PracticeFilterState = {
    search: '',
    difficulty: 'all',
    status: 'all',
    tag: '',
};

const EMPTY_STATS: UserPracticeStats = {
    isAnonymous: true,
    xp: 0,
    coins: 0,
    currentStreak: 0,
    longestStreak: 0,
    problemsSolved: 0,
    rank: null,
};

export default function PracticePage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const filters = useMemo<PracticeFilterState>(
        () => ({
            search: searchParams.get('q') ?? '',
            difficulty:
                (searchParams.get('difficulty') as PracticeFilterState['difficulty']) ??
                'all',
            status:
                (searchParams.get('status') as PracticeFilterState['status']) ?? 'all',
            tag: searchParams.get('tag') ?? '',
        }),
        [searchParams],
    );

    const [problems, setProblems] = useState<ProblemListItem[]>([]);
    const [facets, setFacets] = useState<{ tags: string[] }>({ tags: [] });
    const [stats, setStats] = useState<UserPracticeStats>(EMPTY_STATS);
    const [daily, setDaily] = useState<DailyChallengeInfo | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);

    // Static (filter-independent) data — single consolidated call
    useEffect(() => {
        let cancelled = false;
        getPracticePageData()
            .then((data) => {
                if (cancelled) return;
                setFacets(data.facets);
                setStats(data.stats);
                setDaily(data.daily);
                setLeaderboard(data.leaderboard);
            })
            .finally(() => !cancelled && setIsLoadingMeta(false));
        return () => {
            cancelled = true;
        };
    }, []);

    // Problem list — refetch on filter change
    useEffect(() => {
        let cancelled = false;
        setIsLoadingList(true);
        getPracticeProblems({
            search: filters.search || undefined,
            difficulty: filters.difficulty,
            status: filters.status,
            tag: filters.tag || undefined,
            limit: 100,
        })
            .then((items) => {
                if (!cancelled) setProblems(items);
            })
            .finally(() => !cancelled && setIsLoadingList(false));
        return () => {
            cancelled = true;
        };
    }, [filters.search, filters.difficulty, filters.status, filters.tag]);

    const applyFilters = (patch: Partial<PracticeFilterState>) => {
        const next = { ...filters, ...patch };
        const params = new URLSearchParams();
        if (next.search) params.set('q', next.search);
        if (next.difficulty !== 'all') params.set('difficulty', next.difficulty);
        if (next.status !== 'all') params.set('status', next.status);
        if (next.tag) params.set('tag', next.tag);
        const query = params.toString();
        router.replace(query ? `/practice?${query}` : '/practice', {
            scroll: false,
        });
    };

    const hasActiveFilters =
        filters.search !== '' ||
        filters.difficulty !== 'all' ||
        filters.status !== 'all' ||
        filters.tag !== '';

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6">
                {isLoadingMeta ? (
                    <div className="h-48 rounded-2xl bg-muted animate-pulse" />
                ) : (
                    <PracticeHero stats={stats} />
                )}

                {!isLoadingMeta && <DailyChallengeBanner info={daily} />}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Problem list — main column */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="sticky top-0 z-10 py-3 -mx-4 sm:mx-0 px-4 sm:px-0 bg-background/80 backdrop-blur-md">
                            <ProblemFilters
                                filters={filters}
                                facets={facets}
                                onChange={applyFilters}
                            />
                        </div>

                        <div className="flex items-baseline justify-between gap-3">
                            <h2
                                className={cn(
                                    dmSans.className,
                                    'text-base sm:text-lg font-bold',
                                )}
                            >
                                {hasActiveFilters ? 'Filtered problems' : 'All problems'}
                            </h2>
                            {!isLoadingList && (
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {problems.length}{' '}
                                    {problems.length === 1 ? 'problem' : 'problems'}
                                </span>
                            )}
                        </div>

                        {isLoadingList ? (
                            <ListSkeleton />
                        ) : problems.length === 0 ? (
                            <EmptyList
                                hasFilters={hasActiveFilters}
                                onClear={() => applyFilters(EMPTY_FILTERS)}
                            />
                        ) : (
                            <ProblemList problems={problems} />
                        )}
                    </div>

                    {/* Right rail — leaderboard snippet */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
                        {!isLoadingMeta && <LeaderboardSnippet entries={leaderboard} />}
                    </aside>
                </div>
            </div>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="h-14 border-b border-border last:border-b-0 animate-pulse bg-muted/30"
                    aria-hidden
                />
            ))}
            <div className="flex items-center justify-center text-muted-foreground text-xs gap-2 py-3">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading problems…
            </div>
        </div>
    );
}

function EmptyList({
    hasFilters,
    onClear,
}: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
                <Inbox className="h-6 w-6 text-primary" />
            </div>
            <h3 className={cn(dmSans.className, 'text-base font-semibold mb-1')}>
                {hasFilters ? 'No problems match these filters' : 'No problems yet'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-5">
                {hasFilters
                    ? 'Try broadening your search or clearing a filter.'
                    : 'The problem bank is empty. Run the seed script to generate problems.'}
            </p>
            {hasFilters ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                    Clear filters
                </button>
            ) : (
                <Link
                    href="/resources"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                    Browse Resources
                </Link>
            )}
        </div>
    );
}
