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
    sessionId?: string;
}

interface OptimizeFormProps {
    onSubmit: (data: OptimizeFormData) => void;
    isLoading?: boolean;
    canOptimize?: boolean;
    canOrchestrate?: boolean;
    initialData?: Partial<OptimizeFormData>;
    awaitingQuestions?: boolean;
}

export function OptimizeForm({
    onSubmit,
    isLoading = false,
    canOptimize = true,
    canOrchestrate = false,
    initialData,
    awaitingQuestions = false,
}: OptimizeFormProps) {
    const [prompt, setPrompt] = React.useState(initialData?.prompt || "");
    const [targetModel, setTargetModel] = React.useState(initialData?.targetModel || "universal");
    const [strength, setStrength] = React.useState(initialData?.strength || "medium");
    const [context, setContext] = React.useState(initialData?.context || "");
    const [contextFiles, setContextFiles] = React.useState<ContextFile[]>(initialData?.contextFiles || []);
    const [useOrchestration, setUseOrchestration] = React.useState(initialData?.useOrchestration || false);
    const [progressStage, setProgressStage] = React.useState(0);
    const [sessionId, setSessionId] = React.useState<string | null>(null);
    const [realStageName, setRealStageName] = React.useState<string | null>(null);

    const STAGES = [
        { stage: 0, label: "Preparing request...", percent: 5 },
        { stage: 1, label: "Initializing...", percent: 15 },
        { stage: 2, label: "Classifying request...", percent: 35 },
        { stage: 3, label: "Deep analysis...", percent: 60 },
        { stage: 4, label: "Generating optimization...", percent: 90 },
        { stage: 5, label: "Complete!", percent: 100 }
    ];

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

    // Poll for real progress from n8n
    React.useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (isLoading && sessionId) {
            // Start with stage 0
            setProgressStage(0);
            setRealStageName("Preparing request...");

            pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/optimize/progress?sessionId=${sessionId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.stage > 0) {
                            setRealStageName(data.stageName);
                            setProgressStage(data.stage);
                        }
                    }
                } catch (error) {
                    // Silent fail - don't break the UX if progress polling fails
                    console.error('Progress poll error:', error);
                }
            }, 400); // Poll every 400ms for responsive updates
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isLoading, sessionId]);

    // Reset progress when loading completes
    React.useEffect(() => {
        if (!isLoading && progressStage > 0 && progressStage < 5) {
            // Jump to complete
            setProgressStage(5);
            setRealStageName("Complete!");

            // Clean up after a delay
            const timeout = setTimeout(() => {
                setProgressStage(0);
                setRealStageName(null);
                if (sessionId) {
                    // Clean up the progress session
                    fetch(`/api/optimize/progress?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => { });
                    setSessionId(null);
                }
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, progressStage, sessionId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        // Generate a new session ID for progress tracking
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        setRealStageName(null);
        setProgressStage(0);

        onSubmit({
            prompt,
            targetModel,
            strength,
            context,
            contextFiles,
            useOrchestration,
            sessionId: newSessionId
        });
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
                                rows={6}
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

                    {/* Real-Time Progress Bar */}
                    <div className={cn(
                        "transition-all duration-500 ease-in-out overflow-hidden",
                        isLoading || (progressStage > 0 && progressStage <= 5) ? "opacity-100 max-h-48" : "opacity-0 max-h-0"
                    )}>
                        <div className="space-y-4 py-4">
                            {/* Stage Label - Centered above bar */}
                            <div className="text-center">
                                <span className="text-sm font-bold text-electric-cyan tracking-wider uppercase">
                                    {awaitingQuestions
                                        ? "Awaiting your input..."
                                        : (realStageName || STAGES[progressStage]?.label || "Preparing...")}
                                </span>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="relative px-1">
                                {/* Background bar */}
                                <div className="h-3 w-full bg-deep-teal/40 rounded-full overflow-hidden border border-electric-cyan/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                                    {/* Filled portion */}
                                    <div
                                        className={cn(
                                            "h-full bg-gradient-to-r from-electric-cyan via-electric-cyan to-sunset-orange rounded-full transition-all duration-500 ease-out relative overflow-hidden",
                                            awaitingQuestions && "animate-pulse"
                                        )}
                                        style={{
                                            width: awaitingQuestions ? '50%' : `${STAGES[Math.min(progressStage, STAGES.length - 1)]?.percent || 5}%`,
                                            boxShadow: '0 0 15px rgba(9, 183, 180, 0.6)'
                                        }}
                                    >
                                        {/* Shimmer effect */}
                                        {isLoading && (
                                            <div
                                                className="absolute inset-0 w-full h-full"
                                                style={{
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                    animation: 'shimmer 1.5s infinite'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Stage markers */}
                                <div className="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none">
                                    {[
                                        { pos: 15, stage: 1 },
                                        { pos: 35, stage: 2 },
                                        { pos: 60, stage: 3 },
                                        { pos: 90, stage: 4 }
                                    ].map(({ pos, stage }) => (
                                        <div
                                            key={stage}
                                            className={cn(
                                                "absolute h-4 w-4 rounded-full border-2 transition-all duration-500",
                                                progressStage >= stage
                                                    ? "bg-electric-cyan border-electric-cyan shadow-[0_0_10px_rgba(9,183,180,0.8)]"
                                                    : "bg-midnight border-electric-cyan/30"
                                            )}
                                            style={{
                                                left: `${pos}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Stage labels below bar */}
                            <div className="grid grid-cols-4 text-[9px] text-white/50 uppercase tracking-wider">
                                <span className={cn("text-center transition-colors", progressStage >= 1 && "text-electric-cyan/80")}>Classify</span>
                                <span className={cn("text-center transition-colors", progressStage >= 2 && "text-electric-cyan/80")}>Analyze</span>
                                <span className={cn("text-center transition-colors", progressStage >= 3 && "text-electric-cyan/80")}>Generate</span>
                                <span className={cn("text-center transition-colors", progressStage >= 4 && "text-electric-cyan/80")}>Complete</span>
                            </div>

                            {/* Processing indicator */}
                            <div className="flex justify-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <div className="h-1.5 w-1.5 rounded-full bg-electric-cyan animate-ping" />
                                            Stage {Math.max(1, Math.min(progressStage, 4))} of 4
                                        </>
                                    ) : progressStage === 5 ? (
                                        <>
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                            Optimization Complete
                                        </>
                                    ) : null}
                                </span>
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
