import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function CancellationPolicyPage() {
    return (
        <StaticPageLayout
            title="Cancellation Policy"
            subtitle="How to cancel your subscription and what happens next."
            lastUpdated="April 18, 2026"
        >
            <section>
                <h2>1. How to Cancel</h2>
                <p>
                    You can cancel your subscription at any time from <strong>Dashboard &rarr; Billing</strong>. No need to email or call &mdash; cancellation is instant and self-service. You will receive a confirmation email when your cancellation is processed.
                </p>
            </section>

            <section>
                <h2>2. What Happens After Cancellation</h2>
                <p>
                    When you cancel, you keep access to all premium features (additional mocks, video interviews, extended AI tutor limits) until the end of your current billing period. After that, your account reverts to the Free tier:
                </p>
                <ul>
                    <li>3 AI mock interviews per month.</li>
                    <li>10 AI tutor messages per day.</li>
                    <li>Full access to the Practice Hub, learning tracks, and community.</li>
                    <li>Your XP, coins, streak, badges, and leaderboard position are preserved.</li>
                </ul>
            </section>

            <section>
                <h2>3. Your Data Is Preserved</h2>
                <p>
                    Cancellation does not delete your data. Your interview history, mock results, practice submissions, video recordings, and progress stats remain intact. You can re-subscribe at any time to restore premium limits without losing anything.
                </p>
            </section>

            <section>
                <h2>4. Pay-As-You-Go Credits</h2>
                <p>
                    Unused mock pack and voice interview pack credits do not expire when you cancel a subscription. They remain available regardless of your subscription status and can be used on the Free tier.
                </p>
            </section>

            <section>
                <h2>5. No Pro-Rated Refunds</h2>
                <p>
                    Cancelling mid-cycle does not generate a pro-rated refund for the remaining days. If you believe you are eligible for a refund, see our <a href="/refund-billing">Refund &amp; Billing Policy</a> for the refund window and conditions.
                </p>
            </section>

            <section>
                <h2>6. Permanent Account Deletion</h2>
                <p>
                    If you want to permanently delete your account and all associated data (interview recordings, submissions, progress, payment records), you can do so from <strong>Profile &rarr; Delete Account</strong> or by emailing <a href="mailto:gitaman8481@gmail.com">gitaman8481@gmail.com</a>. This action is irreversible and cannot be undone.
                </p>
            </section>

            <section>
                <h2>7. Re-Subscribing</h2>
                <p>
                    You can re-subscribe to any plan at any time. A new billing cycle starts on the day you re-subscribe. If your previous plan is no longer available, you will be offered the closest current equivalent.
                </p>
            </section>
        </StaticPageLayout>
    );
}
