"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export function HeroSection() {
    const containerRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.from(".hero-badge", {
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.2
        })
            .from(".hero-title span", {
                y: 80,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.6")
            .from(".hero-description", {
                y: 30,
                opacity: 0,
                duration: 1,
            }, "-=0.8")
            .from(".hero-actions button, .hero-actions a", {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(2)"
            }, "-=0.6")
            .from(".hero-stats", {
                opacity: 0,
                y: 20,
                duration: 1.2,
            }, "-=0.4")
            .from(".hero-mockup", {
                y: 100,
                scale: 0.9,
                opacity: 0,
                duration: 2,
                ease: "expo.out"
            }, "-=1");
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <Container className="relative">
                <div className="text-center max-w-4xl mx-auto">
                    <div>
                        <div className="hero-badge inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-xs font-bold mb-6 uppercase tracking-widest">
                            <Sparkles className="h-3 w-3" />
                            <span>Transform Your AI Workflow</span>
                        </div>

                        <h1 className="hero-title text-5xl md:text-8xl font-normal font-display tracking-tight mb-8 text-white leading-[1.1]">
                            <span className="inline-block">Transform</span> <span className="inline-block">Your</span> <span className="inline-block">AI</span> <span className="inline-block">Prompts</span> <span className="inline-block">Into</span> <br />
                            <span className="inline-block text-electric-cyan glow-sm italic">Powerful</span> <span className="inline-block">Results</span>
                        </h1>

                        <p className="hero-description text-xl text-white/60 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                            Eloquo optimizes your raw prompts for ChatGPT, Claude, and Gemini. Get consistent, high-quality AI responses every single time.
                        </p>

                        <div className="hero-actions flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl btn-gradient text-lg tracking-widest uppercase glow-sm hover:glow-md transition-all group" asChild>
                                <Link href="/signup">
                                    Start Optimizing <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl border-electric-cyan/20 bg-deep-teal/10 text-white hover:bg-electric-cyan/5 text-lg tracking-widest uppercase transition-all" asChild>
                                <Link href="#how-it-works">Watch Sequence</Link>
                            </Button>
                        </div>

                        <div className="hero-stats mt-16 flex items-center justify-center space-x-8 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                            <div className="flex items-center space-x-2">
                                <span className="text-white">25+</span>
                                <span>Cycles Free</span>
                            </div>
                            <div className="w-px h-4 bg-electric-cyan/10" />
                            <div className="flex items-center space-x-2">
                                <span className="text-white">Multi-Model</span>
                                <span>Matrix</span>
                            </div>
                            <div className="w-px h-4 bg-electric-cyan/10" />
                            <div className="flex items-center space-x-2">
                                <span className="text-white">Elite</span>
                                <span>Response Quality</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="hero-mockup mt-24 relative max-w-6xl mx-auto">
                    <div className="rounded-3xl p-1.5 glass border-electric-cyan/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/10 to-sunset-orange/5" />
                        <div className="rounded-2xl overflow-hidden border border-electric-cyan/10 bg-midnight/80 aspect-[16/10] relative group/mockup">
                            {/* Dashboard Mockup Content */}
                            <div className="absolute inset-0 p-8 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-3 w-3 rounded-full bg-terracotta/40" />
                                        <div className="h-3 w-3 rounded-full bg-sunset-orange/40" />
                                        <div className="h-3 w-3 rounded-full bg-electric-cyan/40" />
                                    </div>
                                    <div className="h-6 w-48 bg-deep-teal/40 rounded-full border border-electric-cyan/10" />
                                </div>
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-24 glass border-electric-cyan/10 bg-deep-teal/20" />
                                    ))}
                                </div>
                                <div className="flex-1 glass border-electric-cyan/10 bg-deep-teal/10 p-6">
                                    <div className="space-y-4">
                                        <div className="h-4 w-3/4 bg-electric-cyan/20 rounded-full animate-pulse" />
                                        <div className="h-4 w-1/2 bg-dusty-rose/20 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <div className="h-4 w-2/3 bg-electric-cyan/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Overlay Glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-60" />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-12 -right-12 h-64 w-64 bg-electric-cyan/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute -bottom-16 -left-16 h-80 w-80 bg-sunset-orange/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>
            </Container>
        </section>
    );
}
