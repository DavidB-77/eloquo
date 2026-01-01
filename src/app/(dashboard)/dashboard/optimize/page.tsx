"use client";

import * as React from "react";
import Link from "next/link";
import { OptimizeForm, type OptimizeFormData, type ContextFile } from "@/components/optimize/OptimizeForm";
import { ResultsTabs } from "@/components/optimize/ResultsTabs";
import { InputSummary } from "@/components/optimize/InputSummary";
import { QuestionsForm, type ClarificationQuestion } from "@/components/optimize/QuestionsForm";
import { UpgradeModal, type UpgradeOption } from "@/components/optimize/UpgradeModal";
import OptimizationModal from "@/components/OptimizationModal";
import ProjectProtocolResults from "@/components/ProjectProtocolResults";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/UserProvider";
import { useAuth } from "@/providers/AuthProvider";

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

// Project Protocol response type
interface ProjectProtocolResponse {
    success: boolean;
    request_id: string;
    project_name: string;
    project_summary: string;
    documents: {
        prd: string;
        architecture: string;
        stories: string;
    };
    analysis: {
        project_name: string;
        core_features: string[];
        suggested_stack: {
            frontend: string;
            backend: string;
            database: string;
            hosting: string;
        };
        technical_complexity: string;
    };
    metrics: {
        total_tokens: number;
        processing_time_sec: number;
        api_cost_usd: number;
    };
    credits_used: number;
}

