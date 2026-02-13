import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PressKitPage() {
    return (
        <StaticPageLayout
            title="Press Kit"
            subtitle="Everything you need to talk about Mocky, from logos to brand guidelines."
        >
            <div className="grid md:grid-cols-2 gap-12">
                <section className="space-y-6">
                    <h2>About Mocky</h2>
                    <p>
                        Mocky is the next-generation AI-powered mock interview platform. We help software engineers bridge the gap between their technical skills and interview performance.
                    </p>
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-muted-foreground">Quick Facts</h4>
                        <ul className="space-y-2 text-sm font-medium">
                            <li>Founded: 2025</li>
                            <li>Headquarters: Remote-First</li>
                            <li>Platform: AI & Career Success</li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2>Brand Assets</h2>
                    <div className="p-8 rounded-3xl glass border border-primary/10 text-center space-y-4">
                        <div className="h-24 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-2xl">
                            <span className="font-bold text-2xl uppercase tracking-[0.2em]">Mocky</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Full Logo Pack (PNG, SVG, AI)</p>
                        <Button className="w-full dark:text-white">
                            <Download className="mr-2 h-4 w-4" />
                            Download Logo Pack
                        </Button>
                    </div>
                </section>
            </div>

            <section className="mt-16">
                <h2>Recent Coverage</h2>
                <div className="p-6 rounded-2xl border border-dashed border-border italic text-muted-foreground text-center">
                    "The most realistic AI interviewer I've seen in years." — TechCrunch (Mock Quote)
                </div>
            </section>
        </StaticPageLayout>
    );
}
