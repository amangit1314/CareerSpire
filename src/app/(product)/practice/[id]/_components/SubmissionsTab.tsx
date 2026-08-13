'use client';

import { useEffect, useState } from 'react';
import type { SubmissionSummary } from '@/app/actions/practice.actions';
import { getSubmissionHistory } from '@/app/actions/practice.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';

function verdictTone(v: string): { icon: typeof CheckCircle2; color: string; label: string } {
    switch (v) {
        case 'AC':
            return { icon: CheckCircle2, color: 'text-success', label: 'Accepted' };
        case 'TLE':
            return { icon: Clock, color: 'text-warning', label: 'Time Limit' };
        case 'CE':
            return { icon: AlertTriangle, color: 'text-destructive', label: 'Compile Error' };
        case 'RE':
            return { icon: AlertTriangle, color: 'text-destructive', label: 'Runtime Error' };
        default:
            return { icon: XCircle, color: 'text-destructive', label: 'Wrong Answer' };
    }
}

function formatRelative(d: Date): string {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

export function SubmissionsTab({
    questionId,
    refreshKey,
}: {
    questionId: string;
    refreshKey: number;
}) {
    const [subs, setSubs] = useState<SubmissionSummary[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        setSubs(null);
        getSubmissionHistory(questionId).then((s) => {
            if (!cancelled) setSubs(s);
        });
        return () => {
            cancelled = true;
        };
    }, [questionId, refreshKey]);

    if (subs === null) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading submissions…
            </div>
        );
    }

    if (subs.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-xs text-muted-foreground">
                    No submissions yet. Run your code, then click Submit.
                </p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {subs.map((s) => {
                const tone = verdictTone(s.verdict);
                const Icon = tone.icon;
                return (
                    <li
                        key={s.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors"
                    >
                        <Icon className={cn('h-4 w-4 shrink-0', tone.color)} />
                        <div className="min-w-0 flex-1">
                            <p
                                className={cn(
                                    dmSans.className,
                                    'text-sm font-semibold truncate',
                                    tone.color,
                                )}
                            >
                                {tone.label}
                            </p>
                            <p className="text-[0.6875rem] text-muted-foreground">
                                {s.testsPassed}/{s.testsTotal} passed · {s.language} ·{' '}
                                {formatRelative(s.submittedAt)}
                            </p>
                        </div>
                        {s.runtimeMs !== null && (
                            <span className="text-[0.6875rem] text-muted-foreground tabular-nums shrink-0">
                                {s.runtimeMs}ms
                            </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
