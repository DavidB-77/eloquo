"use client";

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
        content: "We use a proprietary multi-stage analysis engine that examines your prompt's intent, structure, and target model. It applies proven prompt engineering patterns to improve clarity, consistency, and the quality of AI responses you receive.",
    },
    {
        id: "faq-3",
        title: "Is my data secure?",
        content: "Yes. Your prompts are stored securely with enterprise-grade encryption and strict access controls. We never use your prompts to train any models, and all data transmission is encrypted.",
    },
    {
        id: "faq-4",
        title: "Can I cancel my subscription anytime?",
        content: "Absolutely. You can cancel your subscription anytime from your account settings. If you cancel, you'll retain access to your plan until the end of your current billing period.",
    },
    {
        id: "faq-5",
        title: "What payment methods do you accept?",
        content: "We accept all major credit cards, Apple Pay, and Google Pay.",
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
                        <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                            Knowledge <span className="text-electric-cyan italic">Base</span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-xl mx-auto font-medium tracking-wide">
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
