"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, Layers, Globe } from "lucide-react";
import { FileUpload, type ContextFile } from "./FileUpload";

import { TARGET_MODELS } from "@/lib/constants/models";
// Remove local TARGET_MODELS definition

const STRENGTH_OPTIONS = [
    { value: "light", label: "Light", description: "Subtle improvements" },
    { value: "medium", label: "Medium", description: "Balanced" },
    { value: "aggressive", label: "Aggressive", description: "Maximum" },
];

export interface OptimizeFormData {
    prompt: string;
    targetModel: string;
    strength: string;
    context: string;
    contextFiles: ContextFile[];
    useOrchestration: boolean;
}

interface OptimizeFormProps {
    onSubmit: (data: OptimizeFormData) => void;
    isLoading?: boolean;
    canOptimize?: boolean;
    canOrchestrate?: boolean;
    initialData?: Partial<OptimizeFormData>;
}

export function OptimizeForm({
    onSubmit,
    isLoading = false,
    canOptimize = true,
    canOrchestrate = false,
    initialData,
}: OptimizeFormProps) {
    const [prompt, setPrompt] = React.useState(initialData?.prompt || "");
    const [targetModel, setTargetModel] = React.useState(initialData?.targetModel || "universal");
    const [strength, setStrength] = React.useState(initialData?.strength || "medium");
    const [context, setContext] = React.useState(initialData?.context || "");
    const [contextFiles, setContextFiles] = React.useState<ContextFile[]>(initialData?.contextFiles || []);
    const [useOrchestration, setUseOrchestration] = React.useState(initialData?.useOrchestration || false);
    const [progressStage, setProgressStage] = React.useState(0);

    const STAGES = ["Analyzing...", "Optimizing...", "Validating...", "Complete!"];

    // Update form when initialData changes (for edit mode)
    React.useEffect(() => {
        if (initialData) {
            setPrompt(initialData.prompt || "");
            setTargetModel(initialData.targetModel || "universal");
            setStrength(initialData.strength || "medium");
            setContext(initialData.context || "");
            setContextFiles(initialData.contextFiles || []);
            setUseOrchestration(initialData.useOrchestration || false);
        }
    }, [initialData]);

    // Progress animation logic
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setProgressStage(0);
            interval = setInterval(() => {
                setProgressStage((prev) => (prev < STAGES.length - 2 ? prev + 1 : prev));
            }, 1500);
        } else if (progressStage > 0) {
            setProgressStage(3);
            const timeout = setTimeout(() => setProgressStage(0), 2000);
            return () => clearTimeout(timeout);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        onSubmit({ prompt, targetModel, strength, context, contextFiles, useOrchestration });
    };

    const clearForm = () => {
        setPrompt("");
        setContext("");
        setContextFiles([]);
        setUseOrchestration(false);
    };

    return (
        <Card className="relative p-0.5 overflow-hidden glass rounded-[20px] shadow-2xl group/card">
            {/* Animated Gradient Border Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan via-sunset-orange to-electric-cyan bg-[length:200%_auto] animate-gradient opacity-40 group-hover/card:opacity-70 transition-opacity duration-500" />

            <CardContent className="relative bg-midnight/90 rounded-[18px] p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="font-display text-4xl text-white tracking-widest uppercase glow-md">ELOQUO</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-electric-cyan/50 to-transparent" />
                    </div>
                    <p className="text-white/60 text-sm font-medium tracking-wide">
                        ENTER YOUR PROMPT BELOW FOR BIOLUMINESCENT OPTIMIZATION
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Prompt Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Input Prompt <span className="text-terracotta">*</span>
                            </label>
                            <span className="text-[10px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                                <Globe className="h-3 w-3" />
                                Multilingual Engine Active
                            </span>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder="What would you like to build today?"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={8}
                                className="resize-none bg-midnight border-electric-cyan/20 focus:border-electric-cyan focus:ring-4 focus:ring-electric-cyan/5 text-white placeholder:text-white/20 rounded-xl transition-all duration-300 py-4 px-5 text-lg leading-relaxed shadow-inner"
                            />
                            <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">
                                    {prompt.length} CHR / ~{Math.ceil(prompt.length / 4)} TOK
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Target Model
                            </label>
                            <div className="relative">
                                <Select
                                    value={targetModel}
                                    onChange={(e) => setTargetModel(e.target.value)}
                                    className="w-full bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl h-12 hover:bg-deep-teal/40 transition-colors cursor-pointer"
                                >
                                    {TARGET_MODELS.map((model) => (
                                        <option key={model.value} value={model.value} className="bg-midnight">
                                            {model.icon} {model.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Optimization Strength
                            </label>
                            <div className="flex bg-deep-teal/20 border border-electric-cyan/20 p-1 rounded-xl h-12">
                                {STRENGTH_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setStrength(option.value)}
                                        className={`flex-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${strength === option.value
                                            ? "bg-electric-cyan text-midnight shadow-[0_0_15px_rgba(9,183,180,0.4)]"
                                            : "text-white/60 hover:text-white"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Context and Files */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Additional Context
                            </label>
                            <Textarea
                                placeholder="E.g., 'Target audience is students'"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                rows={3}
                                className="resize-none bg-deep-teal/10 border-electric-cyan/10 focus:border-electric-cyan/30 text-white placeholder:text-white/10 rounded-xl transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                Reference Materials
                            </label>
                            <FileUpload
                                onFilesChange={setContextFiles}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Energy Bar Progress Animation */}
                    <div className={cn(
                        "transition-all duration-700 ease-in-out",
                        isLoading || progressStage > 0 ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none grayscale blur-[0.5px]"
                    )}>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold text-electric-cyan animate-pulse tracking-[0.2em] uppercase">
                                    {STAGES[progressStage]}
                                </span>
                                <span className="text-[10px] font-mono text-white/40">
                                    {isLoading ? "PHASE IN PROGRESS" : "COMPLETE"}
                                </span>
                            </div>
                            <div className="h-3 w-full bg-deep-teal/40 rounded-full overflow-hidden relative border border-electric-cyan/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-gradient-to-r from-electric-cyan via-sunset-orange to-electric-cyan bg-[length:50%_100%] animate-shimmer rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.5)]",
                                        !isLoading && progressStage === 0 ? "opacity-20" : "opacity-100"
                                    )}
                                    style={{
                                        width: '100%',
                                        left: '0'
                                    }}
                                />
                                {isLoading && (
                                    <>
                                        {/* Pulse effect */}
                                        <div className="absolute inset-0 bg-electric-cyan/20 animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-around opacity-60">
                                            {[...Array(15)].map((_, i) => (
                                                <div key={i} className="h-full w-1 bg-white/30 blur-[2px] animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer & Submit */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-electric-cyan/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Cost Structure</span>
                            <div className="flex items-center mt-1">
                                {useOrchestration ? (
                                    <span className="flex items-center text-xs text-electric-cyan font-bold">
                                        <Sparkles className="h-3 w-3 mr-1.5" />
                                        PREMIUM ORCHESTRATION ACTIVE
                                    </span>
                                ) : (
                                    <span className="text-xs text-white font-medium flex items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-electric-cyan mr-2 animate-ping" />
                                        1 STANDARD OPTIMIZATION CREDIT
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full md:w-auto h-14 px-12 rounded-xl btn-gradient text-lg tracking-widest uppercase glow-sm hover:glow-md active:scale-95 transition-all"
                            disabled={!canOptimize || !prompt.trim() || isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>ENERGIZING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Zap className="h-5 w-5 mr-3 fill-current" />
                                    Optimize
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export { type ContextFile };
