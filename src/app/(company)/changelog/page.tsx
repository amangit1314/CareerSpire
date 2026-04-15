import { Card, CardContent } from "@/components/ui/card";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const changelog = [
    {
        date: "Apr 10, 2026",
        title: "Video Interview Auto-Finish & UX Improvements",
        badge: "Feature",
        badgeVariant: "secondary" as const,
        description: "Enhanced video mock interviews with automatic session completion and a smoother overall recording experience.",
        items: [
            "Auto-finish when interview time expires",
            "Improved video recording flow and error handling",
            "Better session state management during interviews",
        ],
    },
    {
        date: "Apr 05, 2026",
        title: "Coding Test Cases & Type Safety",
        badge: "Improvement",
        badgeVariant: "secondary" as const,
        description: "Test cases are now saved with coding questions, and all mock interview actions have been upgraded with strict TypeScript types.",
        items: [
            "Test case persistence for coding questions",
            "Eliminated all `any` types in mock session actions",
        ],
    },
    {
        date: "Mar 28, 2026",
        title: "Billing & Subscription Dashboard",
        badge: "Feature",
        badgeVariant: "secondary" as const,
        description: "Introduced a full billing dashboard so users can view invoices, manage subscriptions, and track payment history.",
        items: [
            "New billing API for fetching transaction data",
            "Subscription tier management UI",
            "Payment history and invoice views",
        ],
    },
    {
        date: "Mar 15, 2026",
        title: "Dynamic Test Engine",
        badge: "New",
        badgeVariant: "default" as const,
        description: "Launched a dynamic test execution engine that generates and runs test cases against your code in real time during mock interviews.",
        items: [
            "Auto-generated test cases based on question constraints",
            "Real-time pass/fail feedback in the code editor",
            "Support for JavaScript and Python execution",
        ],
    },
    {
        date: "Feb 20, 2026",
        title: "Community Hub & Video Sharing",
        badge: "Feature",
        badgeVariant: "secondary" as const,
        description: "The community section is now live with video interview sharing, likes, and browsing by company, difficulty, and topic.",
        items: [
            "Browse and filter community video interviews",
            "Like and bookmark videos for later",
            "Trending and popular video feeds",
        ],
    },
    {
        date: "Feb 10, 2026",
        title: "Authentication & Profile Overhaul",
        badge: "Improvement",
        badgeVariant: "secondary" as const,
        description: "Rebuilt the authentication flow and user profile system with a more secure, streamlined experience.",
        items: [
            "New sign-in and sign-up pages with rate limiting",
            "User profile page with editable details",
            "Session management with secure refresh tokens",
        ],
    },
    {
        date: "Feb 01, 2026",
        title: "Footer, Navigation & Static Pages",
        badge: "Improvement",
        badgeVariant: "secondary" as const,
        description: "Rolled out a comprehensive footer, improved navigation, and added all company, legal, and support pages.",
    },
    {
        date: "Jan 25, 2026",
        title: "Speech Recognition Update",
        badge: "New",
        badgeVariant: "default" as const,
        description: "Fixed compatibility issues with SpeechRecognition API and improved voice detection accuracy during mock interviews.",
        items: [
            "Added global type definitions for Web Speech API",
            "Optimized silence detection algorithm",
        ],
    },
    {
        date: "Jan 16, 2026",
        title: "AI-Powered Question Bank",
        badge: "Feature",
        badgeVariant: "secondary" as const,
        description: "Launched comprehensive resource section with AI-generated interview questions for JavaScript and Python.",
    },
    {
        date: "Jan 01, 2026",
        title: "Public Launch",
        badge: "Milestone",
        badgeVariant: "outline" as const,
        description: "CareerSpire is now live! Start practicing your interviews with AI feedback.",
    },
];

export default function ChangelogPage() {
    return (
        <div className="min-h-screen mesh-gradient py-20 px-4">
            <div className="container mx-auto max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <h1 className={cn(dmSans.className, "text-4xl font-bold tracking-tight")}>
                        Changelog
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        New updates and improvements to CareerSpire.
                    </p>
                </div>

                <div className="space-y-8">
                    {changelog.map((entry, i) => (
                        <Card key={i} className="glass border-primary/20">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                    <div className="md:w-32 shrink-0">
                                        <span className="text-sm text-muted-foreground font-mono">{entry.date}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold">{entry.title}</h2>
                                            <Badge
                                                variant={entry.badgeVariant}
                                                className={entry.badgeVariant === "default" ? "bg-primary/20 text-primary hover:bg-primary/30 border-0" : ""}
                                            >
                                                {entry.badge}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">{entry.description}</p>
                                        {entry.items && (
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                {entry.items.map((item, j) => (
                                                    <li key={j}>{item}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
