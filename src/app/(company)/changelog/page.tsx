import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const changelog = [
    {
        date: "Apr 18, 2026",
        title: "Practice Hub, Gamification & Security Hardening",
        badge: "Feature",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        items: [
            "Full DSA Practice Hub with in-browser code editor, test runner, and submissions history.",
            "Gamification: XP, coins, daily streaks, badges, and weekly leaderboard.",
            "Daily challenge system with bonus rewards.",
            "Security: removed hardcoded JWT fallback, sandboxed code runner, auth on payment endpoints.",
            "Performance: consolidated server actions, lazy-loaded GSAP, removed unnecessary re-renders.",
        ],
    },
    {
        date: "Apr 10, 2026",
        title: "Video Interview Auto-Finish & UX Improvements",
        badge: "Feature",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        items: [
            "Auto-finish when interview time expires.",
            "Improved video recording flow and error handling.",
            "Better session state management during interviews.",
        ],
    },
    {
        date: "Apr 05, 2026",
        title: "Coding Test Cases & Type Safety",
        badge: "Improvement",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        items: [
            "Test case persistence for coding questions.",
            "Eliminated all untyped values in mock session actions.",
        ],
    },
    {
        date: "Mar 28, 2026",
        title: "Billing & Subscription Dashboard",
        badge: "Feature",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        items: [
            "Billing page with payment history, subscription management, and invoice views.",
            "Razorpay integration for INR payments (UPI, cards, net banking).",
            "Pay-as-you-go mock packs and voice interview packs.",
        ],
    },
    {
        date: "Mar 15, 2026",
        title: "Dynamic Test Engine",
        badge: "New",
        color: "bg-primary/10 text-primary",
        items: [
            "Auto-generated test cases based on question constraints.",
            "Real-time pass/fail feedback during mock interviews.",
            "JavaScript and Python execution with 3s timeout and 256MB memory cap.",
        ],
    },
    {
        date: "Feb 20, 2026",
        title: "Community Hub & Video Sharing",
        badge: "Feature",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        items: [
            "Share video mock interviews publicly with the community.",
            "Like, comment, and browse interviews by company and difficulty.",
            "Interview experience sharing with structured write-ups.",
        ],
    },
    {
        date: "Feb 10, 2026",
        title: "Authentication & Profile Overhaul",
        badge: "Improvement",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        items: [
            "Secure sign-in/sign-up with rate limiting on auth endpoints.",
            "JWT + refresh token session management with HTTP-only cookies.",
            "User profile with editable name, email, and password change.",
        ],
    },
    {
        date: "Jan 25, 2026",
        title: "AI Tutor & Learning Tracks",
        badge: "Feature",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        items: [
            "Adaptive AI tutor chat with Socratic questioning (Groq + Gemini fallback).",
            "Curated learning tracks for JavaScript, Python, React, Node.js, and DSA.",
            "AI-generated custom roadmaps for any skill.",
        ],
    },
    {
        date: "Jan 16, 2026",
        title: "AI Question Bank Cache",
        badge: "Improvement",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        items: [
            "Pre-generated question banks (30+ questions per skill) to reduce API latency.",
            "Skill-level caching with hit-count tracking for popular topics.",
        ],
    },
    {
        date: "Jan 01, 2026",
        title: "Public Launch",
        badge: "Milestone",
        color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        items: [
            "CareerSpire goes live with AI mock interviews, resource hub, and community.",
            "Free tier: 3 mocks/month, 10 tutor messages/day, unlimited practice problems.",
        ],
    },
];

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-12 sm:py-16">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-10">
                        <h1 className={cn(dmSans.className, "text-3xl sm:text-4xl font-bold tracking-tight mb-2")}>
                            Changelog
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            What&apos;s new and improved in CareerSpire.
                        </p>
                    </header>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border hidden sm:block" />

                        <div className="space-y-8">
                            {changelog.map((entry, i) => (
                                <div key={i} className="relative sm:pl-8">
                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-primary bg-background hidden sm:block" />

                                    <div className="flex items-baseline gap-3 mb-2">
                                        <time className="text-xs text-muted-foreground font-mono shrink-0">{entry.date}</time>
                                        <span className={cn("text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", entry.color)}>
                                            {entry.badge}
                                        </span>
                                    </div>
                                    <h2 className={cn(dmSans.className, "text-base font-bold mb-2")}>{entry.title}</h2>
                                    {entry.items && (
                                        <ul className="space-y-1">
                                            {entry.items.map((item, j) => (
                                                <li key={j} className="text-sm text-muted-foreground leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/30">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
