"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, Globe, Copy, Check, ChevronDown, Paperclip, X } from "lucide-react";

type DemoStage = "input" | "processing" | "results";
type TabType = "full" | "quickRef" | "snippet";

const DEMO_PROMPT = "Analyze this image and create a detailed product description for an e-commerce listing. Include key features, target audience, and suggested price range.";

const DEMO_RESULTS = {
    full: `Act as a senior e-commerce copywriter with expertise in product photography analysis and conversion optimization. You are creating a product description for premium wireless headphones.

**Context & Analysis:**
- Product: Premium over-ear wireless headphones
- Target audience: Tech enthusiasts, audiophiles, remote workers
- Price positioning: Premium segment ($199-299)

**Your task:**
1. Analyze the visual elements in the product image
2. Identify key selling features (materials, design, technology)
3. Create an emotionally engaging description using sensory language
4. Include technical specifications in buyer-friendly terms
5. Add 3-5 benefit-focused bullet points
6. Suggest optimal pricing based on perceived value

**Constraints:**
- Length: 150-200 words for main description
- Tone: Professional yet approachable
- Include SEO keywords: wireless headphones, noise cancelling, premium audio
- End with compelling call-to-action`,
    quickRef: `E-commerce Product Description Prompt
• Role: Senior copywriter, product photography expert
• Target: Tech enthusiasts, $199-299 segment
• Include: Visual analysis, features, benefits, CTA
• Keywords: wireless headphones, noise cancelling`,
    snippet: `Create product description for premium headphones. Include features, target audience, price range. Professional tone, 150-200 words.`
};

const PROCESSING_STAGES = [
    { label: "Classifying intent...", duration: 1500 },
    { label: "Deep analysis...", duration: 2000 },
    { label: "Generating prompt...", duration: 2500 },
    { label: "Validating quality...", duration: 1500 },
];

