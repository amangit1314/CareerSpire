import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { CareerSpireLogo } from "@/components/CareerSpireLogo";
import { PRESS_KIT_PAGE_CONTENT } from "@/config/content";

export default function PressKitPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <header className="mb-12">
            <h1
              className={cn(
                dmSans.className,
                "text-3xl sm:text-4xl font-bold tracking-tight mb-3",
              )}
            >
              {PRESS_KIT_PAGE_CONTENT.TITLE}
            </h1>
            <p className="text-base text-muted-foreground">
              {PRESS_KIT_PAGE_CONTENT.SUBTITLE}
            </p>
          </header>

          {/* About */}
          <section className="mb-10">
            <h2 className={cn(dmSans.className, "text-lg font-bold mb-3")}>
              {PRESS_KIT_PAGE_CONTENT.ABOUT_TITLE}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {PRESS_KIT_PAGE_CONTENT.ABOUT_BODY}
            </p>
            <div className="p-5 rounded-xl border border-border bg-card/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">
                {PRESS_KIT_PAGE_CONTENT.QUICK_FACTS_TITLE}
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                <span className="text-muted-foreground">Launched</span>
                <span className="font-medium">January 2026</span>
                <span className="text-muted-foreground">Headquarters</span>
                <span className="font-medium">India (Remote-First)</span>
                <span className="text-muted-foreground">Languages</span>
                <span className="font-medium">JavaScript, Python, Java</span>
                <span className="text-muted-foreground">AI Providers</span>
                <span className="font-medium">
                  Groq (Llama 3.3), Google Gemini
                </span>
                <span className="text-muted-foreground">Payments</span>
                <span className="font-medium">Razorpay (INR)</span>
                <span className="text-muted-foreground">Pricing</span>
                <span className="font-medium">
                  Free tier + &#8377;499&ndash;&#8377;999/mo
                </span>
              </div>
            </div>
          </section>

          {/* Logo */}
          <section className="mb-10">
            <h2 className={cn(dmSans.className, "text-lg font-bold mb-3")}>
              {PRESS_KIT_PAGE_CONTENT.BRAND_TITLE}
            </h2>
            <div className="p-6 rounded-xl border border-border bg-card/50 flex flex-col items-center gap-6">
              <div className="flex items-center gap-8">
                <div className="p-4 rounded-xl bg-background border border-border">
                  <CareerSpireLogo size="xl" showText={false} />
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <CareerSpireLogo size="lg" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {PRESS_KIT_PAGE_CONTENT.BRAND_DESCRIPTION_PREFIX}{" "}
                <code className="text-xs">oklch(0.66 0.22 262)</code>
              </p>
            </div>
          </section>

          {/* Key features */}
          <section>
            <h2 className={cn(dmSans.className, "text-lg font-bold mb-3")}>
              {PRESS_KIT_PAGE_CONTENT.KEY_FEATURES_TITLE}
            </h2>
            <div className="space-y-2">
              {[
                "AI mock interviews with real-time code execution, scoring, and detailed feedback.",
                "DSA Practice Hub with 100+ problems, in-browser editor, and instant test results.",
                "Adaptive AI Tutor powered by Groq and Gemini with Socratic questioning.",
                "Video mock interviews with recording, playback, and community sharing.",
                "Gamification: XP, coins, daily streaks, badges, and leaderboards.",
                "Pay-as-you-go pricing designed for Indian college students (starts at ₹0).",
              ].map((feature) => (
                <div
                  key={feature}
                  className="p-3 rounded-lg border border-border/60 text-sm text-muted-foreground"
                >
                  {feature}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
