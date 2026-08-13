import { notFound } from 'next/navigation';
import { getTopicsForCategory, recordRoadmapVisit } from '@/app/actions/resource.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { dmSans } from '@/lib/fonts';

export const dynamic = 'force-dynamic';

export default async function ResourceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    // Fetch topics (syllabus) from AI
    const topics = await getTopicsForCategory(decodedCategory);

    if (!topics || topics.length === 0) {
        notFound();
    }

    // Record this visit in the user's custom roadmaps. No-op for curated
    // slugs or anonymous users. Fire-and-forget — never blocks render.
    recordRoadmapVisit(decodedCategory).catch(() => {});

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link
                    href="/resources"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-block"
                >
                    ← Back to Resources
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className={`${dmSans.className} text-3xl font-bold capitalize`}>
                        {decodedCategory} Mastery Path
                    </h1>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI-Powered
                    </Badge>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Master {decodedCategory} concept by concept. Follow the syllabus below to gain in-depth knowledge and practice interview-ready questions.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                    <Link key={topic.id} href={`/resources/${category}/${topic.id}`}>
                        <Card className="h-full hover:shadow-lg transition-all duration-300 group border-primary/10 hover:border-primary/30">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className={`${dmSans.className} text-xl group-hover:text-primary transition-colors`}>
                                        {topic.title}
                                    </CardTitle>
                                    <BookOpen className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                    {topic.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <Badge variant={
                                        topic.difficulty === 'Beginner' ? 'secondary' :
                                            topic.difficulty === 'Intermediate' ? 'default' : 'destructive'
                                    } className="text-xs dark:text-white">
                                        {topic.difficulty}
                                    </Badge>
                                    <span className="text-sm font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                        Start Learning <ArrowRight className="ml-1 w-4 h-4" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
