'use client';

import { Search, X, Circle, CheckCircle2, CircleDashed, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PracticeFilterState {
    search: string;
    difficulty: 'all' | 'EASY' | 'MEDIUM' | 'HARD';
    status: 'all' | 'SOLVED' | 'ATTEMPTED' | 'TODO' | 'BOOKMARKED';
    tag: string;
}

interface ProblemFiltersProps {
    filters: PracticeFilterState;
    facets: { tags: string[] };
    onChange: (patch: Partial<PracticeFilterState>) => void;
}

const DIFFICULTIES: { value: PracticeFilterState['difficulty']; label: string; tone: string }[] = [
    { value: 'all', label: 'Any', tone: 'text-foreground/70' },
    { value: 'EASY', label: 'Easy', tone: 'text-success' },
    { value: 'MEDIUM', label: 'Medium', tone: 'text-warning' },
    { value: 'HARD', label: 'Hard', tone: 'text-destructive' },
];

const STATUS_OPTIONS: {
    value: PracticeFilterState['status'];
    label: string;
    icon: typeof Circle;
}[] = [
    { value: 'all', label: 'All', icon: Circle },
    { value: 'SOLVED', label: 'Solved', icon: CheckCircle2 },
    { value: 'ATTEMPTED', label: 'Attempted', icon: CircleDashed },
    { value: 'TODO', label: 'To-do', icon: Circle },
    { value: 'BOOKMARKED', label: 'Bookmarked', icon: Bookmark },
];

export function ProblemFilters({ filters, facets, onChange }: ProblemFiltersProps) {
    const hasActive =
        filters.search !== '' ||
        filters.difficulty !== 'all' ||
        filters.status !== 'all' ||
        filters.tag !== '';

    const clearAll = () =>
        onChange({ search: '', difficulty: 'all', status: 'all', tag: '' });

    return (
        <div className="space-y-3">
            {/* Search + status dropdown */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onChange({ search: e.target.value })}
                        placeholder="Search problems by title, topic, or tag…"
                        className={cn(
                            'w-full pl-9 pr-9 py-2 rounded-lg text-sm',
                            'bg-background border border-border',
                            'placeholder:text-muted-foreground/60',
                            'focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
                            'transition-colors',
                        )}
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => onChange({ search: '' })}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <select
                    value={filters.status}
                    onChange={(e) =>
                        onChange({ status: e.target.value as PracticeFilterState['status'] })
                    }
                    className={cn(
                        'text-sm px-3 py-2 rounded-lg cursor-pointer',
                        'bg-background border border-border',
                        'focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
                    )}
                >
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Difficulty chips + Tag chips + Clear */}
            <div className="flex flex-wrap items-center gap-1.5">
                {DIFFICULTIES.map((d) => {
                    const active = filters.difficulty === d.value;
                    return (
                        <button
                            key={d.value}
                            type="button"
                            onClick={() => onChange({ difficulty: d.value })}
                            className={cn(
                                'text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors cursor-pointer',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : cn(
                                          'bg-muted/60 hover:bg-primary/10 hover:text-primary',
                                          d.tone,
                                      ),
                            )}
                        >
                            {d.label}
                        </button>
                    );
                })}

                {facets.tags.length > 0 && (
                    <>
                        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
                        <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground font-semibold mr-1">
                            Tags
                        </span>
                        {facets.tags.slice(0, 10).map((tag) => {
                            const active = filters.tag === tag;
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => onChange({ tag: active ? '' : tag })}
                                    className={cn(
                                        'text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors cursor-pointer',
                                        active
                                            ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                                            : 'bg-muted/60 text-foreground/70 hover:bg-primary/10 hover:text-primary',
                                    )}
                                >
                                    #{tag}
                                </button>
                            );
                        })}
                    </>
                )}

                {hasActive && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="ml-auto inline-flex items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
