import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callOptimize, type OptimizeRequest } from '@/lib/n8n';
import { checkUsageLimits, incrementUsage, saveToHistory, getUserUsage } from '@/lib/usage';
import { calculateTokenSavings, countTokens } from '@/lib/tokenizer';

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

export async function POST(request: Request) {
    const startTime = Date.now();
    try {
        // 1. Get user from session
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Check usage limits
        const { canOptimize, usage } = await checkUsageLimits(user.id);

        if (!canOptimize) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Monthly optimization limit reached',
                    usage
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
        } = body;

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // 4. Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, comprehensive_credits_remaining')
            .eq('id', user.id)
            .single();

        const userTier = (profile?.subscription_tier as 'free' | 'pro' | 'team' | 'enterprise') || 'free';
        const comprehensiveCreditsRemaining = profile?.comprehensive_credits_remaining ?? 3;

        // 5. Call n8n
        const n8nRequest: OptimizeRequest = {
            prompt,
            targetModel,
            strength,
            additionalContext: context,
            userId: user.id,
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

        const result = await callOptimize(n8nRequest);

        // 7. Handle special statuses
        if ('status' in result && (result.status === 'needs_clarification' || result.status === 'upgrade_required')) {
            return NextResponse.json(result);
        }

        // 8. Track usage and save with analytics if successful
        if ('success' in result && result.success && 'results' in result) {
            await incrementUsage(user.id, 1, 0);

            if (result.metrics?.outputMode === 'comprehensive' && comprehensiveCreditsRemaining > 0) {
                await supabase
                    .from('profiles')
                    .update({ comprehensive_credits_remaining: comprehensiveCreditsRemaining - 1 })
                    .eq('id', user.id);
            }

            // Calculate analytics
            const originalPrompt = prompt;
            const optimizedPrompt = result.results.full;
            const tokenData = calculateTokenSavings(prompt, optimizedPrompt || '', targetModel);

            const processingTime = Date.now() - startTime;
            const inputTokens = result.metrics?.originalTokens || tokenData.original || 0;
            const outputTokens = result.metrics?.optimizedTokens || tokenData.optimized || 0;
            const model = result.analytics?.generationModel || result.generationModel || 'deepseek/deepseek-chat';
            const apiCost = calculateCost(inputTokens, outputTokens, model);

            // Save to database using insert to include new analytics columns
            try {
                const { error: saveError } = await supabase
                    .from('optimizations')
                    .insert({
                        user_id: user.id,
                        original_prompt: prompt,
                        optimized_prompt: optimizedPrompt,
                        target_model: targetModel,
                        strength: strength,
                        tokens_original: tokenData.original,
                        tokens_optimized: tokenData.optimized,
                        tokens_saved: tokenData.saved,
                        improvements: result.improvements || [],
                        metrics: { ...result.metrics, qualityScore: result.validation?.score || 0 },
                        quick_reference: result.results.quickRef || null,
                        snippet: result.results.snippet || null,
                        was_orchestrated: false,
                        // New Analytics columns
                        api_tokens_input: inputTokens,
                        api_tokens_output: outputTokens,
                        api_tokens_total: inputTokens + outputTokens,
                        api_cost_usd: apiCost,
                        processing_time_ms: processingTime,
                        had_file_upload: contextFiles && contextFiles.length > 0,
                        file_count: contextFiles?.length || 0,
                        user_tier: userTier,
                        generation_model: model,
                    });

                if (saveError) console.error('Failed to save optimization:', saveError);
            } catch (saveError) {
                console.error('Error saving optimization:', saveError);
            }

            // Ensure frontend gets calculated metrics
            if (!result.metrics) result.metrics = {};
            result.metrics.originalTokens = tokenData.original;
            result.metrics.optimizedTokens = tokenData.optimized;
            result.metrics.tokensSaved = tokenData.saved;
            result.metrics.processingTimeMs = processingTime;
            result.metrics.estimatedCost = apiCost;
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
