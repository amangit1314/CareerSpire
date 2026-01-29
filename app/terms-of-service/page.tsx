import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function TermsOfServicePage() {
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="Please read these terms carefully before using our platform."
            lastUpdated="January 29, 2026"
        >
            <section>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using Mocky, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
            </section>

            <section>
                <h2>2. Use License</h2>
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on Mocky's website for personal, non-commercial transitory viewing only.
                </p>
                <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul>
                    <li>Modify or copy the materials.</li>
                    <li>Use the materials for any commercial purpose, or for any public display.</li>
                    <li>Attempt to decompile or reverse engineer any software contained on Mocky's website.</li>
                    <li>Remove any copyright or other proprietary notations from the materials.</li>
                </ul>
            </section>

            <section>
                <h2>3. User Accounts</h2>
                <p>
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
            </section>

            <section>
                <h2>4. Subscription and Payments</h2>
                <p>
                    Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. Billing cycles are set on a monthly or annual basis.
                </p>
            </section>

            <section>
                <h2>5. Content</h2>
                <p>
                    Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post to the Service.
                </p>
            </section>

            <section>
                <h2>6. Limitation of Liability</h2>
                <p>
                    In no event shall Mocky, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
                </p>
            </section>

            <section>
                <h2>7. Governing Law</h2>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Mocky operates, without regard to its conflict of law provisions.
                </p>
            </section>

            <section>
                <h2>8. Changes</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
            </section>
        </StaticPageLayout>
    );
}
