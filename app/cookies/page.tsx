import { Card, CardContent } from "@/components/ui/card";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center py-20 px-4">
            <Card className="glass border-primary/20 max-w-3xl w-full">
                <CardContent className="p-8 md:p-12 space-y-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Cookie className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h1 className={cn(dmSans.className, "text-4xl font-bold tracking-tight")}>
                            Cookies & Tracking
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We use cookies to make your experience better, not to track you around the web.
                        </p>
                    </div>

                    <div className="prose prose-neutral dark:prose-invert max-w-none text-left bg-muted/30 p-6 rounded-xl">
                        <p>
                            <strong>Essential Cookies:</strong> Required for you to log in and save your progress.
                        </p>
                        <p>
                            <strong>Analytics Cookies:</strong> Help us understand how people use the site so we can improve it. All data is anonymized.
                        </p>
                        <p className="text-sm text-muted-foreground pt-4">
                            We do not use advertising cookies or share your browsing history with marketers.
                        </p>
                    </div>

                    <div className="pt-4">
                        <a href="/cookie-policy" className="text-primary hover:underline font-medium">
                            View detailed Cookie Policy &rarr;
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
