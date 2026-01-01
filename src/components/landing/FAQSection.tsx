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
        title: "How does Eloquo's Adaptive Intelligence work?",
        content: "Every time you rate an optimization, that feedback trains our system. Our AI continuously analyzes patterns across all rated prompts—what worked, what didn't, and why—then evolves its strategies. The result: Eloquo gets measurably better with every use. Your ratings directly improve the system for you and everyone else.",
    },
    {
        id: "faq-2",
        title: "What AI models does Eloquo support?",
        content: "Eloquo supports all major AI models including ChatGPT (GPT-4, GPT-4o), Claude (Sonnet, Opus, Haiku), and Gemini (Pro, Flash). Our system creates prompts optimized for any model, or you can target a specific model for tailored results.",
    },
    {
        id: "faq-3",
        title: "Can I export my prompt history?",
        content: "Absolutely. Your prompts are yours. Every plan includes one-click export of your complete library: original prompts, optimized versions, quality scores, ratings, and timestamps. Download as JSON or CSV anytime. No lock-in, ever.",
    },
    {
        id: "faq-4",
        title: "What is MCP and why should I care?",
        content: "MCP (Model Context Protocol) is an open standard that lets AI tools connect to each other—think of it like USB-C for AI. With Eloquo's MCP server (Pro & Business), you can optimize prompts directly inside Claude Desktop, Cursor, Windsurf, Claude Code, or any MCP-compatible tool. No copy-paste, no switching apps. Optimize where you work.",
    },
    {
        id: "faq-5",
        title: "Where else can I use Eloquo besides the web app?",
        content: "Today: Web dashboard (any device) and REST API (Pro & Business). Coming soon: MCP server for IDE integration, browser extensions for ChatGPT/Claude.ai/Gemini, and native plugins for VS Code and Cursor. Our goal: optimize prompts anywhere you write them.",
    },
    {
        id: "faq-6",
        title: "Is my data used to train your AI?",
        content: "Your actual prompt content is never used for training—that stays completely private. What we learn from is anonymous patterns: rating scores, complexity levels, domain categories, and success signals. This lets us improve optimization strategies while keeping your specific prompts confidential.",
    },
    {
        id: "faq-7",
        title: "What are the pricing tiers?",
        content: "Basic ($7/month): 150 optimizations, 6-month history, export capability. Pro ($9/month founding, $15 regular): 400 optimizations, 1-year history, MCP server access, full API. Business ($20/month founding, $35 regular): 1000 optimizations, unlimited history, priority processing, dedicated support.",
    },
    {
        id: "faq-8",
        title: "What is Project Protocol?",
        content: "Project Protocol is our advanced feature for developers. Describe your project idea, and we generate three production-ready documents: a Product Requirements Document (PRD), Technical Architecture Document, and Implementation Stories. It's like having a senior PM, architect, and scrum master on demand.",
    },
    {
        id: "faq-9",
        title: "Can I upload files and images?",
        content: "Yes! You can upload images, screenshots, documents, and other files. Our AI analyzes the content and incorporates relevant context into your optimized prompt. Files are processed in real-time and never stored - your data stays private.",
    },
    {
        id: "faq-10",
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
