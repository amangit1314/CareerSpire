import { StaticPageLayout } from "@/components/StaticPageLayout";
import { DollarSign, Rocket, Users } from "lucide-react";

export default function FundingPage() {
    return (
        <StaticPageLayout
            title="Funding & Investment"
            subtitle="Our journey to democratize technical interview preparation."
        >
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="p-8 rounded-3xl glass border border-primary/10 text-center space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold">Bootstrapped</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Built with passion and dedication to solving a real-world problem.</p>
                </div>

                <div className="p-8 rounded-3xl glass border border-primary/10 text-center space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold">Community Led</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Growing organically through user feedback and word-of-mouth.</p>
                </div>

                <div className="p-8 rounded-3xl glass border border-primary/10 text-center space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold">Future Growth</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Open to strategic partnerships that align with our core mission.</p>
                </div>
            </div>

            <section className="space-y-6 max-w-2xl mx-auto text-center">
                <h2>Our Mission</h2>
                <p className="text-lg">
                    We believe that every talented engineer deserves a fair shot at their dream job. We're building Mocky to ensure that preparation is accessible, realistic, and effective for everyone, regardless of their background.
                </p>
                <p className="text-muted-foreground">
                    Interested in joining our journey as an investor or partner? We'd love to hear from you.
                </p>
                <a
                    href="mailto:invest@Mocky.com"
                    className="inline-flex items-center px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20 dark:text-white"
                >
                    Get in Touch
                </a>
            </section>
        </StaticPageLayout>
    );
}
