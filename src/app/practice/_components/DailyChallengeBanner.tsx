'use client';

import Link from 'next/link';
import type { DailyChallengeInfo } from '@/app/actions/practice.actions';
import { difficultyTone } from '@/lib/difficultyTone';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Calendar, Coins, CheckCircle2, ArrowRight } from 'lucide-react';

export function DailyChallengeBanner({ info }: { info: DailyChallengeInfo | null }) {
    if (!info) return null;
    const tone = difficultyTone(info.difficulty);

    return (
        <Link
            href={`/practice/${info.questionId}`}
            className={cn(
                'relative block overflow-hidden rounded-xl border',
                'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
                'hover:border-primary/40 transition-colors group cursor-pointer',
                info.solved ? 'border-success/30' : 'border-primary/20',
            )}
        >
            <div className="p-4 sm:p-5 flex items-center gap-4 flex-wrap">
                <div
                    className={cn(
                        'shrink-0 h-11 w-11 rounded-xl flex items-center justify-center',
                        info.solved ? 'bg-success/15' : 'bg-primary/15',
                    )}
                >
                    {info.solved ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                        <Calendar className="h-5 w-5 text-primary" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary">
                            {info.solved ? "Today's Challenge · Solved" : "Today's Challenge"}
                        </span>
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ring-1',
                                tone.bg,
                                tone.text,
                                tone.ring,
                            )}
                        >
                            {tone.label}
                        </span>
                    </div>
                    <h3
                        className={cn(
                            dmSans.className,
                            'text-base sm:text-lg font-bold truncate',
                        )}
                    >
                        {info.title}
                    </h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    {!info.solved && (
                        <span className="inline-flex items-center gap-1 text-primary font-semibold">
                            <Coins className="h-3.5 w-3.5" />
                            +100
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                        {info.solved ? 'Review' : 'Solve'}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
