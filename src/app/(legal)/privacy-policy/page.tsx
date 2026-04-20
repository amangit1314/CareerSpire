import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function PrivacyPolicyPage() {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="How CareerSpire collects, uses, and protects your data."
            lastUpdated="April 18, 2026"
        >
            <section>
                <h2>1. Introduction</h2>
                <p>
                    CareerSpire (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an AI-powered interview preparation platform. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and services at careerspire.vercel.app.
                </p>
                <p>
                    By creating an account or using CareerSpire, you agree to the practices described in this policy.
                </p>
            </section>

            <section>
                <h2>2. Information We Collect</h2>

                <h3>Account Information</h3>
                <p>
                    When you sign up, we collect your name, email address, and a hashed password. If you sign in via Google or GitHub, we receive your name, email, and profile picture from the OAuth provider.
                </p>

                <h3>Interview &amp; Practice Data</h3>
                <p>
                    When you use our platform, we collect and store:
                </p>
                <ul>
                    <li>Your code submissions, answers, and test results from mock interviews and the Practice Hub.</li>
                    <li>AI-generated feedback scores, weak-topic analysis, and performance history.</li>
                    <li>Video and audio recordings if you use the Video Interview feature, stored securely in Supabase Storage.</li>
                    <li>Your XP, coins, streak data, badges, and leaderboard position.</li>
                </ul>

                <h3>Usage &amp; Device Data</h3>
                <p>
                    We automatically collect your IP address, browser type, device information, and pages visited. This helps us maintain security and improve the platform. We do not use third-party tracking pixels or advertising cookies.
                </p>

                <h3>Payment Data</h3>
                <p>
                    Payments are processed by <strong>Razorpay</strong>. We store your Razorpay order ID, payment status, and subscription tier. We never store your card number, CVV, or bank details on our servers.
                </p>
            </section>

            <section>
                <h2>3. How We Use Your Information</h2>
                <ul>
                    <li><strong>Delivering the service</strong> &mdash; Generating AI mock interviews, running your code against test cases, providing AI tutor responses, and tracking your learning progress.</li>
                    <li><strong>Personalisation</strong> &mdash; Identifying your weak topics, adjusting question difficulty, and recommending learning tracks.</li>
                    <li><strong>Billing</strong> &mdash; Processing subscription payments and mock/voice pack purchases via Razorpay.</li>
                    <li><strong>Communication</strong> &mdash; Sending transactional emails (welcome, mock results, password resets) through Supabase Edge Functions. You can disable email notifications in your settings.</li>
                    <li><strong>Platform improvement</strong> &mdash; Aggregating anonymised usage patterns to improve our AI question generation and feedback quality.</li>
                </ul>
            </section>

            <section>
                <h2>4. AI Processing</h2>
                <p>
                    Your code submissions and interview answers are sent to AI providers (<strong>Groq</strong> and <strong>Google Gemini</strong>) for real-time evaluation and feedback generation. We do not use your submissions to train third-party AI models. The AI providers process data under their respective data processing agreements and do not retain your inputs beyond the API call.
                </p>
            </section>

            <section>
                <h2>5. Data Sharing</h2>
                <p>
                    We do not sell your personal data. We share data only with:
                </p>
                <ul>
                    <li><strong>Razorpay</strong> &mdash; Payment processing (order creation, payment verification, webhook events).</li>
                    <li><strong>Supabase</strong> &mdash; Database hosting, file storage (video recordings), and transactional email delivery.</li>
                    <li><strong>Groq &amp; Google</strong> &mdash; AI inference for question generation, code evaluation, and tutor chat responses.</li>
                    <li><strong>Law enforcement</strong> &mdash; Only if legally required by a valid court order or regulatory obligation.</li>
                </ul>
            </section>

            <section>
                <h2>6. Data Storage &amp; Security</h2>
                <p>
                    Your data is stored in a PostgreSQL database hosted on Supabase (AWS Asia-Pacific region). Video recordings are stored in Supabase Storage with signed URLs that expire after 1 hour.
                </p>
                <p>
                    We protect your data with hashed passwords (bcrypt, 12 rounds), HTTP-only secure cookies for authentication, JWT-based session management, and rate limiting on authentication endpoints.
                </p>
            </section>

            <section>
                <h2>7. Community &amp; Public Content</h2>
                <p>
                    If you make a video interview public or share an interview experience, that content (including your display name and profile picture) becomes visible to all CareerSpire users. You can toggle visibility or delete shared content at any time.
                </p>
            </section>

            <section>
                <h2>8. Your Rights</h2>
                <ul>
                    <li><strong>Access &amp; export</strong> &mdash; View your profile, interview history, and practice stats from your Dashboard.</li>
                    <li><strong>Correction</strong> &mdash; Update your name, email, or profile picture from your Profile page.</li>
                    <li><strong>Deletion</strong> &mdash; Permanently delete your account and all associated data from Settings, or email us. This action is irreversible.</li>
                    <li><strong>Opt out</strong> &mdash; Disable email notifications from Notification Preferences without deleting your account.</li>
                </ul>
            </section>

            <section>
                <h2>9. Data Retention</h2>
                <p>
                    We retain your account data for as long as your account is active. If you delete your account, all personal data, interview recordings, submissions, and progress are permanently removed within 30 days. Anonymised, aggregated statistics (e.g. &quot;X users solved this problem&quot;) may be retained indefinitely.
                </p>
            </section>

            <section>
                <h2>10. Changes to This Policy</h2>
                <p>
                    We may update this policy from time to time. Material changes will be communicated via email or an in-app notification at least 14 days before taking effect. Continued use of CareerSpire after the effective date constitutes acceptance.
                </p>
            </section>

            <section>
                <h2>11. Contact</h2>
                <p>
                    For privacy-related questions, data access requests, or concerns, email us at <a href="mailto:gitaman8481@gmail.com">gitaman8481@gmail.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
}
