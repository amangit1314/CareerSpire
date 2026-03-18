'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { dmSans, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface StaticPageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    lastUpdated?: string;
}

export function StaticPageLayout({
    title,
    subtitle,
    children,
    className,
    lastUpdated,
}: StaticPageLayoutProps) {
    return (
        <div className="min-h-screen pt-24 pb-20 overflow-hidden relative">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className={cn(
                            dmSans.className,
                            "text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
                        )}>
                            {title}
                        </h1>
                        {subtitle && (
                            <p className={cn(
                                inter.className,
                                "text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed"
                            )}>
                                {subtitle}
                            </p>
                        )}
                        {lastUpdated && (
                            <div className="mt-8 inline-flex items-center px-4 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium">
                                Last Updated: {lastUpdated}
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className={cn(
                        inter.className,
                        "prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                        className
                    )}>
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