export default function OptimizePage() {
    // Core state
    const [result, setResult] = React.useState<SuccessResult | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [submittedData, setSubmittedData] = React.useState<OptimizeFormData | null>(null);

    // Optimization modal state
    const [showOptimizationModal, setShowOptimizationModal] = React.useState(false);
    const [optimizationComplete, setOptimizationComplete] = React.useState(false);

    // Questions flow state
    const [showQuestions, setShowQuestions] = React.useState(false);
    const [clarificationData, setClarificationData] = React.useState<ClarificationData | null>(null);
    const [isSubmittingQuestions, setIsSubmittingQuestions] = React.useState(false);

    // Upgrade flow state
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
    const [upgradeData, setUpgradeData] = React.useState<UpgradeData | null>(null);

    // User data from context
    const { userData, refreshUserData } = useUser();
    const { user } = useAuth();
    const userTier = userData?.tier || "basic";
    const comprehensiveCredits = userData?.comprehensiveCreditsRemaining ?? null;

    // Project Protocol state
    const [ppResult, setPpResult] = React.useState<ProjectProtocolResponse | null>(null);
    const [ppLoading, setPpLoading] = React.useState(false);

    const handleSubmit = async (data: OptimizeFormData, contextAnswers?: Record<string, string>, forceStandard?: boolean) => {
        // Check if Project Protocol mode
        if (data.isProjectProtocol) {
            // Validate minimum character length
            if (data.prompt.length < 20) {
                setError('Project idea must be at least 20 characters. Please provide more detail about your project.');
                return;
            }

            setPpLoading(true);
            setPpResult(null);
            setError(null);
            setSubmittedData(data);

            try {
                const payload = {
                    project_idea: data.prompt,
                    project_type: data.projectType || 'saas',
                    tech_preferences: data.techPreferences || null,
                    target_audience: data.targetAudience || null,
                    additional_context: data.context || null,
                    user_id: user?.id || '',
                    user_tier: userData?.tier || 'basic',
                };

                console.log('Sending to Project Protocol:', payload);

                const response = await fetch('https://agent.eloquo.io/project-protocol', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Failed to generate project');
                }

                const ppData = await response.json();
                setPpResult(ppData);
                await refreshUserData();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Project Protocol generation failed');
            } finally {
                setPpLoading(false);
            }
            return;
        }

        // Standard optimization flow
        setShowOptimizationModal(true);
        setOptimizationComplete(false);
        setResult(null);
        setError(null);
        setShowQuestions(false);
        setClarificationData(null);
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
                setShowOptimizationModal(false);
                setClarificationData(apiResult);
                setShowQuestions(true);
                return;
            }

            // Handle: Upgrade Required
            if (apiResult.status === "upgrade_required") {
                setShowOptimizationModal(false);
                setUpgradeData(apiResult);
                setShowUpgradeModal(true);
                return;
            }

            // Handle: Success
            if (apiResult.success) {
                setResult(apiResult);
                setOptimizationComplete(true);
                await refreshUserData();
                return;
            }

            // Handle: Error
            setShowOptimizationModal(false);
            setError(apiResult.error || "Optimization failed");

        } catch (err) {
            setShowOptimizationModal(false);
            setError("Failed to connect to optimization service");
        }
    };

    // Handle questions submit
    const handleQuestionsSubmit = async (answers: Record<string, string>) => {
        if (!submittedData) return;

        setIsSubmittingQuestions(true);
        setShowQuestions(false);

        try {
            await handleSubmit(submittedData, answers);
        } finally {
            setIsSubmittingQuestions(false);
        }
    };

    const handleQuestionsCancel = () => {
        setShowQuestions(false);
        setClarificationData(null);
    };

    // Handle upgrade modal
    const handleUpgrade = () => {
        setShowUpgradeModal(false);
    };

    const handleContinueStandard = async () => {
        if (!submittedData) return;
        setShowUpgradeModal(false);
        await handleSubmit(submittedData, undefined, true);
    };

    // When user clicks "View Optimized Prompt" in modal
    const handleViewResults = () => {
        setShowOptimizationModal(false);
        // Results are already loaded, just close the modal
    };

    const handleEdit = () => {
        setResult(null);
    };

    const handleStartNew = () => {
        setResult(null);
        setError(null);
        setSubmittedData(null);
        setClarificationData(null);
        setUpgradeData(null);
        setShowQuestions(false);
        setShowOptimizationModal(false);
        setOptimizationComplete(false);
        setPpResult(null);
    };

    // Calculate metrics for display
    const getMetrics = () => {
        if (!result) return undefined;
        return result.metrics;
    };

    return (
        <>
            {/* Optimization Modal - always available */}
            <OptimizationModal
                isOpen={showOptimizationModal}
                isComplete={optimizationComplete}
                onViewResults={handleViewResults}
            />

            {/* Upgrade Modal - always available */}
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

            {/* PP Results - Full Page View (replaces entire page) */}
            {ppResult && !ppLoading ? (
                <ProjectProtocolResults
                    result={ppResult}
                    onNewProject={handleStartNew}
                    onBack={() => setPpResult(null)}
                />
            ) : (
                /* Normal Optimize Page */
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
                                variant={userTier === "basic" ? "secondary" : "default"}
                                className={cn(
                                    "capitalize",
                                    userTier !== "basic" && "bg-primary/10 text-primary border-primary/20"
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

                            {userTier === "basic" && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/pricing">Upgrade</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Error State */}
                    {error && !result && (
                        <Card className="border-destructive bg-destructive/5">
                            <CardContent className="py-6">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-destructive">Generation Failed</p>
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

                    {/* PP Loading State */}
                    {ppLoading && (
                        <div className="mt-8 p-8 border border-electric-cyan/30 rounded-xl bg-midnight/80 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-electric-cyan border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-electric-cyan font-medium text-lg">🚀 Generating Project Documents...</p>
                            <p className="text-white/50 text-sm mt-2">This takes 15-30 seconds. Creating PRD, Architecture, and Implementation Stories.</p>
                        </div>
                    )}

                    {/* Results View (Standard Optimization) */}
                    {result && !showOptimizationModal ? (
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
                    ) : !showOptimizationModal && !ppLoading ? (
                        /* Form + Questions Layout */
                        <div className={cn(
                            "grid gap-6 transition-all duration-500",
                            showQuestions ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-6xl mx-auto"
                        )}>
                            {/* Left: Form */}
                            <div className="w-full">
                                <OptimizeForm
                                    onSubmit={(data) => handleSubmit(data)}
                                    isLoading={false}
                                    canOptimize={true}
                                    canOrchestrate={userTier !== "basic"}
                                    initialData={submittedData || undefined}
                                />
                            </div>

                            {/* Right: Questions panel (appears when needed) */}
                            {showQuestions && clarificationData && (
                                <div className="w-full h-full animate-in slide-in-from-right duration-500">
                                    <QuestionsForm
                                        questions={clarificationData.questions}
                                        originalPrompt={clarificationData.originalPrompt}
                                        creditsWillUse={clarificationData.creditsWillUse}
                                        classification={clarificationData.classification}
                                        onSubmit={handleQuestionsSubmit}
                                        onCancel={handleQuestionsCancel}
                                        isSubmitting={isSubmittingQuestions}
                                    />
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </>
    );
}
