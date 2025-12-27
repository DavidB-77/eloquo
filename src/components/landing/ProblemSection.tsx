"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, ZapOff, TrendingDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PAIN_POINTS = [
    {
        title: "Inconsistent AI Outputs",
        description: "Poorly structured prompts lead to unpredictable results, forcing you to retry and waste time.",
        icon: <ZapOff className="h-10 w-10 text-electric-cyan" />,
    },
    {
        title: "Wasted API Credits",
        description: "Verbose and inefficient prompts consume 2-3x more tokens than necessary, ballooning your bills.",
        icon: <TrendingDown className="h-10 w-10 text-electric-cyan" />,
    },
    {
        title: "No Visibility",
        description: "Without tracking, you have no way to know which prompt versions performed best or saved most.",
        icon: <AlertCircle className="h-10 w-10 text-electric-cyan" />,
    },
];

export function ProblemSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".problem-header > *", {
            scrollTrigger: {
                trigger: ".problem-header",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".problem-card", {
            scrollTrigger: {
                trigger: ".problem-grid",
                start: "top 75%",
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "expo.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-32 relative overflow-hidden">
            <Container>
                <div className="problem-header text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Process Friction <span className="text-terracotta italic">&</span> Dead Tokens
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide border-l-2 border-electric-cyan pl-6">
                        Using AI shouldn&apos;t be a guessing game. Eloquo solves the primary hurdles in LLM communication.
                    </p>
                </div>

                <div className="problem-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PAIN_POINTS.map((point) => (
                        <div key={point.title} className="problem-card group">
                            <Card className="h-full glass glass-hover bg-deep-teal/5 border-electric-cyan/10 p-10 text-center transition-all duration-500">
                                <CardContent className="p-0">
                                    <div className="mb-8 flex justify-center group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(9,183,180,0.4)] transition-all duration-500">
                                        {point.icon}
                                    </div>
                                    <h3 className="text-xl font-display text-white mb-4 uppercase tracking-widest">{point.title}</h3>
                                    <p className="text-white/60 leading-relaxed font-medium">
                                        {point.description}
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
