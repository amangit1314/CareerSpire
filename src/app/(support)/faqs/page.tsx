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
        answer: "CareerSpire is an AI-powered interview preparation platform for college students and early-career engineers. It offers AI mock interviews (text and video), a DSA Practice Hub with an in-browser code editor, an adaptive AI tutor, curated learning tracks, and a community for sharing interview experiences."
    },
    {
        question: "Is CareerSpire free?",
        answer: "Yes. The free tier includes 3 AI mock interviews per month, unlimited Practice Hub access (100+ DSA problems), 10 AI tutor messages per day, full access to all learning tracks, and gamification features (XP, coins, streaks, badges). No credit card required."
    },
    {
        question: "What paid plans do you offer?",
        answer: "We have two paid plans: Pro (₹499/month) with 15 mocks, 3 video mocks, and 150 tutor messages/day, and Placement (₹999/month) with 30 mocks, 10 video mocks, unlimited tutor access, and priority support. Both plans also offer discounted yearly billing. We also sell pay-as-you-go mock packs (starting at ₹79) and voice interview packs (starting at ₹149)."
    },
    {
        question: "Which programming languages are supported?",
        answer: "The code editor and test runner support JavaScript, Python, and Java for DSA and coding mock interviews. Each language runs in a sandboxed environment with a 3-second time limit and 256MB memory cap."
    },
    {
        question: "How does the AI feedback work?",
        answer: "When you submit code or answer a question, our AI (powered by Groq's Llama 3.3 with Google Gemini as fallback) evaluates your solution against test cases, analyses code quality, and generates a detailed feedback report with scores, strengths, and areas for improvement."
    },
    {
        question: "What is the AI Tutor?",
        answer: "The AI Tutor is a chat-based learning assistant available on every topic page. It uses Socratic questioning to guide you through concepts without giving away answers directly. It adapts to your level — whether you're stuck, want a hint, or want to be tested."
    },
    {
        question: "How do video mock interviews work?",
        answer: "You choose a mode (technical, non-technical, or mixed), and the AI generates interview questions. You record your answers on camera, and the AI evaluates your transcript for content quality. Recordings are stored securely in Supabase Storage and you can optionally share them with the community."
    },
    {
        question: "What is the Practice Hub?",
        answer: "The Practice Hub is a LeetCode-style problem-solving environment with DSA problems, an in-browser code editor (Monaco), instant test execution, submission history, and bookmarking. Solving problems earns XP and coins, which contribute to your streak and leaderboard ranking."
    },
    {
        question: "How do streaks, XP, and coins work?",
        answer: "You earn XP for solving problems and completing mocks. Coins are awarded for correct submissions and can be spent on hints or solution unlocks. Maintaining a daily practice streak earns bonus rewards. Badges unlock at milestones. The leaderboard ranks users by weekly XP."
    },
    {
        question: "Can I get a refund?",
        answer: "Monthly plans are refundable within 7 days if you've used fewer than 3 mocks. Annual plans within 14 days with fewer than 5 mocks used. Mock and voice packs are refundable within 48 hours if unused. See our Refund & Billing page for full details."
    },
    {
        question: "Is my data safe?",
        answer: "Yes. Passwords are hashed with bcrypt (12 rounds), sessions use HTTP-only JWT cookies, auth endpoints are rate-limited, and we don't use any third-party tracking cookies. Video recordings are stored with time-limited signed URLs. You can delete your account and all data anytime."
    },
    {
        question: "What payment methods do you accept?",
        answer: "Payments are processed through Razorpay in Indian Rupees (INR). We accept UPI, credit/debit cards, net banking, and popular wallets."
    },
];

export default function FAQPage() {
    return (
        <StaticPageLayout
            title="Frequently Asked Questions"
            subtitle="Common questions about CareerSpire, pricing, and features."
        >
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-bold text-sm sm:text-base">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <div className="mt-10 p-6 rounded-xl border border-border bg-card/50 text-center">
                <h3 className="text-sm font-bold mb-1">Still have questions?</h3>
                <p className="text-xs text-muted-foreground mb-4">Our support team is here to help.</p>
                <a
                    href="mailto:gitaman8481@gmail.com"
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    Contact Support
                </a>
            </div>
        </StaticPageLayout>
    );
}
