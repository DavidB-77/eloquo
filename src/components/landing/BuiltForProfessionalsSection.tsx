"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Code2, PenTool, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const PERSONAS = [
    {
        icon: Code2,
        title: "Developers & Engineers",
        description: "Build software faster with BMAD-structured prompts. Get architecture docs, implementation specs, and Cursor-ready outputs for your projects.",
        useCase: "Generate a complete PRD and tech spec for my SaaS idea",
        color: "electric-cyan",
    },
    {
        icon: PenTool,
        title: "Content Creators & Marketers",
        description: "Create consistent, high-quality content prompts. Stop getting generic AI outputs - get prompts engineered for your specific brand voice and goals.",
        useCase: "Write product descriptions that convert",
        color: "sunset-orange",
    },
    {
        icon: BarChart3,
        title: "Researchers & Analysts",
        description: "Structure complex research queries for deeper, more accurate AI responses. Extract insights from documents and images with context-aware prompts.",
        useCase: "Analyze this dataset and identify trends",
        color: "neon-magenta",
    },
];

export function BuiltForProfessionalsSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".professionals-header > *", {
            scrollTrigger: {
                trigger: ".professionals-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".persona-card", {
            scrollTrigger: {
                trigger: ".persona-cards",
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "expo.out"
        });
    }, { scope: sectionRef });

    const getColorStyles = (color: string) => {
        switch (color) {
            case "electric-cyan":
                return { bg: "rgba(9,183,180,0.1)", border: "rgba(9,183,180,0.2)", text: "#09B7B4" };
            case "sunset-orange":
                return { bg: "rgba(229,120,68,0.1)", border: "rgba(229,120,68,0.2)", text: "#E57844" };
            case "neon-magenta":
                return { bg: "rgba(255,0,255,0.1)", border: "rgba(255,0,255,0.2)", text: "#FF00FF" };
            default:
                return { bg: "rgba(9,183,180,0.1)", border: "rgba(9,183,180,0.2)", text: "#09B7B4" };
        }
    };

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            <Container>
                <div className="professionals-header text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Built for <span className="text-electric-cyan italic">Professionals</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        Whether you're building software, creating content, or conducting research - Eloquo adapts to your workflow.
                    </p>
                </div>

                <div className="persona-cards grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PERSONAS.map((persona, i) => {
                        const colors = getColorStyles(persona.color);
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "persona-card glass p-6 rounded-2xl border border-white/10 hover:border-opacity-50 transition-all duration-300 group flex flex-col",
                                    "bg-gradient-to-br from-midnight/80 to-deep-teal/5"
                                )}
                                style={{ '--hover-color': colors.border } as React.CSSProperties}
                            >
                                <div
                                    className="h-14 w-14 rounded-xl flex items-center justify-center mb-5"
                                    style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderStyle: 'solid' }}
                                >
                                    <persona.icon className="h-7 w-7" style={{ color: colors.text }} />
                                </div>

                                <h3 className="text-lg font-bold text-white mb-3">
                                    {persona.title}
                                </h3>

                                <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1">
                                    {persona.description}
                                </p>

                                <div className="mt-auto">
                                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Example use case</div>
                                    <div
                                        className="px-4 py-3 rounded-xl text-sm font-medium"
                                        style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderWidth: 1, borderStyle: 'solid' }}
                                    >
                                        "{persona.useCase}"
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
