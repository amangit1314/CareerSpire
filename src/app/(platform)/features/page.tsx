"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Users, Video, Code2, Zap, Rocket } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { FEATURES_PAGE_CONTENT } from "@/config/content";

// One consistent icon treatment (bg-primary/10 + text-primary) across all
// cards — not a different rainbow color per feature. Per DESIGN_LANGUAGE.md:
// per-card colored icon boxes read as a bento-grid template, not a
// considered hierarchy.
const features = [
  {
    title: "AI Interview Tutor",
    description:
      "Engage in real-time, interactive practice sessions. Our AI tutor explains concepts, identifies pitfalls, and provides live feedback on your answers.",
    icon: Bot,
    delay: 0.1,
  },
  {
    title: "Community Experiences",
    description:
      "Learn from thousands of shared interview journeys. Real questions, real feedback, and real results from candidates at top tech companies.",
    icon: Users,
    delay: 0.2,
  },
  {
    title: "Video Mock Sessions",
    description:
      "Record and review your mock interviews. Get AI-powered behavioral analysis and optionally share your performance with the community.",
    icon: Video,
    delay: 0.3,
  },
  {
    title: "Learning Resource Hub",
    description:
      "A comprehensive library of AI-generated study guides and questions covering DSA, System Design, and Frontend/Backend frameworks.",
    icon: Code2,
    delay: 0.4,
  },
  {
    title: "Instant AI Feedback",
    description:
      "No more waiting. Get detailed, granular feedback on your code and reasoning within seconds, showing exactly where to improve.",
    icon: Zap,
    delay: 0.5,
  },
  {
    title: "Placement Tracking",
    description:
      "Track your progress from the first mock to the final offer. See your growth and ready-for-interview score in real-time.",
    icon: Rocket,
    delay: 0.6,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 section-space relative">
        {/* Hero Section */}
        <section className="relative -mx-6 px-6 pb-24 overflow-hidden">
          <div className="text-center max-w-3xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="block text-xs uppercase tracking-wider font-semibold text-primary mb-6">
                {FEATURES_PAGE_CONTENT.BADGE}
              </span>
              <h1 className="text-display mb-6">
                {FEATURES_PAGE_CONTENT.TITLE_LINE_1} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                  {FEATURES_PAGE_CONTENT.TITLE_LINE_2}
                </span>
              </h1>
              <p className="text-body text-muted-foreground">
                {FEATURES_PAGE_CONTENT.SUBTITLE}
              </p>
            </motion.div>
          </div>
        </section>

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
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-heading mb-3">{feature.title}</h3>
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
            <h2 className="text-heading mb-4">
              {FEATURES_PAGE_CONTENT.CTA_TITLE}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {FEATURES_PAGE_CONTENT.CTA_SUBTITLE}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={ROUTES.RESOURCES}>
                  {FEATURES_PAGE_CONTENT.CTA_PRIMARY}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={ROUTES.COMMUNITY}>
                  {FEATURES_PAGE_CONTENT.CTA_SECONDARY}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
