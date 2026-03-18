import { SubscriptionTier } from '@/types/enums';

// ─── Plan Definitions ────────────────────────────────────────────────────────
// DB enum mapping: FREE → Free, STARTER → Pro, PRO → Placement
// This file is the SINGLE SOURCE OF TRUTH for all pricing data.

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPricePerMonth: number;
  yearlyTotal: number;
  mocksPerMonth: number | null; // null = lifetime (Free plan)
  mockLabel: string;
  learningPathsPerMonth: number;
  features: PlanFeature[];
  ctaLabel: string;
  ctaLoggedInLabel: string;
  highlight?: string;
  highlightColor?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    tier: SubscriptionTier.FREE,
    name: 'Free',
    tagline: 'Try the platform risk-free',
    monthlyPrice: 0,
    yearlyPricePerMonth: 0,
    yearlyTotal: 0,
    mocksPerMonth: null,
    mockLabel: '2 mocks (lifetime)',
    learningPathsPerMonth: 1,
    features: [
      { text: '2 mock interviews (lifetime)', included: true },
      { text: '1 learning path/month', included: true },
      { text: 'Readiness score', included: true },
      { text: 'Interview roadmap', included: true },
      { text: 'No expiry', included: true },
    ],
    ctaLabel: 'Get Started Free',
    ctaLoggedInLabel: 'Current Plan',
  },
  {
    id: 'pro',
    tier: SubscriptionTier.STARTER,
    name: 'Pro',
    tagline: 'Master interviews with structured practice',
    monthlyPrice: 499,
    yearlyPricePerMonth: 399,
    yearlyTotal: 4788,
    mocksPerMonth: 15,
    mockLabel: '15 mocks/month',
    learningPathsPerMonth: 5,
    features: [
      { text: '15 mock interviews/month', included: true },
      { text: '5 learning paths/month', included: true },
      { text: 'Resume review', included: true },
      { text: 'Progress insights', included: true },
      { text: 'Roadmaps included', included: true },
    ],
    ctaLabel: 'Start with Pro',
    ctaLoggedInLabel: 'Upgrade to Pro',
    highlight: 'Most Popular',
  },
  {
    id: 'placement',
    tier: SubscriptionTier.PRO,
    name: 'Placement',
    tagline: 'Designed to get you placed in product companies',
    monthlyPrice: 999,
    yearlyPricePerMonth: 699,
    yearlyTotal: 8388,
    mocksPerMonth: 25,
    mockLabel: '25 mocks/month',
    learningPathsPerMonth: 10,
    features: [
      { text: '25 mock interviews/month', included: true },
      { text: '10 learning paths/month', included: true },
      { text: 'Resume + LinkedIn optimization', included: true },
      { text: 'Recruiter outreach templates', included: true },
      { text: 'Interview tracker', included: true },
      { text: 'Priority support', included: true },
    ],
    ctaLabel: 'Start with Placement',
    ctaLoggedInLabel: 'Upgrade to Placement',
    highlight: 'Best Value',
    highlightColor: 'green',
  },
];

// ─── Mock Packs (PAYG) ──────────────────────────────────────────────────────

export interface MockPack {
  id: string;
  mocks: number;
  price: number;
  label: string;
  badge?: string;
}

export const MOCK_PACKS: MockPack[] = [
  { id: 'mock_1', mocks: 1, price: 79, label: '1 Mock' },
  { id: 'mock_5', mocks: 5, price: 299, label: '5 Mocks', badge: 'Popular' },
  { id: 'mock_10', mocks: 10, price: 499, label: '10 Mocks', badge: 'Best Value' },
];

// ─── Voice Interview Packs (standalone — never bundled with plans) ───────────

export interface VoicePack {
  id: string;
  sessions: number;
  price: number;
  label: string;
  badge?: string;
}

export const VOICE_PACKS: VoicePack[] = [
  { id: 'voice_1', sessions: 1, price: 149, label: '1 Session' },
  { id: 'voice_3', sessions: 3, price: 399, label: '3 Sessions' },
  { id: 'voice_5', sessions: 5, price: 599, label: '5 Sessions', badge: 'Popular' },
  { id: 'voice_10', sessions: 10, price: 999, label: '10 Sessions', badge: 'Best Value' },
];

// ─── Add-ons ─────────────────────────────────────────────────────────────────

export const ADDON_LEARNING_PATH_PRICE = 29;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

export function getPlanByTier(tier: SubscriptionTier): Plan {
  return PLANS.find((p) => p.tier === tier) ?? PLANS[0];
}

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function isUpgrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  const order = { [SubscriptionTier.FREE]: 0, [SubscriptionTier.STARTER]: 1, [SubscriptionTier.PRO]: 2 };
  return order[targetTier] > order[currentTier];
}

export function getYearlySavings(plan: Plan): number {
  if (plan.monthlyPrice === 0) return 0;
  return (plan.monthlyPrice * 12) - plan.yearlyTotal;
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export interface FAQ {
  question: string;
  answer: string;
}

export const PRICING_FAQS: FAQ[] = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes. You can upgrade or downgrade at any time. When upgrading, the difference is prorated. When downgrading, the new plan starts at the next billing cycle.',
  },
  {
    question: 'What happens when my mocks run out?',
    answer: 'You can buy individual mock packs (pay-as-you-go) starting at \u20B979 per mock, or upgrade to a higher plan for more monthly mocks.',
  },
  {
    question: 'Are voice interviews included in plans?',
    answer: 'No. Voice interview sessions are purchased separately and are not bundled with any plan. This keeps plan prices lower for users who don\u2019t need voice.',
  },
  {
    question: 'How does yearly billing work?',
    answer: 'Yearly plans are billed once per year at a discounted rate (save ~20%). You can cancel anytime, and the plan remains active until the end of the billing period.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 7-day refund policy for paid plans if you haven\u2019t used more than 2 mocks. Mock packs and voice packs are non-refundable once used.',
  },
  {
    question: 'Do unused mocks roll over?',
    answer: 'No. Monthly mocks reset at the start of each billing cycle. We recommend buying a mock pack if you need additional mocks beyond your plan limit.',
  },
];
