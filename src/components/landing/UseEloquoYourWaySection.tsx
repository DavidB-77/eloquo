"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Monitor, Link2, Code2, Rocket, Info } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const INTEGRATION_OPTIONS = [
    {
        title: "Web Dashboard",
        badge: "Available Now",
        badgeColor: "bg-green-500",
        description: "Our full-featured web app. Optimize prompts, manage your library, track your history. Works on any device, anywhere.",
        icon: <Monitor className="h-8 w-8" />,
    },
    {
        title: "Direct Integration",
        badge: "Pro & Business",
        badgeColor: "bg-electric-cyan",
        description: "Connect Eloquo to the tools you already use. Our MCP server works with Claude Desktop, Cursor, Windsurf, Claude Code, and more—optimize prompts without leaving your workflow.",
        icon: <Link2 className="h-8 w-8" />,
        tooltip: "MCP (Model Context Protocol) is an open standard that lets AI tools talk to each other. Think of it like USB-C for AI—one connection that works everywhere.",
    },
    {
        title: "API Access",
        badge: "Pro & Business",
        badgeColor: "bg-electric-cyan",
        description: "Build Eloquo into your own tools. Full REST API with comprehensive documentation. Automate optimization in your pipelines, custom apps, or internal tools.",
        icon: <Code2 className="h-8 w-8" />,
    },
];

export function UseEloquoYourWaySection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);
    const [showTooltip, setShowTooltip] = React.useState<string | null>(null);

    useGSAP(() => {
        gsap.from(".use-header > *", {
            scrollTrigger: {
                trigger: ".use-header",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".use-card", {
            scrollTrigger: {
                trigger: ".use-grid",
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
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            <Container>
                <div className="use-header text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Use Eloquo <span className="text-electric-cyan italic">Your Way</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-xl mx-auto font-medium tracking-wide">
                        Web app today. Everywhere tomorrow.
                    </p>
                </div>

                <div className="use-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {INTEGRATION_OPTIONS.map((option) => (
                        <div key={option.title} className="use-card group relative">
                            <Card className="h-full glass glass-hover bg-deep-teal/5 border-white/10 hover:border-electric-cyan/30 p-6 transition-all duration-500">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-14 w-14 rounded-xl bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan">
                                            {option.icon}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                                            option.badgeColor,
                                            option.badgeColor === "bg-green-500" ? "text-white" : "text-midnight"
                                        )}>
                                            {option.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3">{option.title}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        {option.description}
                                    </p>
                                    {option.tooltip && (
                                        <div className="mt-4 relative">
                                            <button
                                                className="flex items-center gap-1 text-xs text-electric-cyan hover:text-electric-cyan/80 transition-colors"
                                                onMouseEnter={() => setShowTooltip(option.title)}
                                                onMouseLeave={() => setShowTooltip(null)}
                                            >
                                                <Info className="h-3 w-3" />
                                                <span>What is MCP?</span>
                                            </button>
                                            {showTooltip === option.title && (
                                                <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-midnight border border-white/10 rounded-lg shadow-xl z-10 text-xs text-white/70 leading-relaxed">
                                                    {option.tooltip}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Roadmap Callout */}
                <div className="text-center">
                    <div className="inline-flex items-start gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-left max-w-3xl">
                        <Rocket className="h-5 w-5 text-neon-orange flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="text-white font-medium">On Our Roadmap: </span>
                            <span className="text-white/60">Browser extensions for Chrome (optimize directly on ChatGPT, Claude.ai, Gemini), native VS Code and Cursor plugins, and more. One tool, everywhere you write prompts.</span>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
