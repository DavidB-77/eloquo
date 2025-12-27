"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".cta-card", {
            scrollTrigger: {
                trigger: ".cta-card",
                start: "top 85%",
            },
            scale: 0.95,
            opacity: 0,
            duration: 1.2,
            ease: "expo.out"
        });

        gsap.from(".cta-content > *", {
            scrollTrigger: {
                trigger: ".cta-card",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-32 relative overflow-hidden">
            {/* Background Bioluminescence */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-cyan/5 rounded-full blur-[120px] -z-10 animate-pulse" />

            <Container>
                <div className="cta-card glass bg-gradient-to-br from-deep-teal/20 via-midnight to-deep-teal/10 border-electric-cyan/30 rounded-[40px] p-12 md:p-24 text-center max-w-5xl mx-auto shadow-[0_0_100px_rgba(9,183,180,0.1)] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-64 w-64 text-electric-cyan" />
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sunset-orange/10 rounded-full blur-3xl" />

                    <div className="cta-content relative z-10">
                        <h2 className="text-4xl md:text-7xl font-normal font-display mb-10 text-white uppercase glow-sm">
                            Initialize Your <span className="text-electric-cyan italic">Success</span> Sequence
                        </h2>
                        <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide border-t border-b border-white/5 py-8">
                            Start optimizing your prompts today with Eloquo. Join elite operators using neuro-optimization to master AI communication.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
                            <Button size="lg" className="w-full sm:w-auto btn-gradient text-white text-xs font-bold uppercase tracking-[0.2em] px-12 h-16 rounded-xl glow-sm hover:glow-md transition-all" asChild>
                                <Link href="/signup">
                                    Start Protocol Initializer <ArrowRight className="ml-3 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                            <div className="flex items-center space-x-2">
                                <Zap className="h-3 w-3 text-electric-cyan" />
                                <span>No Credit Card Required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className="h-3 w-3 text-electric-cyan" />
                                <span>25 Free Optimizations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className="h-3 w-3 text-electric-cyan" />
                                <span>Multi-Model Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
