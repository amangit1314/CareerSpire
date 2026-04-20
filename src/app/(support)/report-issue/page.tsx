import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReportIssuePage() {
    return (
        <StaticPageLayout
            title="Report an Issue"
            subtitle="Found a bug in the code editor, mock interviews, or anywhere else? Let us know."
        >
            <div className="p-6 sm:p-8 rounded-xl border border-border bg-card/50 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Name</label>
                        <Input placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Email</label>
                        <Input placeholder="Your email" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Area</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option>Mock Interview (Text)</option>
                        <option>Mock Interview (Video)</option>
                        <option>Practice Hub / Code Editor</option>
                        <option>AI Tutor Chat</option>
                        <option>Learning Tracks / Resources</option>
                        <option>Billing / Payments</option>
                        <option>Authentication / Account</option>
                        <option>Community / Sharing</option>
                        <option>UI / Display Issue</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Description</label>
                    <Textarea
                        placeholder="What happened? What did you expect? Include the browser you're using and any error messages you saw."
                        className="min-h-[140px]"
                    />
                </div>

                <Button className="w-full font-semibold">
                    Submit Report
                </Button>

                <p className="text-[0.6875rem] text-muted-foreground text-center">
                    You can also email us directly at <a href="mailto:gitaman8481@gmail.com" className="text-primary font-medium">gitaman8481@gmail.com</a>.
                </p>
            </div>
        </StaticPageLayout>
    );
}
