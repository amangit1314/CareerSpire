import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReportIssuePage() {
    return (
        <StaticPageLayout
            title="Report an Issue"
            subtitle="Found a bug? Let us know and we'll squash it as soon as possible."
        >
            <div className="p-8 md:p-12 rounded-3xl glass border border-primary/10 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                        <Input placeholder="Your name" className="bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                        <Input placeholder="Your email" className="bg-muted/30" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Issue Type</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>Bug</option>
                        <option>Performance Issue</option>
                        <option>Typos/UI Glitch</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                    <Textarea
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[150px] bg-muted/30"
                    />
                </div>

                <Button className="w-full py-6 text-md font-bold shadow-xl shadow-primary/10 dark:text-white">
                    Submit Report
                </Button>
            </div>
        </StaticPageLayout>
    );
}
