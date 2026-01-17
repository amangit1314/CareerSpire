'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Code, TrendingUp, Zap, Target, Users, ArrowRight, Star } from 'lucide-react';
import { dmSans, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Spotlight } from '@/components/ui/Spotlight';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    // GSAP Scroll Animations for features
    const cards = gsap.utils.toArray('.feature-card');
    cards.forEach((card: any, i: number) => {
      gsap.fromTo(card,
        { opacity: 0, scale: 0.9, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          delay: i * 0.1
        }
      );
    });

    // GSAP reveal for sections
    gsap.from('.section-reveal', {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: '.section-reveal',
        start: "top 80%",
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col relative overflow-hidden mesh-gradient min-h-screen">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative container mx-auto px-4 py-32 md:py-48 text-center min-h-[90vh] flex flex-col items-center justify-center">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(var(--primary), 0.2)" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-xs font-medium text-primary mb-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <Star className="h-3 w-3 fill-primary" />
            <span>Trusted by 5,000+ Engineers</span>
          </div>

          <h1 className={`${dmSans.className} text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.1] mb-6`}>
            Master Your Next
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent drop-shadow-sm">
              Tech Interview
            </span>
          </h1>

          <p className={`${inter.className} text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed`}>
            Elevate your engineering career with AI-powered mock interviews.
            Real-time feedback, deep insights, and expert-level preparation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className={`${dmSans.className} text-lg px-10 py-7 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 group`}>
                Start Free Mock
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className={`${dmSans.className} text-lg px-10 py-7 rounded-2xl glass hover:bg-muted/50 transition-all duration-300`}>
                View Plans
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 opacity-60">
            {['FAANG', 'Startups', 'FinTech', 'Open Source'].map((label) => (
              <span key={label} className="text-sm font-medium tracking-widest uppercase">{label}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-32 z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className={`${dmSans.className} text-4xl md:text-5xl font-bold mb-6`}
          >
            Why Choose Mocky?
          </motion.h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            We've revolutionized the preparation cycle with cutting-edge AI that simulates real-world high-stake interviews.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Zap, title: 'AI-Powered Feedback', desc: 'Get instant, doctoral-level feedback on code quality, design patterns, and efficiency.' },
            { icon: Code, title: 'Real Interview Engine', desc: 'Practice with a bespoke IDE supporting 20+ languages and real-time execution.' },
            { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Our AI predicts your performance probability for specific company tiers.' },
            { icon: Target, title: 'Role-Specific Prep', desc: 'Tailored paths for Frontend, Backend, Fullstack, and Systems Engineering.' },
            { icon: Users, title: 'Peer Comparison', desc: 'See how your solutions rank against thousands of successful FAANG candidates.' },
            { icon: Star, title: 'Expert Curated', desc: 'Questions hand-picked by hiring managers from top-tier tech companies.' },
          ].map((feature, i) => (
            <Card key={i} className="feature-card glass border-primary/10 hover:border-primary/30 transition-all duration-500 overflow-hidden group">
              <CardHeader className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className={`${dmSans.className} text-2xl`}>{feature.title}</CardTitle>
                <CardDescription className="text-base pt-2 text-muted-foreground/80">
                  {feature.desc}
                </CardDescription>
              </CardHeader>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="h-24 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works with Premium Style */}
      <section className="container mx-auto px-4 py-32 relative z-10">
        <div className="glass rounded-[3rem] p-8 md:p-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center mb-16">
            <h2 className={`${dmSans.className} text-4xl md:text-5xl font-bold mb-4`}>The Success Framework</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to mastery</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            {[
              { step: '01', title: 'Initiate', desc: 'Select your target role and company. Our engine constructs a hyper-relevant technical scenario.' },
              { step: '02', title: 'Execute', desc: 'Code your solution in our production-grade environment. No local setup required.' },
              { step: '03', title: 'Analyze', desc: 'Receive a comprehensive breakdown of your performance, including code smell detection.' },
              { step: '04', title: 'Iterate', desc: 'Receive personalized drills based on your weak points to ensure continuous growth.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <span className="text-5xl font-black text-primary/10 group-hover:text-primary/30 transition-colors duration-500">{item.step}</span>
                <div>
                  <h3 className={`${dmSans.className} text-xl font-bold mb-2`}>{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Gradient */}
      <section className="container mx-auto px-4 py-32 text-center relative z-10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="section-reveal max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 p-12 md:p-24 rounded-[3rem] shadow-2xl shadow-primary/40 text-primary-foreground relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-8">
            <h2 className={`${dmSans.className} text-4xl md:text-6xl font-extrabold`}>
              The Future of Prep is Here.
            </h2>
            <p className="text-xl opacity-90 max-w-xl mx-auto leading-relaxed">
              Don't leave your career to chance. Practice with the most advanced AI interview engine on the market.
            </p>
            <div className="pt-6">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className={`${dmSans.className} text-xl px-12 py-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group`}>
                  Get Started for Free
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
