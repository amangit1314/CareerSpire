import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function FeedbackPage() {
    return (
        <StaticPageLayout
            title="Give Feedback"
            subtitle="Your feedback directly shapes what we build next."
        >
            <div className="p-6 sm:p-8 rounded-xl border border-border bg-card/50 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">How would you rate CareerSpire?</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} className="p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                                <Star className="h-6 w-6 text-muted-foreground/30 hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">What&apos;s on your mind?</label>
                    <Textarea
                        placeholder="What do you like? What could be better? Which feature do you use the most — mocks, practice hub, AI tutor, or community?"
                        className="min-h-[160px]"
                    />
                </div>

                <Button className="w-full font-semibold">
                    Send Feedback
                </Button>

                <p className="text-[0.6875rem] text-muted-foreground text-center">
                    Want to suggest a specific feature instead? <a href="/request-feature" className="text-primary font-medium">Request a feature</a>.
                </p>
            </div>
        </StaticPageLayout>
    );
}
