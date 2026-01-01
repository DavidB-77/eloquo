"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, Globe } from "lucide-react";
import { FileUpload, type ContextFile } from "./FileUpload";

import { TARGET_MODELS } from "@/lib/constants/models";

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
    // Project Protocol fields
    isProjectProtocol?: boolean;
    projectType?: string;
    targetAudience?: string;
    techPreferences?: string;
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
    // Project Protocol state
    const [isProjectProtocol, setIsProjectProtocol] = React.useState(initialData?.isProjectProtocol || false);
    const [projectType, setProjectType] = React.useState(initialData?.projectType || "saas");
    const [targetAudience, setTargetAudience] = React.useState(initialData?.targetAudience || "");
    const [techPreferences, setTechPreferences] = React.useState(initialData?.techPreferences || "");

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        onSubmit({
            prompt,
            targetModel,
            strength,
            context,
            contextFiles,
            useOrchestration,
            isProjectProtocol,
            projectType,
            targetAudience,
            techPreferences,
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
                        {isProjectProtocol ? "DESCRIBE YOUR PROJECT FOR FULL DOCUMENTATION" : "ENTER YOUR PROMPT BELOW FOR AI-POWERED OPTIMIZATION"}
                    </p>
                </div>

                {/* Project Protocol Toggle */}
                <div
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${isProjectProtocol
                        ? "bg-electric-cyan/10 border-electric-cyan/40 shadow-[0_0_15px_rgba(9,183,180,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                    onClick={() => setIsProjectProtocol(!isProjectProtocol)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🚀</span>
                            <div>
                                <p className="text-sm font-bold text-white">PROJECT PROTOCOL</p>
                                <p className="text-xs text-white/60">Generate PRD, Architecture & Implementation Stories</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${isProjectProtocol ? "bg-electric-cyan" : "bg-white/20"
                            }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isProjectProtocol ? "left-7" : "left-1"
                                }`} />
                        </div>
                    </div>
                    {isProjectProtocol && (
                        <div className="mt-3 pt-3 border-t border-electric-cyan/20 flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-electric-cyan/20 text-electric-cyan font-bold">5 CREDITS</span>
                            <span className="text-[10px] text-white/40">Generates complete project documentation</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Prompt Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                {isProjectProtocol ? "Project Idea" : "Input Prompt"} <span className="text-terracotta">*</span>
                            </label>
                            <span className="text-[10px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                                <Globe className="h-3 w-3" />
                                Multilingual Engine Active
                            </span>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder={isProjectProtocol ? "Describe your project idea in detail..." : "What would you like to optimize?"}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={isProjectProtocol ? 8 : 6}
                                className="resize-none bg-midnight border-electric-cyan/20 focus:border-electric-cyan focus:ring-4 focus:ring-electric-cyan/5 text-white placeholder:text-white/20 rounded-xl transition-all duration-300 py-4 px-5 text-lg leading-relaxed shadow-inner"
                            />
                            <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">
                                    {prompt.length} CHR / ~{Math.ceil(prompt.length / 4)} TOK
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controls Section - Conditional based on mode */}
                    {!isProjectProtocol ? (
                        // Standard Optimization Controls
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
                    ) : (
                        // Project Protocol Controls
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                    Project Type
                                </label>
                                <Select
                                    value={projectType}
                                    onChange={(e) => setProjectType(e.target.value)}
                                    className="w-full bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl h-12"
                                >
                                    <option value="saas" className="bg-midnight">SaaS Application</option>
                                    <option value="web_app" className="bg-midnight">Web Application</option>
                                    <option value="mobile_app" className="bg-midnight">Mobile App</option>
                                    <option value="api" className="bg-midnight">API / Backend</option>
                                    <option value="tool" className="bg-midnight">Tool / Utility</option>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                    Target Audience <span className="text-white/40">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g., Small businesses, developers"
                                    className="w-full bg-deep-teal/20 border border-electric-cyan/20 text-white rounded-xl h-12 px-4 placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                                    Tech Preferences <span className="text-white/40">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={techPreferences}
                                    onChange={(e) => setTechPreferences(e.target.value)}
                                    placeholder="e.g., React, Node.js, PostgreSQL"
                                    className="w-full bg-deep-teal/20 border border-electric-cyan/20 text-white rounded-xl h-12 px-4 placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    )}

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

                    {/* Footer & Submit */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-electric-cyan/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Cost Structure</span>
                            <div className="flex items-center mt-1">
                                {isProjectProtocol ? (
                                    <span className="flex items-center text-xs text-electric-cyan font-bold">
                                        🚀 5 PROJECT PROTOCOL CREDITS
                                    </span>
                                ) : useOrchestration ? (
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
                            className={`w-full md:w-auto h-14 px-12 rounded-xl text-lg tracking-widest uppercase glow-sm hover:glow-md active:scale-95 transition-all ${isProjectProtocol
                                    ? "bg-electric-cyan hover:bg-electric-cyan/90 text-midnight"
                                    : "btn-gradient"
                                }`}
                            disabled={!canOptimize || !prompt.trim() || isLoading}
                        >
                            <div className="flex items-center">
                                {isProjectProtocol ? (
                                    <>🚀 Generate Project</>
                                ) : (
                                    <>
                                        <Zap className="h-5 w-5 mr-3 fill-current" />
                                        Optimize
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export { type ContextFile };
