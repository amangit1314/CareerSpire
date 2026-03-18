import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function CookiePolicyPage() {
    return (
        <StaticPageLayout
            title="Cookie Policy"
            subtitle="Learn how we use cookies to improve your experience."
            lastUpdated="January 29, 2026"
        >
            <section>
                <h2>1. What are Cookies?</h2>
                <p>
                    Cookies are small text files that are placed on your device by websites that you visit. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
                </p>
            </section>

            <section>
                <h2>2. How We Use Cookies</h2>
                <p>
                    We use cookies for several reasons:
                </p>
                <ul>
                    <li>**Authentication**: To keep you logged in as you move through the platform.</li>
                    <li>**Preferences**: To remember your settings (like dark mode or language).</li>
                    <li>**Analytics**: To understand how visitors use the platform.</li>
                    <li>**Security**: To help identify and prevent security risks.</li>
                </ul>
            </section>

            <section>
                <h2>3. Types of Cookies We Use</h2>
                <h3>Essential Cookies</h3>
                <p>These are necessary for the platform to function properly and cannot be switched off.</p>
                <h3>Functional Cookies</h3>
                <p>These allow us to remember choices you've made and provide enhanced features.</p>
                <h3>Performance Cookies</h3>
                <p>These help us understand how people interact with our platform so we can make it better.</p>
            </section>

            <section>
                <h2>4. Managing Your Cookies</h2>
                <p>
                    Most web browsers allow some control of cookies through the browser settings. However, please note that blocking some types of cookies may impact your experience on our platform.
                </p>
            </section>
        </StaticPageLayout>
    );
}