export function HeroDemo() {
    const [stage, setStage] = React.useState<DemoStage>("input");
    const [typedText, setTypedText] = React.useState("");
    const [showFile, setShowFile] = React.useState(false);
    const [activeProcessingStage, setActiveProcessingStage] = React.useState(0);
    const [processingProgress, setProcessingProgress] = React.useState(0);
    const [activeTab, setActiveTab] = React.useState<TabType>("full");
    const [isPaused, setIsPaused] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [buttonPulsing, setButtonPulsing] = React.useState(false);

    // Main demo loop
    React.useEffect(() => {
        if (isPaused) return;

        let timeouts: NodeJS.Timeout[] = [];
        let intervals: NodeJS.Timeout[] = [];

        const runDemo = async () => {
            // Reset state
            setStage("input");
            setTypedText("");
            setShowFile(false);
            setActiveProcessingStage(0);
            setProcessingProgress(0);
            setActiveTab("full");
            setCopied(false);
            setButtonPulsing(false);

            // Stage 1: Typing animation (0-5 seconds)
            for (let i = 0; i <= DEMO_PROMPT.length; i++) {
                if (isPaused) return;
                await new Promise<void>(resolve => {
                    const t = setTimeout(() => {
                        setTypedText(DEMO_PROMPT.slice(0, i));
                        resolve();
                    }, 25);
                    timeouts.push(t);
                });
            }

            // Show file attachment
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setShowFile(true); resolve(); }, 400);
                timeouts.push(t);
            });

            // Button pulsing
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setButtonPulsing(true); resolve(); }, 600);
                timeouts.push(t);
            });

            // "Click" the button
            await new Promise<void>(resolve => {
                const t = setTimeout(resolve, 800);
                timeouts.push(t);
            });

            // Stage 2: Processing (5-12 seconds)
            setStage("processing");
            setButtonPulsing(false);

            // Animate through processing stages
            for (let i = 0; i < PROCESSING_STAGES.length; i++) {
                if (isPaused) return;
                setActiveProcessingStage(i);

                // Progress within this stage
                const startProgress = (i / PROCESSING_STAGES.length) * 100;
                const endProgress = ((i + 1) / PROCESSING_STAGES.length) * 100;
                const steps = 20;
                const stepDuration = PROCESSING_STAGES[i].duration / steps;

                for (let j = 0; j <= steps; j++) {
                    await new Promise<void>(resolve => {
                        const t = setTimeout(() => {
                            setProcessingProgress(startProgress + (endProgress - startProgress) * (j / steps));
                            resolve();
                        }, stepDuration);
                        timeouts.push(t);
                    });
                }
            }

            // Stage 3: Results (12-22 seconds)
            setStage("results");

            // Cycle through tabs
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setActiveTab("full"); resolve(); }, 3000);
                timeouts.push(t);
            });
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setActiveTab("quickRef"); resolve(); }, 2000);
                timeouts.push(t);
            });
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setActiveTab("snippet"); resolve(); }, 2000);
                timeouts.push(t);
            });
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setActiveTab("full"); resolve(); }, 1000);
                timeouts.push(t);
            });

            // Show "copied" effect
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setCopied(true); resolve(); }, 1000);
                timeouts.push(t);
            });
            await new Promise<void>(resolve => {
                const t = setTimeout(() => { setCopied(false); resolve(); }, 1500);
                timeouts.push(t);
            });

            // Hold on results
            await new Promise<void>(resolve => {
                const t = setTimeout(resolve, 2000);
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
            intervals.forEach(clearInterval);
        };
    }, [isPaused]);

    return (
        <div
            className="relative w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Demo Container - Matches real OptimizeForm/ResultsTabs styling */}
            <div className="relative p-0.5 overflow-hidden glass rounded-[20px] shadow-2xl group/card">
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan via-sunset-orange to-electric-cyan bg-[length:200%_auto] animate-gradient opacity-40" />

                <div className="relative bg-midnight/90 rounded-[18px] overflow-hidden">

                    {/* INPUT STAGE */}
                    {stage === "input" && (
                        <div className="p-6 md:p-8 space-y-6">
                            {/* Header - Exact match */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-3">
                                    <span className="font-display text-2xl md:text-3xl text-white tracking-widest uppercase glow-md">ELOQUO</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-electric-cyan/50 to-transparent" />
                                </div>
                                <p className="text-white/60 text-xs font-medium tracking-wide">
                                    ENTER YOUR PROMPT BELOW FOR ADAPTIVE AI OPTIMIZATION
                                </p>
                            </div>

                            {/* Prompt Input */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                        Input Prompt <span className="text-terracotta">*</span>
                                    </label>
                                    <span className="text-[10px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Globe className="h-3 w-3" />
                                        Multilingual Engine Active
                                    </span>
                                </div>
                                <div className="relative">
                                    <div className="resize-none bg-midnight border border-electric-cyan/20 text-white rounded-xl py-4 px-5 text-sm leading-relaxed shadow-inner min-h-[140px]">
                                        {typedText}
                                        <span className="inline-block w-0.5 h-4 bg-electric-cyan ml-0.5 animate-pulse" />
                                    </div>
                                    <div className="absolute bottom-3 right-4 text-[10px] font-mono text-white/40 uppercase tracking-tighter">
                                        {typedText.length} CHR / ~{Math.ceil(typedText.length / 4)} TOK
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Chip */}
                            <div className={cn(
                                "transition-all duration-500",
                                showFile ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 overflow-hidden"
                            )}>
                                <div className="flex items-center gap-2 text-xs text-white/70 bg-electric-cyan/10 border border-electric-cyan/20 rounded-lg px-3 py-2 w-fit">
                                    <Paperclip className="h-3.5 w-3.5 text-electric-cyan" />
                                    <span>product-photo.png</span>
                                    <span className="text-[10px] text-white/40">2.4 MB</span>
                                    <X className="h-3 w-3 text-white/40 ml-2" />
                                </div>
                            </div>

                            {/* Controls Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                        Target Model
                                    </label>
                                    <div className="bg-deep-teal/20 border border-electric-cyan/20 text-white rounded-xl h-10 flex items-center px-4 text-sm">
                                        🌐 Universal
                                        <ChevronDown className="h-4 w-4 ml-auto text-white/40" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                        Optimization Strength
                                    </label>
                                    <div className="flex bg-deep-teal/20 border border-electric-cyan/20 p-1 rounded-xl h-10">
                                        {["Light", "Medium", "Aggressive"].map((opt, i) => (
                                            <div
                                                key={opt}
                                                className={cn(
                                                    "flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center",
                                                    i === 1
                                                        ? "bg-electric-cyan text-midnight shadow-[0_0_15px_rgba(9,183,180,0.4)]"
                                                        : "text-white/40"
                                                )}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <div
                                    className={cn(
                                        "h-12 px-10 rounded-xl btn-gradient text-white font-bold tracking-widest uppercase flex items-center transition-all",
                                        buttonPulsing && "animate-pulse shadow-[0_0_30px_rgba(229,120,68,0.6)] scale-105"
                                    )}
                                >
                                    <Zap className="h-4 w-4 mr-2 fill-current" />
                                    Optimize
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROCESSING STAGE */}
                    {stage === "processing" && (
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center space-x-3">
                                <span className="font-display text-2xl md:text-3xl text-white tracking-widest uppercase glow-md">ELOQUO</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-electric-cyan/50 to-transparent" />
                            </div>

                            <div className="text-center py-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-cyan/10 border border-electric-cyan/30">
                                    <div className="h-2 w-2 rounded-full bg-electric-cyan animate-ping" />
                                    <span className="text-sm font-bold text-electric-cyan uppercase tracking-wider">Optimizing...</span>
                                </div>
                            </div>

                            {/* Progress Stages */}
                            <div className="space-y-3">
                                {PROCESSING_STAGES.map((pStage, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="flex-1 h-2 bg-midnight border border-electric-cyan/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-electric-cyan to-sunset-orange transition-all duration-300"
                                                style={{
                                                    width: i < activeProcessingStage ? "100%" :
                                                        i === activeProcessingStage ? `${(processingProgress - (i * 25)) * 4}%` : "0%"
                                                }}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-xs min-w-[130px] font-medium transition-colors",
                                            i <= activeProcessingStage ? "text-electric-cyan" : "text-white/30"
                                        )}>
                                            {pStage.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* DNA Helix Animation */}
                            <div className="bg-midnight/60 border border-electric-cyan/20 rounded-2xl p-6 mt-6">
                                <div className="text-center text-xs text-white/50 mb-4 uppercase tracking-widest">
                                    🧬 Neural Processing Active 🧬
                                </div>
                                <div className="flex justify-center items-center h-16 gap-1">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-2 bg-gradient-to-b from-electric-cyan to-neon-magenta rounded-full"
                                            style={{
                                                height: `${20 + Math.sin((Date.now() / 200) + i) * 15}px`,
                                                animation: `pulse 1s ease-in-out ${i * 0.1}s infinite`
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="text-center mt-4">
                                    <span className="text-sm font-bold text-electric-cyan">Score: {Math.floor(processingProgress * 8.5)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESULTS STAGE */}
                    {stage === "results" && (
                        <div className="flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-electric-cyan/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 text-white font-display uppercase tracking-widest">
                                        <Sparkles className="h-5 w-5 text-electric-cyan glow-sm" />
                                        Optimized Result
                                    </div>
                                    <div className="px-3 py-1.5 border border-electric-cyan/50 bg-electric-cyan/10 text-electric-cyan text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                        + New Optimization
                                    </div>
                                </div>

                                {/* Metrics Row */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Optimized Tokens</span>
                                        <span className="font-display text-xl text-white">219</span>
                                    </div>
                                    <div className="w-px h-8 bg-electric-cyan/10" />
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Quality Score</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-display text-xl text-electric-cyan glow-sm">5.0</span>
                                            <span className="text-white/40 text-xs font-bold">/ 5.0</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-electric-cyan/10" />
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Engine</span>
                                        <span className="font-bold text-white uppercase text-xs tracking-wider">Universal</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Bar */}
                            <div className="flex bg-midnight/60 p-2 gap-2 border-b border-electric-cyan/10">
                                {(["full", "quickRef", "snippet"] as TabType[]).map((tab) => (
                                    <div
                                        key={tab}
                                        className={cn(
                                            "flex-1 py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] text-center transition-all duration-300",
                                            activeTab === tab
                                                ? "bg-electric-cyan text-white shadow-[0_0_20px_rgba(9,183,180,0.4)] glow-sm"
                                                : "text-white/40"
                                        )}
                                    >
                                        {tab === "full" ? "Full Version" : tab === "quickRef" ? "Quick-Ref" : "Snippet"}
                                    </div>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="p-5 bg-midnight/20 max-h-[180px] overflow-hidden">
                                <div className="bg-midnight/60 border border-electric-cyan/10 rounded-xl p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-white/80">
                                    {DEMO_RESULTS[activeTab].slice(0, 400)}...
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 p-5 border-t border-electric-cyan/10 bg-midnight/20">
                                <div className={cn(
                                    "flex-1 h-10 border rounded-xl flex items-center justify-center text-sm font-medium transition-all",
                                    copied
                                        ? "border-electric-cyan bg-electric-cyan/20 text-electric-cyan"
                                        : "border-electric-cyan/20 bg-deep-teal/10 text-white"
                                )}>
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Prompt
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 h-10 btn-gradient rounded-xl flex items-center justify-center text-sm font-bold text-white uppercase tracking-wider">
                                    💾 TRANSMIT
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pause indicator */}
            {isPaused && (
                <div className="absolute top-3 right-3 text-[10px] text-white/50 bg-black/60 px-2 py-1 rounded z-10">
                    Paused
                </div>
            )}

            {/* Scan lines overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02] rounded-[20px]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
                }}
            />
        </div>
    );
}
