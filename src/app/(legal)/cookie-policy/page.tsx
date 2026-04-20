import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function CookiePolicyPage() {
    return (
        <StaticPageLayout
            title="Cookie Policy"
            subtitle="What cookies CareerSpire uses and why."
            lastUpdated="April 18, 2026"
        >
            <section>
                <h2>1. What Are Cookies</h2>
                <p>
                    Cookies are small text files stored on your device by your browser. They help websites remember your preferences and maintain sessions. CareerSpire uses a minimal set of cookies &mdash; only what is necessary for the platform to function.
                </p>
            </section>

            <section>
                <h2>2. Cookies We Use</h2>

                <h3>Authentication Cookies (Essential)</h3>
                <p>
                    We set two HTTP-only, secure cookies when you log in:
                </p>
                <ul>
                    <li><strong>access_token</strong> &mdash; A JWT that authenticates your requests. Expires after 6 hours. Cannot be read by JavaScript (HTTP-only).</li>
                    <li><strong>refresh_token</strong> &mdash; Used to issue a new access token when the current one expires. Expires after 7 days. Also HTTP-only.</li>
                </ul>
                <p>
                    These cookies are strictly necessary. Without them, you cannot stay logged in or access protected features like mock interviews, the Practice Hub, or your Dashboard.
                </p>

                <h3>Theme Preference</h3>
                <p>
                    We store your light/dark mode preference using the <strong>next-themes</strong> library. This is a first-party cookie/localStorage entry that remembers your visual preference across sessions.
                </p>
            </section>

            <section>
                <h2>3. What We Do Not Use</h2>
                <ul>
                    <li>No third-party advertising or tracking cookies.</li>
                    <li>No Google Analytics, Facebook Pixel, or similar tracking scripts.</li>
                    <li>No cross-site tracking or fingerprinting.</li>
                    <li>No cookie consent walls &mdash; because we only use essential cookies.</li>
                </ul>
            </section>

            <section>
                <h2>4. Managing Cookies</h2>
                <p>
                    You can clear or block cookies through your browser settings. Note that blocking our authentication cookies will log you out and prevent you from using features that require a login. Clearing cookies will not delete your account data.
                </p>
            </section>

            <section>
                <h2>5. Changes</h2>
                <p>
                    If we introduce additional cookies (e.g. analytics), we will update this policy and notify you before they take effect. Essential authentication cookies may be updated without notice as part of security improvements.
                </p>
            </section>

            <section>
                <h2>6. Contact</h2>
                <p>
                    Questions about our cookie usage? Email <a href="mailto:gitaman8481@gmail.com">gitaman8481@gmail.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
}
