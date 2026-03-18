import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
    try {
        const { amount, currency = 'INR', planId, billing } = await req.json();

        // Determine the amount based on the plan/input
        // If exact amount is passed (e.g. for credits), use it. 
        // Otherwise calculate based on planId and billing cycle.
        // NOTE: Razorpay expects amount in smallest currency unit (paise for INR).

        let finalAmount = amount;

        // Logic to validate/set amount based on plans if needed
        // This connects to what the user said: "the pricing plans should be as it is shown at the pricing page"
        if (planId) {
            if (planId === 'skills') {
                finalAmount = billing === 'yearly' ? 449 * 12 : 499;
            } else if (planId === 'accelerator') {
                finalAmount = billing === 'yearly' ? 449 * 12 : 999;
            }
        }

        // Convert to paise if provided in rupees (assuming frontend sends rupees)
        // Or we can assume frontend sends the raw amount. 
        // Let's ensure we are dealing with numbers.
        const amountInPaise = Math.round(Number(finalAmount) * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Error creating order', details: error.message },
            { status: 500 }
        );
    }
}
