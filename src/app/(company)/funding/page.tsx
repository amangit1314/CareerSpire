import Link from "next/link";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Rocket, Users, Heart } from "lucide-react";

export default function FundingPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className={cn(dmSans.className, "text-3xl sm:text-4xl font-bold tracking-tight mb-3")}>
                            Funding &amp; Investment
                        </h1>
                        <p className="text-base text-muted-foreground max-w-xl mx-auto">
                            Our journey to make quality interview preparation accessible to every engineering student in India.
                        </p>
                    </header>

                    <div className="grid sm:grid-cols-3 gap-4 mb-14">
                        {[
                            { icon: Rocket, title: "Bootstrapped", desc: "Built independently with a focus on sustainable unit economics from day one." },
                            { icon: Users, title: "Community-Led", desc: "Growing through word-of-mouth. Every feature is shaped by real student feedback." },
                            { icon: Heart, title: "Mission-Driven", desc: "Affordable prep for college students and early-career engineers preparing for placements." },
                        ].map((item) => (
                            <div key={item.title} className="p-5 rounded-xl border border-border bg-card/50 space-y-3 text-center">
                                <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                                    <item.icon className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <h3 className={cn(dmSans.className, "font-bold text-sm")}>{item.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 text-center">
                        <h2 className={cn(dmSans.className, "text-xl font-bold")}>Our Mission</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                            Most students walk into placement season underprepared &mdash; not because they lack talent, but because structured, affordable practice doesn&apos;t exist. CareerSpire changes that with AI-powered mocks starting at &#8377;0, a full DSA practice hub, and an AI tutor available 24/7.
                        </p>
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            We&apos;re open to strategic partnerships and investment that align with our mission of accessible, high-quality interview prep.
                        </p>
                        <div className="pt-2">
                            <a
                                href="mailto:gitaman8481@gmail.com"
                                className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                            >
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
