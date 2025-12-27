"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { DemoOptimizeForm } from "@/components/landing/DemoOptimizeForm";

export function HeroSection() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.from(".hero-content > *", {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            delay: 0.2
        })
            .from(".hero-mockup-container", {
                x: 50,
                opacity: 0,
                duration: 1.5,
                ease: "expo.out"
            }, "-=0.8");

        // Check session
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <Container className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Column: Content */}
                    <div className="hero-content text-left">
                        <div className="hero-badge inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan text-electric-cyan text-xs font-bold mb-8 uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                            <Sparkles className="h-3 w-3" />
                            <span>Transform Your AI Workflow</span>
                        </div>

                        <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-normal font-display mb-8 text-white leading-[1.05] drop-shadow-lg">
                            Transform <span className="text-electric-cyan glow-sm italic">Prompts</span> Into <br />
                            <span className="text-white">Power</span>
                        </h1>

                        <p className="hero-description text-xl text-[#D0D0D0] mb-10 max-w-lg font-medium leading-relaxed">
                            Eloquo optimizes your raw prompts for ChatGPT, Claude, and Gemini. Get consistent, high-quality AI responses every single time.
                        </p>

                        <div className="hero-actions flex flex-col sm:flex-row items-center justify-start space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-neon-orange hover:bg-neon-orange/90 text-[#0A0A0A] border-none text-lg font-bold tracking-widest uppercase glow-sm hover:glow-md transition-all group" asChild>
                                <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                                    {isLoggedIn ? "Go to Dashboard" : "Start Optimizing"} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl border-electric-cyan text-electric-cyan hover:bg-electric-cyan/10 text-lg font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]" asChild>
                                <Link href="#optimization-comparison">Watch Sequence</Link>
                            </Button>
                        </div>

                        <div className="hero-stats flex items-center justify-start space-x-6 text-[10px] font-bold text-[#E0E0E0] uppercase tracking-[0.15em]">
                            <div className="flex items-center space-x-2">
                                <span className="text-white text-base">25+</span>
                                <span>Cycles Free</span>
                            </div>
                            <div className="w-px h-4 bg-electric-cyan/30" />
                            <div className="flex items-center space-x-2">
                                <span className="text-white text-base">Multi-Model</span>
                                <span>Matrix</span>
                            </div>
                            <div className="w-px h-4 bg-electric-cyan/30" />
                            <div className="flex items-center space-x-2">
                                <span className="text-white text-base">Elite</span>
                                <span>Quality</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="hero-mockup-container relative">
                        {/* Interactive Demo Form */}
                        <div className="relative z-10 w-full max-w-lg mx-auto lg:max-w-none transform transition-transform hover:scale-[1.01] duration-500">
                            <DemoOptimizeForm />
                        </div>

                        {/* Decorative Elements - New Colors */}
                        <div className="absolute -top-20 -right-20 h-80 w-80 bg-electric-cyan/15 rounded-full blur-[120px]" />
                        <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-neon-magenta/15 rounded-full blur-[100px]" />
                    </div>
                </div>
            </Container>
        </section>
    );
}
