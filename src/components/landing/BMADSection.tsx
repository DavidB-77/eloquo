"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Check, Puzzle, Workflow, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const COMPATIBILITY_FEATURES = [
    "Cursor-ready output format",
    "VS Code / Claude Code compatible",
    "Works with BMAD methodology",
    "Windsurf integration ready",
];

const IDE_LOGOS = [
    { name: "Cursor", logo: "/logos/cursor.png", invert: true },
    { name: "VS Code", logo: "/logos/vscode.png", invert: false },
    { name: "Claude Code", logo: "/logos/claude-code.png", invert: false },
    { name: "Windsurf", logo: "/logos/windsurf.png", invert: true },
];

export function BMADSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <Container>
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 mb-6">
                        <Puzzle className="h-4 w-4 text-electric-cyan" />
                        <span className="text-xs font-bold text-electric-cyan uppercase tracking-wider">Workflow Integration</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Works With Your <span className="text-electric-cyan italic">Stack</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-xl mx-auto font-medium tracking-wide">
                        Eloquo outputs integrate seamlessly with modern AI-assisted development tools and methodologies.
                    </p>
                </div>

                {/* IDE Compatibility */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {IDE_LOGOS.map((ide, i) => (
                        <div
                            key={i}
                            className={cn(
                                "glass p-6 rounded-2xl border border-white/10 hover:border-electric-cyan/30 transition-all duration-300 text-center group flex flex-col items-center"
                            )}
                        >
                            <div className="h-12 w-12 mb-4 flex items-center justify-center">
                                <Image
                                    src={ide.logo}
                                    alt={ide.name}
                                    width={48}
                                    height={48}
                                    className={cn("object-contain", ide.invert && "brightness-0 invert")}
                                />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-wide">{ide.name}</span>
                        </div>
                    ))}
                </div>

                {/* Features List */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
                    {COMPATIBILITY_FEATURES.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                            <Check className="h-4 w-4 text-electric-cyan" />
                            {feature}
                        </div>
                    ))}
                </div>

                {/* BMAD Note */}
                <div className="max-w-2xl mx-auto">
                    <div className="glass p-5 rounded-xl border border-white/10 bg-white/5 flex items-start gap-4">
                        <Workflow className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-white/70">
                                <span className="font-bold text-white">BMAD Compatible:</span> Eloquo's Project Protocol generates outputs compatible with the
                                <a
                                    href="https://github.com/bmad-code-org/BMAD-METHOD"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 ml-1 inline-flex items-center gap-1"
                                >
                                    BMAD methodology <ExternalLink className="h-3 w-3" />
                                </a>
                                — an open-source framework for AI-driven development.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
