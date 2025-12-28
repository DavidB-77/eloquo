"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Target, Microscope, Zap, Shield, Clock, Sparkles, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STAGES = [
    {
        icon: Target,
        step: "01",
        title: "Classify",
        subtitle: "Intent Classification",
        description: "AI analyzes your prompt to understand intent, complexity, and domain. Determines if clarifying questions are needed.",
        model: "Gemini Flash",
        modelNote: "Fast & accurate",
        color: "electric-cyan",
    },
    {
        icon: Microscope,
        step: "02",
        title: "Analyze",
        subtitle: "Deep Analysis",
        description: "For complex prompts, performs deep analysis to identify gaps, implicit requirements, and optimization opportunities.",
        model: "Claude Sonnet",
        modelNote: "Nuanced reasoning",
        color: "neon-magenta",
    },
    {
        icon: Zap,
        step: "03",
        title: "Generate",
        subtitle: "Prompt Generation",
        description: "Generates three versions - Full (comprehensive), Quick-Ref (condensed), and Snippet (one-liner). Structured with roles, context, and constraints.",
        model: "Tier-appropriate",
        modelNote: "DeepSeek to Claude",
        color: "sunset-orange",
    },
    {
        icon: Shield,
        step: "04",
        title: "Validate",
        subtitle: "Quality Validation",
        description: "An AI judge reviews the output and scores it 1-5 on clarity, completeness, structure, and effectiveness.",
        model: "Claude Haiku",
        modelNote: "Quality assurance",
        color: "electric-cyan",
    },
];

const STATS = [
    { icon: Sparkles, value: "4.7", label: "Avg Quality Score", suffix: "/5.0" },
    { icon: Clock, value: "3.2", label: "Avg Processing Time", suffix: "s" },
    { icon: TrendingDown, value: "30-40", label: "Token Savings", suffix: "%" },
];

export function EloquoProtocolSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".protocol-header > *", {
            scrollTrigger: {
                trigger: ".protocol-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".protocol-stage", {
            scrollTrigger: {
                trigger: ".protocol-stages",
                start: "top 80%",
            },
            x: -30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "expo.out"
        });

        gsap.from(".protocol-stat", {
            scrollTrigger: {
                trigger: ".protocol-stats",
                start: "top 90%",
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section id="protocol" ref={sectionRef} className="py-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-electric-cyan/5 rounded-full blur-[150px] -translate-y-1/2" />

            <Container>
                <div className="protocol-header text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        The Eloquo <span className="text-electric-cyan italic">Protocol</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        A 4-stage AI pipeline that transforms raw ideas into production-ready prompts.
                    </p>
                </div>

                {/* Pipeline Stages */}
                <div className="protocol-stages space-y-4 max-w-4xl mx-auto mb-16">
                    {PIPELINE_STAGES.map((stage, i) => (
                        <div
                            key={i}
                            className={cn(
                                "protocol-stage glass p-6 rounded-2xl border border-white/10 hover:border-electric-cyan/30 transition-all duration-300",
                                "bg-gradient-to-r from-midnight/80 to-deep-teal/5 group"
                            )}
                        >
                            <div className="flex items-start gap-6">
                                {/* Step Number & Icon */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className={cn(
                                            "h-14 w-14 rounded-xl flex items-center justify-center",
                                            `bg-${stage.color}/10 border border-${stage.color}/20`
                                        )}
                                            style={{
                                                backgroundColor: stage.color === "electric-cyan" ? "rgba(9,183,180,0.1)" :
                                                    stage.color === "neon-magenta" ? "rgba(255,0,255,0.1)" :
                                                        stage.color === "sunset-orange" ? "rgba(229,120,68,0.1)" : "rgba(9,183,180,0.1)",
                                                borderColor: stage.color === "electric-cyan" ? "rgba(9,183,180,0.2)" :
                                                    stage.color === "neon-magenta" ? "rgba(255,0,255,0.2)" :
                                                        stage.color === "sunset-orange" ? "rgba(229,120,68,0.2)" : "rgba(9,183,180,0.2)"
                                            }}
                                        >
                                            <stage.icon className="h-6 w-6 text-electric-cyan" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white/30 bg-midnight px-1.5 py-0.5 rounded border border-white/10">
                                            {stage.step}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                                            {stage.title}
                                        </h3>
                                        <span className="text-xs text-white/40">
                                            {stage.subtitle}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/60 leading-relaxed mb-3">
                                        {stage.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/50 font-mono">
                                            {stage.model}
                                        </span>
                                        <span className="text-white/30">
                                            {stage.modelNote}
                                        </span>
                                    </div>
                                </div>

                                {/* Connector line */}
                                {i < PIPELINE_STAGES.length - 1 && (
                                    <div className="hidden md:block absolute left-[3.25rem] top-[4.5rem] w-px h-4 bg-gradient-to-b from-electric-cyan/30 to-transparent" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="protocol-stats flex flex-wrap items-center justify-center gap-8 md:gap-16 py-6 px-8 glass rounded-2xl border border-electric-cyan/20 max-w-3xl mx-auto">
                    {STATS.map((stat, i) => (
                        <div key={i} className="protocol-stat flex items-center gap-3">
                            <stat.icon className="h-5 w-5 text-electric-cyan" />
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-display text-white">{stat.value}</span>
                                    <span className="text-sm text-white/40">{stat.suffix}</span>
                                </div>
                                <span className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
