'use server';

import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import type { Payment } from '@/types';
import { SubscriptionTier, PaymentStatus } from '@/types/enums';

export interface BillingData {
  plan: SubscriptionTier;
  planActive: boolean;
  planExpiresAt: Date | null;
  mocksRemaining: number;
  mocksTotal: number;
  payments: Payment[];
}

export async function getBillingDataAction(userId: string): Promise<BillingData> {
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

  // Determine total mocks based on tier
  let mocksTotal: number;
  switch (tier) {
    case SubscriptionTier.PRO:
      mocksTotal = 25;
      break;
    case SubscriptionTier.STARTER:
      mocksTotal = 15;
      break;
    default:
      mocksTotal = 2;
  }

  return {
    plan: tier,
    planActive,
    planExpiresAt: user.subscriptionEndsAt,
    mocksRemaining: user.freeMocksRemaining,
    mocksTotal,
    payments: payments.map((p) => ({
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
