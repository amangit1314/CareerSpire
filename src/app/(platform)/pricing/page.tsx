"use client";

import { useState } from "react";
import Script from "next/script";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  HelpCircle,
  Sparkles,
  Zap,
  Video,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PLANS, MOCK_PACKS, VOICE_PACKS, PRICING_FAQS } from "@/lib/pricing";
import { SubscriptionTier } from "@/types/enums";
import { MESSAGES } from "@/config/messages";
import { PRICING_PAGE_CONTENT } from "@/config/content";
import { PlanCard } from "./_components/PlanCard";
// Window.Razorpay is declared globally in src/types/global.d.ts

const FREE_FEATURES = [
  "Practice Hub",
  "Code Sandbox",
  "Learning Tracks",
  "AI Roadmaps",
  "Community",
  "Daily Challenges",
  "Coins & XP",
  "Leaderboard",
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePurchase = async (
    itemId: string,
    amount: number,
    description: string,
  ) => {
    // Defensive fallback, not expected in production: if the public Razorpay
    // key isn't configured, send unauthenticated users to sign up instead of
    // opening a checkout widget that can't load.
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      window.location.href = `/auth/signup?plan=${itemId}`;
      return;
    }

    setProcessing(itemId);
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId:
            itemId.startsWith("mock_") || itemId.startsWith("voice_")
              ? undefined
              : itemId,
          billing,
          amount,
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "CareerSpire",
        description,
        order_id: data.orderId,
        handler: () => {
          toast.success(MESSAGES.PAYMENT_SUCCESS);
        },
        prefill: { name: user?.name ?? "", email: user?.email ?? "" },
        theme: { color: "#0F172A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        toast.error(res.error.description || MESSAGES.PAYMENT_FAILED_FALLBACK);
      });
      rzp.open();
    } catch {
      toast.error(MESSAGES.GENERIC_ERROR);
    } finally {
      setProcessing(null);
    }
  };

  const userTier = user?.subscriptionTier as SubscriptionTier | null;

  return (
    <div className="min-h-screen bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 section-space-sm">
        {/* ── Header ── */}
        <header className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary mb-4">
            <Sparkles className="h-3 w-3" />
            {PRICING_PAGE_CONTENT.BADGE}
          </span>
          <h1 className="text-display">
            {PRICING_PAGE_CONTENT.TITLE_PREFIX}{" "}
            <span className="text-primary">
              {PRICING_PAGE_CONTENT.TITLE_HIGHLIGHT}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
            {PRICING_PAGE_CONTENT.SUBTITLE}
          </p>
        </header>

        {/* ── Billing Toggle ── */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/30">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                billing === "monthly"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {PRICING_PAGE_CONTENT.BILLING_MONTHLY}
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2",
                billing === "yearly"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {PRICING_PAGE_CONTENT.BILLING_YEARLY}
              <span className="text-[0.625rem] font-bold bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                {PRICING_PAGE_CONTENT.BILLING_YEARLY_SAVE}
              </span>
            </button>
          </div>
        </div>

        {/* ── Plan Cards ── */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto mb-20">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              userTier={userTier}
              isProcessing={processing === plan.id}
              onBuy={() => {
                const amount =
                  billing === "monthly" ? plan.monthlyPrice : plan.yearlyTotal;
                handlePurchase(plan.id, amount, `${plan.name} Plan`);
              }}
            />
          ))}
        </div>

        {/* ── Bento: Free features + Packs + FAQ ── */}
        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Left column — free features + packs */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free features banner */}
            <div className="rounded-xl border border-border bg-gradient-to-r from-primary/[0.04] to-transparent p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <h2 className={"text-body !text-sm font-semibold"}>
                  {PRICING_PAGE_CONTENT.FREE_FEATURES_TITLE}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {FREE_FEATURES.map((f) => (
                  <span
                    key={f}
                    className="text-[0.6875rem] font-medium px-2.5 py-1 rounded-md bg-background/80 border border-border/60 text-foreground/80"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Mock Packs */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h2 className={"text-body !text-sm font-semibold"}>
                    {PRICING_PAGE_CONTENT.MOCK_PACKS_TITLE}
                  </h2>
                </div>
                <span className="text-[0.625rem] text-muted-foreground font-medium">
                  {PRICING_PAGE_CONTENT.MOCK_PACKS_SUBTITLE}
                </span>
              </div>
              <div className="p-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  {MOCK_PACKS.map((pack) => {
                    const isBest = pack.badge === "Best Value";
                    return (
                      <div
                        key={pack.id}
                        className={cn(
                          "group relative rounded-xl p-4 flex flex-col justify-between transition-all",
                          isBest
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "border border-border hover:border-primary/30 hover:shadow-md",
                        )}
                      >
                        {pack.badge && !isBest && (
                          <span className="absolute top-2.5 right-2.5 text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                            {pack.badge}
                          </span>
                        )}
                        {isBest && (
                          <span className="absolute top-2.5 right-2.5 text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full bg-white text-primary">
                            {pack.badge}
                          </span>
                        )}
                        <div>
                          <p
                            className={cn(
                              "text-body !text-sm font-semibold",
                              isBest && "text-white",
                            )}
                          >
                            {pack.label}
                          </p>
                          <p
                            className={cn(
                              "text-heading !text-2xl mt-1",
                              isBest && "text-white",
                            )}
                          >
                            {formatPrice(pack.price)}
                          </p>
                          <p
                            className={cn(
                              "text-[0.625rem] mt-0.5",
                              isBest
                                ? "text-white/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {formatPrice(pack.perMockPrice)}/mock
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className={cn(
                            "w-full mt-4 cursor-pointer text-xs font-semibold transition-colors",
                            isBest
                              ? "bg-white text-primary hover:bg-white/90 shadow-md"
                              : "bg-transparent border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary",
                          )}
                          onClick={() =>
                            handlePurchase(
                              pack.id,
                              pack.price,
                              `${pack.label} Pack`,
                            )
                          }
                          disabled={processing === pack.id}
                        >
                          {processing === pack.id && (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {PRICING_PAGE_CONTENT.MOCK_PACKS_BUY}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Voice Packs */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-rose-500" />
                  <h2 className={"text-body !text-sm font-semibold"}>
                    {PRICING_PAGE_CONTENT.VOICE_PACKS_TITLE}
                  </h2>
                </div>
                <span className="text-[0.625rem] text-muted-foreground font-medium">
                  {PRICING_PAGE_CONTENT.VOICE_PACKS_SUBTITLE}
                </span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {VOICE_PACKS.map((pack) => {
                    const isBest = pack.badge === "Best Value";
                    return (
                      <div
                        key={pack.id}
                        className={cn(
                          "group relative rounded-xl p-3.5 flex flex-col justify-between transition-all",
                          isBest
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "border border-border hover:border-primary/30 hover:shadow-md",
                        )}
                      >
                        {pack.badge && !isBest && (
                          <span className="absolute top-2 right-2 text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                            {pack.badge}
                          </span>
                        )}
                        {isBest && (
                          <span className="absolute top-2 right-2 text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full bg-white text-primary">
                            {pack.badge}
                          </span>
                        )}
                        <div>
                          <p
                            className={cn(
                              "text-body !text-xs font-semibold",
                              isBest && "text-white",
                            )}
                          >
                            {pack.label}
                          </p>
                          <p
                            className={cn(
                              "text-heading !text-lg mt-1",
                              isBest && "text-white",
                            )}
                          >
                            {formatPrice(pack.price)}
                          </p>
                          <p
                            className={cn(
                              "text-[0.5625rem] mt-0.5",
                              isBest
                                ? "text-white/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {formatPrice(pack.perSessionPrice)}/session
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className={cn(
                            "w-full mt-3 cursor-pointer text-[0.6875rem] font-semibold transition-colors",
                            isBest
                              ? "bg-white text-primary hover:bg-white/90 shadow-md"
                              : "bg-transparent border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary",
                          )}
                          onClick={() =>
                            handlePurchase(
                              pack.id,
                              pack.price,
                              `${pack.label} Voice Pack`,
                            )
                          }
                          disabled={processing === pack.id}
                        >
                          {processing === pack.id && (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {PRICING_PAGE_CONTENT.VOICE_PACKS_BUY}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right column — FAQ */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <h2 className={"text-body !text-sm font-semibold"}>
                  {PRICING_PAGE_CONTENT.FAQ_TITLE}
                </h2>
              </div>
              <div className="px-5 py-1">
                <Accordion type="single" collapsible className="w-full">
                  {PRICING_FAQS.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className={
                        i === PRICING_FAQS.length - 1 ? "border-b-0" : ""
                      }
                    >
                      <AccordionTrigger className="text-left text-xs font-semibold py-3.5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
