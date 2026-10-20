"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { apiManager } from "@/lib/api-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown,
  CreditCard,
  Mic,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { dmSans } from "@/lib/fonts";
import { toast } from "sonner";
import {
  PLANS,
  MOCK_PACKS,
  VOICE_PACKS,
  getPlanByTier,
  isUpgrade,
} from "@/lib/pricing";
import { SubscriptionTier, PaymentStatus } from "@/types/enums";
import type { BillingData } from "@/app/actions/billing.actions";
import { ROUTES } from "@/config/routes";
import { BILLING_CONTENT } from "@/config/content";
import { MESSAGES, BILLING_MESSAGES } from "@/config/messages";
// Window.Razorpay is declared globally in src/types/global.d.ts

export default function BillingPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }
    fetchBilling();
  }, [authLoading, isAuthenticated, router]);

  const fetchBilling = async () => {
    try {
      const res = await apiManager.get<BillingData>("/billing");
      if (res.data) setBilling(res.data);
    } catch {
      toast.error(BILLING_MESSAGES.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (
    itemId: string,
    amount: number,
    description: string,
  ) => {
    setProcessing(itemId);
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error(BILLING_MESSAGES.ORDER_CREATE_FAILED);
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
          fetchBilling();
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

  if (authLoading || loading) return <BillingSkeleton />;

  if (!billing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        {BILLING_MESSAGES.LOAD_FAILED_FULL_PAGE}
      </div>
    );
  }

  const currentPlan = getPlanByTier(billing.plan);
  const usagePercent =
    billing.mocksTotal > 0
      ? Math.round((billing.mocksRemaining / billing.mocksTotal) * 100)
      : 0;
  const mocksUsed = billing.mocksTotal - billing.mocksRemaining;
  const isFreePlan = billing.plan === SubscriptionTier.FREE;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="mb-8">
        <h1 className={cn(dmSans.className, "text-3xl font-bold mb-2")}>
          {BILLING_CONTENT.TITLE}
        </h1>
        <p className="text-muted-foreground">{BILLING_CONTENT.SUBTITLE}</p>
      </div>

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className={dmSans.className}>
                {currentPlan.name} {BILLING_CONTENT.PLAN_SUFFIX}
              </CardTitle>
              <CardDescription>
                {billing.planActive ? (
                  <Badge
                    variant="secondary"
                    className="mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    {BILLING_CONTENT.STATUS_ACTIVE}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">
                    {BILLING_CONTENT.STATUS_EXPIRED}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          {!isFreePlan && billing.planExpiresAt && (
            <p className="text-sm text-muted-foreground">
              {BILLING_CONTENT.RENEWS_PREFIX}{" "}
              {new Date(billing.planExpiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {BILLING_CONTENT.USAGE_LABEL}
              </span>
              <span className="font-medium">
                {mocksUsed}/{billing.mocksTotal}
              </span>
            </div>
            <Progress
              value={
                billing.mocksTotal > 0
                  ? (mocksUsed / billing.mocksTotal) * 100
                  : 0
              }
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {BILLING_CONTENT.MOCKS_REMAINING(billing.mocksRemaining)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {billing.plan !== SubscriptionTier.PRO && (
              <Button asChild>
                <Link href={ROUTES.PRICING}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {BILLING_CONTENT.UPGRADE_PLAN}
                </Link>
              </Button>
            )}
            {!isFreePlan && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowCancelConfirm(true)}
              >
                {BILLING_CONTENT.CANCEL_PLAN}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">
                  {BILLING_CONTENT.CANCEL_CONFIRM_TITLE(currentPlan.name)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {BILLING_CONTENT.CANCEL_CONFIRM_BODY}
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      toast.info(BILLING_MESSAGES.CANCELLATION_SUBMITTED);
                      setShowCancelConfirm(false);
                    }}
                  >
                    {BILLING_CONTENT.CANCEL_CONFIRM_ACTION}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    {BILLING_CONTENT.CANCEL_KEEP_ACTION}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buy Mock Packs */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className={dmSans.className}>
              {BILLING_CONTENT.MOCK_PACKS_TITLE}
            </CardTitle>
          </div>
          <CardDescription>
            {BILLING_CONTENT.MOCK_PACKS_SUBTITLE}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {MOCK_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="flex flex-col justify-between border rounded-lg p-4 hover:shadow-sm transition relative"
              >
                {pack.badge && (
                  <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    {pack.badge}
                  </span>
                )}
                <div>
                  <p className="font-semibold">{pack.label}</p>
                  <p className={cn(dmSans.className, "text-xl font-bold mt-1")}>
                    {formatPrice(pack.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 cursor-pointer"
                  disabled={processing === pack.id}
                  onClick={() =>
                    handlePurchase(
                      pack.id,
                      pack.price,
                      `${pack.label} ${BILLING_CONTENT.MOCK_PACK_SUFFIX}`,
                    )
                  }
                >
                  {processing === pack.id && (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  )}
                  Buy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buy Voice Packs */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <CardTitle className={dmSans.className}>
              {BILLING_CONTENT.VOICE_PACKS_TITLE}
            </CardTitle>
          </div>
          <CardDescription>
            {BILLING_CONTENT.VOICE_PACKS_SUBTITLE}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {VOICE_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="flex flex-col justify-between border rounded-lg p-4 hover:shadow-sm transition relative"
              >
                {pack.badge && (
                  <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    {pack.badge}
                  </span>
                )}
                <div>
                  <p className="font-semibold">{pack.label}</p>
                  <p className={cn(dmSans.className, "text-xl font-bold mt-1")}>
                    {formatPrice(pack.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 cursor-pointer"
                  disabled={processing === pack.id}
                  onClick={() =>
                    handlePurchase(
                      pack.id,
                      pack.price,
                      `${pack.label} ${BILLING_CONTENT.VOICE_PACK_SUFFIX}`,
                    )
                  }
                >
                  {processing === pack.id && (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  )}
                  Buy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className={dmSans.className}>
            {BILLING_CONTENT.PAYMENT_HISTORY_TITLE}
          </CardTitle>
          <CardDescription>
            {BILLING_CONTENT.PAYMENT_HISTORY_SUBTITLE}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billing.payments.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              {BILLING_CONTENT.NO_PAYMENTS}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      {BILLING_CONTENT.TABLE_DATE}
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      {BILLING_CONTENT.TABLE_DESCRIPTION}
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      {BILLING_CONTENT.TABLE_AMOUNT}
                    </th>
                    <th className="py-3 font-medium text-muted-foreground">
                      {BILLING_CONTENT.TABLE_STATUS}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billing.payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {payment.subscriptionTier
                          ? `${getPlanByTier(payment.subscriptionTier).name} ${BILLING_CONTENT.PLAN_SUFFIX}`
                          : BILLING_CONTENT.MOCK_PACK_ROW_LABEL}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {formatPrice(payment.amount / 100)}
                      </td>
                      <td className="py-3">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        >
          {BILLING_CONTENT.PAYMENT_STATUS_COMPLETED}
        </Badge>
      );
    case PaymentStatus.PENDING:
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
        >
          {BILLING_CONTENT.PAYMENT_STATUS_PENDING}
        </Badge>
      );
    case PaymentStatus.FAILED:
      return (
        <Badge variant="destructive">
          {BILLING_CONTENT.PAYMENT_STATUS_FAILED}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function BillingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
