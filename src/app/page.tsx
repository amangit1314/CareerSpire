'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    Sparkles,
    Terminal,
    Cpu,
    ChevronRight,
    Play,
    Code2,
    BookOpen,
    Users,
    Video,
    MessageSquare,
    Flame,
    Trophy,
    Coins,
    Brain,
} from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Spotlight } from '@/components/ui/Spotlight';

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const smoothYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const scale = useTransform(smoothYProgress, [0, 0.2], [1, 0.95]);
    const opacity = useTransform(smoothYProgress, [0, 0.1], [1, 0.8]);

    // Lazy-load GSAP only when the page mounts (saves ~30KB from initial bundle)
    useEffect(() => {
        let cleanup: (() => void) | undefined;
        import('gsap').then(async (gsapModule) => {
            const gsap = gsapModule.default;
            const { ScrollTrigger } = await import('gsap/dist/ScrollTrigger');
            gsap.registerPlugin(ScrollTrigger);

            const cards = gsap.utils.toArray('.bento-item');
            cards.forEach((card: any, i: number) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
                        delay: i * 0.1,
                    },
                );
            });
            cleanup = () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
        });
        return () => cleanup?.();
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col relative overflow-hidden bg-background">
            {/* Scroll progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-[0%]"
                style={{ scaleX: smoothYProgress }}
            />

            {/* Background ambiance */}
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 mesh-gradient opacity-40" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* ═══════════════ HERO ═══════════════ */}
            <motion.section
                style={{ scale, opacity }}
                className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 px-4 z-10"
            >
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(var(--primary), 0.15)" />

                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
                    >
                        <Sparkles className="h-3 w-3" />
                        AI-Powered Interview Preparation
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(dmSans.className, 'text-5xl md:text-8xl font-extrabold tracking-tight leading-[1] text-balance')}
                    >
                        Practice. Solve. <br />
                        <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                            Get Hired.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed text-balance"
                    >
                        AI mock interviews, a full DSA practice hub, curated learning tracks, and a community of engineers — everything you need to land your next role.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Link href="/auth/signup">
                            <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-lg font-bold">
                                Get Started Free
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/practice">
                            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-primary/20 hover:bg-primary/5 transition-all text-lg font-bold">
                                Try Practice Hub
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Quick feature highlights */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="pt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
                    >
                        {[
                            { icon: Play, label: 'AI Mock Interviews' },
                            { icon: Code2, label: 'Code Sandbox' },
                            { icon: Brain, label: 'AI Tutor' },
                            { icon: BookOpen, label: 'Learning Tracks' },
                        ].map((item) => (
                            <span key={item.label} className="inline-flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-primary" />
                                <span className="font-medium">{item.label}</span>
                            </span>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* ═══════════════ WHY WE EXIST ═══════════════ */}
            <section className="z-10">
                <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8 sm:p-10 text-center relative overflow-hidden"
                    >
                        {/* Subtle gradient accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-5">
                            Most students walk into placement season underprepared — not because they lack talent, but because they lack{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10 text-foreground font-semibold">structured, affordable practice.</span>
                                <svg
                                    className="absolute -bottom-1.5 left-0 w-full h-2.5 text-primary/50"
                                    viewBox="0 0 200 8"
                                    preserveAspectRatio="none"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 5.5C20 2, 40 7, 60 4C80 1, 100 6.5, 120 3.5C140 0.5, 160 6, 180 3C190 1.5, 199 5, 199 5"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        </p>

                        <p className={cn(dmSans.className, 'text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-snug')}>
                            We built <span className="text-primary">CareerSpire</span> to change that.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════ FEATURES BENTO ═══════════════ */}
            <section className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-24 sm:py-32 z-10">
                <div className="mb-14 sm:mb-16 space-y-4">
                    <h2 className={cn(dmSans.className, 'text-3xl md:text-5xl font-bold tracking-tight')}>
                        Everything you need to <span className="text-primary">ace the interview.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        From mock interviews to hands-on coding — a complete prep toolkit powered by AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* AI Mock Interviews — hero card */}
                    <div className="md:col-span-4 bento-item group bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-10 relative overflow-hidden transition-all hover:border-primary/30">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="space-y-4">
                                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Cpu className="h-5 w-5 text-white" />
                                </div>
                                <h3 className={cn(dmSans.className, 'text-2xl md:text-3xl font-bold')}>AI Mock Interviews</h3>
                                <p className="text-base text-muted-foreground/80 max-w-md">
                                    Simulate real technical interviews with AI-generated questions, instant scoring, and detailed feedback on your answers. Text or video — your choice.
                                </p>
                            </div>
                            <div className="mt-6">
                                <Link href="/mock/new" className="inline-flex items-center text-primary font-semibold text-sm gap-1.5 hover:gap-2.5 transition-all">
                                    Start a mock interview <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.06] group-hover:opacity-[0.12] transition-all transform group-hover:scale-110">
                            <Terminal className="h-64 w-64" />
                        </div>
                    </div>

                    {/* Practice Hub */}
                    <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 relative overflow-hidden transition-all hover:border-primary/20 group">
                        <div className="space-y-4 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <Code2 className="h-5 w-5 text-orange-500" />
                            </div>
                            <h3 className={cn(dmSans.className, 'text-xl font-bold')}>Practice Hub</h3>
                            <p className="text-sm text-muted-foreground">
                                DSA problems with an in-browser code editor, test runner, and instant feedback. Earn XP and coins as you solve.
                            </p>
                        </div>
                        <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3 text-amber-500" /> Leaderboard</span>
                            <span className="inline-flex items-center gap-1"><Coins className="h-3 w-3 text-yellow-500" /> Coin Economy</span>
                            <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> Streaks</span>
                        </div>
                    </div>

                    {/* AI Tutor */}
                    <div className="md:col-span-3 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20 group">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <MessageSquare className="h-5 w-5 text-purple-500" />
                            </div>
                            <h3 className={cn(dmSans.className, 'text-xl font-bold')}>AI Tutor</h3>
                            <p className="text-sm text-muted-foreground">
                                Chat with an AI mentor while learning any topic. Get explanations, hints, and follow-up questions tailored to your level — like having a senior engineer on call.
                            </p>
                            <Link href="/resources" className="inline-flex items-center text-primary font-semibold text-xs gap-1.5 hover:gap-2.5 transition-all">
                                Explore resources <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Learning Tracks */}
                    <div className="md:col-span-3 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20 group">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                            </div>
                            <h3 className={cn(dmSans.className, 'text-xl font-bold')}>Learning Tracks</h3>
                            <p className="text-sm text-muted-foreground">
                                Curated prep paths for JavaScript, Python, React, DSA, and more. Or type any skill and let AI generate a personalized roadmap instantly.
                            </p>
                            <Link href="/resources" className="inline-flex items-center text-primary font-semibold text-xs gap-1.5 hover:gap-2.5 transition-all">
                                Browse tracks <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Video Mocks */}
                    <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20 group">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                <Video className="h-5 w-5 text-rose-500" />
                            </div>
                            <h3 className={cn(dmSans.className, 'text-xl font-bold')}>Video Interviews</h3>
                            <p className="text-sm text-muted-foreground">
                                Record yourself answering questions on camera. Review your responses, share with the community, and practice your delivery.
                            </p>
                        </div>
                    </div>

                    {/* Community */}
                    <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20 group">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <Users className="h-5 w-5 text-green-500" />
                            </div>
                            <h3 className={cn(dmSans.className, 'text-xl font-bold')}>Community</h3>
                            <p className="text-sm text-muted-foreground">
                                Share interview experiences, learn from others' stories, and stay motivated with a community of engineers preparing together.
                            </p>
                        </div>
                    </div>

                    {/* Dashboard */}
                    <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20 group">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <Sparkles className="h-5 w-5 text-cyan-500" />
                            </div>
                            <h3 className={cn(dmSans.className, 'text-xl font-bold')}>Progress Tracking</h3>
                            <p className="text-sm text-muted-foreground">
                                Track your scores over time, identify weak areas, maintain streaks, and level up with XP and achievements as you improve.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section className="border-t border-border/50">
                <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-24 sm:py-32">
                    <div className="text-center mb-16 sm:mb-20 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                            How It Works
                        </div>
                        <h2 className={cn(dmSans.className, 'text-3xl md:text-5xl font-bold')}>Start preparing in minutes</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            A simple, focused workflow designed to maximize your interview readiness.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: '01',
                                title: 'Take a Mock',
                                desc: 'Start with an AI-powered mock interview. Get scored on correctness, communication, and problem-solving approach.',
                                icon: Play,
                            },
                            {
                                step: '02',
                                title: 'Practice & Learn',
                                desc: 'Solve DSA problems in the code sandbox, explore curated learning tracks, and chat with the AI tutor on topics you\'re weak in.',
                                icon: Code2,
                            },
                            {
                                step: '03',
                                title: 'Track & Improve',
                                desc: 'Monitor your performance trends, maintain your streak, earn achievements, and revisit weak areas until you\'re interview-ready.',
                                icon: Trophy,
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ margin: '-50px' }}
                                transition={{ delay: i * 0.15 }}
                                className="relative rounded-2xl border border-border bg-card p-8 text-center"
                            >
                                <div className={cn(
                                    dmSans.className,
                                    'text-5xl font-extrabold text-primary/15 absolute top-4 right-6',
                                )}>
                                    {item.step}
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                                    <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className={cn(dmSans.className, 'text-xl font-bold mb-3')}>{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA ═══════════════ */}
            <section className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
                <div className="relative rounded-2xl bg-slate-950 dark:bg-slate-900 p-10 md:p-16 overflow-hidden group">
                    <div className="absolute inset-0 mesh-gradient opacity-30 group-hover:opacity-40 transition-opacity duration-1000" />
                    <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[150px]" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-lg">
                            <h2 className={cn(dmSans.className, 'text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight')}>
                                Ready to start <br className="hidden sm:block" />
                                <span className="text-primary">preparing?</span>
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                Join engineers who are building their interview skills with AI-powered mocks, hands-on practice, and structured learning paths.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/auth/signup">
                                <Button size="lg" className="h-14 px-8 rounded-xl bg-white text-black hover:bg-slate-200 transition-all text-base font-bold">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button size="lg" className="h-14 px-8 rounded-xl border border-slate-600 bg-transparent text-white hover:bg-white/10 hover:border-slate-400 transition-all text-base font-bold">
                                    See Pricing
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="absolute right-[-5%] bottom-[-15%] select-none pointer-events-none opacity-[0.06] hidden lg:block group-hover:opacity-[0.1] transition-opacity duration-1000">
                        <Terminal className="h-80 w-80 text-white" />
                    </div>
                </div>
            </section>
        </div>
    );
}
