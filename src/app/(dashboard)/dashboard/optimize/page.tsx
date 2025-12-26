"use client";

import * as React from "react";
import { OptimizeForm, type OptimizeFormData, type ContextFile } from "@/components/optimize/OptimizeForm";
import { ResultsTabs } from "@/components/optimize/ResultsTabs";
import { InputSummary } from "@/components/optimize/InputSummary";
import { OrchestrationResults } from "@/components/optimize/OrchestrationResults";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewState = "form" | "results";

interface OptimizeResult {
    optimizedPrompt: string;
    quickRefPrompt?: string;
    snippetPrompt?: string;
    improvements: string[];
    metrics: {
        originalTokens: number;
        optimizedTokens: number;
    };
    targetModel: string;
}

interface OrchestrationResult {
    summary: string;
    segments: any[];
    premiumCreditsUsed: number;
}

type ResultType =
    | { type: "optimize"; data: OptimizeResult }
    | { type: "orchestrate"; data: OrchestrationResult }
    | null;

export default function OptimizePage() {
    const [viewState, setViewState] = React.useState<ViewState>("form");
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState<ResultType>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [submittedData, setSubmittedData] = React.useState<OptimizeFormData | null>(null);

    const handleSubmit = async (data: OptimizeFormData) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSubmittedData(data);

        try {
            const endpoint = data.useOrchestration ? "/api/orchestrate" : "/api/optimize";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: data.prompt,
                    targetModel: data.targetModel,
                    strength: data.strength,
                    context: data.context,
                    contextFiles: data.contextFiles.map((f) => ({
                        name: f.name,
                        mimeType: f.mimeType,
                        base64: f.base64,
                    })),
                }),
            });

            const apiResult = await response.json();

            if (!apiResult.success) {
                setError(apiResult.error || "Optimization failed");
                return;
            }

            // Generate all three versions from response or derive them
            const optimizedPrompt = apiResult.data.optimizedPrompt;
            const quickRefPrompt = apiResult.data.quickRefPrompt || generateQuickRef(optimizedPrompt);
            const snippetPrompt = apiResult.data.snippetPrompt || generateSnippet(optimizedPrompt);

            setResult({
                type: data.useOrchestration ? "orchestrate" : "optimize",
                data: data.useOrchestration
                    ? apiResult.data
                    : {
                        ...apiResult.data,
                        optimizedPrompt,
                        quickRefPrompt,
                        snippetPrompt,
                    },
            });

            setViewState("results");
        } catch (err) {
            setError("Failed to connect to optimization service");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setViewState("form");
    };

    const handleStartNew = () => {
        setViewState("form");
        setResult(null);
        setError(null);
        setSubmittedData(null);
    };

    // Generate a condensed version (strip verbose instructions, keep core)
    const generateQuickRef = (prompt: string): string => {
        // Simple heuristic: take first 60% of content, remove filler phrases
        const lines = prompt.split("\n").filter((l) => l.trim());
        const keepCount = Math.max(3, Math.ceil(lines.length * 0.6));
        return lines.slice(0, keepCount).join("\n");
    };

    // Generate ultra-short snippet
    const generateSnippet = (prompt: string): string => {
        // Take first meaningful sentence or 100 chars
        const firstSentence = prompt.split(/[.!?]/)[0];
        if (firstSentence.length < 150) {
            return firstSentence + ".";
        }
        return prompt.substring(0, 100).trim() + "...";
    };

    // Calculate metrics
    const getMetrics = () => {
        if (!result || result.type !== "optimize" || !submittedData) return null;
        const originalTokens = Math.ceil(submittedData.prompt.length / 4);
        const optimizedTokens = Math.ceil(result.data.optimizedPrompt.length / 4);
        const tokensSaved = originalTokens - optimizedTokens;
        const percentageSaved = Math.round((tokensSaved / originalTokens) * 100);
        return { originalTokens, optimizedTokens, tokensSaved, percentageSaved };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-display tracking-tight">Optimize</h1>
                <p className="text-muted-foreground mt-1">
                    Transform your prompts for maximum effectiveness across any AI model.
                </p>
            </div>

            {/* Error State */}
            {error && !isLoading && (
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="py-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-destructive">Optimization Failed</p>
                                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={handleStartNew}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {isLoading && (
                <Card className="border-primary bg-primary/5">
                    <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Spinner size="lg" />
                        <div className="text-center">
                            <p className="font-medium">⏳ Optimizing your prompt...</p>
                            <p className="text-sm text-muted-foreground">This usually takes 3-10 seconds</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form View (centered) */}
            {viewState === "form" && !isLoading && (
                <div className="max-w-3xl mx-auto">
                    <OptimizeForm
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        canOptimize={true}
                        canOrchestrate={true}
                        initialData={submittedData || undefined}
                    />
                </div>
            )}

            {/* Results View (side-by-side) */}
            {viewState === "results" && result && !isLoading && (
                <div
                    className={cn(
                        "grid gap-6 animate-in slide-in-from-right-5 duration-300",
                        "lg:grid-cols-[35%_1fr]"
                    )}
                >
                    {/* Left: Input Summary */}
                    {submittedData && (
                        <InputSummary
                            prompt={submittedData.prompt}
                            targetModel={submittedData.targetModel}
                            strength={submittedData.strength}
                            context={submittedData.context}
                            files={submittedData.contextFiles}
                            onEdit={handleEdit}
                        />
                    )}

                    {/* Right: Results */}
                    {result.type === "optimize" && (
                        <ResultsTabs
                            results={{
                                full: result.data.optimizedPrompt,
                                quickRef: result.data.quickRefPrompt || "",
                                snippet: result.data.snippetPrompt || "",
                            }}
                            metrics={getMetrics() || undefined}
                            targetModel={submittedData?.targetModel || "universal"}
                            onStartNew={handleStartNew}
                        />
                    )}

                    {result.type === "orchestrate" && (
                        <div className="lg:col-span-2">
                            <OrchestrationResults
                                summary={result.data.summary}
                                segments={result.data.segments}
                                premiumCreditsUsed={result.data.premiumCreditsUsed}
                            />
                            <div className="text-center mt-4">
                                <Button variant="ghost" onClick={handleStartNew}>
                                    🔄 Start New Optimization
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
