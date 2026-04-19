'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { TestResult } from '@/lib/code-runner';
import {
    runProblem,
    submitProblem,
    toggleBookmark,
    type ProblemDetail,
    type ProblemLanguage,
    type SubmitResult,
} from '@/app/actions/practice.actions';
import { CodeEditor } from '@/components/CodeEditor';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { difficultyTone } from '@/lib/difficultyTone';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Send,
    Bookmark,
    Loader2,
    Trophy,
    Coins,
    Flame,
    Award,
} from 'lucide-react';
import { ProblemDescription } from './ProblemDescription';
import { SubmissionsTab } from './SubmissionsTab';
import { HintsTab } from './HintsTab';
import { TestOutput } from './TestOutput';

const LANGUAGES: { value: ProblemLanguage; label: string }[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
];

type TabKey = 'description' | 'hints' | 'submissions';

export function ProblemWorkspace({
    problem,
    coinBalance: initialCoins,
}: {
    problem: ProblemDetail;
    coinBalance: number | null;
}) {
    const tone = difficultyTone(problem.difficulty);

    const [language, setLanguage] = useState<ProblemLanguage>(
        problem.userProgress.lastLanguage ?? 'javascript',
    );
    const [code, setCode] = useState<string>(
        problem.userProgress.lastCode ?? problem.starterCode ?? '',
    );
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('description');
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [submitPayload, setSubmitPayload] = useState<SubmitResult | null>(null);
    const [submissionsRefreshKey, setSubmissionsRefreshKey] = useState(0);
    const [bookmarked, setBookmarked] = useState(problem.userProgress.isBookmarked);
    const [coinBalance, setCoinBalance] = useState(initialCoins);
    const [isRunning, startRunning] = useTransition();
    const [isSubmitting, startSubmitting] = useTransition();

    // Keyboard: Cmd/Ctrl + B toggles problem panel
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setCollapsed((c) => !c);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleCodeChange = useCallback((v: string | undefined) => setCode(v ?? ''), []);

    const handleRun = () => {
        if (!code.trim()) {
            toast.error('Write some code first');
            return;
        }
        startRunning(() => {
            runProblem(problem.id, code, language)
                .then((r) => {
                    setTestResult(r);
                    setSubmitPayload(null);
                })
                .catch((e) => toast.error(e?.message ?? 'Run failed'));
        });
    };

    const handleSubmit = () => {
        if (!code.trim()) {
            toast.error('Write some code first');
            return;
        }
        startSubmitting(() => {
            submitProblem(problem.id, code, language)
                .then((r) => {
                    setTestResult(r.testResult);
                    setSubmitPayload(r);
                    setSubmissionsRefreshKey((k) => k + 1);
                    if (r.rewards) {
                        setCoinBalance(r.rewards.coinBalance);
                    }
                    if (r.testResult.verdict === 'AC') {
                        toast.success(
                            r.isFirstSolve
                                ? `Accepted! +${r.rewards?.xpEarned ?? 0} XP · +${r.rewards?.coinsEarned ?? 0} coins`
                                : 'Accepted again — nice!',
                        );
                    } else {
                        toast.error(
                            `${r.testResult.verdict}: ${r.testResult.passed}/${r.testResult.total} passed`,
                        );
                    }
                })
                .catch((e) => toast.error(e?.message ?? 'Submit failed'));
        });
    };

    const handleBookmark = () => {
        const next = !bookmarked;
        setBookmarked(next);
        toggleBookmark(problem.id).catch(() => {
            setBookmarked(!next);
            toast.error('Could not update bookmark');
        });
    };

    const tabs = useMemo<{ key: TabKey; label: string }[]>(
        () => [
            { key: 'description', label: 'Description' },
            { key: 'hints', label: `Hints (${problem.hints.length})` },
            { key: 'submissions', label: 'Submissions' },
        ],
        [problem.hints.length],
    );

    return (
        <div
            className={cn(
                'grid gap-3 transition-[grid-template-columns] duration-300 ease-in-out',
                'h-[calc(100vh-8rem)] min-h-[36rem]',
                collapsed
                    ? 'grid-cols-[2.5rem_1fr]'
                    : 'grid-cols-1 lg:grid-cols-[minmax(22rem,30rem)_1fr]',
            )}
        >
            {/* Left panel — collapsible */}
            {collapsed ? (
                <button
                    type="button"
                    onClick={() => setCollapsed(false)}
                    className="flex flex-col items-center justify-start gap-2 py-3 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-colors group"
                    aria-label="Expand problem panel (Cmd/Ctrl + B)"
                    title="Expand (Cmd/Ctrl + B)"
                >
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span
                        className="text-[0.625rem] uppercase tracking-wider text-muted-foreground font-semibold group-hover:text-primary"
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        Problem
                    </span>
                </button>
            ) : (
                <aside className="glass rounded-xl border border-border flex flex-col overflow-hidden">
                    {/* Header — title + tags + bookmark + collapse */}
                    <div className="shrink-0 px-4 py-3 border-b border-border/60 bg-primary/5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                                <h1
                                    className={cn(
                                        dmSans.className,
                                        'text-base sm:text-lg font-bold truncate',
                                    )}
                                >
                                    {problem.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ring-1',
                                            tone.bg,
                                            tone.text,
                                            tone.ring,
                                        )}
                                    >
                                        {tone.label}
                                    </span>
                                    {problem.tags.slice(0, 3).map((t) => (
                                        <span
                                            key={t}
                                            className="text-[0.625rem] text-muted-foreground font-medium"
                                        >
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleBookmark}
                                    aria-label="Toggle bookmark"
                                    className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <Bookmark
                                        className={cn(
                                            'h-4 w-4',
                                            bookmarked
                                                ? 'text-primary fill-primary'
                                                : 'text-muted-foreground',
                                        )}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCollapsed(true)}
                                    aria-label="Collapse problem panel (Cmd/Ctrl + B)"
                                    title="Collapse (Cmd/Ctrl + B)"
                                    className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 -mb-3 mt-1">
                            {tabs.map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={cn(
                                        'text-xs font-semibold px-3 py-2 rounded-t-md transition-colors cursor-pointer',
                                        activeTab === t.key
                                            ? 'bg-background text-foreground border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {activeTab === 'description' && (
                            <ProblemDescription
                                description={problem.description}
                                sampleTestCases={problem.sampleTestCases}
                                expectedComplexity={problem.expectedComplexity}
                            />
                        )}
                        {activeTab === 'hints' && (
                            <HintsTab
                                questionId={problem.id}
                                hints={problem.hints}
                                coinBalance={coinBalance}
                                onCoinsChanged={setCoinBalance}
                            />
                        )}
                        {activeTab === 'submissions' && (
                            <SubmissionsTab
                                questionId={problem.id}
                                refreshKey={submissionsRefreshKey}
                            />
                        )}
                    </div>
                </aside>
            )}

            {/* Right panel — editor + console */}
            <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-card dark:bg-[#1e1e1e] min-h-0">
                {/* Editor toolbar */}
                <div className="shrink-0 px-3 py-2 border-b border-border/60 bg-muted/50 dark:bg-[#252526] flex items-center gap-2 flex-wrap">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as ProblemLanguage)}
                        className={cn(
                            'text-xs px-2.5 py-1.5 rounded-md cursor-pointer',
                            'bg-background border border-border',
                            'focus:outline-none focus:border-primary/40',
                        )}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>
                                {l.label}
                            </option>
                        ))}
                    </select>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleRun}
                            disabled={isRunning || isSubmitting}
                            className={cn(
                                'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md',
                                'border border-border bg-background hover:border-primary/40 hover:bg-primary/5',
                                'disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer',
                            )}
                        >
                            {isRunning ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Play className="h-3.5 w-3.5" />
                            )}
                            Run
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            className={cn(
                                'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md',
                                'bg-primary text-primary-foreground hover:opacity-90',
                                'disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer',
                            )}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            Submit
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 min-h-0 grid grid-rows-[3fr_2fr]">
                    <div className="relative min-h-0">
                        <div className="absolute inset-0">
                            <CodeEditor
                                language={language}
                                value={code}
                                onChange={handleCodeChange}
                                height="100%"
                                hideToolbar
                                className="border-0 rounded-none"
                            />
                        </div>
                    </div>

                    {/* Console */}
                    <div className="border-t border-border/60 overflow-y-auto bg-background">
                        {submitPayload?.rewards && submitPayload.testResult.verdict === 'AC' ? (
                            <SuccessPanel
                                result={submitPayload}
                                onViewSubmissions={() => setActiveTab('submissions')}
                            />
                        ) : (
                            <TestOutput result={testResult} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SuccessPanel({
    result,
    onViewSubmissions,
}: {
    result: SubmitResult;
    onViewSubmissions: () => void;
}) {
    const r = result.rewards;
    if (!r) return null;

    return (
        <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-success" />
                <h3 className={cn(dmSans.className, 'font-bold text-success')}>
                    {result.isFirstSolve
                        ? 'Accepted — first solve!'
                        : 'Accepted again'}
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <Reward
                    icon={Trophy}
                    label="XP earned"
                    value={`+${r.xpEarned}`}
                    tone="text-primary"
                />
                <Reward
                    icon={Coins}
                    label="Coins"
                    value={`+${r.coinsEarned}`}
                    tone="text-warning"
                />
                <Reward
                    icon={Flame}
                    label="Streak"
                    value={`${r.newStreak}d`}
                    tone="text-destructive"
                />
                <Reward
                    icon={Award}
                    label="Total solved"
                    value={r.totalSolved}
                    tone="text-success"
                />
            </div>

            {r.newBadges.length > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
                    <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary mb-1">
                        New achievements
                    </p>
                    <p className="text-sm">🏆 {r.newBadges.length} badge{r.newBadges.length > 1 ? 's' : ''} unlocked</p>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs">
                <button
                    type="button"
                    onClick={onViewSubmissions}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                    View submissions
                </button>
                <span className="text-muted-foreground">·</span>
                <Link
                    href="/practice"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    More problems
                </Link>
            </div>
        </div>
    );
}

function Reward({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Trophy;
    label: string;
    value: string | number;
    tone: string;
}) {
    return (
        <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
            <Icon className={cn('h-3.5 w-3.5 mx-auto mb-0.5', tone)} />
            <p className={cn(dmSans.className, 'text-sm font-bold tabular-nums', tone)}>
                {value}
            </p>
            <p className="text-[0.625rem] text-muted-foreground uppercase tracking-wider">
                {label}
            </p>
        </div>
    );
}
