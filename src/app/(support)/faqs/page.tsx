import { StaticPageLayout } from "@/components/StaticPageLayout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is CareerSpire?",
        answer: "CareerSpire is an AI-powered mock interview platform designed to help software engineers prepare for technical interviews with realistic simulations and actionable feedback."
    },
    {
        question: "How does the AI feedback work?",
        answer: "Our AI analyzes your code, video response, and communication style against industry standards and specific problem constraints to provide a score and detailed improvement suggestions."
    },
    {
        question: "Which programming languages are supported?",
        answer: "Currently, we fully support JavaScript and Python for DSA interviews. Support for Java and C++ is on our roadmap for Q2 2026."
    },
    {
        question: "Is there a free trial?",
        answer: "Yes! New users get a limited number of free mock interviews to experience the platform. You can upgrade to a premium plan for unlimited practice."
    },
    {
        question: "Can I use CareerSpire for mobile interview prep?",
        answer: "Yes, our platform is fully responsive. However, for the best coding experience, we recommend using a desktop browser."
    }
];

export default function FAQPage() {
    return (
        <StaticPageLayout
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about CareerSpire and how to get the most out of your practice."
        >
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-bold text-lg">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                <p className="text-muted-foreground mb-6">Our support team is always here to help you succeed.</p>
                <a
                    href="mailto:support@CareerSpire.com"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity dark:text-white"
                >
                    Contact Support
                </a>
            </div>
        </StaticPageLayout>
    );
}
