import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RequestFeaturePage() {
    return (
        <StaticPageLayout
            title="Request a Feature"
            subtitle="Have an idea that would make interview prep better? We're listening."
        >
            <div className="p-6 sm:p-8 rounded-xl border border-border bg-card/50 space-y-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Feature Title</label>
                    <Input placeholder="e.g. Support for C++ in Practice Hub, Company-specific mock paths" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Which area does this relate to?</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option>Mock Interviews</option>
                        <option>Practice Hub / DSA Problems</option>
                        <option>AI Tutor</option>
                        <option>Learning Tracks / Resources</option>
                        <option>Video Interviews</option>
                        <option>Community</option>
                        <option>Gamification (XP, Coins, Streaks)</option>
                        <option>Billing / Pricing</option>
                        <option>Dashboard / Analytics</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">What problem does this solve?</label>
                    <Textarea
                        placeholder="Describe the problem or pain point you're experiencing..."
                        className="min-h-[100px]"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">How should it work?</label>
                    <Textarea
                        placeholder="Describe your ideal solution..."
                        className="min-h-[120px]"
                    />
                </div>

                <Button className="w-full font-semibold">
                    Submit Feature Request
                </Button>

                <p className="text-[0.6875rem] text-muted-foreground text-center">
                    Check our <a href="/roadmap" className="text-primary font-medium">roadmap</a> to see what&apos;s already planned.
                </p>
            </div>
        </StaticPageLayout>
    );
}
