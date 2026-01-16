import { NextResponse } from 'next/server';
import { callOptimize, type OptimizeRequest, type OptimizeSuccessResponse } from '@/lib/n8n';
import { calculateTokenSavings, countTokens } from '@/lib/tokenizer';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { headers } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Cost per million tokens by model
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
    'deepseek/deepseek-chat': { input: 0.28, output: 0.42 },
    'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
    'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
    'google/gemini-2.5-flash-preview': { input: 0.075, output: 0.30 },
};

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const costs = MODEL_COSTS[model] || MODEL_COSTS['deepseek/deepseek-chat'];
    return (inputTokens / 1_000_000) * costs.input + (outputTokens / 1_000_000) * costs.output;
}

// Extended type to handle optional analytics fields not present in base n8n type
interface ExtendedOptimizeResult extends OptimizeSuccessResponse {
    analytics?: {
        generationModel?: string;
    };
    generationModel?: string;
}

export async function POST(request: Request) {
    const startTime = Date.now();
    try {
        // 1. Get user from Better Auth session
        let token: string | null = null;
        try {
            token = await getToken();
        } catch (tokenError) {
            console.error('Optimize API: getToken error:', tokenError);
            // Log full error details
            if (tokenError instanceof Error) {
                console.error('Token error message:', tokenError.message);
                console.error('Token error cause:', (tokenError as any).cause);
            }
            return NextResponse.json(
                { success: false, error: 'Authentication service unavailable' },
                { status: 503 }
            );
        }

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Set token for Convex client
        convex.setAuth(token);

        // Get user profile to get the email/userId correctly if needed
        const session = await convex.query(api.auth.getUserById, {});
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = session;

        // 2a. Fetch System Settings overrides from Convex
        const generalSettings: any = await convex.query(api.settings.getSettings, { key: 'general_settings' }) || {};
        const isTestMode = generalSettings.test_mode_enabled === true;
        const basicLimit = typeof generalSettings.basic_plan_monthly_limit === 'number' ? generalSettings.basic_plan_monthly_limit : 150;

        // 2b. Re-Check usage limits from Convex
        const usageData: any = await convex.query(api.profiles.getUsage, {});
        if (!usageData) {
            return NextResponse.json(
                { success: false, error: 'User profile not found' },
                { status: 404 }
            );
        }

        const userTier = usageData.tier;
        const comprehensiveCreditsRemaining = usageData.comprehensiveCreditsRemaining ?? 3;

        // Check if user can optimize
        if (!usageData.canOptimize) {
            return NextResponse.json(
                {
                    success: false,
                    error: userTier === 'free' ? 'Weekly limit reached. Please upgrade to continue.' : 'Optimization limit reached. Please upgrade to continue.',
                    usage: usageData
                },
                { status: 429 }
            );
        }

        // 3. Parse request body
        const body = await request.json();
        const {
            prompt,
            targetModel = 'universal',
            strength = 'medium',
            context = '',
            contextFiles = [],
            contextAnswers = null,
            forceStandard = false,
            isFollowUpSubmission = false,
            isProjectProtocol = false,
        } = body;

        // 3a. Validate Project Protocol - Paid users only
        if (isProjectProtocol && userTier === 'free') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Project Protocol requires a Pro subscription. Please upgrade to access this feature.'
                },
                { status: 403 }
            );
        }

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        let result: ExtendedOptimizeResult | { status: string } | { success: false; error: string };

        // 5. Call n8n OR Mock if Test Mode
        if (isTestMode) {
            console.log("TEST MODE ACTIVE");
            await new Promise(resolve => setTimeout(resolve, 1500));

            result = {
                success: true,
                results: {
                    full: `[TEST MODE] Optimized: ${prompt}`,
                    quickRef: "[TEST MODE] Quick lookup info...",
                    snippet: "Test Mode Snippet",
                },
                metrics: {
                    originalTokens: countTokens(prompt),
                    optimizedTokens: countTokens(prompt) + 50,
                    outputMode: 'standard',
                    processingTimeMs: 1500,
                    creditsUsed: 0,
                    tokensSaved: -50,
                },
                improvements: ["Test Mode: No API calls made"],
                classification: { complexity: 'simple', domain: 'test' },
                usage: { creditsUsed: 0, comprehensiveRemaining: comprehensiveCreditsRemaining },
                generationModel: "test-mode-mock"
            } as ExtendedOptimizeResult;
        } else {
            const n8nRequest: OptimizeRequest = {
                prompt,
                targetModel,
                strength,
                additionalContext: context,
                userId: user.id || undefined,
                userTier,
                contextFiles: contextFiles.map((f: { name: string; mimeType: string; base64: string }) => ({
                    name: f.name,
                    mimeType: f.mimeType,
                    base64: f.base64,
                })),
                contextAnswers,
                comprehensiveCreditsRemaining,
                forceStandard,
            };

            result = await callOptimize(n8nRequest) as ExtendedOptimizeResult | any;
        }

        // 7. Handle special statuses
        if ('status' in result && (result.status === 'needs_clarification' || result.status === 'upgrade_required')) {
            return NextResponse.json(result);
        }

        // 8. Track usage and save with analytics if successful
        if ('success' in result && result.success && 'results' in result) {
            const successResult = result as ExtendedOptimizeResult;
            const optimizedPrompt = successResult.results.full;
            const tokenData = calculateTokenSavings(prompt, optimizedPrompt || '', targetModel);
            const processingTime = Date.now() - startTime;
            const inputTokens = successResult.metrics?.originalTokens || tokenData.original || 0;
            const outputTokens = successResult.metrics?.optimizedTokens || tokenData.optimized || 0;
            const model = successResult.analytics?.generationModel || successResult.generationModel || 'deepseek/deepseek-chat';
            const apiCost = calculateCost(inputTokens, outputTokens, model);

            // Call Convex mutation to save optimization and update usage
            // The mutation handles credit deduction and logging
            await convex.mutation(api.optimizations.createOptimization, {
                originalPrompt: prompt,
                optimizedPrompt: optimizedPrompt || '',
                targetModel: targetModel,
                optimizationType: (successResult.metrics?.outputMode as "standard" | "comprehensive") || "standard",
                strength: strength,
                context: context || undefined,

                tokensOriginal: inputTokens,
                tokensOptimized: outputTokens,
                improvements: successResult.improvements || [],
                metrics: {
                    qualityScore: successResult.validation?.score || 0,
                    total_tokens: inputTokens + outputTokens,
                    processing_time_sec: processingTime / 1000,
                    api_cost_usd: apiCost,
                },
                wasOrchestrated: false,
                outputMode: successResult.metrics?.outputMode,
                creditsUsed: successResult.metrics?.creditsUsed || 1,
            });

            // Ensure frontend gets calculated metrics
            if (!successResult.metrics) {
                // @ts-ignore
                successResult.metrics = {};
            }

            const metrics = successResult.metrics as any;
            metrics.originalTokens = inputTokens;
            metrics.optimizedTokens = outputTokens;
            metrics.tokensSaved = inputTokens - outputTokens;
            metrics.processingTimeMs = processingTime;
            metrics.estimatedCost = apiCost;
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Optimize API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
