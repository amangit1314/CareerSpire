'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Code,
  TrendingUp,
  Zap,
  Target,
  Users,
  ArrowRight,
  Star,
  Sparkles,
  Terminal,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Globe
} from 'lucide-react';
import { dmSans, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Spotlight } from '@/components/ui/Spotlight';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const scale = useTransform(smoothYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(smoothYProgress, [0, 0.1], [1, 0.8]);

  useEffect(() => {
    // GSAP reveal for bento cards
    const cards = gsap.utils.toArray('.bento-item');
    cards.forEach((card: any, i: number) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
          },
          delay: i * 0.1
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col relative overflow-hidden bg-background">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-[0%]"
        style={{ scaleX: smoothYProgress }}
      />
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <motion.section
        style={{ scale, opacity }}
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 px-4 z-10"
      >
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(var(--primary), 0.15)" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest"
          >
            <Sparkles className="h-3 w-3" />
            <span>The Gold Standard for Engineering Prep</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(dmSans.className, "text-5xl md:text-8xl font-black tracking-tight leading-[1] text-balance")}
          >
            From Developer to <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
              Elite Engineer.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed text-balance"
          >
            CareerSpire is the high-stakes AI interview platform built for the next generation of staff engineers. Master logic, architecture, and behavioral traits in one unified engine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-lg font-bold">
                Start Elite Training
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/resources">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-primary/20 glass hover:bg-primary/5 transition-all text-lg font-bold">
                Explore Resources
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500"
          >
            {['FAANG READY', 'ISO 27001', 'SOC2 COMPLIANT', 'AI-CERTIFIED'].map((tag) => (
              <span key={tag} className="text-[10px] font-black tracking-[0.3em] uppercase">{tag}</span>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Bento Grid Features */}
      <section className="container mx-auto px-4 py-32 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 space-y-4">
            <h2 className={cn(dmSans.className, "text-3xl md:text-5xl font-bold tracking-tight")}>
              Engineered for <span className="text-primary italic">Absolute Readiness.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Don't just practice. Simulate the pressure, complexity, and scrutiny of top-tier technical interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large Feature 1 */}
            <div className="md:col-span-4 bento-item group bg-primary/5 border border-primary/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden transition-all hover:border-primary/30">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={cn(dmSans.className, "text-2xl md:text-4xl font-bold")}>AI Tutor: Real-time Pedagogy</h3>
                  <p className="text-lg text-muted-foreground/80 max-w-md">
                    Our AI doesn't just evaluate; it teaches. Engage in active dialogue during your coding session to explore alternative approaches and design trade-offs.
                  </p>
                </div>
                <div className="mt-8">
                  <Link href="/resources" className="inline-flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                    See it in action <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-[-10%] right-[-10%] opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110">
                <Terminal className="h-80 w-80" />
              </div>
            </div>

            {/* Small Feature 1 */}
            <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-[2rem] p-8 relative overflow-hidden transition-all hover:border-primary/20 group">
              <div className="space-y-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className={cn(dmSans.className, "text-xl font-bold")}>Readiness Score</h3>
                <p className="text-sm text-muted-foreground">
                  Our proprietary algorithm calculates your probability of passing interviews at Tier 1 companies.
                </p>
              </div>
              <div className="mt-8 bg-background/50 rounded-xl p-4 border border-border relative z-10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold opacity-60 uppercase">Progress</span>
                  <span className="text-xs font-bold text-primary">84%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '84%' }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Medium Feature 1 */}
            <div className="md:col-span-3 bento-item bg-muted/30 border border-border rounded-[2rem] p-8 transition-all hover:border-primary/20 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className={cn(dmSans.className, "text-xl font-bold")}>Global Benchmarking</h4>
                <p className="text-sm text-muted-foreground">
                  Compare your code performance against successful candidates from Google, Netflix, and Amazon.
                </p>
              </div>
            </div>

            {/* Medium Feature 2 */}
            <div className="md:col-span-3 bento-item bg-muted/30 border border-border rounded-[2rem] p-8 transition-all hover:border-primary/20 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                </div>
                <h4 className={cn(dmSans.className, "text-xl font-bold")}>Secure Submissions</h4>
                <p className="text-sm text-muted-foreground">
                  Your code is yours. We provide a sandbox environment that isolates your execution for maximum security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Glass Card Style */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge className="bg-primary/20 text-primary border-primary/20 text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">The CareerSpire Mission</Badge>
              <h2 className={cn(dmSans.className, "text-4xl md:text-6xl font-bold leading-tight")}>
                Democratizing <br />
                <span className="text-primary italic">Elite</span> Mentorship.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Landing a role at a top-tier company shouldn't depend on your network or your bank account. We've encoded the knowledge of Staff Engineers into an AI engine that treats every user like an elite candidate.
              </p>
              <div className="grid grid-cols-2 gap-12 pt-4">
                <div className="space-y-2">
                  <div className="text-4xl font-black text-primary">5k+</div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-60">Engineers Placed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-black text-primary">120k+</div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-60">AI Mocks Run</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/30 blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
              <Card className="glass border-primary/10 rounded-[4rem] p-4 overflow-hidden transform hover:-rotate-1 transition-transform duration-1000 shadow-2xl relative z-10">
                <div className="aspect-square bg-gradient-to-br from-primary/10 via-background to-blue-500/10 rounded-[3.5rem] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 mesh-gradient opacity-30" />
                  <Sparkles className="h-32 w-32 text-primary animate-pulse relative z-10" />

                  {/* Floating Elements */}
                  <div className="absolute top-10 right-10 p-4 glass rounded-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute bottom-10 left-10 p-4 glass rounded-2xl animate-bounce" style={{ animationDuration: '4s' }}>
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Path to Mastery - Timeline Refined */}
      <section className="container mx-auto px-4 py-32 border-t border-border/50">
        <div className="text-center mb-24 space-y-4">
          <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">The Curriculum</Badge>
          <h2 className={cn(dmSans.className, "text-4xl md:text-6xl font-black")}>The Path to Mastery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A rigorous, data-driven journey designed to transform your interviewing DNA.</p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden md:block" />

          {[
            { step: '01', title: 'Deep Diagnostic', desc: 'Baseline your skills with a comprehensive mock interview covering both complex logic and system design.', icon: Zap },
            { step: '02', title: 'Roadmap Synthesis', desc: 'AI constructs a daily training regimen focused on your individual weak points and architectural gaps.', icon: Target },
            { step: '03', title: 'Dialectical Tutoring', desc: 'Engage in active dialogue with our AI tutor during coding drills to explore deep patterns.', icon: Cpu },
            { step: '04', title: 'The Staff Certification', desc: 'Clear a series of high-stakes final mocks to earn your readiness badge and enter the elite pool.', icon: Star }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              className={cn(
                "flex flex-col md:flex-row gap-12 mb-32 relative",
                i % 2 === 0 ? "md:text-right" : "md:flex-row-reverse md:text-left"
              )}
            >
              <div className="flex-1 space-y-6">
                <div className={cn("flex items-center gap-4", i % 2 === 0 ? "md:flex-row-reverse" : "")}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-4xl font-black opacity-10">{item.step}</span>
                </div>
                <h3 className={cn(dmSans.className, "text-3xl font-bold")}>{item.title}</h3>
                <p className="text-xl text-muted-foreground/80 leading-relaxed font-light">{item.desc}</p>
              </div>
              <div className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-background absolute left-[50%] ml-[-8px] top-6 z-10 shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
              <div className="flex-1" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - Ultra Premium */}
      <section className="container mx-auto px-4 py-32">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative rounded-[4rem] bg-slate-950 p-12 md:p-24 overflow-hidden group shadow-2xl shadow-primary/20"
        >
          <div className="absolute inset-0 mesh-gradient opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
          <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-primary/20 rounded-full blur-[150px]" />

          <div className="relative z-10 max-w-3xl space-y-10">
            <h2 className={cn(dmSans.className, "text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.9]")}>
              Enter the <br /> <span className="text-primary italic">Elite.</span>
            </h2>
            <p className="text-2xl text-slate-300 leading-relaxed max-w-xl font-light">
              Don't leave your engineering career to chance. Join 5,000+ developers practicing on the most advanced prep platform.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-20 px-16 rounded-[2rem] bg-white text-black hover:bg-slate-200 transition-all text-2xl font-black group">
                  Get Started Free
                  <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-3 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute right-[-10%] bottom-[-10%] select-none pointer-events-none opacity-10 hidden lg:block group-hover:opacity-20 transition-opacity duration-1000">
            <Terminal className="h-[30rem] w-[30rem] text-white" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

