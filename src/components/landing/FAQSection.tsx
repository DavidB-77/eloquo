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
        content: "Eloquo supports all major AI models including ChatGPT (GPT-4, GPT-4o), Claude (Sonnet, Opus, Haiku), and Gemini (Pro, Flash). Our Universal mode creates prompts optimized for any model, or you can target a specific model for tailored results.",
    },
    {
        id: "faq-2",
        title: "How does prompt optimization work?",
        content: "Eloquo uses a 4-stage AI pipeline: First, we classify your intent and complexity. Then we perform deep analysis to identify gaps and improvements. Next, we generate an optimized prompt with clear structure, constraints, and context. Finally, an AI validator scores your prompt for quality (1-5 scale) to ensure excellence.",
    },
    {
        id: "faq-3",
        title: "Can I upload files and images?",
        content: "Yes! You can upload images, screenshots, documents, and other files. Our AI analyzes the content and incorporates relevant context into your optimized prompt. Files are processed in real-time and never stored - your data stays private.",
    },
    {
        id: "faq-4",
        title: "What is the Quality Score?",
        content: "Every optimization includes an AI-powered quality validation. Our system rates your optimized prompt from 1-5 based on clarity, completeness, structure, and effectiveness. This ensures you always receive production-ready prompts.",
    },
    {
        id: "faq-5",
        title: "What are the pricing tiers?",
        content: "We offer three plans: Basic ($9/month) for 150 optimizations, Pro ($19/month) for 400 optimizations with enhanced models, and Business ($39/month) for 1,000 optimizations with priority processing. All plans include file uploads, quality scoring, and multi-model support.",
    },
    {
        id: "faq-6",
        title: "Is my data secure?",
        content: "Absolutely. Your prompts are encrypted in transit and at rest. Uploaded files are processed ephemerally (in memory only) and immediately discarded - we never store your files. We never use your data to train any models.",
    },
    {
        id: "faq-7",
        title: "Can I cancel anytime?",
        content: "Yes, cancel anytime from your account settings. You'll retain access until the end of your billing period.",
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
                            Everything you need to know about Eloquo and prompt optimization.
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
