'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Bot, Users, Video, Code2, Zap, Rocket, ShieldCheck, Globe } from 'lucide-react';
import Link from 'next/link';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const features = [
    {
        title: "AI Interview Tutor",
        description: "Engage in real-time, interactive practice sessions. Our AI tutor explains concepts, identifies pitfalls, and provides live feedback on your answers.",
        icon: Bot,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        delay: 0.1
    },
    {
        title: "Community Experiences",
        description: "Learn from thousands of shared interview journeys. Real questions, real feedback, and real results from candidates at top tech companies.",
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        delay: 0.2
    },
    {
        title: "Video Mock Sessions",
        description: "Record and review your mock interviews. Get AI-powered behavioral analysis and optionally share your performance with the community.",
        icon: Video,
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        delay: 0.3
    },
    {
        title: "Learning Resource Hub",
        description: "A comprehensive library of AI-generated study guides and questions covering DSA, System Design, and Frontend/Backend frameworks.",
        icon: Code2,
        color: "text-green-500",
        bg: "bg-green-500/10",
        delay: 0.4
    },
    {
        title: "Instant AI Feedback",
        description: "No more waiting. Get detailed, granular feedback on your code and reasoning within seconds, showing exactly where to improve.",
        icon: Zap,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        delay: 0.5
    },
    {
        title: "Placement Tracking",
        description: "Track your progress from the first mock to the final offer. See your growth and ready-for-interview score in real-time.",
        icon: Rocket,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        delay: 0.6
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen mesh-gradient overflow-hidden">
            <div className="container mx-auto px-6 py-24 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -z-10" />

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1">
                            Platform Features
                        </Badge>
                        <h1 className={cn(dmSans.className, "text-5xl md:text-6xl font-bold mb-6 tracking-tight")}>
                            Engineered for <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                                Interview Success
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            A complete ecosystem designed to transform how you prepare for technical interviews.
                            From AI-led teaching to community-driven insights.
                        </p>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: feature.delay }}
                        >
                            <Card className="glass border-primary/10 hover:border-primary/30 transition-all duration-300 group h-full">
                                <CardContent className="p-8">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300", feature.bg)}>
                                        <feature.icon className={cn("h-7 w-7", feature.color)} />
                                    </div>
                                    <h3 className={cn(dmSans.className, "text-xl font-bold mb-3")}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-24 text-center"
                >
                    <div className="glass p-12 rounded-3xl border-primary/20 max-w-4xl mx-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="h-32 w-32 text-primary" />
                        </div>
                        <h2 className={cn(dmSans.className, "text-3xl font-bold mb-4")}>Ready to experience the future?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Join thousands of candidates who are already using our AI to land their dream roles.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20 dark:text-white" asChild>
                                <Link href="/resources">Start Practice Now</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8 glass" asChild>
                                <Link href="/community">Join Community</Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === "outline" ? "text-foreground" : "bg-primary text-primary-foreground",
            className
        )}>
            {children}
        </span>
    );
}
