"use client";

import { Container } from "@/components/layout/Container";
import { Accordion } from "@/components/ui/Accordion";

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
    return (
        <section id="faq" className="py-24 bg-muted/30 scroll-mt-20">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground text-lg italic">
                            Everything you need to know about Eloquo.
                        </p>
                    </div>

                    <Accordion items={FAQS} className="bg-background rounded-xl p-2 border shadow-sm" />
                </div>
            </Container>
        </section>
    );
}
