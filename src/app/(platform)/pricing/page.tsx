'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    CheckCircle2,
    Loader2,
    Mic,
    HelpCircle,
    Sparkles,
    ArrowRight,
    Zap,
    Video,
} from 'lucide-react';
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
    getYearlySavings,
    type Plan,
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
        description: string,
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
                handler: () => { toast.success('Payment successful!'); },
                prefill: { name: user?.name ?? '', email: user?.email ?? '' },
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
        <div className="min-h-screen bg-background">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-12 sm:py-16">

                {/* ── Header ── */}
                <header className="text-center mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
                        <Sparkles className="h-3 w-3" />
                        Student-friendly pricing
                    </div>
                    <h1 className={cn(dmSans.className, 'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight')}>
                        Plans that fit your <span className="text-primary">prep budget</span>
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                        Start free with unlimited practice. Upgrade when you need AI mocks for placement season.
                    </p>
                </header>

                {/* ── Billing Toggle ── */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/30">
                        <button
                            type="button"
                            onClick={() => setBilling('monthly')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                                billing === 'monthly'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBilling('yearly')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2',
                                billing === 'yearly'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Yearly
                            <span className="text-[0.625rem] font-bold bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                                Save 20%
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
                                const amount = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyTotal;
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
                                <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Free on every plan</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Practice Hub',
                                    'Code Sandbox',
                                    'Learning Tracks',
                                    'AI Roadmaps',
                                    'Community',
                                    'Daily Challenges',
                                    'Coins & XP',
                                    'Leaderboard',
                                ].map((f) => (
                                    <span key={f} className="text-[0.6875rem] font-medium px-2.5 py-1 rounded-md bg-background/80 border border-border/60 text-foreground/80">
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
                                    <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Mock Interview Packs</h2>
                                </div>
                                <span className="text-[0.625rem] text-muted-foreground font-medium">Pay as you go</span>
                            </div>
                            <div className="p-4">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {MOCK_PACKS.map((pack) => {
                                        const isBest = pack.badge === 'Best Value';
                                        return (
                                            <div
                                                key={pack.id}
                                                className={cn(
                                                    'group relative rounded-xl p-4 flex flex-col justify-between transition-all',
                                                    isBest
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                        : 'border border-border hover:border-primary/30 hover:shadow-md',
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
                                                    <p className={cn(dmSans.className, 'text-sm font-bold', isBest && 'text-white')}>{pack.label}</p>
                                                    <p className={cn(dmSans.className, 'text-2xl font-bold mt-1', isBest && 'text-white')}>
                                                        {formatPrice(pack.price)}
                                                    </p>
                                                    <p className={cn('text-[0.625rem] mt-0.5', isBest ? 'text-white/70' : 'text-muted-foreground')}>
                                                        {formatPrice(pack.perMockPrice)}/mock
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className={cn(
                                                        'w-full mt-4 cursor-pointer text-xs font-semibold transition-colors',
                                                        isBest
                                                            ? 'bg-white text-primary hover:bg-white/90 shadow-md'
                                                            : 'bg-transparent border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary',
                                                    )}
                                                    onClick={() => handlePurchase(pack.id, pack.price, `${pack.label} Pack`)}
                                                    disabled={processing === pack.id}
                                                >
                                                    {processing === pack.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                    Buy Mocks
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
                                    <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Video Interview Packs</h2>
                                </div>
                                <span className="text-[0.625rem] text-muted-foreground font-medium">Top-up anytime</span>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {VOICE_PACKS.map((pack) => {
                                        const isBest = pack.badge === 'Best Value';
                                        return (
                                            <div
                                                key={pack.id}
                                                className={cn(
                                                    'group relative rounded-xl p-3.5 flex flex-col justify-between transition-all',
                                                    isBest
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                        : 'border border-border hover:border-primary/30 hover:shadow-md',
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
                                                    <p className={cn(dmSans.className, 'text-xs font-bold', isBest && 'text-white')}>{pack.label}</p>
                                                    <p className={cn(dmSans.className, 'text-lg font-bold mt-1', isBest && 'text-white')}>
                                                        {formatPrice(pack.price)}
                                                    </p>
                                                    <p className={cn('text-[0.5625rem] mt-0.5', isBest ? 'text-white/70' : 'text-muted-foreground')}>
                                                        {formatPrice(pack.perSessionPrice)}/session
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className={cn(
                                                        'w-full mt-3 cursor-pointer text-[0.6875rem] font-semibold transition-colors',
                                                        isBest
                                                            ? 'bg-white text-primary hover:bg-white/90 shadow-md'
                                                            : 'bg-transparent border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary',
                                                    )}
                                                    onClick={() => handlePurchase(pack.id, pack.price, `${pack.label} Voice Pack`)}
                                                    disabled={processing === pack.id}
                                                >
                                                    {processing === pack.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                    Buy
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
                                <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Frequently Asked Questions</h2>
                            </div>
                            <div className="px-5 py-1">
                                <Accordion type="single" collapsible className="w-full">
                                    {PRICING_FAQS.map((faq, i) => (
                                        <AccordionItem key={i} value={`faq-${i}`} className={i === PRICING_FAQS.length - 1 ? 'border-b-0' : ''}>
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
    const price = billing === 'yearly' ? plan.yearlyPricePerMonth : plan.monthlyPrice;
    const yearlySavings = getYearlySavings(plan);

    const isHighlighted = !!plan.highlight;
    const borderColor = plan.highlightColor === 'green' ? 'border-green-500' : 'border-primary';
    const badgeBg = plan.highlightColor === 'green'
        ? 'bg-green-500 text-white'
        : 'bg-primary text-primary-foreground';

    return (
        <div
            className={cn(
                'relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all',
                isHighlighted ? `border-2 ${borderColor} shadow-lg` : 'border-border hover:border-primary/20 hover:shadow-md',
            )}
        >
            {plan.highlight && (
                <div className={cn('text-center py-1.5 text-[0.6875rem] font-bold', badgeBg)}>
                    {plan.highlight}
                </div>
            )}

            <div className="p-5 sm:p-6 flex flex-col flex-1">
                {/* Name + tagline */}
                <div className="mb-4">
                    <h3 className={cn(dmSans.className, 'text-lg font-bold')}>{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                        <span className={cn(dmSans.className, 'text-3xl sm:text-4xl font-bold')}>
                            {isFree ? '₹0' : formatPrice(price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {isFree ? '/forever' : '/month'}
                        </span>
                    </div>
                    {!isFree && billing === 'yearly' && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Billed {formatPrice(plan.yearlyTotal)}/year · Save {formatPrice(yearlySavings)}
                        </p>
                    )}
                </div>

                {/* Key limits */}
                <div className="rounded-lg bg-muted/40 border border-border/60 p-3 mb-5 space-y-1.5">
                    <LimitRow label="AI Mocks" value={plan.mockLabel} />
                    <LimitRow label="Video Mocks" value={plan.videoMocksPerMonth === 0 ? '—' : `${plan.videoMocksPerMonth}/month`} />
                    <LimitRow
                        label="AI Tutor"
                        value={!Number.isFinite(plan.tutorMsgsPerDay) ? 'Unlimited' : `${plan.tutorMsgsPerDay} msgs/day`}
                    />
                </div>

                {/* Features */}
                <div className="space-y-2 flex-1">
                    {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className={cn(
                                'h-4 w-4 mt-0.5 shrink-0',
                                f.highlight ? 'text-primary' : 'text-green-500',
                            )} />
                            <span className={cn('text-xs', f.highlight && 'font-semibold')}>
                                {f.text}
                            </span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-6">
                    {isFree && !userTier ? (
                        <Button asChild variant="outline" className="w-full cursor-pointer">
                            <Link href="/auth/signup">
                                {plan.ctaLabel}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                            Current Plan
                        </Button>
                    ) : canUpgrade || !userTier ? (
                        <Button
                            className={cn('w-full cursor-pointer', isHighlighted && 'shadow-md')}
                            onClick={onBuy}
                            disabled={isProcessing || isFree}
                        >
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {userTier ? plan.ctaLoggedInLabel : plan.ctaLabel}
                            {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" disabled>
                            Current Plan
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
