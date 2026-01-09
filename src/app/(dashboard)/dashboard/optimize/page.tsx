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
import { FreeTierBadge } from "@/components/FreeTierIndicator";
import { AlertCircle, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/UserProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useFreeTierStatus } from "@/hooks/useFingerprint";

// Response types from n8n
interface SuccessResult {
    success: true;
    results: {
        full: string;
        quickRef: string;
        snippet: string;
    };
    improvements: string[];
    techniques_applied?: string[];
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
    const [isRefining, setIsRefining] = React.useState(false);
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
    const userTier = userData?.tier || "free";
    const comprehensiveCredits = userData?.comprehensiveCreditsRemaining ?? null;

    // Free Tier Status
    const {
        canOptimize,
        isPaidUser,
        remaining,
        recordUsage,
        isLoading: statusLoading
    } = useFreeTierStatus(user?.id || null);

    // Project Protocol state
    const [ppResult, setPpResult] = React.useState<ProjectProtocolResponse | null>(null);
    const [ppLoading, setPpLoading] = React.useState(false);

    // Guard against double-calling recordUsage (e.g., double-click submit)
    const isRecordingUsage = React.useRef(false);

    // Session tracking to prevent double-charging on follow-up questions
    const [sessionChargeRecorded, setSessionChargeRecorded] = React.useState(false);
    const currentSessionId = React.useRef<string | null>(null);

    // Track when initial status check is complete to prevent race conditions
    const [statusChecked, setStatusChecked] = React.useState(false);

    // Track initial remaining count when page loads (for warning banner UX)
    const [initialRemaining, setInitialRemaining] = React.useState<number | null | undefined>(null);

    // Track if optimization is actively processing (prevents blocker mid-session)
    const [optimizationInProgress, setOptimizationInProgress] = React.useState(false);

    // Track if user is viewing a result (prevents blocker from covering result)
    const [isViewingResult, setIsViewingResult] = React.useState(false);

    // Mark status as checked after loading completes
    React.useEffect(() => {
        if (!statusLoading && user?.id) {
            setStatusChecked(true);
        }
    }, [statusLoading, user?.id]);

    // Capture the remaining count when status first loads (for warning banner)
    React.useEffect(() => {
        // Only set initialRemaining AFTER we have confirmed fresh data from API
        if (remaining !== undefined && remaining !== null && initialRemaining === null && statusChecked) {
            console.log('[UX] Setting initialRemaining to:', remaining);
            setInitialRemaining(remaining);
        }
    }, [remaining, initialRemaining, statusChecked]);

