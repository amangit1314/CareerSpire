import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function LicensePage() {
    return (
        <StaticPageLayout
            title="License Agreement"
            subtitle="The terms governing your use of our software and materials."
            lastUpdated="January 29, 2026"
        >
            <section>
                <h2>1. Grant of License</h2>
                <p>
                    CareerSpire granting you a personal, non-exclusive, non-transferable, limited license to use the platform in accordance with the terms of this agreement and our Terms of Service.
                </p>
            </section>

            <section>
                <h2>2. Restrictions</h2>
                <p>
                    You agree not to, and you will not permit others to:
                </p>
                <ul>
                    <li>License, sell, rent, lease, assign, distribute, host, or otherwise commercially exploit the platform.</li>
                    <li>Modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the platform.</li>
                    <li>Remove, alter or obscure any proprietary notice (including any notice of copyright or trademark).</li>
                </ul>
            </section>

            <section>
                <h2>3. Intellectual Property</h2>
                <p>
                    The platform and its original content, features, and functionality are and will remain the exclusive property of CareerSpire and its licensors.
                </p>
            </section>

            <section>
                <h2>4. Termination</h2>
                <p>
                    This License shall remain in effect until terminated by you or CareerSpire. The license will terminate immediately if you fail to comply with any term of this agreement.
                </p>
            </section>
        </StaticPageLayout>
    );
}
