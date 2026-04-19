'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Mic, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  PLANS,
  MOCK_PACKS,
  VOICE_PACKS,
  PRICING_FAQS,
  formatPrice,
  isUpgrade,
  type Plan,
  type MockPack,
  type VoicePack,
} from '@/lib/pricing';
import { SubscriptionTier } from '@/types/enums';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePurchase = async (
    itemId: string,
    amount: number,
    description: string
  ) => {
    setProcessing(itemId);
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: itemId.startsWith('mock_') || itemId.startsWith('voice_')
            ? undefined
            : itemId,
          billing,
          amount,
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'CareerSpire',
        description,
        order_id: data.orderId,
        handler: () => {
          toast.success('Payment successful!');
        },
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
        },
        theme: { color: '#0F172A' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res: any) => {
        toast.error(res.error.description || 'Payment failed');
      });
      rzp.open();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const userTier = user?.subscriptionTier as SubscriptionTier | null;

  return (
    <div className="container mx-auto px-4 py-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Header */}
      <header className="text-center mb-14">
        <h1 className={cn(dmSans.className, 'text-4xl font-bold')}>
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Choose the plan that fits your interview prep journey. Upgrade, downgrade, or pay-as-you-go anytime.
        </p>
      </header>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg border bg-background shadow-sm">
          <Button
            variant={billing === 'monthly' ? 'default' : 'ghost'}
            className="px-4 cursor-pointer"
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billing === 'yearly' ? 'default' : 'ghost'}
            className="px-4 cursor-pointer relative"
            onClick={() => setBilling('yearly')}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Save 20%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            userTier={userTier}
            isProcessing={processing === plan.id}
            onBuy={() => {
              const amount =
                billing === 'monthly' ? plan.monthlyPrice : plan.yearlyTotal;
              handlePurchase(plan.id, amount, `${plan.name} Plan`);
            }}
          />
        ))}
      </div>

      {/* PAYG Section */}
      <section className="mt-20">
        <div className="text-center mb-8">
          <h2 className={cn(dmSans.className, 'text-2xl font-bold')}>
            Need fewer mocks? Pay as you go
          </h2>
          <p className="text-muted-foreground mt-1">
            Buy individual mock packs — no subscription required
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {MOCK_PACKS.map((pack) => (
            <PackCard
              key={pack.id}
              price={pack.price}
              label={pack.label}
              subtitle={`${formatPrice(pack.price)} for ${pack.mocks} mock${pack.mocks > 1 ? 's' : ''}`}
              badge={pack.badge}
              ctaLabel="Buy Mocks"
              isProcessing={processing === pack.id}
              onBuy={() =>
                handlePurchase(pack.id, pack.price, `${pack.label} Pack`)
              }
            />
          ))}
        </div>
      </section>

      {/* Voice Section */}
      <section className="mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Mic className="h-5 w-5 text-primary" />
            <Badge variant="outline">Purchased separately</Badge>
          </div>
          <h2 className={cn(dmSans.className, 'text-2xl font-bold')}>
            Voice Interviews — feel the real thing
          </h2>
          <p className="text-muted-foreground mt-1">
            Practice with AI-powered voice interviews. Not included in any plan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {VOICE_PACKS.map((pack) => (
            <PackCard
              key={pack.id}
              price={pack.price}
              label={pack.label}
              subtitle={`${pack.sessions} voice session${pack.sessions > 1 ? 's' : ''}`}
              badge={pack.badge}
              ctaLabel="Buy Sessions"
              isProcessing={processing === pack.id}
              onBuy={() =>
                handlePurchase(pack.id, pack.price, `${pack.label} Voice Pack`)
              }
            />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className={cn(dmSans.className, 'text-2xl font-bold')}>
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {PRICING_FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  billing,
  userTier,
  isProcessing,
  onBuy,
}: {
  plan: Plan;
  billing: 'monthly' | 'yearly';
  userTier: SubscriptionTier | null;
  isProcessing: boolean;
  onBuy: () => void;
}) {
  const isCurrentPlan = userTier === plan.tier;
  const canUpgrade = userTier ? isUpgrade(userTier, plan.tier) : false;
  const isFree = plan.monthlyPrice === 0;

  const price =
    billing === 'yearly' ? plan.yearlyPricePerMonth : plan.monthlyPrice;

  const borderColor =
    plan.highlightColor === 'green' ? 'border-green-600' : 'border-primary';
  const badgeBg =
    plan.highlightColor === 'green' ? 'bg-green-600' : 'bg-primary';

  return (
    <Card
      className={cn(
        'relative flex flex-col hover:shadow-lg hover:-translate-y-1 transition',
        plan.highlight && `border-2 ${borderColor}`
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              badgeBg,
              'text-white px-4 py-1 rounded-full text-sm font-semibold'
            )}
          >
            {plan.highlight}
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className={cn(dmSans.className, 'text-xl mb-1')}>
          {plan.name}
        </CardTitle>
        <CardDescription className="text-sm">{plan.tagline}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="text-center mb-4">
          <span className={cn(dmSans.className, 'text-4xl font-bold')}>
            {isFree ? '\u20B90' : formatPrice(price)}
          </span>
          {!isFree && (
            <span className="text-muted-foreground ml-1">/month</span>
          )}
          {!isFree && billing === 'yearly' && (
            <p className="text-muted-foreground text-xs mt-1">
              billed {formatPrice(plan.yearlyTotal)}/year
            </p>
          )}
          {isFree && (
            <span className="text-muted-foreground ml-1">/forever</span>
          )}
        </div>

        {/* Mocks & Learning Paths summary */}
        <div className="flex justify-between text-sm mb-4 px-2 py-2 rounded-md bg-muted/50">
          <span>{plan.mockLabel}</span>
          <span>{plan.learningPathsPerMonth} path{plan.learningPathsPerMonth > 1 ? 's' : ''}/mo</span>
        </div>

        <div className="space-y-2 flex-1">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isFree && !userTier ? (
          <Button asChild variant="outline" className="w-full mt-6 cursor-pointer">
            <Link href="/auth/signup">{plan.ctaLabel}</Link>
          </Button>
        ) : isCurrentPlan ? (
          <Button variant="outline" className="w-full mt-6" disabled>
            Current Plan
          </Button>
        ) : canUpgrade || !userTier ? (
          <Button
            className="w-full mt-6 cursor-pointer"
            onClick={onBuy}
            disabled={isProcessing || isFree}
          >
            {isProcessing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {userTier ? plan.ctaLoggedInLabel : plan.ctaLabel}
          </Button>
        ) : (
          <Button variant="outline" className="w-full mt-6" disabled>
            Current Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Pack Card (PAYG / Voice) ────────────────────────────────────────────────

function PackCard({
  price,
  label,
  subtitle,
  badge,
  ctaLabel,
  isProcessing,
  onBuy,
}: {
  price: number;
  label: string;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  isProcessing: boolean;
  onBuy: () => void;
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
        <p className={cn(dmSans.className, 'text-2xl font-bold mt-1')}>
          {formatPrice(price)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Button
        className="w-full mt-4 cursor-pointer"
        onClick={onBuy}
        disabled={isProcessing}
      >
        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {ctaLabel}
      </Button>
    </Card>
  );
}
