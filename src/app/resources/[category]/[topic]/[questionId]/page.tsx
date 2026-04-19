import { notFound } from 'next/navigation';
import { getQuestionDetails, generateOpeningMessage } from '@/app/actions/resource.actions';
import { InteractivePractice } from './InteractivePractice';
import { ProblemPanel } from './ProblemPanel';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Code2, Gauge } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const difficultyTone: Record<string, { dot: string; text: string; bg: string; ring: string }> = {
    easy: { dot: 'bg-success', text: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
    medium: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
    hard: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10', ring: 'ring-destructive/20' },
};

function DifficultyChip({ difficulty }: { difficulty: string }) {
    const tone = difficultyTone[difficulty.toLowerCase()] ?? difficultyTone.easy;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-semibold uppercase tracking-wider ring-1',
                tone.bg,
                tone.text,
                tone.ring,
            )}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
            <Gauge className="h-3 w-3" />
            {difficulty}
        </span>
    );
}

function CategoryChip({ category }: { category: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[0.625rem] font-semibold uppercase tracking-wider ring-1 ring-primary/20">
            <Code2 className="h-3 w-3" />
            {category}
        </span>
    );
}

export default async function QuestionPracticePage({
    params,
}: {
    params: Promise<{ category: string; topic: string; questionId: string }>;
}) {
    const { category, topic, questionId } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedTopic = decodeURIComponent(topic);

    const question = await getQuestionDetails(questionId);
    if (!question) notFound();

    const hints = Array.isArray(question.hints) ? (question.hints as string[]) : [];

    const openingMessage = await generateOpeningMessage({
        title: question.title,
        description: question.description,
        topic: question.topic,
        difficulty: question.difficulty,
        hints: question.hints,
        codeSnippet: (question as { codeSnippet?: string | null }).codeSnippet ?? null,
        language: (question as { language?: string | null }).language ?? null,
    });

    return (
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 max-w-7xl">
            {/* Compact header */}
            <header className="mb-4 sm:mb-5">
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 flex-wrap"
                >
                    <Link href="/resources" className="hover:text-primary transition-colors">
                        Resources
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                    <Link
                        href={`/resources/${category}`}
                        className="hover:text-primary transition-colors capitalize"
                    >
                        {decodedCategory}
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                    <Link
                        href={`/resources/${category}/${topic}?tab=practice`}
                        className="hover:text-primary transition-colors capitalize"
                    >
                        {decodedTopic}
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                    <span className="text-foreground/80 font-medium truncate">
                        {question.title}
                    </span>
                </nav>

                {/* Title row — title + chips + back action all in one line */}
                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                        <h1
                            className={cn(
                                dmSans.className,
                                'text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate',
                            )}
                        >
                            {question.title}
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <CategoryChip category={decodedCategory} />
                            <DifficultyChip difficulty={question.difficulty} />
                        </div>
                    </div>

                    <Link
                        href={`/resources/${category}/${topic}?tab=practice`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0 self-start sm:self-auto"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back to {decodedTopic}
                    </Link>
                </div>
            </header>

            {/* Workspace — fills viewport on desktop, natural stack on mobile */}
            <div
                className={cn(
                    'grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5',
                    'lg:h-[calc(100vh-11rem)] lg:min-h-[37.5rem] lg:max-h-[56.25rem]',
                )}
            >
                <aside className="lg:col-span-4 lg:h-full">
                    <ProblemPanel description={question.description} hints={hints} />
                </aside>

                <main className="lg:col-span-8 lg:h-full h-[calc(100vh-10rem)] min-h-[32.5rem]">
                    <InteractivePractice
                        question={question}
                        initialExplanation={openingMessage}
                        category={decodedCategory}
                        topic={decodedTopic}
                    />
                </main>
            </div>
        </div>
    );
}
