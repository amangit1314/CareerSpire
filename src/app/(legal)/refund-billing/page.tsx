import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function RefundBillingPage() {
    return (
        <StaticPageLayout
            title="Refund & Billing Policy"
            subtitle="How billing works, and when you're eligible for a refund."
            lastUpdated="April 18, 2026"
        >
            <section>
                <h2>1. Pricing Overview</h2>
                <p>
                    CareerSpire offers a free tier and two paid subscription plans, billed in Indian Rupees (INR):
                </p>
                <ul>
                    <li><strong>Free</strong> &mdash; 3 AI mock interviews per month, unlimited Practice Hub access, 10 AI tutor messages per day. No credit card required.</li>
                    <li><strong>Pro</strong> &mdash; &#8377;499/month (or &#8377;399/month billed yearly). 15 mocks, 3 video mocks, 150 tutor messages per day, and performance insights.</li>
                    <li><strong>Placement</strong> &mdash; &#8377;999/month (or &#8377;699/month billed yearly). 30 mocks, 10 video mocks, unlimited tutor, and priority support.</li>
                </ul>
                <p>
                    We also offer pay-as-you-go mock packs (starting at &#8377;79 for 1 mock) and voice interview packs (starting at &#8377;149 for 1 session). These are one-time purchases and do not auto-renew.
                </p>
            </section>

            <section>
                <h2>2. Payment Processing</h2>
                <p>
                    All payments are processed securely through <strong>Razorpay</strong>. We accept UPI, credit/debit cards, net banking, and popular wallets. Your card details are handled entirely by Razorpay and are never stored on CareerSpire&apos;s servers. You will receive a payment confirmation via email after each successful transaction.
                </p>
            </section>

            <section>
                <h2>3. Billing Cycles</h2>
                <p>
                    Subscriptions begin on the day you purchase and auto-renew at the end of each cycle (monthly or annual). Your billing cycle resets your mock and video mock usage counters. If you upgrade mid-cycle, the change takes effect immediately. Downgrades take effect at the end of the current cycle.
                </p>
            </section>

            <section>
                <h2>4. Refund Eligibility</h2>
                <ul>
                    <li><strong>Monthly subscriptions</strong> &mdash; Eligible for a full refund within 7 days of your first purchase, provided you have not used more than 3 mock interviews.</li>
                    <li><strong>Annual subscriptions</strong> &mdash; Eligible for a full refund within 14 days of purchase, provided you have not used more than 5 mock interviews.</li>
                    <li><strong>Renewal charges</strong> &mdash; Refundable within 48 hours of the renewal charge, provided no mocks were used in the new cycle.</li>
                    <li><strong>Mock &amp; voice packs</strong> &mdash; Refundable within 48 hours of purchase if none of the credits have been used.</li>
                    <li><strong>Free tier</strong> &mdash; No charges, so no refunds applicable.</li>
                </ul>
            </section>

            <section>
                <h2>5. How to Request a Refund</h2>
                <p>
                    Email <a href="mailto:gitaman8481@gmail.com">gitaman8481@gmail.com</a> with your registered email address, payment receipt or Razorpay order ID, and the reason for your refund request. We process eligible refunds within 5&ndash;7 business days. Refunds are issued to the original payment method.
                </p>
            </section>

            <section>
                <h2>6. Failed Payments</h2>
                <p>
                    If a renewal payment fails, your account will revert to the Free tier. You will not lose your interview history or progress data. You can re-subscribe at any time to restore premium access.
                </p>
            </section>

            <section>
                <h2>7. Price Changes</h2>
                <p>
                    We may adjust pricing with at least 30 days&apos; notice via email. Existing subscribers will continue at their current rate until the end of their billing cycle. The new pricing applies on the next renewal.
                </p>
            </section>

            <section>
                <h2>8. Contact</h2>
                <p>
                    For billing disputes or questions, email <a href="mailto:gitaman8481@gmail.com">gitaman8481@gmail.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
}
