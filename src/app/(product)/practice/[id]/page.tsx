import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    getProblemDetail,
    getUserPracticeStats,
} from '@/app/actions/practice.actions';
import { ProblemWorkspace } from './_components/ProblemWorkspace';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProblemDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [problem, stats] = await Promise.all([
        getProblemDetail(id),
        getUserPracticeStats(),
    ]);

    if (!problem) notFound();

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 flex-wrap"
                >
                    <Link
                        href="/practice"
                        className="hover:text-primary transition-colors"
                    >
                        Practice
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                    <span className="text-foreground/80 font-medium truncate">
                        {problem.title}
                    </span>
                </nav>

                {/* Workspace */}
                <ProblemWorkspace
                    problem={problem}
                    coinBalance={stats.isAnonymous ? null : stats.coins}
                />
            </div>
        </div>
    );
}
