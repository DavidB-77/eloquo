"use client";

import * as React from "react";
import { OptimizeForm } from "@/components/optimize/OptimizeForm";
import { ResultDisplay } from "@/components/optimize/ResultDisplay";
import { OrchestrationResults } from "@/components/optimize/OrchestrationResults";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, AlertCircle } from "lucide-react";

type ResultType =
    | { type: 'optimize'; data: any }
    | { type: 'orchestrate'; data: any }
    | null;

export default function OptimizePage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState<ResultType>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [originalPrompt, setOriginalPrompt] = React.useState("");

    const handleSubmit = async (data: {
        prompt: string;
        targetModel: string;
        strength: string;
        context: string;
        useOrchestration: boolean;
    }) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setOriginalPrompt(data.prompt);

        try {
            const endpoint = data.useOrchestration ? '/api/orchestrate' : '/api/optimize';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: data.prompt,
                    targetModel: data.targetModel,
                    strength: data.strength,
                    context: data.context,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                setError(result.error || 'Optimization failed');
                return;
            }

            setResult({
                type: data.useOrchestration ? 'orchestrate' : 'optimize',
                data: result.data,
            });

        } catch (err) {
            setError('Failed to connect to optimization service');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
        setOriginalPrompt("");
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-display tracking-tight">Optimize</h1>
                <p className="text-muted-foreground mt-1">
                    Transform your prompts for maximum effectiveness across any AI model.
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <Card className="border-primary bg-primary/5">
                    <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Spinner size="lg" />
                        <div className="text-center">
                            <p className="font-medium">Optimizing your prompt...</p>
                            <p className="text-sm text-muted-foreground">This usually takes 3-10 seconds</p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                    onClick={handleReset}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {result && !isLoading && (
                <div className="space-y-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Optimize Another
                    </Button>

                    {result.type === 'optimize' && (
                        <ResultDisplay
                            originalPrompt={originalPrompt}
                            optimizedPrompt={result.data.optimizedPrompt}
                            improvements={result.data.improvements}
                            metrics={result.data.metrics}
                            targetModel={result.data.targetModel || 'Universal'}
                        />
                    )}

                    {result.type === 'orchestrate' && (
                        <OrchestrationResults
                            summary={result.data.summary}
                            segments={result.data.segments}
                            premiumCreditsUsed={result.data.premiumCreditsUsed}
                        />
                    )}
                </div>
            )}

            {/* Form (only show when not loading and no results) */}
            {!isLoading && !result && (
                <OptimizeForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    canOptimize={true}
                    canOrchestrate={true} // TODO: Check from usage API
                />
            )}
        </div>
    );
}
