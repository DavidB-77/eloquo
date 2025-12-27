"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
        onSubmit({ prompt, targetModel, strength, context, contextFiles, useOrchestration });
    };

    const clearForm = () => {
        setPrompt("");
        setContext("");
        setContextFiles([]);
        setUseOrchestration(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Optimize Your Prompt
                </CardTitle>
                <CardDescription>
                    Enter your prompt below and we'll transform it for maximum effectiveness.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Prompt Input */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">
                                Your Prompt <span className="text-destructive">*</span>
                            </label>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Works in any language
                            </span>
                        </div>
                        <Textarea
                            placeholder="Enter your prompt here... Be as detailed as you like. We'll help structure it for the best results."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={6}
                            className="resize-none"
                        />
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>{prompt.length} characters</span>
                            <span>~{Math.ceil(prompt.length / 4)} tokens</span>
                        </div>
                    </div>

                    {/* Model and Strength Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Target Model">
                            <Select
                                value={targetModel}
                                onChange={(e) => setTargetModel(e.target.value)}
                            >
                                {TARGET_MODELS.map((model) => (
                                    <option key={model.value} value={model.value}>
                                        {model.icon} {model.label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Optimization Strength">
                            <div className="flex space-x-2">
                                {STRENGTH_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setStrength(option.value)}
                                        className={`flex-1 p-2 rounded-lg border text-sm font-medium transition-all ${strength === option.value
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background hover:bg-muted border-input"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </FormField>
                    </div>

                    {/* Optional Context */}
                    <FormField
                        label="Additional Context"
                        description="Optional: Provide background information to help refine the optimization."
                    >
                        <Textarea
                            placeholder="E.g., 'This is for a formal business proposal' or 'Target audience is students'"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </FormField>

                    {/* File Upload */}
                    <FileUpload
                        onFilesChange={setContextFiles}
                        disabled={isLoading}
                    />

                    {/* Orchestration Toggle */}
                    {canOrchestrate && (
                        <div
                            className={`p-4 rounded-lg border cursor-not-allowed transition-all opacity-60 bg-muted/30 border-input`}
                        >
                            <div className="flex items-start space-x-3">
                                <div
                                    className={`h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 border-input`}
                                >
                                    {/* Unchecked state for disabled */}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium text-sm text-muted-foreground">Use Orchestration</span>
                                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Coming Soon</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        For complex tasks. Breaks your request into multiple targeted prompts. (Premium Feature)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-xs text-muted-foreground">
                            {useOrchestration ? (
                                <span className="flex items-center">
                                    <Sparkles className="h-3 w-3 mr-1 text-primary" />
                                    Uses premium credits for each segment
                                </span>
                            ) : (
                                <span>Uses 1 optimization credit</span>
                            )}
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isLoading}
                            disabled={!canOptimize || !prompt.trim()}
                        >
                            {isLoading ? (
                                "⏳ Optimizing..."
                            ) : useOrchestration ? (
                                <>
                                    <Layers className="h-4 w-4 mr-2" />
                                    Orchestrate
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Optimize
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export { type ContextFile };
