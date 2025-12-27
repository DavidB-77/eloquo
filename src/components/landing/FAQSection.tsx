import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Accordion } from "@/components/ui/Accordion";

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
    {
        id: "faq-1",
        title: "What AI models does Eloquo support?",
        content: "Eloquo currently supports ChatGPT (GPT-3.5, GPT-4, GPT-4o), Claude (v2, v3 Haiku/Sonnet/Opus), and Gemini (1.0, 1.5 Pro/Flash). We're constantly adding new models as they release.",
    },
    {
        id: "faq-2",
        title: "How does prompt optimization work?",
        content: "We use a multi-stage process powered by Gemini 2.0 Flash that analyzes your prompt's intent, constraints, and target model. It then applies proven engineering patterns to improve clarity, reduce token usage, and enhance the quality of the AI response.",
    },
    {
        id: "faq-3",
        title: "Is my data secure?",
        content: "Yes. Your prompts are stored securely in Supabase with strict Row Level Security (RLS). We never use your prompts to train our internal models, and all interactions with external AI providers are encrypted.",
    },
    {
        id: "faq-4",
        title: "Can I cancel my subscription anytime?",
        content: "Absolutely. You can manage your subscription through our Lemon Squeezy customer portal. If you cancel, you will retain access to your plan until the end of your current billing period.",
    },
    {
        id: "faq-5",
        title: "Do you offer refunds?",
        content: "We offer a 14-day refund policy for any yearly plans if you find the service isn't right for you. Monthly plans are non-refundable but can be cancelled at any time.",
    },
    {
        id: "faq-6",
        title: "How do team plans work?",
        content: "Team plans allow you to invite up to 5 members to a shared workspace. You can collaborate on prompts, maintain a shared library, and manage billing centrally.",
    },
    {
        id: "faq-7",
        title: "Is there an API available?",
        content: "Yes, Pro and Team users get access to our developer API, allowing you to integrate Eloquo's optimization engine directly into your own applications.",
    },
    {
        id: "faq-8",
        title: "What payment methods do you accept?",
        content: "We accept all major credit cards, Apple Pay, and Google Pay via Lemon Squeezy.",
    },
];

export function FAQSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".faq-header > *", {
            scrollTrigger: {
                trigger: ".faq-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".faq-content", {
            scrollTrigger: {
                trigger: ".faq-content",
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "expo.out"
        });
    }, { scope: sectionRef });

    return (
        <section id="faq" ref={sectionRef} className="py-32 relative scroll-mt-20 overflow-hidden">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="faq-header text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-normal font-display tracking-tight mb-6 text-white uppercase glow-sm">
                            Knowledge <span className="text-electric-cyan italic">Base</span>
                        </h2>
                        <p className="text-dusty-rose text-lg max-w-xl mx-auto font-medium tracking-wide">
                            Everything you need to know about the Eloquo protocol and neuro-optimization.
                        </p>
                    </div>

                    <div className="faq-content">
                        <Accordion items={FAQS} className="rounded-3xl p-4 overflow-hidden" />
                    </div>
                </div>
            </Container>
        </section>
    );
}
