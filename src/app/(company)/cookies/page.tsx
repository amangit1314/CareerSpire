import Link from "next/link";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Cookie, ArrowRight } from "lucide-react";
import { COOKIES_PAGE_CONTENT } from "@/config/content";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <h1
              className={cn(
                dmSans.className,
                "text-3xl sm:text-4xl font-bold tracking-tight mb-3",
              )}
            >
              {COOKIES_PAGE_CONTENT.TITLE}
            </h1>
            <p className="text-base text-muted-foreground">
              {COOKIES_PAGE_CONTENT.SUBTITLE}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="p-4 rounded-xl border border-border bg-card/50">
              <h3 className={cn(dmSans.className, "font-bold text-sm mb-1")}>
                {COOKIES_PAGE_CONTENT.AUTH_TITLE}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {COOKIES_PAGE_CONTENT.AUTH_DESCRIPTION_PREFIX}
                <code className="text-xs">access_token</code>
                {COOKIES_PAGE_CONTENT.AUTH_DESCRIPTION_MID}
                <code className="text-xs">refresh_token</code>
                {COOKIES_PAGE_CONTENT.AUTH_DESCRIPTION_SUFFIX}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/50">
              <h3 className={cn(dmSans.className, "font-bold text-sm mb-1")}>
                {COOKIES_PAGE_CONTENT.THEME_TITLE}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {COOKIES_PAGE_CONTENT.THEME_DESCRIPTION}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-border/60">
              <h3
                className={cn(
                  dmSans.className,
                  "font-bold text-sm mb-1 text-muted-foreground",
                )}
              >
                {COOKIES_PAGE_CONTENT.NO_TRACKING_TITLE}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {COOKIES_PAGE_CONTENT.NO_TRACKING_DESCRIPTION}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/cookie-policy"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {COOKIES_PAGE_CONTENT.READ_FULL_POLICY}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
