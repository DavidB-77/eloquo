"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, RefreshCw, BookOpen, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const DIFFERENTIATORS = [
    {
        title: "Learns From Real Results",
        description: "Rate your optimizations. Our AI analyzes patterns across thousands of rated prompts to understand what actually works—not what should work in theory. Every rating makes it smarter.",
        icon: <Star className="h-10 w-10 text-electric-cyan" />,
    },
    {
        title: "Your Feedback, Instant Impact",
        description: "Your ratings flow directly into our Adaptive Intelligence Engine. The system continuously improves its strategies based on what's working. Better for you, better for everyone.",
        icon: <RefreshCw className="h-10 w-10 text-electric-cyan" />,
    },
    {
        title: "Your Library, Your Advantage",
        description: "Every optimization is saved to your personal library. Search past prompts, track what worked, export anytime. Your prompt history becomes your competitive edge.",
        icon: <BookOpen className="h-10 w-10 text-electric-cyan" />,
    },
];

export function WhyEloquoIsDifferentSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".different-header > *", {
            scrollTrigger: {
                trigger: ".different-header",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".different-card", {
            scrollTrigger: {
                trigger: ".different-grid",
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
        <section ref={sectionRef} className="py-24 relative overflow-hidden bg-gradient-to-b from-midnight/50 to-deep-teal/10">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-electric-cyan/5 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />

            <Container>
                <div className="different-header text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal font-display mb-6 text-white leading-tight">
                        Most Prompt Tools Are <span className="text-terracotta italic">Frozen in Time</span>.<br />
                        <span className="text-electric-cyan">Eloquo Evolves.</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        Other optimizers use static rules. Eloquo learns from real results—and gets smarter every time you use it.
                    </p>
                </div>

                <div className="different-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                    {DIFFERENTIATORS.map((item) => (
                        <div key={item.title} className="different-card group">
                            <Card className="h-full glass glass-hover bg-deep-teal/5 border-electric-cyan/10 p-8 text-center transition-all duration-500">
                                <CardContent className="p-0">
                                    <div className="mb-6 flex justify-center group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(9,183,180,0.4)] transition-all duration-500">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-display text-white mb-4 uppercase tracking-widest">{item.title}</h3>
                                    <p className="text-white/60 leading-relaxed text-sm">{item.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Trust Badge */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm">
                        <Sparkles className="h-4 w-4 text-electric-cyan" />
                        <span>Built on Stanford NLP research frameworks</span>
                    </div>
                </div>
            </Container>
        </section>
    );
}
