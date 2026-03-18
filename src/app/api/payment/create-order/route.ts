import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { PLANS, MOCK_PACKS, VOICE_PACKS } from '@/lib/pricing';

export async function POST(req: Request) {
  try {
    const { amount, currency = 'INR', planId, billing } = await req.json();

    let finalAmount = amount;

    // Resolve amount from plan definitions (single source of truth)
    if (planId) {
      const plan = PLANS.find((p) => p.id === planId);
      if (plan) {
        finalAmount =
          billing === 'yearly' ? plan.yearlyTotal : plan.monthlyPrice;
      }

      const mockPack = MOCK_PACKS.find((p) => p.id === planId);
      if (mockPack) finalAmount = mockPack.price;

      const voicePack = VOICE_PACKS.find((p) => p.id === planId);
      if (voicePack) finalAmount = voicePack.price;
    }

    const amountInPaise = Math.round(Number(finalAmount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Error creating order', details: error.message },
      { status: 500 }
    );
  }
}
