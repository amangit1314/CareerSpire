"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CareerSpireLogo } from "@/components/CareerSpireLogo";
import {
  Heart,
  Target,
  Brain,
  Users,
  Code2,
  Play,
  BookOpen,
  Video,
  MessageSquare,
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { ABOUT_PAGE_CONTENT } from "@/config/content";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative section-space-sm overflow-hidden border-b border-border/50">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <CareerSpireLogo size="lg" showText={false} />
            </div>
            <h1 className="text-display mb-6">
              {ABOUT_PAGE_CONTENT.HERO_TITLE_LINE_1}
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/70">
                {ABOUT_PAGE_CONTENT.HERO_TITLE_LINE_2}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {ABOUT_PAGE_CONTENT.HERO_SUBTITLE}
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mt-5">
              {ABOUT_PAGE_CONTENT.HERO_PROBLEM_PREFIX}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-foreground font-semibold">
                  {ABOUT_PAGE_CONTENT.HERO_PROBLEM_HIGHLIGHT}
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
              </span>{" "}
              {ABOUT_PAGE_CONTENT.HERO_PROBLEM_SUFFIX}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="section-space-sm">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs uppercase tracking-wider font-semibold text-primary mb-4 block">
                {ABOUT_PAGE_CONTENT.OFFER_BADGE}
              </span>
              <h2 className={"text-heading mb-4"}>
                {ABOUT_PAGE_CONTENT.OFFER_TITLE}
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>{ABOUT_PAGE_CONTENT.OFFER_BODY}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                {
                  icon: Play,
                  label: "AI Mock Interviews",
                  desc: "Scored with detailed feedback",
                },
                {
                  icon: Code2,
                  label: "Practice Hub",
                  desc: "DSA problems + code runner",
                },
                {
                  icon: BookOpen,
                  label: "Learning Tracks",
                  desc: "6 curated + AI-generated",
                },
                {
                  icon: MessageSquare,
                  label: "AI Tutor",
                  desc: "Chat while you learn",
                },
                {
                  icon: Video,
                  label: "Video Mocks",
                  desc: "Practice on camera",
                },
                {
                  icon: Users,
                  label: "Community",
                  desc: "Share & learn from others",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-body !text-xs font-semibold mb-0.5">
                    {f.label}
                  </p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="section-space-sm border-y border-border/50 bg-muted/20">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className={"text-heading mb-2"}>
              {ABOUT_PAGE_CONTENT.VALUES_TITLE}
            </h2>
            <p className="text-sm text-muted-foreground">
              {ABOUT_PAGE_CONTENT.VALUES_SUBTITLE}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Student-first pricing",
                desc: "Free tier with unlimited practice. Paid plans start at ₹499/month — less than one day of coaching class. Pay-as-you-go mock packs from ₹79.",
              },
              {
                icon: Target,
                title: "Practice > Theory",
                desc: "Every feature is hands-on. Write code in a real sandbox, take timed mocks, solve daily challenges. Build muscle memory, not just knowledge.",
              },
              {
                icon: Brain,
                title: "AI that teaches, not just tests",
                desc: "Our AI tutor doesn't just grade you. It explains concepts, gives hints, discusses trade-offs, and adapts to your level — like a senior engineer on call.",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-body font-semibold mb-2">{value.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section-space-sm">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className={"text-heading mb-2"}>
              {ABOUT_PAGE_CONTENT.HOW_IT_WORKS_TITLE}
            </h2>
            <p className="text-sm text-muted-foreground">
              {ABOUT_PAGE_CONTENT.HOW_IT_WORKS_SUBTITLE}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: Play,
                title: "Take a mock",
                desc: "AI generates questions, scores your answers, and gives feedback on what to improve.",
              },
              {
                step: "02",
                icon: Code2,
                title: "Practice problems",
                desc: "Solve DSA problems in the code sandbox. Earn coins and XP. Maintain your streak.",
              },
              {
                step: "03",
                icon: BookOpen,
                title: "Learn & grow",
                desc: "Follow curated tracks or ask AI to generate a roadmap for any skill you want to learn.",
              },
              {
                step: "04",
                icon: Trophy,
                title: "Track progress",
                desc: "Monitor scores, identify weak areas, level up, and compete on the leaderboard.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-xl border border-border bg-card p-5"
              >
                <span className="text-display !text-3xl text-primary/10 absolute top-3 right-4">
                  {item.step}
                </span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-body !text-sm font-semibold mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gamification highlight ── */}
      <section className="section-space-sm border-t border-border/50">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6">
          <div className="rounded-xl border border-border bg-gradient-to-r from-primary/[0.04] to-transparent p-8 sm:p-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className={"text-heading"}>
                {ABOUT_PAGE_CONTENT.GAMIFICATION_TITLE}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {ABOUT_PAGE_CONTENT.GAMIFICATION_BODY}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: Flame,
                  label: "Daily streaks",
                  color: "text-orange-500 bg-orange-500/10",
                },
                {
                  icon: Sparkles,
                  label: "XP & levels",
                  color: "text-purple-500 bg-purple-500/10",
                },
                {
                  icon: Trophy,
                  label: "Leaderboard",
                  color: "text-amber-500 bg-amber-500/10",
                },
                {
                  icon: Target,
                  label: "Daily challenges",
                  color: "text-blue-500 bg-blue-500/10",
                },
              ].map((g) => (
                <div
                  key={g.label}
                  className="flex items-center gap-2.5 rounded-lg bg-background/80 border border-border/60 p-3"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      g.color.split(" ")[1],
                    )}
                  >
                    <g.icon className={cn("h-4 w-4", g.color.split(" ")[0])} />
                  </div>
                  <span className="text-xs font-semibold">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-space-sm border-t border-border/50">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 text-center">
          <div className="max-w-lg mx-auto space-y-5">
            <h2 className="text-heading">{ABOUT_PAGE_CONTENT.CTA_TITLE}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ABOUT_PAGE_CONTENT.CTA_BODY}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href={ROUTES.SIGNUP}>
                <Button size="lg" className="rounded-xl font-bold">
                  {ABOUT_PAGE_CONTENT.CTA_PRIMARY}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.PRICING}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl font-bold"
                >
                  {ABOUT_PAGE_CONTENT.CTA_SECONDARY}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
