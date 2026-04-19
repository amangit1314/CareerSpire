import Link from "next/link";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Shield, Lock, Eye, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className={cn(dmSans.className, "text-3xl sm:text-4xl font-bold tracking-tight mb-3")}>
                        Privacy at CareerSpire
                    </h1>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto">
                        Your trust is our most valuable asset. Here&apos;s how we protect your data.
                    </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
                    {[
                        { icon: Shield, title: "Secure by Design", desc: "Bcrypt-hashed passwords, HTTP-only JWT cookies, and rate-limited auth endpoints." },
                        { icon: Lock, title: "You Own Your Data", desc: "We never sell your information. Delete your account anytime and all data is wiped." },
                        { icon: Eye, title: "No Tracking", desc: "No advertising cookies, no third-party analytics pixels, no cross-site tracking." },
                    ].map((item) => (
                        <div key={item.title} className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
                            <item.icon className="h-5 w-5 text-primary" />
                            <h3 className={cn(dmSans.className, "font-bold text-sm")}>{item.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/privacy-policy"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        Read the full Privacy Policy
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
