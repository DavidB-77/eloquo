"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, FileText, Building2, ListChecks, Check, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const DOCUMENTS = [
    {
        icon: FileText,
        title: "PRD",
        subtitle: "Product Requirements",
        items: ["Requirements", "User Stories", "MVP Scope", "Success KPIs"],
    },
    {
        icon: Building2,
        title: "Architecture",
        subtitle: "Technical Design",
        items: ["Tech Stack", "Database Schema", "API Design", "Infrastructure"],
    },
    {
        icon: ListChecks,
        title: "Stories",
        subtitle: "Implementation Plan",
        items: ["Sprint-Ready", "Acceptance Criteria", "Dependencies", "Test Cases"],
    },
];

const FEATURES = [
    "Works with Cursor, VS Code, Claude Code, Windsurf",
    "BMAD-compatible output format",
    "Complete SQL schemas & API endpoints included",
    "Mermaid diagrams for architecture visualization",
];

export function ProjectProtocolSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".pp-header > *", {
            scrollTrigger: {
                trigger: ".pp-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".pp-doc-card", {
            scrollTrigger: {
                trigger: ".pp-docs",
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "expo.out"
        });

        gsap.from(".pp-feature", {
            scrollTrigger: {
                trigger: ".pp-features",
                start: "top 85%",
            },
            x: -20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            {/* Purple accent for developer section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />

            <Container>
                <div className="pp-header text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                        <Code2 className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">For Developers</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Project <span className="text-purple-400 italic">Protocol</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-xl mx-auto font-medium tracking-wide">
                        From Idea to Implementation-Ready in Under 2 Minutes
                    </p>
                </div>

                <p className="text-center text-white/50 mb-12 max-w-2xl mx-auto">
                    Describe your project once. Get three production-ready documents:
                </p>

                {/* Document Cards */}
                <div className="pp-docs grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {DOCUMENTS.map((doc, i) => (
                        <div
                            key={i}
                            className={cn(
                                "pp-doc-card glass p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group",
                                "bg-gradient-to-br from-purple-500/5 to-transparent"
                            )}
                        >
                            <div className="h-14 w-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-shadow">
                                <doc.icon className="h-7 w-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-wide">
                                {doc.title}
                            </h3>
                            <p className="text-sm text-purple-400/80 mb-4">{doc.subtitle}</p>
                            <ul className="space-y-2">
                                {doc.items.map((item, j) => (
                                    <li key={j} className="text-sm text-white/50 flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-purple-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Features */}
                <div className="pp-features flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
                    {FEATURES.map((feature, i) => (
                        <div key={i} className="pp-feature flex items-center gap-2 text-sm text-white/60">
                            <Check className="h-4 w-4 text-electric-cyan" />
                            {feature}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button
                        size="lg"
                        className="h-14 px-10 bg-gradient-to-r from-purple-500 to-electric-cyan text-white font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                        asChild
                    >
                        <Link href="/signup">
                            Try Project Protocol <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <p className="mt-6 text-sm text-white/40 italic">
                        "Skip weeks of planning. Get production-ready specs in 90 seconds."
                    </p>
                </div>
            </Container>
        </section>
    );
}
