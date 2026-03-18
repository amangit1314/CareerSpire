import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RequestFeaturePage() {
    return (
        <StaticPageLayout
            title="Request a Feature"
            subtitle="Have an idea that would make CareerSpire even better? We're listening."
        >
            <div className="p-8 md:p-12 rounded-3xl glass border border-primary/10 space-y-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Feature Title</label>
                    <Input placeholder="E.g., Support for Rust programming language" className="bg-muted/30" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What problem does this solve?</label>
                    <Textarea
                        placeholder="Describe the problem or use case..."
                        className="min-h-[100px] bg-muted/30"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Desired Solution</label>
                    <Textarea
                        placeholder="How would you like this feature to work?"
                        className="min-h-[150px] bg-muted/30"
                    />
                </div>

                <Button className="w-full py-6 text-lg font-bold shadow-xl shadow-primary/10">
                    Submit Feature Request
                </Button>
            </div>
        </StaticPageLayout>
    );
}
