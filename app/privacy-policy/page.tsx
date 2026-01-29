import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function PrivacyPolicyPage() {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="Last updated: January 29, 2026"
            lastUpdated="January 29, 2026"
        >
            <section>
                <h2>1. Introduction</h2>
                <p>
                    At Mocky, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
            </section>

            <section>
                <h2>2. Information We Collect</h2>
                <h3>Personal Data</h3>
                <p>
                    We collect information that you provide directly to us, such as your name, email address, and professional background when you create an account.
                </p>
                <h3>Usage Data</h3>
                <p>
                    We automatically collect certain information when you visit, use, or navigate the platform. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser, and device characteristics.
                </p>
                <h3>Interview Data</h3>
                <p>
                    We record and process your interview sessions, including video, audio, and code submissions, to provide AI-powered feedback and improve our algorithms.
                </p>
            </section>

            <section>
                <h2>3. How We Use Your Information</h2>
                <p>
                    We use your information to provide, operate, and maintain our platform, including:
                </p>
                <ul>
                    <li>Generating AI feedback for your interviews.</li>
                    <li>Processing your transactions and managing your subscription.</li>
                    <li>Sending you technical notices, updates, and support messages.</li>
                    <li>Improving our AI models and platform features.</li>
                </ul>
            </section>

            <section>
                <h2>4. Data Sharing and Disclosure</h2>
                <p>
                    We do not sell your personal data. We may share information with:
                </p>
                <ul>
                    <li>**Service Providers**: Third-party vendors who perform services for us (e.g., payment processing, cloud hosting).</li>
                    <li>**AI Partners**: Securely processing data for feedback generation.</li>
                    <li>**Legal Obligations**: If required by law or to protect our rights.</li>
                </ul>
            </section>

            <section>
                <h2>5. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational security measures to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                </p>
            </section>

            <section>
                <h2>6. Your Privacy Rights</h2>
                <p>
                    Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data.
                </p>
            </section>

            <section>
                <h2>7. Contact Us</h2>
                <p>
                    If you have questions or comments about this policy, you may email us at **support@Mocky.com**.
                </p>
            </section>
        </StaticPageLayout>
    );
}
