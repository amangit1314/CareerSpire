import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function CancellationPolicyPage() {
    return (
        <StaticPageLayout
            title="Cancellation Policy"
            subtitle="How to manage and cancel your Mocky subscription."
            lastUpdated="January 29, 2026"
        >
            <section>
                <h2>1. Self-Service Cancellation</h2>
                <p>
                    You can cancel your subscription at any time through your Account Settings. No need to call or email—you have full control over your billing.
                </p>
            </section>

            <section>
                <h2>2. Effect of Cancellation</h2>
                <p>
                    Upon cancellation, you will retain access to your premium features until the end of your current paid billing period. At that point, your account will revert to the Free tier.
                </p>
            </section>

            <section>
                <h2>3. Data Retention</h2>
                <p>
                    When you cancel, we do not immediately delete your data. You can re-subscribe later to regain access to your previous interview history and progress.
                </p>
            </section>

            <section>
                <h2>4. No Pro-rated Refunds for Early Cancellation</h2>
                <p>
                    Except as provided in our Refund Policy, we do not provide pro-rated refunds for the remaining time in your billing period if you decide to cancel early.
                </p>
            </section>

            <section>
                <h2>5. Account Deletion</h2>
                <p>
                    If you wish to permanently delete your account and all associated data, please use the "Delete Account" option in your settings or contact our support team.
                </p>
            </section>
        </StaticPageLayout>
    );
}
