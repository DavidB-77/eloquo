"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, FileText, Building2, Code2, Repeat, CheckCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const BENEFITS = [
    {
        icon: Repeat,
        title: "Skip the Boilerplate",
        description: "Stop writing the same prompt structures over and over. Get PRD templates, architecture docs, and implementation guides instantly.",
    },
    {
        icon: CheckCircle,
        title: "Consistent Quality",
        description: "Every project follows the same proven methodology. No more ad-hoc prompting that misses critical requirements.",
    },
    {
        icon: Code2,
        title: "Cursor/IDE Ready",
        description: "Output formats designed for Cursor, VS Code, and modern AI-assisted development workflows.",
    },
];

export function BMADSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".bmad-header > *", {
            scrollTrigger: {
                trigger: ".bmad-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".bmad-flow", {
            scrollTrigger: {
                trigger: ".bmad-flow",
                start: "top 80%",
            },
            scale: 0.95,
            opacity: 0,
            duration: 1,
            ease: "expo.out"
        });

        gsap.from(".bmad-benefit", {
            scrollTrigger: {
                trigger: ".bmad-benefits",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            {/* Purple-ish accent for developer section */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />

            <Container>
                <div className="bmad-header text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                        <Code2 className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">For Developers</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Built for <span className="text-purple-400 italic">Serious</span> Development
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        Eloquo integrates the BMAD methodology for structured AI-driven development
                    </p>
                </div>

                {/* What is BMAD */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="glass p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                        <h3 className="text-lg font-bold text-white mb-3">What is BMAD?</h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                            <strong className="text-purple-400">BMAD</strong> (Breakthrough Method for Agile AI-Driven Development) is an open-source framework with <strong className="text-white">24,000+ GitHub stars</strong>, used by professional developers to structure complex projects with AI assistance.
                        </p>
                    </div>
                </div>

                {/* Flow Diagram */}
                <div className="bmad-flow max-w-4xl mx-auto mb-16">
                    <div className="glass p-8 rounded-2xl border border-white/10">
                        <div className="text-center mb-6">
                            <span className="text-sm text-white/40 uppercase tracking-wider">How Eloquo Uses BMAD</span>
                        </div>

                        {/* Your Project Idea */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-electric-cyan/10 border border-electric-cyan/30 rounded-xl">
                                <span className="text-sm font-bold text-electric-cyan">Your Project Idea</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center mb-6">
                            <div className="w-px h-8 bg-gradient-to-b from-electric-cyan/50 to-white/20" />
                        </div>

                        {/* Three Prompt Types */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                { icon: FileText, title: "PM Prompt", items: ["Product Requirements", "User Stories", "MVP Scope"] },
                                { icon: Building2, title: "Architect Prompt", items: ["System Architecture", "Tech Stack", "Database Schema"] },
                                { icon: Code2, title: "Dev Prompt", items: ["Implementation", "Code Specs", "Test Plans"] },
                            ].map((prompt, i) => (
                                <div key={i} className="bg-midnight/60 border border-white/10 rounded-xl p-5 text-center">
                                    <prompt.icon className="h-6 w-6 text-purple-400 mx-auto mb-3" />
                                    <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">{prompt.title}</h4>
                                    <ul className="space-y-1">
                                        {prompt.items.map((item, j) => (
                                            <li key={j} className="text-xs text-white/50">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center mb-6">
                            <div className="w-px h-8 bg-gradient-to-b from-white/20 to-electric-cyan/50" />
                        </div>

                        {/* Output */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-electric-cyan/10 border border-electric-cyan/30 rounded-xl">
                                <span className="text-sm font-bold text-electric-cyan">Production-Ready Development Prompts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="bmad-benefits grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {BENEFITS.map((benefit, i) => (
                        <div
                            key={i}
                            className="bmad-benefit glass p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                        >
                            <benefit.icon className="h-8 w-8 text-purple-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                            <p className="text-sm text-white/60 leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button size="lg" className="btn-gradient px-10 h-14 rounded-xl text-lg font-bold uppercase tracking-wider" asChild>
                        <Link href="/signup">
                            Try BMAD Optimization <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <p className="mt-4 text-xs text-white/40">
                        BMAD is open source. <a href="https://github.com/bmad-code-org/BMAD-METHOD" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                            Learn more <ExternalLink className="h-3 w-3" />
                        </a>
                    </p>
                </div>
            </Container>
        </section>
    );
}
