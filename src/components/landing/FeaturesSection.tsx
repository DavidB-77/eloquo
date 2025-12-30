"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    BarChart3,
    Wand2,
    Layers,
    History,
    Zap,
    TrendingUp,
    GitBranch
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
    {
        title: "Prompt Analysis",
        description: "Understand exactly why your prompts work or don't—with actionable insights to improve.",
        icon: <BarChart3 className="h-6 w-6" />,
    },
    {
        title: "One-Click Optimization",
        description: "Transform loose ideas into precision-engineered prompts that get results on the first try.",
        icon: <Wand2 className="h-6 w-6" />,
    },
    {
        title: "Formatted For Your AI",
        description: "Each AI thinks differently. Claude gets XML, ChatGPT gets markdown, Gemini gets clean prose.",
        icon: <Layers className="h-6 w-6" />,
    },
    {
        title: "Efficiency Insights",
        description: "See exactly how your prompts improved. Track your optimization history and level up over time.",
        icon: <TrendingUp className="h-6 w-6" />,
    },
    {
        title: "History & Versioning",
        description: "Never lose a great prompt again. Track iterations and revert anytime.",
        icon: <History className="h-6 w-6" />,
    },
    {
        title: "BMAD Integration",
        description: "Generate structured prompts following the BMAD methodology for complex projects.",
        icon: <GitBranch className="h-6 w-6" />,
    },
];

export function FeaturesSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".features-header > *", {
            scrollTrigger: {
                trigger: ".features-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out"
        });

        gsap.from(".feature-card", {
            scrollTrigger: {
                trigger: ".features-grid",
                start: "top 85%",
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section id="features" ref={sectionRef} className="py-32 relative scroll-mt-20 overflow-hidden">
            <Container>
                <div className="features-header text-center mb-20">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-[10px] font-bold mb-6 uppercase tracking-[0.2em] animate-pulse">
                        <Zap className="h-3 w-3 fill-current" />
                        <span>Core Matrix Modules</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Master AI Communication
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium leading-relaxed tracking-wide">
                        Powerful modules designed to make your AI interactions faster, more precise, and more consistent.
                    </p>
                </div>

                <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature) => (
                        <div key={feature.title} className="feature-card group">
                            <Card className="h-full glass glass-hover bg-deep-teal/5 border-electric-cyan/10 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <div className="h-24 w-24 [&>svg]:h-full [&>svg]:w-full">
                                        {feature.icon}
                                    </div>
                                </div>
                                <CardHeader className="relative z-10">
                                    <div className="h-14 w-14 rounded-xl bg-deep-teal/40 border border-electric-cyan/20 text-electric-cyan flex items-center justify-center mb-6 group-hover:bg-electric-cyan group-hover:text-midnight group-hover:shadow-[0_0_20px_rgba(9,183,180,0.4)] transition-all duration-500">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-white font-display uppercase tracking-widest text-lg">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <p className="text-white/60 text-sm leading-relaxed font-normal">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
