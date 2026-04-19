import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { requireAuth } from '@/lib/auth';
import { PLANS, MOCK_PACKS, VOICE_PACKS } from '@/lib/pricing';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { currency = 'INR', planId, billing } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    // Derive amount ONLY from server-side plan definitions (never trust client amount)
    let finalAmount: number | undefined;

    const plan = PLANS.find((p) => p.id === planId);
    if (plan) {
      finalAmount = billing === 'yearly' ? plan.yearlyTotal : plan.monthlyPrice;
    }

    const mockPack = MOCK_PACKS.find((p) => p.id === planId);
    if (mockPack) finalAmount = mockPack.price;

    const voicePack = VOICE_PACKS.find((p) => p.id === planId);
    if (voicePack) finalAmount = voicePack.price;

    if (finalAmount === undefined) {
      return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });
    }

    const amountInPaise = Math.round(finalAmount * 100);

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
  } catch (error: unknown) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Error creating order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
