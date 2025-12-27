"use client";

import * as React from "react";
import Link from "next/link";
import { OptimizeForm, type OptimizeFormData, type ContextFile } from "@/components/optimize/OptimizeForm";
import { ResultsTabs } from "@/components/optimize/ResultsTabs";
import { InputSummary } from "@/components/optimize/InputSummary";
import { QuestionsForm, type ClarificationQuestion } from "@/components/optimize/QuestionsForm";
import { UpgradeModal, type UpgradeOption } from "@/components/optimize/UpgradeModal";
import { OrchestrationResults } from "@/components/optimize/OrchestrationResults";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/UserProvider";

type ViewState = "form" | "questions" | "results";

// Response types from n8n
interface SuccessResult {
    success: true;
    results: {
        full: string;
        quickRef: string;
        snippet: string;
    };
    improvements: string[];
    metrics: {
        originalTokens: number;
        optimizedTokens: number;
        tokensSaved: number;
        processingTimeMs: number;
        creditsUsed: number;
        outputMode: string;
        qualityScore: number;
    };
    validation?: {
        approved: boolean;
        score: number;
    };
}

interface ClarificationData {
    status: "needs_clarification";
    message: string;
    questions: ClarificationQuestion[];
    originalPrompt: string;
    classification: { domain: string; complexity: string };
    creditsWillUse: number;
}

interface UpgradeData {
    status: "upgrade_required";
    message: string;
    comprehensiveRemaining: number;
    options: UpgradeOption[];
    originalPrompt: string;
}

export default function OptimizePage() {
    const [viewState, setViewState] = React.useState<ViewState>("form");
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState<SuccessResult | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [submittedData, setSubmittedData] = React.useState<OptimizeFormData | null>(null);

    // Questions flow state
    const [clarificationData, setClarificationData] = React.useState<ClarificationData | null>(null);

    // Upgrade flow state
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
    const [upgradeData, setUpgradeData] = React.useState<UpgradeData | null>(null);

    // Pending request for re-submission
    const [pendingRequest, setPendingRequest] = React.useState<OptimizeFormData | null>(null);

    // User data from context
    const { userData, refreshUserData } = useUser();
    const userTier = userData?.tier || "free";
    const comprehensiveCredits = userData?.comprehensiveCreditsRemaining ?? null;

    const handleSubmit = async (data: OptimizeFormData, contextAnswers?: Record<string, string>, forceStandard?: boolean) => {
        setIsLoading(true);
        setError(null);
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
                    contextAnswers: contextAnswers || null,
                    forceStandard: forceStandard || false,
                }),
            });

            const apiResult = await response.json();

            // Handle: Needs Clarification
            if (apiResult.status === "needs_clarification") {
                setPendingRequest(data);
                setClarificationData(apiResult);
                setViewState("questions");
                return;
            }

            // Handle: Upgrade Required
            if (apiResult.status === "upgrade_required") {
                setPendingRequest(data);
                setUpgradeData(apiResult);
                setShowUpgradeModal(true);
                return;
            }

            // Handle: Success
            if (apiResult.success) {
                setResult(apiResult);
                setViewState("results");
                setClarificationData(null);
                setUpgradeData(null);
                // Update credits display

                // Refresh global user data (sidebar, header, etc.)
                await refreshUserData();

                return;
            }

            // Handle: Error
            setError(apiResult.error || "Optimization failed");
        } catch (err) {
            setError("Failed to connect to optimization service");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle questions submit
    const handleQuestionsSubmit = async (answers: Record<string, string>) => {
        if (!pendingRequest) return;
        await handleSubmit(pendingRequest, answers);
    };

    const handleQuestionsCancel = () => {
        setViewState("form");
        setClarificationData(null);
        setPendingRequest(null);
    };

    // Handle upgrade modal
    const handleUpgrade = () => {
        setShowUpgradeModal(false);
    };

    const handleContinueStandard = async () => {
        if (!pendingRequest) return;
        setShowUpgradeModal(false);
        await handleSubmit(pendingRequest, undefined, true);
    };

    const handleEdit = () => {
        setViewState("form");
    };

    const handleStartNew = () => {
        setViewState("form");
        setResult(null);
        setError(null);
        setSubmittedData(null);
        setClarificationData(null);
        setUpgradeData(null);
        setPendingRequest(null);
    };

    // Calculate metrics for display
    const getMetrics = () => {
        if (!result) return undefined;
        return result.metrics;
    };

    return (
        <div className="space-y-6">
            {/* Header with Tier Display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Optimize</h1>
                    <p className="text-muted-foreground mt-1">
                        Transform your prompts for maximum effectiveness across any AI model.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge
                        variant={userTier === "free" ? "secondary" : "default"}
                        className={cn(
                            "capitalize",
                            userTier !== "free" && "bg-primary/10 text-primary border-primary/20"
                        )}
                    >
                        <Crown className="h-3 w-3 mr-1" />
                        {userTier} Plan
                    </Badge>

                    {comprehensiveCredits !== null && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>{comprehensiveCredits} comprehensive credits</span>
                        </div>
                    )}

                    {userTier === "free" && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/pricing">Upgrade</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Upgrade Modal */}
            {upgradeData && (
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    message={upgradeData.message}
                    comprehensiveRemaining={upgradeData.comprehensiveRemaining}
                    options={upgradeData.options}
                    onUpgrade={handleUpgrade}
                    onContinueStandard={handleContinueStandard}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}

            {/* Error State */}
            {error && !isLoading && viewState === "form" && (
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

            {/* Questions View */}
            {viewState === "questions" && clarificationData && !isLoading && (
                <div className="max-w-3xl mx-auto">
                    <QuestionsForm
                        questions={clarificationData.questions}
                        originalPrompt={clarificationData.originalPrompt}
                        creditsWillUse={clarificationData.creditsWillUse}
                        classification={clarificationData.classification}
                        onSubmit={handleQuestionsSubmit}
                        onCancel={handleQuestionsCancel}
                        isSubmitting={isLoading}
                    />
                </div>
            )}

            {/* Form View (centered) */}
            {viewState === "form" && !isLoading && (
                <div className="max-w-3xl mx-auto">
                    <OptimizeForm
                        onSubmit={(data) => handleSubmit(data)}
                        isLoading={isLoading}
                        canOptimize={true}
                        canOrchestrate={userTier !== "free"}
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
                    <div className="space-y-4">
                        <ResultsTabs
                            results={result.results}
                            metrics={getMetrics() || undefined}
                            targetModel={submittedData?.targetModel || "universal"}
                            onStartNew={handleStartNew}
                            improvements={result.improvements}
                            validation={result.validation}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
