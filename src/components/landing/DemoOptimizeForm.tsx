"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, Globe, Upload } from "lucide-react";
import { TARGET_MODELS } from "@/lib/constants/models";

const STRENGTH_OPTIONS = [
    { value: "light", label: "Light", description: "Subtle improvements" },
    { value: "medium", label: "Medium", description: "Balanced" },
    { value: "aggressive", label: "Aggressive", description: "Maximum" },
];

const DEMO_PROMPTS = [
    "Write a high-converting landing page tagline for a cyberpunk SaaS product...",
    "Analyze this python script for memory leaks and optimize specifically for readability...",
    "Draft a cold email sequence for B2B enterprise sales targeting CTOs...",
];

export function DemoOptimizeForm() {
    const [prompt, setPrompt] = React.useState("");
    const [targetModel, setTargetModel] = React.useState("universal");
    const [strength, setStrength] = React.useState("medium");
    const [isLoading, setIsLoading] = React.useState(false);
    const [progressStage, setProgressStage] = React.useState(0);
    const [activePromptIndex, setActivePromptIndex] = React.useState(0);

    const STAGES = ["Analyzing...", "Optimizing...", "Validating...", "Complete!"];

    // Typing Animation Loop
    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const currentFullText = DEMO_PROMPTS[activePromptIndex];

        const typeChar = (index: number) => {
            if (index < currentFullText.length) {
                setPrompt(currentFullText.slice(0, index + 1));
                // Random typing speed variation
                timeoutId = setTimeout(() => typeChar(index + 1), 30 + Math.random() * 50);
            } else {
                // Typing finished, wait then submit
                timeoutId = setTimeout(startOptimization, 1000);
            }
        };

        const startOptimization = () => {
            setIsLoading(true);
            setProgressStage(0);

            // Artificial progress steps
            let stage = 0;
            const progressInterval = setInterval(() => {
                stage++;
                if (stage < STAGES.length) {
                    setProgressStage(stage);
                } else {
                    clearInterval(progressInterval);
                    cleanupAndReset();
                }
            }, 1200);
        };

        const cleanupAndReset = () => {
            // Wait a bit showing "Complete", then reset
            timeoutId = setTimeout(() => {
                setIsLoading(false);
                setPrompt("");
                setProgressStage(0);
                setActivePromptIndex((prev) => (prev + 1) % DEMO_PROMPTS.length);
            }, 2000);
        };

        // Start typing after initial delay
        timeoutId = setTimeout(() => typeChar(0), 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [activePromptIndex]);

    return (
        <Card className="relative p-0.5 overflow-hidden glass rounded-[20px] shadow-2xl group/card pointer-events-none select-none transform scale-[0.85] origin-top-right sm:scale-100 sm:origin-center">
            {/* Animated Gradient Border Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan via-sunset-orange to-electric-cyan bg-[length:200%_auto] animate-gradient opacity-40 transition-opacity duration-500" />

            <CardContent className="relative bg-midnight/90 rounded-[18px] p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="font-display text-2xl text-white tracking-widest uppercase glow-md">ELOQUO</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-electric-cyan/50 to-transparent" />
                    </div>
                    <p className="text-white/60 text-[10px] font-medium tracking-wide">
                        ENTER YOUR PROMPT BELOW FOR BIOLUMINESCENT OPTIMIZATION
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Prompt Input */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-[9px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Input Prompt <span className="text-terracotta">*</span>
                            </label>
                            <span className="text-[9px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                                <Globe className="h-3 w-3" />
                                Multilingual Engine Active
                            </span>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder="What would you like to build today?"
                                value={prompt}
                                readOnly
                                rows={4}
                                className="resize-none bg-midnight border-electric-cyan/20 text-white placeholder:text-white/20 rounded-xl py-3 px-4 text-sm leading-relaxed shadow-inner"
                            />
                            {/* Typing Cursor */}
                            {!isLoading && prompt.length < DEMO_PROMPTS[activePromptIndex].length && (
                                <span className="absolute inline-block w-2 H-4 bg-electric-cyan animate-pulse ml-1" />
                            )}
                            <div className="absolute bottom-3 right-3 flex items-center space-x-4">
                                <span className="text-[9px] font-mono text-white/40 uppercase tracking-tighter">
                                    {prompt.length} CHR
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Target Model
                            </label>
                            <div className="relative">
                                <Select
                                    value={targetModel}
                                    disabled
                                    className="w-full bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl h-10 cursor-not-allowed opacity-100"
                                >
                                    {TARGET_MODELS.slice(0, 1).map((model) => (
                                        <option key={model.value} value={model.value} className="bg-midnight">
                                            {model.icon} {model.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Strength
                            </label>
                            <div className="flex bg-deep-teal/20 border border-electric-cyan/20 p-1 rounded-xl h-10">
                                {STRENGTH_OPTIONS.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`flex-1 flex items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-wider ${strength === option.value
                                            ? "bg-electric-cyan text-midnight shadow-[0_0_15px_rgba(9,183,180,0.4)]"
                                            : "text-white/60"
                                            }`}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Context and Files (simplified visually) */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Context
                            </label>
                            <div className="h-10 bg-deep-teal/10 border border-electric-cyan/10 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Reference
                            </label>
                            <div className="h-10 bg-deep-teal/10 border border-electric-cyan/10 rounded-xl flex items-center justify-center border-dashed">
                                <Upload className="h-4 w-4 text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Energy Bar Progress Animation */}
                    <div className={cn(
                        "transition-all duration-700 ease-in-out",
                        isLoading ? "opacity-100 translate-y-0" : "opacity-30 blur-[0.5px]"
                    )}>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-bold text-electric-cyan animate-pulse tracking-[0.2em] uppercase">
                                    {STAGES[progressStage]}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-deep-teal/40 rounded-full overflow-hidden relative border border-electric-cyan/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-gradient-to-r from-electric-cyan via-sunset-orange to-electric-cyan bg-[length:50%_100%] animate-shimmer rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.5)]",
                                        !isLoading && progressStage === 0 ? "opacity-20" : "opacity-100"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer & Submit */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-electric-cyan/10">
                        <div className="flex items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-electric-cyan mr-2 animate-ping" />
                            <span className="text-[9px] text-white font-medium uppercase tracking-wider">
                                Ready
                            </span>
                        </div>

                        <Button
                            size="lg"
                            className={cn(
                                "w-auto px-8 rounded-xl btn-gradient text-sm tracking-widest uppercase transition-all duration-300",
                                isLoading ? "glow-md scale-105" : "glow-sm"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Energizing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Zap className="h-4 w-4 mr-2 fill-current" />
                                    Optimize
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
