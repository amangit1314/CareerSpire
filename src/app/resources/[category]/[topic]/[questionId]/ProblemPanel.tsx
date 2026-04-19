'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Lightbulb, Lock, Eye } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface ProblemPanelProps {
    description: string;
    hints?: string[];
}

export function ProblemPanel({ description, hints = [] }: ProblemPanelProps) {
    const [revealed, setRevealed] = useState<Set<number>>(new Set());

    const reveal = (index: number) => {
        setRevealed((prev) => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
    };

    const usedCount = revealed.size;
    const totalHints = hints.length;

    return (
        <div className="glass rounded-2xl border border-primary/10 lg:h-full flex flex-col overflow-hidden">
            {/* Fixed header — always visible */}
            <div className="px-5 py-4 border-b border-border/40 bg-primary/5 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/15">
                        <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className={cn(dmSans.className, 'text-sm sm:text-base font-semibold')}>
                        Problem Statement
                    </h2>
                </div>
            </div>

            {/* Scrollable body */}
            <ScrollArea className="flex-1 lg:h-0">
                <div className="px-5 py-5 space-y-6">
                    {/* Description */}
                    <p className="text-sm leading-relaxed text-foreground/85">
                        {description}
                    </p>

                    {/* Progressive Hints */}
                    {totalHints > 0 && (
                        <div className="pt-5 border-t border-border/40">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-warning" />
                                    <h3
                                        className={cn(
                                            dmSans.className,
                                            'text-sm font-semibold',
                                        )}
                                    >
                                        Hints
                                    </h3>
                                </div>
                                <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground font-medium tabular-nums">
                                    {usedCount}/{totalHints} used
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {hints.map((hint, i) => {
                                    const isRevealed = revealed.has(i);
                                    const isUnlocked = i === 0 || revealed.has(i - 1);

                                    return (
                                        <li key={i}>
                                            <HintItem
                                                index={i}
                                                text={hint}
                                                isRevealed={isRevealed}
                                                isUnlocked={isUnlocked}
                                                onReveal={() => reveal(i)}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>

                            {usedCount === 0 && (
                                <p className="text-[0.6875rem] text-muted-foreground/80 mt-3 italic">
                                    Try solving on your own first — hints reveal one at a time.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function HintItem({
    index,
    text,
    isRevealed,
    isUnlocked,
    onReveal,
}: {
    index: number;
    text: string;
    isRevealed: boolean;
    isUnlocked: boolean;
    onReveal: () => void;
}) {
    if (isRevealed) {
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg border border-warning/20 bg-warning/5 p-3"
            >
                <div className="flex items-start gap-2">
                    <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-warning/15 text-warning text-[0.625rem] font-bold mt-0.5">
                        {index + 1}
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed">{text}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <button
            type="button"
            disabled={!isUnlocked}
            onClick={onReveal}
            aria-label={`Reveal hint ${index + 1}`}
            className={cn(
                'w-full text-left rounded-lg border border-dashed p-3 transition-all',
                'flex items-center justify-between gap-2',
                isUnlocked
                    ? 'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer group'
                    : 'border-border/40 opacity-60 cursor-not-allowed',
            )}
        >
            <div className="flex items-center gap-2">
                <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-muted-foreground text-[0.625rem] font-bold">
                    {index + 1}
                </span>
                <span className="text-xs text-muted-foreground">
                    {isUnlocked ? `Hint ${index + 1}` : `Reveal Hint ${index} first`}
                </span>
            </div>
            {isUnlocked ? (
                <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
        </button>
    );
}
