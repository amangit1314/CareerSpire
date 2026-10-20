"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShaderBackground } from "@/components/ui/ShaderBackground";
import {
  ArrowRight,
  ChevronRight,
  Play,
  Code2,
  BookOpen,
  Brain,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });
  const scale = useTransform(smoothYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(smoothYProgress, [0, 0.1], [1, 0.8]);

  // Lazy-load GSAP only when the page mounts (saves ~30KB from initial bundle)
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import("gsap").then(async (gsapModule) => {
      const gsap = gsapModule.default;
      const { ScrollTrigger } = await import("gsap/dist/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const cards = gsap.utils.toArray(".bento-item") as Element[];
      cards.forEach((card, i: number) => {
        gsap.fromTo(
          card,
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
              toggleActions: "play none none reverse",
            },
            delay: i * 0.1,
          },
        );
      });
      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });
    return () => cleanup?.();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col relative overflow-hidden bg-background"
    >
      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-[0%]"
        style={{ scaleX: smoothYProgress }}
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <motion.section
        style={{ scale, opacity }}
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 px-4 z-10 overflow-hidden"
      >
        <ShaderBackground />
        {/* Dissolve the shader into the page's actual background
                    color before the next section starts — without this the
                    dark canvas cuts hard into a plain white/dark section. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent z-[5]" />
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-display text-balance text-white"
          >
            Practice. Solve. <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-300 to-blue-400 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-body text-white/70 max-w-2xl mx-auto text-balance"
          >
            AI mock interviews, a full DSA practice hub, curated learning
            tracks, and a community of engineers — everything you need to land
            your next role.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href={ROUTES.SIGNUP}>
              <Button size="lg" className="text-base font-semibold">
                Get Started Free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={ROUTES.PRACTICE}>
              <Button
                size="lg"
                variant="outline"
                className="text-base font-semibold bg-transparent border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                Try Practice Hub
              </Button>
            </Link>
          </motion.div>

          {/* TODO(screenshot): real product screenshot goes here (mock
                        interview or dashboard, in a plain browser-frame), per
                        docs/architecture/DESIGN_LANGUAGE.md — replaces decorative
                        art with actual product proof once screenshots are provided. */}

          {/* Quick feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70"
          >
            {[
              { icon: Play, label: "AI Mock Interviews" },
              { icon: Code2, label: "Code Sandbox" },
              { icon: Brain, label: "AI Tutor" },
              { icon: BookOpen, label: "Learning Tracks" },
            ].map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <item.icon className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-white/85">{item.label}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════ WHY WE EXIST ═══════════════ */}
      <section className="z-10">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 section-space-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8 sm:p-10 text-center relative overflow-hidden"
          >
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-5">
              Most students walk into placement season underprepared — not
              because they lack talent, but because they lack{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-foreground font-semibold">
                  structured, affordable practice.
                </span>
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

            <p className="text-heading text-foreground">
              We built <span className="text-primary">CareerSpire</span> to
              change that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURES BENTO ═══════════════ */}
      <section className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 section-space z-10">
        <div className="mb-14 sm:mb-16 space-y-4">
          <h2 className="text-display">
            Everything you need to{" "}
            <span className="text-primary">ace the interview.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            From mock interviews to hands-on coding — a complete prep toolkit
            powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* AI Mock Interviews — hero card. TODO(screenshot): swap the
                        empty space below the copy for a real mock-interview screenshot. */}
          <div className="md:col-span-4 bento-item bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between transition-all hover:border-primary/30">
            <div className="space-y-4">
              <h3 className="text-heading">AI Mock Interviews</h3>
              <p className="text-base text-muted-foreground/80 max-w-md">
                Simulate real technical interviews with AI-generated questions,
                instant scoring, and detailed feedback on your answers. Text or
                video — your choice.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href={ROUTES.MOCK_NEW}
                className="inline-flex items-center text-primary font-semibold text-sm gap-1.5 hover:gap-2.5 transition-all"
              >
                Start a mock interview <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Practice Hub */}
          <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20">
            <div className="space-y-3">
              <h3 className="text-heading">Practice Hub</h3>
              <p className="text-sm text-muted-foreground">
                DSA problems with an in-browser code editor, test runner, and
                instant feedback. Earn XP and coins as you solve, with streaks
                and a leaderboard.
              </p>
            </div>
          </div>

          {/* AI Tutor */}
          <div className="md:col-span-3 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20">
            <div className="space-y-3">
              <h3 className="text-heading">AI Tutor</h3>
              <p className="text-sm text-muted-foreground">
                Chat with an AI mentor while learning any topic. Get
                explanations, hints, and follow-up questions tailored to your
                level — like having a senior engineer on call.
              </p>
              <Link
                href={ROUTES.RESOURCES}
                className="inline-flex items-center text-primary font-semibold text-xs gap-1.5 hover:gap-2.5 transition-all"
              >
                Explore resources <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Learning Tracks */}
          <div className="md:col-span-3 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20">
            <div className="space-y-3">
              <h3 className="text-heading">Learning Tracks</h3>
              <p className="text-sm text-muted-foreground">
                Curated prep paths for JavaScript, Python, React, DSA, and more.
                Or type any skill and let AI generate a personalized roadmap
                instantly.
              </p>
              <Link
                href={ROUTES.RESOURCES}
                className="inline-flex items-center text-primary font-semibold text-xs gap-1.5 hover:gap-2.5 transition-all"
              >
                Browse tracks <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Video Mocks */}
          <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20">
            <div className="space-y-3">
              <h3 className="text-heading">Video Interviews</h3>
              <p className="text-sm text-muted-foreground">
                Record yourself answering questions on camera. Review your
                responses, share with the community, and practice your delivery.
              </p>
            </div>
          </div>

          {/* Community */}
          <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20">
            <div className="space-y-3">
              <h3 className="text-heading">Community</h3>
              <p className="text-sm text-muted-foreground">
                Share interview experiences, learn from others&apos; stories,
                and stay motivated with a community of engineers preparing
                together.
              </p>
            </div>
          </div>

          {/* Dashboard */}
          <div className="md:col-span-2 bento-item bg-muted/30 border border-border rounded-2xl p-7 transition-all hover:border-primary/20">
            <div className="space-y-3">
              <h3 className="text-heading">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track your scores over time, identify weak areas, maintain
                streaks, and level up with XP and achievements as you improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="border-t border-border/50">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 section-space">
          <div className="text-center mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-body !text-sm font-semibold text-primary">
              How It Works
            </div>
            <h2 className="text-display">Start preparing in minutes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, focused workflow designed to maximize your interview
              readiness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Take a Mock",
                desc: "Start with an AI-powered mock interview. Get scored on correctness, communication, and problem-solving approach.",
              },
              {
                step: "02",
                title: "Practice & Learn",
                desc: "Solve DSA problems in the code sandbox, explore curated learning tracks, and chat with the AI tutor on topics you're weak in.",
              },
              {
                step: "03",
                title: "Track & Improve",
                desc: "Monitor your performance trends, maintain your streak, earn achievements, and revisit weak areas until you're interview-ready.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-50px" }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-2xl border border-border bg-card p-8 text-center"
              >
                <div className="text-display text-primary/15 absolute top-4 right-6 !text-5xl">
                  {item.step}
                </div>
                <h3 className="text-heading mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 section-space-sm">
        <div className="rounded-2xl bg-inverse p-10 md:p-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-lg">
              <h2 className="text-display text-inverse-foreground">
                Ready to start <br className="hidden sm:block" />
                <span className="text-primary">preparing?</span>
              </h2>
              <p className="text-base text-inverse-foreground/60 leading-relaxed">
                Join engineers who are building their interview skills with
                AI-powered mocks, hands-on practice, and structured learning
                paths.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={ROUTES.SIGNUP}>
                <Button
                  size="lg"
                  className="bg-inverse-foreground text-inverse hover:bg-inverse-foreground/90 text-base font-semibold"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.PRICING}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-inverse-foreground/20 bg-transparent text-inverse-foreground hover:bg-inverse-foreground/10 text-base font-semibold"
                >
                  See Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
