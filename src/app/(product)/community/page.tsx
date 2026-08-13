'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    getCommunityFeed,
    getCommunityPageData,
    FeedItem,
    CommunityStats,
    CommunityFacets,
} from '@/app/actions/community.actions';
import { CommunityHero } from './_components/CommunityHero';
import { CommunityFilters, Filters } from './_components/CommunityFilters';
import { FeedCard } from './_components/FeedCard';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Loader2, Inbox, Plus } from 'lucide-react';

const EMPTY_STATS: CommunityStats = {
    experienceCount: 0,
    videoCount: 0,
    memberCount: 0,
    offersReported: 0,
    newThisWeek: 0,
    topCompanies: [],
};

const EMPTY_FACETS: CommunityFacets = { companies: [] };

const EMPTY_FILTERS: Filters = {
    type: 'all',
    company: '',
    outcome: 'all',
    search: '',
};

export default function CommunityPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const filters = useMemo<Filters>(
        () => ({
            type:
                (searchParams.get('type') as Filters['type']) ?? EMPTY_FILTERS.type,
            company: searchParams.get('company') ?? EMPTY_FILTERS.company,
            outcome:
                (searchParams.get('outcome') as Filters['outcome']) ??
                EMPTY_FILTERS.outcome,
            search: searchParams.get('q') ?? EMPTY_FILTERS.search,
        }),
        [searchParams],
    );

    const [stats, setStats] = useState<CommunityStats>(EMPTY_STATS);
    const [facets, setFacets] = useState<CommunityFacets>(EMPTY_FACETS);
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);

    // Load stats + facets once — single consolidated call
    useEffect(() => {
        let cancelled = false;
        getCommunityPageData()
            .then((data) => {
                if (cancelled) return;
                setStats(data.stats);
                setFacets(data.facets);
            })
            .finally(() => !cancelled && setIsLoadingMeta(false));
        return () => {
            cancelled = true;
        };
    }, []);

    // Refetch feed whenever filters change
    useEffect(() => {
        let cancelled = false;
        setIsLoadingFeed(true);
        getCommunityFeed({
            type: filters.type,
            company: filters.company || undefined,
            outcome: filters.outcome,
            search: filters.search || undefined,
            limit: 30,
        })
            .then((items) => {
                if (cancelled) return;
                setFeed(items);
            })
            .finally(() => !cancelled && setIsLoadingFeed(false));
        return () => {
            cancelled = true;
        };
    }, [filters.type, filters.company, filters.outcome, filters.search]);

    const applyFilters = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        const params = new URLSearchParams();
        if (next.type !== 'all') params.set('type', next.type);
        if (next.company) params.set('company', next.company);
        if (next.outcome !== 'all') params.set('outcome', next.outcome);
        if (next.search) params.set('q', next.search);
        const query = params.toString();
        router.replace(query ? `/community?${query}` : '/community', {
            scroll: false,
        });
    };

    const hasActiveFilters =
        filters.type !== 'all' ||
        filters.company !== '' ||
        filters.outcome !== 'all' ||
        filters.search !== '';

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Hero */}
                {isLoadingMeta ? (
                    <div className="h-48 rounded-2xl bg-muted animate-pulse" />
                ) : (
                    <CommunityHero stats={stats} />
                )}

                {/* Filter bar */}
                <div className="sticky top-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-background/80 backdrop-blur-md">
                    <CommunityFilters
                        filters={filters}
                        facets={facets}
                        onChange={applyFilters}
                    />
                </div>

                {/* Feed header */}
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className={cn(dmSans.className, 'text-lg sm:text-xl font-bold')}>
                        {hasActiveFilters ? 'Filtered results' : 'Latest from the community'}
                    </h2>
                    {!isLoadingFeed && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {feed.length} {feed.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {/* Feed grid */}
                {isLoadingFeed ? (
                    <FeedSkeleton />
                ) : feed.length === 0 ? (
                    <EmptyFeed
                        hasFilters={hasActiveFilters}
                        onClear={() => applyFilters(EMPTY_FILTERS)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {feed.map((item) => (
                            <FeedCard key={`${item.kind}-${item.id}`} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FeedSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="h-64 rounded-xl bg-muted animate-pulse"
                    aria-hidden
                />
            ))}
            <div className="col-span-full flex items-center justify-center text-muted-foreground text-xs gap-2 py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading…
            </div>
        </div>
    );
}

function EmptyFeed({
    hasFilters,
    onClear,
}: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-border p-10 sm:p-14 text-center">
            <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
                <Inbox className="h-6 w-6 text-primary" />
            </div>
            <h3 className={cn(dmSans.className, 'text-base sm:text-lg font-semibold mb-1')}>
                {hasFilters ? 'No matches for these filters' : 'No stories shared yet'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-5">
                {hasFilters
                    ? "Try broadening your search or clearing a filter. The community grows every week."
                    : 'Be the first to share an interview experience — it takes 2 minutes and helps countless others.'}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
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
                        href="/community/experiences/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Share your experience
                    </Link>
                )}
            </div>
        </div>
    );
}
