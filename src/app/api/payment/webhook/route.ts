import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { razorpayConfig } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/types/enums";

export function verifyRazorpaySignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return signature === expected;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (
      !verifyRazorpaySignature(body, signature, razorpayConfig.webhookSecret)
    ) {
      return NextResponse.json(
        { error: signature ? "Invalid signature" : "No signature" },
        { status: signature ? 401 : 400 },
      );
    }

    const event = JSON.parse(body);

    if (
      event.event === "payment.captured" ||
      event.event === "payment.failed"
    ) {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const succeeded = event.event === "payment.captured";

      const paymentRecord = await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data: {
          status: succeeded ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          razorpayPaymentId: payment.id,
        },
      });

      // Plan purchases carry a subscriptionTier; mock/voice packs don't, so
      // they skip the tier bump (no PAYG credit-crediting logic exists yet —
      // out of scope here, flagged separately).
      if (succeeded && paymentRecord.subscriptionTier) {
        const subscriptionEndsAt = new Date();
        subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1); // 1 month subscription

        await prisma.user.update({
          where: { id: paymentRecord.userId },
          data: {
            subscriptionTier: paymentRecord.subscriptionTier,
            subscriptionEndsAt,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 500 },
    );
  }
}
