import { notFound } from 'next/navigation';
import { getQuestionDetails, generatePracticeExplanation } from '@/app/actions/resource.actions';
import { InteractivePractice } from './InteractivePractice';
import Link from 'next/link';
import { ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function QuestionPracticePage({
    params
}: {
    params: Promise<{ category: string; topic: string; questionId: string }>
}) {
    const { category, topic, questionId } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedTopic = decodeURIComponent(topic);

    const question = await getQuestionDetails(questionId);

    if (!question) {
        notFound();
    }

    // Initial AI explanation of the concept
    const explanation = await generatePracticeExplanation(
        decodedTopic,
        question.title,
        question.description
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <Link
                        href={`/resources/${category}/${topic}?tab=practice`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to {decodedTopic}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className={cn(dmSans.className, "text-2xl md:text-3xl font-bold")}>
                            {question.title}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/5 text-primary">
                        {decodedCategory}
                    </Badge>
                    <Badge variant="outline">
                        {question.difficulty}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Question Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass p-6 rounded-2xl border-primary/10 sticky top-24">
                        <h2 className={cn(dmSans.className, "text-lg font-semibold mb-4 flex items-center gap-2")}>
                            <BookOpen className="h-5 w-5 text-primary" />
                            Problem Statement
                        </h2>
                        <div className="prose dark:prose-invert text-sm text-muted-foreground">
                            <p>{question.description}</p>
                        </div>

                        {question.hints && question.hints.length > 0 && (
                            <div className="mt-8 space-y-3">
                                <h3 className="text-sm font-medium">Available Hints</h3>
                                <div className="space-y-2">
                                    {question.hints.map((hint: string, i: number) => (
                                        <div key={i} className="text-xs p-3 rounded-lg bg-muted/50 border border-border">
                                            Hint {i + 1}: {hint}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interactive Tutor */}
                <div className="lg:col-span-8">
                    <InteractivePractice
                        question={question}
                        initialExplanation={explanation}
                        category={decodedCategory}
                        topic={decodedTopic}
                    />
                </div>
            </div>
        </div>
    );
}
