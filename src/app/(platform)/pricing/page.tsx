"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dmSans } from "@/lib/fonts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (planId: string, amount: number, description: string) => {
    setIsProcessing(planId);

    try {
      // 1. Create Order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId.startsWith('credit') ? undefined : planId,
          billing,
          amount, // Only used if planId is missing (credits) or for verification
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const data = await response.json();

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S2vPYjo6eRIEKI', // Fallback for dev
        amount: data.amount,
        currency: data.currency,
        name: "Mocky AI",
        description: description,
        order_id: data.orderId,
        handler: function (response: any) {
          toast.success("Payment Successful!");
          // Verify payment on backend normally, here we just show success
          // router.push('/dashboard');
        },
        prefill: {
          name: "", // We could prefill if we have user context
          email: "",
        },
        theme: {
          color: "#0F172A",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp1.open();

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <header className="text-center mb-14">
        <h1 className={`${dmSans.className} text-4xl font-bold`}>Pricing</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Stop failing silently. Become job-ready for your first tech role.
        </p>
      </header>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center space-x-1 p-1 rounded-lg border bg-background shadow-sm">
          <Button
            variant={billing === "monthly" ? "default" : "ghost"}
            className="px-4 dark:text-white cursor-pointer"
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billing === "yearly" ? "default" : "ghost"}
            className="px-4 dark:text-white cursor-pointer"
            onClick={() => setBilling("yearly")}
          >
            Yearly
          </Button>
        </div>
      </div>

      {billing === "yearly" && (
        <div className="text-center text-sm text-muted-foreground mb-8">
          <p>Renews yearly until placed — then ends automatically.</p>
          <p className="font-semibold mt-1">Effective price: ₹449/month</p>
        </div>
      )}

      {/* PLAN GRID */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PlanCard
          title="Free"
          tagline="Test the platform"
          price="₹0"
          suffix="/forever"
          features={[
            "2 mock interviews",
            // "1 learning resource",
            "Readiness score",
            "Interview roadmap",
            "No expiry"
          ]}
          button={{ label: "Get Started", href: "/auth/signup", variant: "outline" }}
        />

        <PlanCard
          highlight="Most Popular"
          title="Skills Plan"
          tagline="Master interviews with structured practice"
          price={billing === "monthly" ? "₹499/month" : "₹449/month"}
          yearlyHint={billing === "yearly" ? "billed yearly" : undefined}
          features={[
            "15 mocks/month (fair use)",
            // "30 learning resources",
            "Resume review",
            "Progress insights",
            "Roadmaps included"
          ]}
          button={{ label: "Choose Skills Plan", variant: "default" }}
          onBuy={() => handlePurchase('skills', billing === 'monthly' ? 499 : 5388, 'Skills Plan Subscription')}
          isLoading={isProcessing === 'skills'}
        />

        <PlanCard
          highlight="Placement Focused"
          highlightColor="bg-green-600"
          title="Accelerator"
          tagline="Designed to get you placed in product companies"
          price={billing === "monthly" ? "₹999/month" : "₹449/month"}
          yearlyHint={billing === "yearly" ? "billed yearly" : undefined}
          features={[
            "30 mocks/month (fair use)",
            // "60 learning resources",
            "Resume + LinkedIn optimization",
            "Recruiter outreach templates",
            "Interview tracker",
            "Ends when placed",
            "Free extension if not placed in 6 months*"
          ]}
          button={{ label: "Join Accelerator", variant: "default" }}
          onBuy={() => handlePurchase('accelerator', billing === 'monthly' ? 999 : 5388, 'Accelerator Plan Subscription')}
          isLoading={isProcessing === 'accelerator'}
        />
      </div>

      {/* PAY-AS-YOU-GO SECTION */}
      <div className="text-center mt-16 mb-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">or</div>
        <h3 className="mt-2 text-lg font-semibold">Pay-as-you-go</h3>
        <p className="text-sm text-muted-foreground">Perfect for testing or one-off mocks</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <CreditOption
          price="₹99"
          label="1 Mock"
          subtitle="Good for quick practice"
          onBuy={() => handlePurchase('credit_1', 99, '1 Mock Credit')}
          isLoading={isProcessing === 'credit_1'}
        />
        <CreditOption
          price="₹299"
          label="5 Mocks"
          subtitle="Best value (save 40%)"
          badge="Popular"
          onBuy={() => handlePurchase('credit_5', 299, '5 Mock Credits')}
          isLoading={isProcessing === 'credit_5'}
        />
        <CreditOption
          price="₹499"
          label="10 Mocks"
          subtitle="Best value (save 50%)"
          badge="Best Value"
          onBuy={() => handlePurchase('credit_10', 499, '10 Mock Credits')}
          isLoading={isProcessing === 'credit_10'}
        />
      </div>

      {/* small bootcamp conversion footer */}
      <p className="text-center text-xs text-muted-foreground mt-10 max-w-md mx-auto">
        *Placement guarantee: If not placed within 6 months after completing milestones, we extend Accelerator for free until you get placed.
      </p>
    </div>
  );
}

function PlanCard({
  title,
  tagline,
  price,
  suffix,
  yearlyHint,
  features,
  button,
  highlight,
  highlightColor = "bg-primary",
  onBuy,
  isLoading
}: any) {
  return (
    <Card
      // className={`relative flex flex-col hover:shadow-lg hover:-translate-y-1 transition ${highlight ? "border-2 border-primary" : ""} `}
      className={cn(
        "relative flex flex-col hover:shadow-lg hover:-translate-y-1 transition",
        highlight && `border-2 ${highlightColor.replace("bg", "border")}`
      )}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className={`${highlightColor} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
            {highlight}
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className={`${dmSans.className} text-xl mb-1`}>{title}</CardTitle>
        <CardDescription className="text-sm">{tagline}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="text-center mb-4">
          <span className={`${dmSans.className} text-4xl font-bold`}>{price}</span>
          {suffix && <span className="text-muted-foreground ml-1">{suffix}</span>}
          {yearlyHint && <p className="text-muted-foreground text-xs mt-1">{yearlyHint}</p>}
        </div>

        <div className="space-y-2 flex-1">
          {features.map((f: string, i: number) => (
            <Feature key={i} text={f} />
          ))}
        </div>

        {onBuy ? (
          <Button variant={button.variant} className="w-full mt-6 dark:text-white cursor-pointer" onClick={onBuy} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {button.label}
          </Button>
        ) : (
          <Button asChild variant={button.variant} className="w-full mt-6 dark:text-white cursor-pointer">
            <Link href={button.href}>{button.label}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function CreditOption({
  price,
  label,
  subtitle,
  badge,
  onBuy,
  isLoading
}: {
  price: string;
  label: string;
  subtitle: string;
  badge?: string;
  onBuy?: () => void;
  isLoading?: boolean;
}) {
  return (
    <Card className="p-4 flex flex-col justify-between hover:shadow-md transition relative">
      {badge && (
        <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div>
        <p className="text-lg font-semibold">{label}</p>
        <p className="text-2xl font-bold mt-1">{price}</p>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Button className="w-full mt-4 dark:text-white cursor-pointer" onClick={onBuy} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Buy Credits
      </Button>
    </Card>
  );
}
