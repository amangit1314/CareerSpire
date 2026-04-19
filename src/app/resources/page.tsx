'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    getResourcesPageData,
    CategoryStats,
    UserRoadmap,
} from '@/app/actions/resource.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
    Code2,
    Database,
    Terminal,
    Layout,
    Server,
    Sparkles,
    ArrowRight,
    BookMarked,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { ResourceHero } from './_components/ResourceHero';
import { UserRoadmaps } from './_components/UserRoadmaps';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    dsa: Database,
    javascript: Code2,
    typescript: Code2,
    python: Terminal,
    react: Layout,
    node: Server,
};

export default function ResourcesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [categories, setCategories] = useState<CategoryStats[]>([]);
    const [roadmaps, setRoadmaps] = useState<UserRoadmap[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;
        getResourcesPageData(user?.id)
            .then((data) => {
                if (cancelled) return;
                setCategories(data.categories);
                setRoadmaps(data.roadmaps);
            })
            .catch((error) => console.error('Failed to fetch resources', error))
            .finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, [user?.id, authLoading]);

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-8 sm:py-12 space-y-10 sm:space-y-14">
                {/* Hero */}
                <ResourceHero
                    trackCount={categories.length}
                    questionCount={categories.reduce((sum, c) => sum + c.stats.totalQuestions, 0)}
                    roadmapCount={roadmaps.length}
                />

                {/* Your Roadmaps (conditional) */}
                {!isLoading && <UserRoadmaps roadmaps={roadmaps} />}

                {/* Popular Tracks */}
                <section aria-labelledby="popular-heading">
                    <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary/15">
                                    <BookMarked className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary">
                                    Curated tracks
                                </span>
                            </div>
                            <h2
                                id="popular-heading"
                                className={cn(dmSans.className, 'text-xl sm:text-2xl font-bold')}
                            >
                                Popular Tracks
                            </h2>
                        </div>
                        <p className="hidden sm:block text-xs text-muted-foreground">
                            Hand-picked, high-signal interview prep paths
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {isLoading
                            ? Array(6)
                                  .fill(0)
                                  .map((_, i) => (
                                      <Card
                                          key={i}
                                          className="h-48 animate-pulse bg-muted rounded-xl"
                                      />
                                  ))
                            : categories.map((cat) => (
                                  <PopularTrackCard key={cat.slug} cat={cat} />
                              ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function PopularTrackCard({ cat }: { cat: CategoryStats }) {
    const Icon = ICONS[cat.slug] || Sparkles;
    const pct =
        cat.stats.totalQuestions > 0
            ? Math.min(
                  100,
                  Math.round(
                      (cat.stats.completedQuestions / cat.stats.totalQuestions) * 100,
                  ),
              )
            : 0;

    return (
        <Link
            href={`/resources/${cat.slug}`}
            className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
        >
            <Card className="h-full overflow-hidden transition-all group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 cursor-pointer rounded-xl relative">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full transition-transform group-hover:scale-110" />

                <CardHeader className="relative z-10 pb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className={cn('text-base sm:text-lg', dmSans.className)}>
                        {cat.category}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                        {cat.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-foreground tabular-nums">
                                {cat.stats.completedQuestions}/{cat.stats.totalQuestions}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[0.6875rem] text-muted-foreground">
                                {cat.stats.totalQuestions > 0 ? 'Curated Collection' : 'AI Generated'}
                            </span>
                            <span className="flex items-center gap-1 text-primary font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                                Practice
                                <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
