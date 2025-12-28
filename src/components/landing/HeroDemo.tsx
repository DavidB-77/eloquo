"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Paperclip, Check, Copy, Send, Star } from "lucide-react";

type DemoStage = "input" | "processing" | "results";

const DEMO_PROMPT = "Analyze this image and create a product description for e-commerce";
const OPTIMIZED_RESULT = `Act as a professional e-commerce copywriter specializing in product photography. Create an engaging description for the premium headphones shown...

1. Highlight key features visible in the image
2. Target audience alignment for tech enthusiasts
3. Include emotional hooks and benefits
4. Use persuasive language patterns
5. Optimize for conversion`;

export function HeroDemo() {
    const [stage, setStage] = React.useState<DemoStage>("input");
    const [typedText, setTypedText] = React.useState("");
    const [showFile, setShowFile] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [helixRotation, setHelixRotation] = React.useState(0);
    const [score, setScore] = React.useState(0);
    const [activeTab, setActiveTab] = React.useState<"full" | "quick" | "snippet">("full");
    const [isPaused, setIsPaused] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);

    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Main demo loop
    React.useEffect(() => {
        if (isPaused) return;

        let timeouts: NodeJS.Timeout[] = [];

        const runDemo = async () => {
            // Reset
            setStage("input");
            setTypedText("");
            setShowFile(false);
            setProgress(0);
            setScore(0);
            setShowResults(false);
            setActiveTab("full");

            // Stage 1: Typing animation (0-4 seconds)
            for (let i = 0; i <= DEMO_PROMPT.length; i++) {
                await new Promise<void>(resolve => {
                    const t = setTimeout(() => {
                        setTypedText(DEMO_PROMPT.slice(0, i));
                        resolve();
                    }, 50);
                    timeouts.push(t);
                });
                if (isPaused) return;
            }

            // Show file attachment
            await new Promise<void>(resolve => {
                const t = setTimeout(() => {
                    setShowFile(true);
                    resolve();
                }, 500);
                timeouts.push(t);
            });

            // Brief pause before "clicking"
            await new Promise<void>(resolve => {
                const t = setTimeout(resolve, 800);
                timeouts.push(t);
            });

            // Stage 2: Processing (4-10 seconds)
            setStage("processing");

            // Animate progress and DNA helix
            const progressInterval = setInterval(() => {
                setProgress(p => Math.min(p + 2, 100));
                setHelixRotation(r => r + 15);
                setScore(s => Math.min(s + 17, 847));
            }, 100);
            intervalRef.current = progressInterval;

            await new Promise<void>(resolve => {
                const t = setTimeout(() => {
                    clearInterval(progressInterval);
                    setProgress(100);
                    resolve();
                }, 5000);
                timeouts.push(t);
            });

            // Stage 3: Results (10-20 seconds)
            setStage("results");

            await new Promise<void>(resolve => {
                const t = setTimeout(() => {
                    setShowResults(true);
                    resolve();
                }, 300);
                timeouts.push(t);
            });

            // Hold on results
            await new Promise<void>(resolve => {
                const t = setTimeout(resolve, 8000);
                timeouts.push(t);
            });

            // Loop
            if (!isPaused) {
                runDemo();
            }
        };

        runDemo();

        return () => {
            timeouts.forEach(clearTimeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPaused]);

    // DNA Helix component
    const DNAHelix = () => (
        <div className="relative h-16 flex items-center justify-center overflow-hidden">
            <div
                className="flex items-center gap-1"
                style={{ transform: `rotateY(${helixRotation}deg)`, transformStyle: "preserve-3d" }}
            >
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div
                            className="w-2 h-2 rounded-full bg-electric-cyan"
                            style={{
                                transform: `translateY(${Math.sin((helixRotation + i * 60) * Math.PI / 180) * 12}px)`,
                                opacity: 0.5 + Math.sin((helixRotation + i * 60) * Math.PI / 180) * 0.5
                            }}
                        />
                        <div className="w-px h-6 bg-electric-cyan/30" />
                        <div
                            className="w-2 h-2 rounded-full bg-neon-magenta"
                            style={{
                                transform: `translateY(${-Math.sin((helixRotation + i * 60) * Math.PI / 180) * 12}px)`,
                                opacity: 0.5 + Math.cos((helixRotation + i * 60) * Math.PI / 180) * 0.5
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div
            className="relative w-full max-w-lg mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Demo Card */}
            <div className="glass bg-gradient-to-br from-midnight/90 via-deep-teal/20 to-midnight/90 border border-electric-cyan/20 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(9,183,180,0.15)]">

                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/30">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            stage === "input" && "bg-electric-cyan animate-pulse",
                            stage === "processing" && "bg-yellow-400 animate-pulse",
                            stage === "results" && "bg-green-400"
                        )} />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                            {stage === "input" && "✨ Your Prompt"}
                            {stage === "processing" && "⚡ Optimizing"}
                            {stage === "results" && "✅ Optimized Result"}
                        </span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                        eloquo.ai
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 min-h-[320px]">

                    {/* Stage 1: Input */}
                    {stage === "input" && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* Prompt textarea */}
                            <div className="bg-black/30 border border-white/10 rounded-xl p-4 min-h-[100px]">
                                <p className="text-sm text-white/90 leading-relaxed">
                                    {typedText}
                                    <span className="inline-block w-0.5 h-4 bg-electric-cyan ml-0.5 animate-pulse" />
                                </p>
                            </div>

                            {/* File attachment */}
                            <div className={cn(
                                "transition-all duration-500",
                                showFile ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            )}>
                                <div className="flex items-center gap-2 text-sm text-white/70 bg-electric-cyan/10 border border-electric-cyan/20 rounded-lg px-3 py-2">
                                    <Paperclip className="h-4 w-4 text-electric-cyan" />
                                    <span>product-photo.png</span>
                                    <Check className="h-4 w-4 text-green-400 ml-auto" />
                                </div>
                            </div>

                            {/* Settings row */}
                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2">
                                    <span className="text-white/50">Target:</span>
                                    <span className="text-white font-medium">Universal</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2">
                                    <span className="text-white/50">Strength:</span>
                                    <span className="text-white font-medium">Medium</span>
                                </div>
                            </div>

                            {/* Optimize button */}
                            <button className={cn(
                                "w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all",
                                showFile
                                    ? "bg-neon-orange text-black shadow-[0_0_20px_rgba(229,120,68,0.5)] animate-pulse"
                                    : "bg-neon-orange/50 text-black/50"
                            )}>
                                Optimize
                            </button>
                        </div>
                    )}

                    {/* Stage 2: Processing */}
                    {stage === "processing" && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* Progress steps */}
                            <div className="space-y-2">
                                {[
                                    { label: "Analyzing intent...", threshold: 25 },
                                    { label: "Deep analysis...", threshold: 50 },
                                    { label: "Generating prompt...", threshold: 75 },
                                    { label: "Validating quality...", threshold: 90 },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-electric-cyan to-neon-magenta transition-all duration-300"
                                                style={{ width: `${Math.min(100, Math.max(0, (progress - step.threshold + 25) * 4))}%` }}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-xs min-w-[140px] transition-colors",
                                            progress >= step.threshold ? "text-electric-cyan" : "text-white/40"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* DNA Helix game preview */}
                            <div className="bg-black/40 border border-electric-cyan/20 rounded-xl p-4 mt-4">
                                <div className="text-center text-xs text-white/50 mb-2">
                                    🧬 DNA HELIX MINI-GAME 🧬
                                </div>
                                <DNAHelix />
                                <div className="text-center mt-2">
                                    <span className="text-sm font-bold text-electric-cyan">Score: {score}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Results */}
                    {stage === "results" && (
                        <div className={cn(
                            "space-y-4 transition-all duration-500",
                            showResults ? "opacity-100" : "opacity-0"
                        )}>
                            {/* Metrics row */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="text-white/60">Tokens: <span className="text-white font-bold">219</span></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-white/60">Quality:</span>
                                    <span className="text-white font-bold">5.0/5.0</span>
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                                {(["full", "quick", "snippet"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all",
                                            activeTab === tab
                                                ? "bg-electric-cyan text-black"
                                                : "text-white/50 hover:text-white"
                                        )}
                                    >
                                        {tab === "full" ? "Full Version" : tab === "quick" ? "Quick-Ref" : "Snippet"}
                                    </button>
                                ))}
                            </div>

                            {/* Result content */}
                            <div className="bg-black/30 border border-white/10 rounded-xl p-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                                    {OPTIMIZED_RESULT}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-electric-cyan/20 border border-electric-cyan/30 rounded-xl text-electric-cyan text-sm font-bold hover:bg-electric-cyan/30 transition-colors">
                                    <Copy className="h-4 w-4" />
                                    Copy
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neon-orange/20 border border-neon-orange/30 rounded-xl text-neon-orange text-sm font-bold hover:bg-neon-orange/30 transition-colors">
                                    <Send className="h-4 w-4" />
                                    Transmit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scan lines overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
                    }}
                />
            </div>

            {/* Pause indicator */}
            {isPaused && (
                <div className="absolute top-2 right-2 text-[10px] text-white/40 bg-black/50 px-2 py-1 rounded">
                    Paused
                </div>
            )}
        </div>
    );
}
