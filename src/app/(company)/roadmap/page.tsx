import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function RoadmapPage() {
    return (
        <StaticPageLayout
            title="Roadmap"
            subtitle="See what we're working on and what's coming next to CareerSpire."
        >
            <div className="space-y-12">
                <section>
                    <h2 className="text-primary">Q1 2026: The Foundation (Completed)</h2>
                    <div className="grid gap-4 mt-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold">✅ LeetCode-style Execution Engine</h4>
                            <p className="text-sm text-muted-foreground mt-1">Robust support for JavaScript and Python with automated boilerplates.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold">✅ Video Interview Preflight</h4>
                            <p className="text-sm text-muted-foreground mt-1">Comprehensive hardware and connection checks for a seamless experience.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold">✅ Dynamic Test Engine</h4>
                            <p className="text-sm text-muted-foreground mt-1">Real-time test case generation and execution during mock interviews.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold">✅ Community Hub</h4>
                            <p className="text-sm text-muted-foreground mt-1">Video interview sharing, likes, and community browsing with filters.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold">✅ Billing & Subscriptions</h4>
                            <p className="text-sm text-muted-foreground mt-1">Full billing dashboard with invoice history and subscription management.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold">✅ Authentication Overhaul</h4>
                            <p className="text-sm text-muted-foreground mt-1">Secure sign-in, user profiles, and refresh token session management.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-primary">Q2 2026: Scaling Excellence (Current)</h2>
                    <div className="grid gap-4 mt-4">
                        <div className="p-4 rounded-xl border border-dashed border-primary/30">
                            <h4 className="font-bold">Next-Gen AI Feedback</h4>
                            <p className="text-sm text-muted-foreground mt-1">More granular scoring and line-by-line code suggestions.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-dashed border-primary/30">
                            <h4 className="font-bold">Java & C++ Support</h4>
                            <p className="text-sm text-muted-foreground mt-1">Expanding our execution engine to support more languages.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-dashed border-primary/30">
                            <h4 className="font-bold">Interview Experience Sharing</h4>
                            <p className="text-sm text-muted-foreground mt-1">Write and share detailed interview experiences with the community.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>Q3 2026: Community & Collaboration</h2>
                    <div className="grid gap-4 mt-4 text-muted-foreground">
                        <div className="p-4 rounded-xl border border-dashed border-border">
                            <h4 className="font-bold">Live Mock Duels</h4>
                            <p className="text-sm mt-1">Practice with friends in real-time with shared environments.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-dashed border-border">
                            <h4 className="font-bold">Company-Specific Paths</h4>
                            <p className="text-sm mt-1">Curated interview paths for FAANG and top startups.</p>
                        </div>
                    </div>
                </section>
            </div>
        </StaticPageLayout>
    );
}
