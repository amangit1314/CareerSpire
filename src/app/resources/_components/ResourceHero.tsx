'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, BookOpen, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';

const EXAMPLE_SKILLS = ['Rust', 'Go', 'Nest.js', 'Svelte', 'Elixir', 'Kotlin'];

const ROTATING_PLACEHOLDERS = [
    'Search any skill — e.g. Rust',
    'Search any skill — e.g. Nest.js',
    'Search any skill — e.g. Go',
    'Search any skill — e.g. Kotlin',
    'Search any skill — e.g. Svelte',
];

interface ResourceHeroProps {
    trackCount?: number;
    questionCount?: number;
    roadmapCount?: number;
}

export function ResourceHero({ trackCount = 0, questionCount = 0, roadmapCount = 0 }: ResourceHeroProps) {
    const router = useRouter();
    const [value, setValue] = useState('');
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value || isFocused) return;
        const id = window.setInterval(() => {
            setPlaceholderIdx((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
        }, 3000);
        return () => window.clearInterval(id);
    }, [value, isFocused]);

    const submit = (raw?: string) => {
        const q = (raw ?? value).trim();
        if (!q) return;
        router.push(`/resources/${encodeURIComponent(q)}`);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-primary/[0.04] to-transparent">
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-primary/5 rounded-full blur-3xl" />
                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                    style={{
                        backgroundImage:
                            'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16 text-center">
                {/* Pill badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className={cn(dmSans.className, 'text-xs font-semibold text-primary')}>
                        AI-Powered Learning
                    </span>
                </div>

                {/* Heading */}
                <h1
                    className={cn(
                        dmSans.className,
                        'text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] pb-1',
                    )}
                >
                    <span className="text-foreground">Master Any Skill with</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                        Curated &amp; AI-Generated Paths
                    </span>
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto mt-4 sm:mt-5 leading-relaxed">
                    Explore hand-picked interview prep tracks, or type any skill and let our AI
                    build a personalized practice roadmap instantly.
                </p>

                {/* Mini stats row — real data */}
                <div className="flex items-center justify-center gap-6 sm:gap-8 mt-6 sm:mt-8">
                    {[
                        { icon: BookOpen, label: 'Curated tracks', value: trackCount || '—' },
                        { icon: Zap, label: 'Practice questions', value: questionCount || '—' },
                        { icon: Brain, label: 'AI roadmaps created', value: roadmapCount || 'Any skill' },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
                                <s.icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className={cn(dmSans.className, 'text-sm font-bold text-foreground leading-none tabular-nums')}>
                                    {s.value}
                                </p>
                                <p className="text-[0.625rem] text-muted-foreground leading-tight mt-0.5">
                                    {s.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    className="mt-8 sm:mt-10 mx-auto max-w-2xl"
                >
                    <div className="relative group">
                        <div
                            className={cn(
                                'absolute -inset-0.5 rounded-2xl opacity-0 blur-md transition-opacity duration-500',
                                'bg-gradient-to-r from-primary via-primary/60 to-primary',
                                isFocused && 'opacity-40',
                            )}
                            aria-hidden
                        />

                        <div
                            className={cn(
                                'relative flex items-center gap-2 sm:gap-3',
                                'bg-background/90 backdrop-blur-xl',
                                'border border-border rounded-2xl',
                                'shadow-lg shadow-primary/5',
                                'transition-all duration-300',
                                isFocused && 'border-primary/40 shadow-xl shadow-primary/10',
                            )}
                        >
                            <div className="pl-4 sm:pl-5 shrink-0">
                                <Sparkles
                                    className={cn(
                                        'h-4 w-4 sm:h-5 sm:w-5 text-primary transition-transform duration-500',
                                        isFocused && 'scale-110 rotate-12',
                                    )}
                                />
                            </div>

                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder={ROTATING_PLACEHOLDERS[placeholderIdx]}
                                aria-label="Search for any skill"
                                className={cn(
                                    'flex-1 min-w-0 bg-transparent outline-none',
                                    'py-3.5 sm:py-4 pr-2',
                                    'text-sm sm:text-base font-medium',
                                    'placeholder:text-muted-foreground/50 placeholder:font-normal',
                                )}
                            />

                            <button
                                type="submit"
                                disabled={!value.trim()}
                                className={cn(
                                    'inline-flex items-center gap-1.5 m-1.5 sm:m-2',
                                    'px-4 sm:px-5 py-2.5 rounded-xl shrink-0',
                                    'text-xs sm:text-sm font-semibold',
                                    'bg-primary text-primary-foreground',
                                    'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
                                    'transition-all cursor-pointer',
                                    'shadow-md shadow-primary/25',
                                )}
                            >
                                <span className="hidden sm:inline">Generate</span>
                                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Example chips */}
                    <div className="mt-4 sm:mt-5 flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
                        <span className="text-[0.6875rem] sm:text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mr-1">
                            Try
                        </span>
                        {EXAMPLE_SKILLS.map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                    setValue(skill);
                                    submit(skill);
                                }}
                                className={cn(
                                    'text-[0.6875rem] sm:text-xs font-medium',
                                    'px-3 py-1 rounded-full',
                                    'bg-background/80 text-foreground/70',
                                    'border border-border/60',
                                    'hover:bg-primary/10 hover:text-primary hover:border-primary/30',
                                    'transition-all cursor-pointer',
                                )}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}
