import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { dmSans } from "@/lib/fonts";
import { isUpgrade, getYearlySavings, type Plan } from "@/lib/pricing";
import { SubscriptionTier } from "@/types/enums";
import { ROUTES } from "@/config/routes";
import { PRICING_PAGE_CONTENT } from "@/config/content";

export function PlanCard({
  plan,
  billing,
  userTier,
  isProcessing,
  onBuy,
}: {
  plan: Plan;
  billing: "monthly" | "yearly";
  userTier: SubscriptionTier | null;
  isProcessing: boolean;
  onBuy: () => void;
}) {
  const isCurrentPlan = userTier === plan.tier;
  const canUpgrade = userTier ? isUpgrade(userTier, plan.tier) : false;
  const isFree = plan.monthlyPrice === 0;
  const price =
    billing === "yearly" ? plan.yearlyPricePerMonth : plan.monthlyPrice;
  const yearlySavings = getYearlySavings(plan);

  const isHighlighted = !!plan.highlight;
  const borderColor =
    plan.highlightColor === "green" ? "border-green-500" : "border-primary";
  const badgeBg =
    plan.highlightColor === "green"
      ? "bg-green-500 text-white"
      : "bg-primary text-primary-foreground";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all",
        isHighlighted
          ? `border-2 ${borderColor} shadow-lg`
          : "border-border hover:border-primary/20 hover:shadow-md",
      )}
    >
      {plan.highlight && (
        <div
          className={cn(
            "text-center py-1.5 text-[0.6875rem] font-bold",
            badgeBg,
          )}
        >
          {plan.highlight}
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Name + tagline */}
        <div className="mb-4">
          <h3 className={cn(dmSans.className, "text-lg font-bold")}>
            {plan.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(dmSans.className, "text-3xl sm:text-4xl font-bold")}
            >
              {isFree ? "₹0" : formatPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground">
              {isFree
                ? PRICING_PAGE_CONTENT.PRICE_FOREVER
                : PRICING_PAGE_CONTENT.PRICE_MONTHLY}
            </span>
          </div>
          {!isFree && billing === "yearly" && (
            <p className="text-xs text-muted-foreground mt-1">
              {PRICING_PAGE_CONTENT.BILLED_YEARLY_PREFIX}{" "}
              {formatPrice(plan.yearlyTotal)}/year ·{" "}
              {PRICING_PAGE_CONTENT.BILLED_YEARLY_SAVE}{" "}
              {formatPrice(yearlySavings)}
            </p>
          )}
        </div>

        {/* Key limits */}
        <div className="rounded-lg bg-muted/40 border border-border/60 p-3 mb-5 space-y-1.5">
          <LimitRow
            label={PRICING_PAGE_CONTENT.LIMIT_AI_MOCKS}
            value={plan.mockLabel}
          />
          <LimitRow
            label={PRICING_PAGE_CONTENT.LIMIT_VIDEO_MOCKS}
            value={
              plan.videoMocksPerMonth === 0
                ? "—"
                : `${plan.videoMocksPerMonth}/month`
            }
          />
          <LimitRow
            label={PRICING_PAGE_CONTENT.LIMIT_AI_TUTOR}
            value={
              !Number.isFinite(plan.tutorMsgsPerDay)
                ? PRICING_PAGE_CONTENT.LIMIT_UNLIMITED
                : `${plan.tutorMsgsPerDay} msgs/day`
            }
          />
        </div>

        {/* Features */}
        <div className="space-y-2 flex-1">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2
                className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  f.highlight ? "text-primary" : "text-green-500",
                )}
              />
              <span className={cn("text-xs", f.highlight && "font-semibold")}>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6">
          {isFree && !userTier ? (
            <Button asChild variant="outline" className="w-full cursor-pointer">
              <Link href={ROUTES.SIGNUP}>
                {plan.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : isCurrentPlan ? (
            <Button variant="outline" className="w-full" disabled>
              {PRICING_PAGE_CONTENT.CURRENT_PLAN}
            </Button>
          ) : canUpgrade || !userTier ? (
            <Button
              className={cn(
                "w-full cursor-pointer",
                isHighlighted && "shadow-md",
              )}
              onClick={onBuy}
              disabled={isProcessing || isFree}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {userTier ? plan.ctaLoggedInLabel : plan.ctaLabel}
              {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              {PRICING_PAGE_CONTENT.CURRENT_PLAN}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
