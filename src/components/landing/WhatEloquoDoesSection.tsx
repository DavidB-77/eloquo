"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Brain, Image, Grid3X3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
    {
        icon: Brain,
        title: "AI-Powered Optimization",
        description: "Our 4-stage AI pipeline analyzes your intent, identifies gaps, generates production-ready prompts, and validates quality. Every prompt is scored 1-5 by an AI judge to ensure excellence.",
    },
    {
        icon: Image,
        title: "Context-Aware File Processing",
        description: "Upload screenshots, documents, images, or code files. Our AI extracts relevant context and incorporates it into your optimized prompt. Files are processed in real-time and never stored.",
    },
    {
        icon: Grid3X3,
        title: "Optimized for Every AI",
        description: "Get prompts tailored for ChatGPT, Claude, Gemini, or use Universal mode for cross-platform compatibility. Each model has unique strengths - we optimize accordingly.",
    },
];

export function WhatEloquoDoesSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        More Than Just <span className="text-electric-cyan italic">Optimization</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        A complete prompt engineering platform that transforms raw ideas into production-ready AI instructions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map((feature, i) => (
                        <div
                            key={i}
                            className={cn(
                                "glass p-6 rounded-2xl border border-white/10 hover:border-electric-cyan/30 transition-all duration-300 group",
                                "bg-gradient-to-br from-midnight/80 to-deep-teal/10"
                            )}
                        >
                            <div className="h-12 w-12 rounded-xl bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center mb-5 group-hover:shadow-[0_0_20px_rgba(9,183,180,0.3)] transition-shadow">
                                <feature.icon className="h-6 w-6 text-electric-cyan" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {feature.description}
                            </p>
                            {/* Visual representation */}
                            {i === 0 && (
                                <div className="flex items-center gap-1 mt-4 text-[10px] font-mono flex-wrap">
                                    <span className="px-2 py-1 bg-electric-cyan/10 border border-electric-cyan/20 rounded text-electric-cyan">Input</span>
                                    <ArrowRight className="h-3 w-3 text-white/30" />
                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">Classify</span>
                                    <ArrowRight className="h-3 w-3 text-white/30" />
                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">Analyze</span>
                                    <ArrowRight className="h-3 w-3 text-white/30" />
                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">Generate</span>
                                    <ArrowRight className="h-3 w-3 text-white/30" />
                                    <span className="px-2 py-1 bg-electric-cyan/10 border border-electric-cyan/20 rounded text-electric-cyan">Output</span>
                                </div>
                            )}
                            {i === 1 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {["PNG", "JPG", "PDF", "TXT", "MD", "CODE"].map((format) => (
                                        <span key={format} className="px-2 py-0.5 bg-sunset-orange/10 border border-sunset-orange/20 rounded text-[10px] font-bold text-sunset-orange uppercase">
                                            {format}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {i === 2 && (
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                                        <span className="text-sm">🤖</span>
                                        <span className="text-[10px] text-white/60 font-bold">OpenAI</span>
                                    </div>
                                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                                        <span className="text-sm">🧠</span>
                                        <span className="text-[10px] text-white/60 font-bold">Anthropic</span>
                                    </div>
                                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                                        <span className="text-sm">✨</span>
                                        <span className="text-[10px] text-white/60 font-bold">Google</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
