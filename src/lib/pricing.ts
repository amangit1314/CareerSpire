import { SubscriptionTier } from '@/types/enums';

// ─── Plan Definitions ────────────────────────────────────────────────────────
// DB enum mapping: FREE → Free, STARTER → Pro, PRO → Placement
// This file is the SINGLE SOURCE OF TRUTH for all pricing data.

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface Plan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPricePerMonth: number;
  yearlyTotal: number;
  mocksPerMonth: number;
  mockLabel: string;
  videoMocksPerMonth: number;
  tutorMsgsPerDay: number;
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
    tagline: 'Start your prep journey — no card needed',
    monthlyPrice: 0,
    yearlyPricePerMonth: 0,
    yearlyTotal: 0,
    mocksPerMonth: 3,
    mockLabel: '3 mocks/month',
    videoMocksPerMonth: 0,
    tutorMsgsPerDay: 10,
    features: [
      { text: '3 AI mock interviews/month', included: true },
      { text: 'Unlimited practice problems', included: true },
      { text: 'Unlimited learning tracks', included: true },
      { text: 'AI Tutor (10 msgs/day)', included: true },
      { text: 'Community access', included: true },
      { text: 'Coins, XP & streaks', included: true },
      { text: 'Daily challenges', included: true },
    ],
    ctaLabel: 'Get Started Free',
    ctaLoggedInLabel: 'Current Plan',
  },
  {
    id: 'pro',
    tier: SubscriptionTier.STARTER,
    name: 'Pro',
    tagline: 'Serious prep for your upcoming interviews',
    monthlyPrice: 499,
    yearlyPricePerMonth: 399,
    yearlyTotal: 4788,
    mocksPerMonth: 15,
    mockLabel: '15 mocks/month',
    videoMocksPerMonth: 3,
    tutorMsgsPerDay: 150,
    features: [
      { text: '15 AI mock interviews/month', included: true, highlight: true },
      { text: '3 video mock interviews/month', included: true, highlight: true },
      { text: 'Unlimited practice problems', included: true },
      { text: 'Unlimited learning tracks', included: true },
      { text: 'AI Tutor (150 msgs/day)', included: true, highlight: true },
      { text: 'Performance insights', included: true },
      { text: 'Weak area analysis', included: true },
    ],
    ctaLabel: 'Start with Pro',
    ctaLoggedInLabel: 'Upgrade to Pro',
    highlight: 'Most Popular',
  },
  {
    id: 'placement',
    tier: SubscriptionTier.PRO,
    name: 'Placement',
    tagline: 'Go all-in for placement season',
    monthlyPrice: 999,
    yearlyPricePerMonth: 699,
    yearlyTotal: 8388,
    mocksPerMonth: 30,
    mockLabel: '30 mocks/month',
    videoMocksPerMonth: 10,
    tutorMsgsPerDay: Infinity,
    features: [
      { text: '30 AI mock interviews/month', included: true, highlight: true },
      { text: '10 video mock interviews/month', included: true, highlight: true },
      { text: 'Unlimited practice problems', included: true },
      { text: 'Unlimited learning tracks', included: true },
      { text: 'AI Tutor (unlimited)', included: true, highlight: true },
      { text: 'Performance insights', included: true },
      { text: 'Weak area analysis', included: true },
      { text: 'Priority support', included: true },
    ],
    ctaLabel: 'Start with Placement',
    ctaLoggedInLabel: 'Upgrade to Placement',
    highlight: 'Best for Placements',
    highlightColor: 'green',
  },
];

// ─── Mock Packs (PAYG) ──────────────────────────────────────────────────────

export interface MockPack {
  id: string;
  mocks: number;
  price: number;
  label: string;
  perMockPrice: number;
  badge?: string;
}

export const MOCK_PACKS: MockPack[] = [
  { id: 'mock_1', mocks: 1, price: 79, perMockPrice: 79, label: '1 Mock' },
  { id: 'mock_5', mocks: 5, price: 299, perMockPrice: 60, label: '5 Mocks', badge: 'Popular' },
  { id: 'mock_10', mocks: 10, price: 499, perMockPrice: 50, label: '10 Mocks', badge: 'Best Value' },
];

// ─── Voice Interview Packs (PAYG) ──────────────────────────────────────────

export interface VoicePack {
  id: string;
  sessions: number;
  price: number;
  perSessionPrice: number;
  label: string;
  badge?: string;
}

export const VOICE_PACKS: VoicePack[] = [
  { id: 'voice_1', sessions: 1, price: 149, perSessionPrice: 149, label: '1 Session' },
  { id: 'voice_3', sessions: 3, price: 399, perSessionPrice: 133, label: '3 Sessions' },
  { id: 'voice_5', sessions: 5, price: 599, perSessionPrice: 120, label: '5 Sessions', badge: 'Popular' },
  { id: 'voice_10', sessions: 10, price: 999, perSessionPrice: 100, label: '10 Sessions', badge: 'Best Value' },
];

// ─── Add-ons (legacy — learning paths are now unlimited) ────────────────────

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
    question: 'Are video interviews included in plans?',
    answer: 'Pro includes 3 video mocks/month and Placement includes 10/month. You can also buy additional voice packs separately if you need more.',
  },
  {
    question: 'Is the Practice Hub free?',
    answer: 'Yes! The full practice hub with 500+ DSA problems, code sandbox, coins, XP, streaks, and daily challenges is completely free for all users.',
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
  {
    question: 'What AI model powers the mocks?',
    answer: 'We use Groq (llama-3.3-70b) as primary and Gemini Flash as fallback for fast, accurate responses.',
  },
];
