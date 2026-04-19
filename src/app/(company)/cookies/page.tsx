import Link from "next/link";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Cookie, ArrowRight } from "lucide-react";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                            <Cookie className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className={cn(dmSans.className, "text-3xl sm:text-4xl font-bold tracking-tight mb-3")}>
                            Cookies &amp; Tracking
                        </h1>
                        <p className="text-base text-muted-foreground">
                            We use cookies to keep you logged in, not to track you around the web.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="p-4 rounded-xl border border-border bg-card/50">
                            <h3 className={cn(dmSans.className, "font-bold text-sm mb-1")}>Authentication (Essential)</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Two HTTP-only cookies (<code className="text-xs">access_token</code> and <code className="text-xs">refresh_token</code>) keep you signed in securely. These cannot be read by JavaScript.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-card/50">
                            <h3 className={cn(dmSans.className, "font-bold text-sm mb-1")}>Theme Preference</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Remembers your light/dark mode choice via localStorage. First-party only.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-dashed border-border/60">
                            <h3 className={cn(dmSans.className, "font-bold text-sm mb-1 text-muted-foreground")}>No Tracking Cookies</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                No Google Analytics, no Facebook Pixel, no advertising scripts. Zero cross-site tracking.
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/cookie-policy"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Read the full Cookie Policy
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
