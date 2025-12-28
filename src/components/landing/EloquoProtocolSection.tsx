"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Target, Microscope, Zap, Shield, Clock, Sparkles, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
    {
        icon: Target,
        title: "Classify",
        description: "Understand intent & complexity",
        color: "electric-cyan",
    },
    {
        icon: Microscope,
        title: "Analyze",
        description: "Evaluate structure & clarity",
        color: "neon-magenta",
    },
    {
        icon: Zap,
        title: "Generate",
        description: "Create optimized versions",
        color: "sunset-orange",
    },
    {
        icon: Shield,
        title: "Validate",
        description: "Quality score verification",
        color: "electric-cyan",
    },
];

const STATS = [
    { icon: Sparkles, value: "4.7", label: "Avg Quality Score", suffix: "/5.0" },
    { icon: Clock, value: "3.2", label: "Avg Processing Time", suffix: "s" },
    { icon: TrendingDown, value: "30-40", label: "Token Savings", suffix: "%" },
];

const getColorStyles = (color: string) => {
    switch (color) {
        case "electric-cyan":
            return { bg: "rgba(9,183,180,0.1)", border: "rgba(9,183,180,0.3)", text: "#09B7B4", glow: "rgba(9,183,180,0.4)" };
        case "neon-magenta":
            return { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", text: "#A855F7", glow: "rgba(168,85,247,0.4)" };
        case "sunset-orange":
            return { bg: "rgba(229,120,68,0.1)", border: "rgba(229,120,68,0.3)", text: "#E57844", glow: "rgba(229,120,68,0.4)" };
        default:
            return { bg: "rgba(9,183,180,0.1)", border: "rgba(9,183,180,0.3)", text: "#09B7B4", glow: "rgba(9,183,180,0.4)" };
    }
};

export function EloquoProtocolSection() {
    return (
        <section id="protocol" className="py-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-electric-cyan/5 rounded-full blur-[150px] -translate-y-1/2" />

            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        The Eloquo <span className="text-electric-cyan italic">Protocol</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        A 4-stage AI pipeline that transforms raw ideas into production-ready prompts.
                    </p>
                </div>

                {/* Horizontal Pipeline Flow */}
                <div className="max-w-5xl mx-auto mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 relative">
                        {PIPELINE_STAGES.map((stage, i) => {
                            const colors = getColorStyles(stage.color);
                            return (
                                <div key={i} className="relative flex flex-col items-center">
                                    {/* Card */}
                                    <div
                                        className="glass p-6 rounded-2xl border text-center w-full group hover:shadow-lg transition-all duration-300"
                                        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                                    >
                                        {/* Step Number */}
                                        <div
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded border"
                                            style={{ backgroundColor: '#0a1628', borderColor: colors.border, color: colors.text }}
                                        >
                                            0{i + 1}
                                        </div>

                                        {/* Icon */}
                                        <div
                                            className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow"
                                            style={{
                                                backgroundColor: colors.bg,
                                                borderColor: colors.border,
                                                borderWidth: 1,
                                                borderStyle: 'solid',
                                            }}
                                        >
                                            <stage.icon className="h-7 w-7" style={{ color: colors.text }} />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
                                            {stage.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-white/50">
                                            {stage.description}
                                        </p>
                                    </div>

                                    {/* Arrow connector (desktop only, not after last) */}
                                    {i < PIPELINE_STAGES.length - 1 && (
                                        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                                            <ArrowRight className="h-6 w-6 text-electric-cyan/50" />
                                        </div>
                                    )}

                                    {/* Mobile arrow (between cards) */}
                                    {i < PIPELINE_STAGES.length - 1 && (
                                        <div className="md:hidden flex justify-center py-2">
                                            <ArrowRight className="h-5 w-5 text-electric-cyan/50 rotate-90" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-6 px-8 glass rounded-2xl border border-electric-cyan/20 max-w-3xl mx-auto">
                    {STATS.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
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
