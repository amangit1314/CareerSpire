import Razorpay from 'razorpay';

/**
 * Razorpay config + client, colocated (single small integration, no reason
 * to split config from the thing that uses it). `publicKeyId` is the
 * NEXT_PUBLIC_ variant sent to the browser to open the checkout widget —
 * it's not set in .env yet; callers already guard for that (see pricing
 * page) rather than crash.
 */
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID!,
  keySecret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_SECRET!,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
};

export const razorpay = new Razorpay({
  key_id: razorpayConfig.keyId,
  key_secret: razorpayConfig.keySecret,
});
