import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function FeedbackPage() {
    return (
        <StaticPageLayout
            title="Give Feedback"
            subtitle="How's your experience with CareerSpire? We'd love to hear your thoughts."
        >
            <div className="p-8 md:p-12 rounded-3xl glass border border-primary/10 space-y-8">
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Button key={star} variant="ghost" size="icon" className="h-12 w-12 hover:bg-primary/10 hover:text-primary">
                                <Star className="h-8 w-8" />
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What do you think?</label>
                    <Textarea
                        placeholder="Share your experience, what you liked, or where we can improve..."
                        className="min-h-[200px] bg-muted/30 mt-2"
                    />
                </div>

                <Button className="w-full py-6 text-md font-bold shadow-xl shadow-primary/10 dark:text-white">
                    Send Feedback
                </Button>
            </div>
        </StaticPageLayout>
    );
}
