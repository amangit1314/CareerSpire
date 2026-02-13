import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function RefundBillingPage() {
    return (
        <StaticPageLayout
            title="Refund & Billing Policy"
            subtitle="Details about our billing practices and refund conditions."
            lastUpdated="January 29, 2026"
        >
            <section>
                <h2>1. Billing Cycles</h2>
                <p>
                    CareerSpire offers monthly and annual subscription plans. Your billing cycle begins on the day you subscribe and recurs automatically until canceled.
                </p>
            </section>

            <section>
                <h2>2. Payment Methods</h2>
                <p>
                    We accept all major credit cards and other secure payment methods through our payment processor, Stripe. Your payment information is never stored directly on our servers.
                </p>
            </section>

            <section>
                <h2>3. Refund Eligibility</h2>
                <p>
                    We want you to be satisfied with our service. If you are not happy, you may be eligible for a refund:
                </p>
                <ul>
                    <li>**Monthly Plans**: Within the first 7 days of your initial subscription.</li>
                    <li>**Annual Plans**: Within the first 14 days of your initial subscription.</li>
                    <li>**Renewal Payments**: Refunds are typically not provided for renewal payments unless requested within 48 hours of the charge.</li>
                </ul>
            </section>

            <section>
                <h2>4. How to Request a Refund</h2>
                <p>
                    To request a refund, please contact us at **support@CareerSpire.com** with your account details and reasoning. We process refund requests within 3-5 business days.
                </p>
            </section>

            <section>
                <h2>5. Plan Changes</h2>
                <p>
                    You can upgrade or downgrade your plan at any time. Upgrades take effect immediately (pro-rated), while downgrades typically take effect at the end of the current billing cycle.
                </p>
            </section>
        </StaticPageLayout>
    );
}
