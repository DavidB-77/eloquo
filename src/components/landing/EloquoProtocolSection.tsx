"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Target, Microscope, Zap, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
    {
        icon: Target,
        step: "01",
        title: "Classify",
        description: "Understand intent & complexity",
        color: "#09B7B4", // electric-cyan
    },
    {
        icon: Microscope,
        step: "02",
        title: "Analyze",
        description: "Evaluate structure & gaps",
        color: "#A855F7", // purple
    },
    {
        icon: Zap,
        step: "03",
        title: "Generate",
        description: "Create optimized versions",
        color: "#E57844", // sunset-orange
    },
    {
        icon: Shield,
        step: "04",
        title: "Validate",
        description: "Quality score verification",
        color: "#09B7B4", // electric-cyan
    },
];

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
                <div className="max-w-5xl mx-auto mb-12">
                    {/* Desktop: Horizontal layout */}
                    <div className="hidden md:flex items-center justify-between">
                        {PIPELINE_STAGES.map((stage, i) => (
                            <React.Fragment key={i}>
                                {/* Stage Card */}
                                <div className="flex flex-col items-center text-center flex-1">
                                    {/* Icon Circle */}
                                    <div
                                        className="h-20 w-20 rounded-2xl flex items-center justify-center mb-4 relative group transition-all duration-300 hover:scale-105"
                                        style={{
                                            backgroundColor: `${stage.color}15`,
                                            border: `2px solid ${stage.color}40`,
                                            boxShadow: `0 0 30px ${stage.color}20`,
                                        }}
                                    >
                                        {/* Step number badge */}
                                        <span
                                            className="absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: stage.color, color: '#0a1628' }}
                                        >
                                            {stage.step}
                                        </span>
                                        <stage.icon className="h-9 w-9" style={{ color: stage.color }} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-wide">
                                        {stage.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-white/50 max-w-[140px]">
                                        {stage.description}
                                    </p>
                                </div>

                                {/* Arrow Connector */}
                                {i < PIPELINE_STAGES.length - 1 && (
                                    <div className="flex items-center px-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-8 h-px bg-gradient-to-r from-electric-cyan/60 to-electric-cyan/20" />
                                            <ChevronRight className="h-5 w-5 text-electric-cyan/60" />
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile: Vertical layout */}
                    <div className="md:hidden space-y-6">
                        {PIPELINE_STAGES.map((stage, i) => (
                            <div key={i} className="flex items-center gap-4">
                                {/* Icon */}
                                <div
                                    className="h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                                    style={{
                                        backgroundColor: `${stage.color}15`,
                                        border: `2px solid ${stage.color}40`,
                                    }}
                                >
                                    <span
                                        className="absolute -top-2 -right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ backgroundColor: stage.color, color: '#0a1628' }}
                                    >
                                        {stage.step}
                                    </span>
                                    <stage.icon className="h-7 w-7" style={{ color: stage.color }} />
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                                        {stage.title}
                                    </h3>
                                    <p className="text-sm text-white/50">
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tagline (replaces stats bar) */}
                <div className="text-center">
                    <p className="text-white/40 text-sm italic tracking-wide">
                        Every prompt passes through all 4 stages. No shortcuts. No compromises.
                    </p>
                </div>
            </Container>
        </section>
    );
}
