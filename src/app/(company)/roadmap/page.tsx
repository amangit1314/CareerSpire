import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Check, Construction, Telescope } from "lucide-react";

const QUARTERS = [
    {
        label: "Q1 2026 — Foundation",
        icon: Check,
        status: "Completed",
        statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        items: [
            { title: "AI Mock Interviews", desc: "Text-based mocks with AI question generation, code execution, and detailed feedback (Groq + Gemini)." },
            { title: "Video Mock Interviews", desc: "Record-on-camera interviews with AI transcript evaluation, preflight checks, and community sharing." },
            { title: "Dynamic Test Engine", desc: "Server-side JavaScript, Python, and Java execution with auto-generated test cases (3s timeout, 256MB cap)." },
            { title: "Billing & Subscriptions", desc: "Razorpay integration for Pro (₹499) and Placement (₹999) plans, plus pay-as-you-go mock and voice packs." },
            { title: "Auth & Sessions", desc: "Secure JWT auth with bcrypt passwords, HTTP-only cookies, refresh tokens, and rate-limited endpoints." },
            { title: "Community Hub", desc: "Interview experience sharing, public video browsing, likes, comments, and company/difficulty filters." },
        ],
    },
    {
        label: "Q2 2026 — Depth",
        icon: Construction,
        status: "In Progress",
        statusColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
        items: [
            { title: "Practice Hub & Gamification", desc: "100+ DSA problems, in-browser editor, XP/coins/streaks/badges, daily challenges, and leaderboards." },
            { title: "AI Tutor", desc: "Adaptive chat tutor with Socratic questioning, intent detection, and per-tier rate limiting." },
            { title: "Learning Tracks", desc: "Curated paths for JS, Python, React, Node, DSA + AI-generated custom roadmaps for any skill." },
            { title: "Security Hardening", desc: "Code-runner sandboxing, payment auth, IDOR fixes, image domain restrictions, and session token randomisation." },
            { title: "Performance Optimisation", desc: "Consolidated server actions, lazy-loaded GSAP, removed framer-motion from layout, reduced re-renders." },
        ],
    },
    {
        label: "Q3 2026 — Scale",
        icon: Telescope,
        status: "Planned",
        statusColor: "text-muted-foreground bg-muted/50",
        items: [
            { title: "C++ & Rust Support", desc: "Expand code execution to C++ and Rust for competitive programming prep." },
            { title: "Company-Specific Paths", desc: "Curated interview prep paths for specific companies (FAANG, Indian startups, service firms)." },
            { title: "Live Mock Duels", desc: "Real-time paired practice sessions with shared editor and turn-based questioning." },
            { title: "Advanced Analytics", desc: "Topic-level weakness heatmaps, improvement trends, and personalised practice recommendations." },
            { title: "Mobile App", desc: "React Native app for on-the-go revision, flashcards, and tutor chat." },
        ],
    },
];

export default function RoadmapPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-12 sm:py-16">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-10">
                        <h1 className={cn(dmSans.className, "text-3xl sm:text-4xl font-bold tracking-tight mb-2")}>
                            Roadmap
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            What we&apos;ve shipped, what we&apos;re building, and what&apos;s coming next.
                        </p>
                    </header>

                    <div className="space-y-10">
                        {QUARTERS.map((q) => (
                            <section key={q.label}>
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className={cn(dmSans.className, "text-base font-bold")}>{q.label}</h2>
                                    <span className={cn("text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", q.statusColor)}>
                                        {q.status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {q.items.map((item) => (
                                        <div
                                            key={item.title}
                                            className={cn(
                                                "p-4 rounded-lg border",
                                                q.status === "Completed"
                                                    ? "border-border bg-card/50"
                                                    : q.status === "In Progress"
                                                      ? "border-blue-500/20 bg-blue-500/5"
                                                      : "border-dashed border-border/60",
                                            )}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                {q.status === "Completed" && (
                                                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-semibold">{item.title}</h3>
                                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-xs text-muted-foreground mb-3">Have a feature idea?</p>
                        <a
                            href="/request-feature"
                            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            Request a Feature
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
