'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import type { Payment } from '@/types';
import type { Payment as PrismaPayment } from '@prisma/client';
import { SubscriptionTier, PaymentStatus } from '@/types/enums';
import { PLANS, getPlanByTier } from '@/lib/pricing';

export interface BillingData {
  plan: SubscriptionTier;
  planActive: boolean;
  planExpiresAt: Date | null;
  mocksRemaining: number;
  mocksTotal: number;
  videoMocksRemaining: number;
  videoMocksTotal: number;
  payments: Payment[];
}

export async function getBillingDataAction(): Promise<BillingData> {
  const userId = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  }

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const tier = (user.subscriptionTier as SubscriptionTier) ?? SubscriptionTier.FREE;
  const planActive =
    tier === SubscriptionTier.FREE ||
    (user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) > new Date() : false);

  const plan = getPlanByTier(tier);

  // For free tier, use freeMocksRemaining directly.
  // For paid tiers, remaining = plan limit - used this cycle.
  const mocksTotal = plan.mocksPerMonth;
  const mocksRemaining =
    tier === SubscriptionTier.FREE
      ? user.freeMocksRemaining
      : Math.max(0, plan.mocksPerMonth - user.mocksUsedThisCycle);

  const videoMocksTotal = plan.videoMocksPerMonth;
  const videoMocksRemaining =
    tier === SubscriptionTier.FREE
      ? user.videoMocksRemaining
      : Math.max(0, plan.videoMocksPerMonth - user.videoMocksUsedThisCycle);

  return {
    plan: tier,
    planActive,
    planExpiresAt: user.subscriptionEndsAt,
    mocksRemaining,
    mocksTotal,
    videoMocksRemaining,
    videoMocksTotal,
    payments: payments.map((p: PrismaPayment) => ({
      id: p.id,
      userId: p.userId,
      razorpayOrderId: p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      amount: p.amount,
      currency: p.currency,
      status: p.status as PaymentStatus,
      subscriptionTier: p.subscriptionTier as SubscriptionTier | null,
      createdAt: p.createdAt,
    })),
  };
}
