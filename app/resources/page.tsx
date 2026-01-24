'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getResourceCategories, CategoryStats } from '@/app/actions/resource.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { BookOpen, Code2, Database, Terminal, Layout, Server, Sparkles } from 'lucide-react';

const ICONS: Record<string, any> = {
    'dsa': Database,
    'javascript': Code2,
    'typescript': Code2,
    'python': Terminal,
    'react': Layout,
    'node': Server,
};

import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
    const [categories, setCategories] = useState<CategoryStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/resources/${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getResourceCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-8 space-y-8">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="text-center space-y-4">
                        <h1 className={cn("text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60", dmSans.className)}>
                            Learning Resources & Practice Hub
                        </h1>
                        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
                            Deep dive into core programming concepts, data structures, and algorithms.
                            Practice with curated questions and track your progress.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-md mx-auto relative mt-6 sm:mt-8 px-4 sm:px-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search any skill (e.g. Nest.js, Go, Rust)"
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm sm:text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-2 p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    <Sparkles className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                AI-powered: Search for any skill and we'll generate questions for you!
                            </p>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 px-4 sm:px-0">
                        {isLoading ? (
                            // Skeletons
                            Array(6).fill(0).map((_, i) => (
                                <Card key={i} className="h-48 animate-pulse bg-muted rounded-xl" />
                            ))
                        ) : (
                            categories.map((cat) => {
                                const Icon = ICONS[cat.slug] || Sparkles;
                                return (
                                    <Link 
                                        href={`/resources/${cat.slug}`} 
                                        key={cat.slug} 
                                        className="block group focus:outline-none"
                                    >
                                        <Card className="h-full overflow-hidden transition-all hover:scale-[1.02] hover:border-primary/50 cursor-pointer border-muted rounded-xl relative">
                                            {/* Removed negative margins to prevent overflow */}
                                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full transition-transform group-hover:scale-110" />

                                            <CardHeader className="relative z-10">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                                    <Icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <CardTitle className={cn("text-xl", dmSans.className)}>
                                                    {cat.category}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {cat.description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="relative z-10">
                                                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                                                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-primary font-medium">
                                                        Start Practice
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}