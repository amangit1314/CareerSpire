'use client';

import ReactMarkdown from 'react-markdown';
import type { TestCase } from '@/types';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface ProblemDescriptionProps {
    description: string;
    sampleTestCases: TestCase[];
    expectedComplexity: string | null;
}

export function ProblemDescription({
    description,
    sampleTestCases,
    expectedComplexity,
}: ProblemDescriptionProps) {
    return (
        <div className="space-y-5">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                    components={{
                        h1: ({ ...p }) => (
                            <h3
                                className={cn(
                                    dmSans.className,
                                    'text-base font-bold mt-4 mb-2 first:mt-0',
                                )}
                                {...p}
                            />
                        ),
                        h2: ({ ...p }) => (
                            <h3
                                className={cn(
                                    dmSans.className,
                                    'text-base font-bold mt-4 mb-2 first:mt-0',
                                )}
                                {...p}
                            />
                        ),
                        h3: ({ ...p }) => (
                            <h4
                                className={cn(
                                    dmSans.className,
                                    'text-sm font-bold mt-3 mb-1.5 first:mt-0',
                                )}
                                {...p}
                            />
                        ),
                        p: ({ ...p }) => (
                            <p className="mb-2.5 last:mb-0 text-sm" {...p} />
                        ),
                        ul: ({ ...p }) => (
                            <ul className="list-disc pl-5 space-y-1 my-2 text-sm" {...p} />
                        ),
                        ol: ({ ...p }) => (
                            <ol className="list-decimal pl-5 space-y-1 my-2 text-sm" {...p} />
                        ),
                        code: ({ ...p }) => (
                            <code
                                className="px-1.5 py-0.5 rounded font-mono text-[0.75rem] bg-primary/10 text-primary"
                                {...p}
                            />
                        ),
                        pre: ({ ...p }) => (
                            <pre
                                className="p-3 rounded-lg overflow-x-auto my-2 text-[0.75rem] font-mono bg-muted/60 border border-border/60"
                                {...p}
                            />
                        ),
                    }}
                >
                    {description}
                </ReactMarkdown>
            </div>

            {sampleTestCases.length > 0 && (
                <div>
                    <h4
                        className={cn(
                            dmSans.className,
                            'text-sm font-bold mb-2 text-foreground/90',
                        )}
                    >
                        Examples
                    </h4>
                    <ul className="space-y-2">
                        {sampleTestCases.map((t, i) => (
                            <li
                                key={i}
                                className="rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono overflow-x-auto"
                            >
                                <div className="mb-1 break-all">
                                    <span className="text-muted-foreground">Input:</span>{' '}
                                    <span className="text-foreground">
                                        {JSON.stringify(t.input)}
                                    </span>
                                </div>
                                <div className="break-all">
                                    <span className="text-muted-foreground">
                                        Expected:
                                    </span>{' '}
                                    <span className="text-success">
                                        {JSON.stringify(t.expectedOutput)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {expectedComplexity && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary mb-1">
                        Target complexity
                    </p>
                    <p className="font-mono text-sm">{expectedComplexity}</p>
                </div>
            )}
        </div>
    );
}