    const handleSubmit = async (data: OptimizeFormData, contextAnswers?: Record<string, string>, forceStandard?: boolean) => {
        setError(null);

        // Check if this is a follow-up submission (answering clarification questions)
        const isFollowUpSubmission = contextAnswers !== undefined && contextAnswers !== null;

        console.log('[SUBMIT] Is follow-up submission:', isFollowUpSubmission);
        console.log('[SUBMIT] Session charge recorded:', sessionChargeRecorded);
        console.log('[SUBMIT] canOptimize:', canOptimize, 'isPaidUser:', isPaidUser);

        // For NEW submissions (not follow-ups), reset initialRemaining to current value
        // This ensures warning banner shows correctly when user returns after this optimization
        if (!isFollowUpSubmission) {
            console.log('[UX] Resetting initialRemaining for new session to:', remaining);
            setInitialRemaining(remaining);
        }

        // CRITICAL: Follow-up submissions bypass ALL usage checks
        // We already charged/recorded usage for this session on the initial submission
        if (isFollowUpSubmission && sessionChargeRecorded) {
            console.log('[SUBMIT] Follow-up submission with session already charged - bypassing ALL usage checks');
            // Skip directly to API call below
        } else {
            // 1. Check Free Tier Limits (only for NEW submissions, not follow-ups)
            // Note: Project Protocol might have different limits, but prompt implied general optimize.
            // We'll enforce for standard optimize first.
            if (!data.isProjectProtocol && !isPaidUser && !canOptimize && !isFollowUpSubmission) {
                console.log('[SUBMIT] Free tier limit reached and NOT a follow-up - blocking');
                setError("Free tier weekly limit reached. Please upgrade to continue.");
                return;
            }
        }

        // Check if Project Protocol mode
        if (data.isProjectProtocol) {
            // Validate minimum character length
            if (data.prompt.length < 20) {
                setError('Project idea must be at least 20 characters. Please provide more detail about your project.');
                return;
            }

            // Show game modal during PP generation (takes 15-30 seconds)
            setShowOptimizationModal(true);
            setOptimizationComplete(false);
            setPpLoading(true);
            setPpResult(null);
            setError(null);
            setSubmittedData(data);

            try {
                // Record usage for Project Protocol (also consumes 1 optimization from free tier)
                // ONLY charge on first submission, NOT on follow-up question answers
                if (!isPaidUser && !isFollowUpSubmission && !sessionChargeRecorded) {
                    // Guard against duplicate calls
                    if (isRecordingUsage.current) {
                        console.warn('[PROJECT PROTOCOL] Already recording usage, skipping duplicate call');
                        throw new Error("Please wait, processing your previous request...");
                    }

                    isRecordingUsage.current = true;
                    console.log('[PROJECT PROTOCOL] Free tier user - recording usage before generation');
                    console.log('[PROJECT PROTOCOL] Current canOptimize:', canOptimize, 'Remaining:', remaining);

                    try {
                        const usageRecorded = await recordUsage();
                        console.log('[PROJECT PROTOCOL] recordUsage result:', usageRecorded);

                        if (!usageRecorded) {
                            console.error('[PROJECT PROTOCOL] Failed to record usage or limit reached');
                            throw new Error("Weekly limit reached during processing.");
                        }
                        console.log('[PROJECT PROTOCOL] Usage recorded successfully');
                        setSessionChargeRecorded(true); // Mark session as charged
                    } finally {
                        isRecordingUsage.current = false;
                    }
                } else if (!isPaidUser && (isFollowUpSubmission || sessionChargeRecorded)) {
                    console.log('[PROJECT PROTOCOL] Follow-up submission or already charged - skipping recordUsage');
                }

                const payload = {
                    project_idea: data.prompt,
                    project_type: data.projectType || 'saas',
                    tech_preferences: data.techPreferences || null,
                    target_audience: data.targetAudience || null,
                    additional_context: data.context || null,
                    user_id: user?.id || '',
                    user_tier: userData?.tier || 'free',
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
                setShowOptimizationModal(false);
            }
            return;
        }

        // Standard optimization flow

        // 2. Record Usage FIRST for free tier users (BEFORE showing modal)
        // ONLY charge on first submission, NOT on follow-up question answers
        if (!isPaidUser && !isFollowUpSubmission && !sessionChargeRecorded) {
            // Guard against duplicate calls
            if (isRecordingUsage.current) {
                console.warn('[OPTIMIZE] Already recording usage, skipping duplicate call');
                setError("Please wait, processing your previous request...");
                return;
            }

            isRecordingUsage.current = true;
            console.log('[OPTIMIZE] Free tier user - recording usage before optimization');
            console.log('[OPTIMIZE] Current canOptimize:', canOptimize, 'Remaining:', remaining);

            try {
                const usageRecorded = await recordUsage();
                console.log('[OPTIMIZE] recordUsage result:', usageRecorded);

                if (!usageRecorded) {
                    console.error('[OPTIMIZE] Failed to record usage or limit reached');
                    setError("Weekly limit reached. Upgrade to continue.");
                    return;
                }
                console.log('[OPTIMIZE] Usage recorded successfully, proceeding with optimization');
                setSessionChargeRecorded(true); // Mark session as charged
            } finally {
                isRecordingUsage.current = false;
            }
        } else if (!isPaidUser && (isFollowUpSubmission || sessionChargeRecorded)) {
            console.log('[OPTIMIZE] Follow-up submission or already charged - skipping recordUsage');
        }

        setShowOptimizationModal(true);
        setOptimizationComplete(false);
        setResult(null);
        setError(null);
        setShowQuestions(false);
        setClarificationData(null);
        setSubmittedData(data);
        setOptimizationInProgress(true); // Mark optimization as in progress

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
                    isFollowUpSubmission: isFollowUpSubmission, // Prevent double-charging
                }),
            });

            console.log('[OPTIMIZE] API Response status:', response.status, response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[OPTIMIZE] API request failed:', response.status, errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const apiResult = await response.json();
            console.log('[OPTIMIZE] API Result:', apiResult);

            // Handle: Needs Clarification
            if (apiResult.status === "needs_clarification") {
                console.log('[OPTIMIZE] Needs clarification - showing questions');
                setShowOptimizationModal(false);
                setClarificationData(apiResult);
                setShowQuestions(true);
                return;
            }

            // Handle: Upgrade Required
            if (apiResult.status === "upgrade_required") {
                console.log('[OPTIMIZE] Upgrade required - showing modal');
                setShowOptimizationModal(false);
                setUpgradeData(apiResult);
                setShowUpgradeModal(true);
                return;
            }

            // Handle: Success
            if (apiResult.success) {
                console.log('[OPTIMIZE] Success - showing results');
                setResult(apiResult);
                setIsViewingResult(true);  // Mark that we're now viewing a result
                setOptimizationComplete(true);
                setOptimizationInProgress(false); // Clear progress flag
                await refreshUserData();
                return;
            }

            // Handle: Error
            console.error('[OPTIMIZE] API returned error:', apiResult.error || 'Unknown error');
            setShowOptimizationModal(false);
            setError(apiResult.error || "Optimization failed");
            setOptimizationInProgress(false); // Clear progress flag

        } catch (err) {
            console.error('[OPTIMIZE] Exception during optimization:', err);
            setShowOptimizationModal(false);
            setError("Failed to connect to optimization service");
            setOptimizationInProgress(false); // Clear progress flag
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

    // Reset session when user wants to start a new optimization
    const resetSession = () => {
        console.log('[SESSION] Resetting session - clearing charge tracking');
        setSessionChargeRecorded(false);
        currentSessionId.current = null;
        setResult(null);
        setPpResult(null);
        setShowQuestions(false);
        setClarificationData(null);
        setIsViewingResult(false);  // Clear result viewing state
    };

    // When user clicks "View Optimized Prompt" in modal
    const handleViewResults = () => {
        setShowOptimizationModal(false);
        // Results are already loaded, just close the modal
    };

    const handleEdit = () => {
        console.log('[EDIT] Clearing results and resetting session');
        resetSession();  // Also reset session to allow new optimization
    };

    const handleRefine = async (instruction: string) => {
        if (!result?.results?.full) return;

        setIsRefining(true);
        try {
            const res = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalPrompt: result.results.full,
                    instruction,
                    userTier: userTier,
                }),
            });
            const response = await res.json();

            if (response.success && response.refinedPrompt) {
                setResult(prev => prev ? {
                    ...prev,
                    results: {
                        ...prev.results,
                        full: response.refinedPrompt,
                    },
                    improvements: [...(prev.improvements || []), ...(response.changesMade || [])],
                } : null);
            } else {
                console.error('Refine failed:', response.error);
            }
        } catch (error) {
            console.error('Refine error:', error);
        } finally {
            setIsRefining(false);
        }
    };


    const handleStartNew = () => {
        console.log('[NEW OPTIMIZATION] Starting fresh - resetting all state');
        resetSession();  // CRITICAL - Reset session charge flag to prevent unlimited optimizations
        setError(null);
        setSubmittedData(null);
        setClarificationData(null);
        setUpgradeData(null);
        setShowQuestions(false);
        setShowOptimizationModal(false);
        setOptimizationComplete(false);
        setPpResult(null);
        setOptimizationInProgress(false);  // Clear progress flag
        setInitialRemaining(remaining);  // Reset initial remaining for warning banner
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
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold font-display tracking-tight">Optimize</h1>
                                <FreeTierBadge />
                            </div>
                            <p className="text-muted-foreground mt-1">
                                Transform your prompts for maximum effectiveness across any AI model.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge
                                variant={(userTier === "basic" || userTier === "free") ? "secondary" : "default"}
                                className={cn(
                                    "capitalize",
                                    (userTier !== "basic" && userTier !== "free") && "bg-primary/10 text-primary border-primary/20"
                                )}
                            >
                                <Crown className="h-3 w-3 mr-1" />
                                {userTier === "enterprise" ? "Business" : userTier} Plan
                            </Badge>

                            {comprehensiveCredits !== null && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <span>{comprehensiveCredits} comprehensive credits</span>
                                </div>
                            )}

                            {(userTier === "basic" || userTier === "free") && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard/settings?tab=subscription">Upgrade</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Free Tier Warnings */}
                    {!isPaidUser && !statusLoading && (
                        <>
                            {initialRemaining === 1 && (
                                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-500 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Last free optimization this week!</span>
                                </div>
                            )}
                            {remaining === 0 && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Weekly free limit reached.</span>
                                    </div>
                                    <Link href="/dashboard/settings?tab=subscription" className="underline hover:text-red-300 font-medium">Upgrade to Pro</Link>
                                </div>
                            )}
                        </>
                    )}

                    {/* Form Container with Position Relative for Overlays */}
                    <div className="relative">
                        {/* Error State */}
                        {error && !result && (
                            <Card className="border-destructive bg-destructive/5">
                                <CardContent className="py-6">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-destructive">Optimization Stopped</p>
                                            <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                            {!error.includes("limit reached") && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4"
                                                    onClick={handleStartNew}
                                                >
                                                    Try Again
                                                </Button>
                                            )}
                                            {error.includes("limit reached") && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="mt-4 bg-[#09B7B4] text-black hover:bg-[#09B7B4]/90"
                                                    asChild
                                                >
                                                    <Link href="/dashboard/settings?tab=subscription">View Plans</Link>
                                                </Button>
                                            )}
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
                                        techniques_applied={result.techniques_applied}
                                        validation={result.validation}
                                        onRefine={handleRefine}
                                        isRefining={isRefining}
                                        isPaidUser={isPaidUser}
                                        remaining={remaining}
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
                                        canOptimize={isPaidUser || canOptimize} // Pass free tier status: block form if !canOptimize? Or allow submit to show error?
                                        // User flow: If remaining=0, form should probably be disabled OR handling submit shows error.
                                        // Assuming OptimizeForm takes `canOptimize` to disable button.
                                        // But wait, existing code passed `canOptimize={true}` before.
                                        // I'll update it to respect logic, ensuring consistency.
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

                        {/* LOADING OVERLAY - checking usage status */}
                        {!statusChecked && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                                    <p className="text-gray-300">Checking usage...</p>
                                </div>
                            </div>
                        )}


                        {(() => { console.log('[BLOCKER EVAL] remaining:', remaining, 'isViewingResult:', isViewingResult, 'optimizationInProgress:', optimizationInProgress); return null; })()}

                        {/* BLOCKER OVERLAY - limit reached (only show when no result displayed) */}
                        {!isPaidUser && remaining !== undefined && remaining === 0 && !isViewingResult && !optimizationInProgress && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg">
                                <div className="text-center p-8">
                                    <div className="text-red-500 text-xl font-bold mb-4">Weekly Limit Reached</div>
                                    <p className="text-gray-300 mb-2">You've used all 3 free optimizations this week.</p>
                                    <p className="text-gray-400 mb-6">Resets on Monday</p>
                                    <Link href="/dashboard/settings?tab=subscription">
                                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                                            Upgrade for Unlimited
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>{/* Close position relative wrapper */}
                </div>
            )}
        </>
    );
}
