"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { ClipboardPaste, Cpu, Download, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        title: "Paste Your Prompt",
        description: "Drop your draft prompt into our editor. We support everything from short instructions to complex system prompts.",
        icon: <ClipboardPaste className="h-8 w-8" />,
    },
    {
        title: "AI Analysis",
        description: "Our Gemini-powered engine analyzes your prompt for clarity, token density, and model suitability.",
        icon: <Cpu className="h-8 w-8" />,
    },
    {
        title: "Get Enhanced Results",
        description: "Instantly receive multiple optimized versions of your prompt, ready to use in your favorite AI tool.",
        icon: <Download className="h-8 w-8" />,
    },
];

export function HowItWorksSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".how-header > *", {
            scrollTrigger: {
                trigger: ".how-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".how-step", {
            scrollTrigger: {
                trigger: ".how-grid",
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.3,
            ease: "expo.out"
        });

        gsap.from(".connector-line", {
            scrollTrigger: {
                trigger: ".how-grid",
                start: "top 75%",
            },
            scaleX: 0,
            transformOrigin: "left center",
            duration: 2,
            ease: "power2.inOut"
        });
    }, { scope: sectionRef });

    return (
        <section id="how-it-works" ref={sectionRef} className="py-32 relative scroll-mt-20 overflow-hidden">
            <Container>
                <div className="how-header text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Protocol <span className="text-electric-cyan italic">Transfer</span> Flow
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide border-l-2 border-neon-orange pl-6">
                        Transforming your prompts is a simple three-step sequence that takes seconds.
                    </p>
                </div>

                <div className="how-grid flex flex-col md:flex-row items-start justify-between gap-16 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="connector-line hidden md:block absolute top-16 left-0 w-full h-px bg-gradient-to-r from-electric-cyan/5 via-electric-cyan/20 to-electric-cyan/5 -z-10" />

                    {STEPS.map((step, index) => (
                        <div
                            key={step.title}
                            className="how-step flex-1 flex flex-col items-center text-center group"
                        >
                            <div className="h-32 w-32 rounded-3xl glass border-2 border-electric-cyan/20 flex items-center justify-center text-electric-cyan mb-8 relative shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:border-electric-cyan/50 group-hover:shadow-[0_0_40px_rgba(9,183,180,0.2)] transition-all duration-500">
                                <div className="absolute -top-3 -left-3 h-10 w-10 rounded-xl btn-gradient text-white flex items-center justify-center font-display text-lg shadow-[0_0_15px_rgba(9,183,180,0.4)]">
                                    {index + 1}
                                </div>
                                <div className="[&>svg]:h-12 [&>svg]:w-12 group-hover:[&>svg]:scale-110 [&>svg]:transition-transform [&>svg]:duration-500">
                                    {step.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-display text-white mb-4 uppercase tracking-widest">{step.title}</h3>
                            <p className="text-white/60 max-w-xs leading-relaxed font-medium">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex items-center space-x-3 text-electric-cyan text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Sequence Ready for Initialization</span>
                    </div>
                </div>
            </Container>
        </section>
    );
}
