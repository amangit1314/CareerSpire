'use client';

import type { TestResult } from '@/lib/code-runner';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Terminal } from 'lucide-react';

function verdictMeta(v: TestResult['verdict']) {
    switch (v) {
        case 'AC':
            return { icon: CheckCircle2, tone: 'text-success', label: 'Accepted' };
        case 'WA':
            return { icon: XCircle, tone: 'text-destructive', label: 'Wrong Answer' };
        case 'TLE':
            return { icon: Clock, tone: 'text-warning', label: 'Time Limit Exceeded' };
        case 'RE':
            return { icon: AlertTriangle, tone: 'text-destructive', label: 'Runtime Error' };
        case 'CE':
            return { icon: AlertTriangle, tone: 'text-destructive', label: 'Compile Error' };
        default:
            return { icon: Terminal, tone: 'text-muted-foreground', label: 'Not Run' };
    }
}

export function TestOutput({ result }: { result: TestResult | null }) {
    if (!result) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
                <Terminal className="h-3.5 w-3.5" />
                Run your code to see test results here.
            </div>
        );
    }

    const meta = verdictMeta(result.verdict);
    const Icon = meta.icon;
    const allPass = result.passed === result.total && result.total > 0;

    return (
        <div className="p-3 sm:p-4 space-y-3">
            {/* Summary row */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', meta.tone)} />
                    <span className={cn(dmSans.className, 'font-bold text-sm', meta.tone)}>
                        {meta.label}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs tabular-nums font-medium">
                    {result.passed}/{result.total} tests passed
                </span>
            </div>

            {/* Per-test details */}
            {result.details.length > 0 && (
                <ul className="space-y-1.5">
                    {result.details.map((d, i) => (
                        <li
                            key={i}
                            className={cn(
                                'rounded-lg border p-2.5 text-[0.75rem] font-mono',
                                d.passed
                                    ? 'border-success/20 bg-success/5'
                                    : 'border-destructive/20 bg-destructive/5',
                            )}
                        >
                            <div className="flex items-center gap-1.5 mb-1.5">
                                {d.passed ? (
                                    <CheckCircle2 className="h-3 w-3 text-success" />
                                ) : (
                                    <XCircle className="h-3 w-3 text-destructive" />
                                )}
                                <span className="text-[0.6875rem] font-sans font-semibold uppercase tracking-wider">
                                    Case {i + 1}
                                </span>
                            </div>
                            <div className="space-y-0.5 text-[0.75rem]">
                                <div>
                                    <span className="text-muted-foreground">input: </span>
                                    <span>{JSON.stringify(d.input)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">expected: </span>
                                    <span className="text-success/90">
                                        {JSON.stringify(d.expected)}
                                    </span>
                                </div>
                                {!d.passed && (
                                    <div>
                                        <span className="text-muted-foreground">got: </span>
                                        <span className="text-destructive/90">
                                            {d.actual !== undefined
                                                ? JSON.stringify(d.actual)
                                                : '—'}
                                        </span>
                                    </div>
                                )}
                                {d.error && (
                                    <div className="text-destructive/90 mt-1 font-sans">
                                        {d.error}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {allPass && (
                <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-xs">
                    🎉 All sample tests pass. Click Submit to run the full test suite.
                </div>
            )}
        </div>
    );
}
