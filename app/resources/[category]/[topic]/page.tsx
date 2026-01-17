

import { notFound } from 'next/navigation';
import { getTopicDetails } from '@/app/actions/resource.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Code2, Sparkles, ArrowRight } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import ReactMarkdown from 'react-markdown';
import { QuestionCard } from '@/components/QuestionCard';

export const dynamic = 'force-dynamic';

export default async function TopicDetailsPage({ params }: { params: Promise<{ category: string; topic: string }> }) {
    const { category, topic } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedTopic = decodeURIComponent(topic);

    // Fetch Guide and Questions
    const { guide, questions } = await getTopicDetails(decodedCategory, decodedTopic);

    if (!guide) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb / Back */}
            <div className="mb-6">
                <Link
                    href={`/resources/${category}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to {decodedCategory}
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className={`${dmSans.className} text-4xl font-bold capitalize`}>
                            {guide.title}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Deep dive into essential concepts and interview patterns.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="guide" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0 mb-8 gap-6">
                    <TabsTrigger
                        value="guide"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-base font-medium"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Study Guide
                    </TabsTrigger>
                    <TabsTrigger
                        value="practice"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-base font-medium"
                    >
                        <Code2 className="w-4 h-4 mr-2" />
                        Practice Questions
                        <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary text-xs pointer-events-none">
                            {questions.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* GUIDE TAB */}
                <TabsContent value="guide" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Content Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-none bg-transparent">
                                <CardContent className="p-0 prose dark:prose-invert max-w-none">
                                    <ReactMarkdown components={{
                                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-primary" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                        code: ({ node, ...props }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                                        pre: ({ node, ...props }) => <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto my-4 border border-border" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mt-2 mb-4" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-2 mt-2 mb-4" {...props} />,
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4" {...props} />,
                                    }}>
                                        {guide.content}
                                    </ReactMarkdown>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            <Card className="bg-primary/5 border-primary/10 sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Key Takeaways
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {guide.keyTakeaways.map((point, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* <div className="flex justify-center py-12">
                        <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 shadow-primary/10 transition-all" variant="outline" asChild>
                          <Link href="?tab=practice">
                                Start Practicing This Topic <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </div> */}

                    <div className="flex justify-center py-12">
                        <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 shadow-primary/10 transition-all" variant="outline">
                            <Link href="?tab=practice" className="flex items-center">
                                Start Practicing This Topic <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                </TabsContent>

                {/* PRACTICE TAB */}
                <TabsContent value="practice" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid gap-6">
                        {questions.length > 0 ? (
                            questions.map((q: any, index: number) => (
                                <QuestionCard
                                    key={q.id} question={q} index={index + 1}
                                // category={q.category}
                                />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <p>No questions generated yet. Try refreshing to generate new ones!</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
