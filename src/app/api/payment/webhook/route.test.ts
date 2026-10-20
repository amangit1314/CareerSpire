import { describe, it, expect, vi } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { PaymentStatus, SubscriptionTier } from "@/types/enums";

vi.mock("@/lib/razorpay", () => ({
  razorpayConfig: { webhookSecret: "test_webhook_secret" },
}));

const WEBHOOK_SECRET = "test_webhook_secret";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    payment: { update: vi.fn() },
    user: { update: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST, verifyRazorpaySignature } from "./route";

function sign(body: string) {
  return crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
}

function makeRequest(payload: object, signature?: string) {
  const body = JSON.stringify(payload);
  return new NextRequest("http://localhost/api/payment/webhook", {
    method: "POST",
    body,
    headers: signature ? { "x-razorpay-signature": signature } : undefined,
  });
}

describe("verifyRazorpaySignature", () => {
  it("accepts a correctly-signed body and rejects a tampered one", () => {
    const body = '{"event":"payment.captured"}';
    expect(verifyRazorpaySignature(body, sign(body), WEBHOOK_SECRET)).toBe(
      true,
    );
    expect(
      verifyRazorpaySignature(body, "wrong-signature", WEBHOOK_SECRET),
    ).toBe(false);
    expect(verifyRazorpaySignature(body, null, WEBHOOK_SECRET)).toBe(false);
  });
});

describe("POST /api/payment/webhook", () => {
  it("rejects a request with no signature header", async () => {
    const res = await POST(makeRequest({ event: "payment.captured" }));
    expect(res.status).toBe(400);
  });

  it("rejects a request with an invalid signature", async () => {
    const res = await POST(
      makeRequest({ event: "payment.captured" }, "bad-signature"),
    );
    expect(res.status).toBe(401);
  });

  it("marks the payment COMPLETED and bumps the user tier on payment.captured for a plan purchase", async () => {
    (prisma.payment.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "pay_row_1",
      userId: "user_1",
      subscriptionTier: SubscriptionTier.STARTER,
    });

    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_razorpay_1", order_id: "order_1" } },
      },
    };
    const body = JSON.stringify(payload);
    const res = await POST(makeRequest(payload, sign(body)));

    expect(res.status).toBe(200);
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { razorpayOrderId: "order_1" },
      data: {
        status: PaymentStatus.COMPLETED,
        razorpayPaymentId: "pay_razorpay_1",
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: expect.objectContaining({
        subscriptionTier: SubscriptionTier.STARTER,
      }),
    });
  });

  it("does not touch the user tier for a mock/voice pack purchase (no subscriptionTier on the payment)", async () => {
    (prisma.payment.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "pay_row_2",
      userId: "user_2",
      subscriptionTier: null,
    });
    vi.mocked(prisma.user.update).mockClear();

    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_razorpay_2", order_id: "order_2" } },
      },
    };
    const body = JSON.stringify(payload);
    await POST(makeRequest(payload, sign(body)));

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("marks the payment FAILED on payment.failed without touching the user", async () => {
    (prisma.payment.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "pay_row_3",
      userId: "user_3",
      subscriptionTier: SubscriptionTier.PRO,
    });
    vi.mocked(prisma.user.update).mockClear();

    const payload = {
      event: "payment.failed",
      payload: {
        payment: { entity: { id: "pay_razorpay_3", order_id: "order_3" } },
      },
    };
    const body = JSON.stringify(payload);
    await POST(makeRequest(payload, sign(body)));

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { razorpayOrderId: "order_3" },
      data: {
        status: PaymentStatus.FAILED,
        razorpayPaymentId: "pay_razorpay_3",
      },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
