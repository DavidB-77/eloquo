// ============================================
// FILE: src/app/api/optimize/route.ts
// Updated Optimize API with Cost Tracking
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Cost per million tokens by model (update as needed)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
    'google/gemini-2.5-flash-preview': { input: 0.075, output: 0.30 },
    'google/gemini-flash-1.5': { input: 0.075, output: 0.30 },
    'deepseek/deepseek-chat': { input: 0.28, output: 0.42 },
    'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
    'anthropic/claude-3-sonnet': { input: 3.0, output: 15.0 },
    'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
};

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const costs = MODEL_COSTS[model] || MODEL_COSTS['deepseek/deepseek-chat'];
    const inputCost = (inputTokens / 1_000_000) * costs.input;
    const outputCost = (outputTokens / 1_000_000) * costs.output;
    return inputCost + outputCost;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, optimizations_used, optimizations_limit')
            .eq('id', user.id)
            .single();

        const userTier = profile?.subscription_tier || 'free';

        const body = await request.json();
        const {
            prompt,
            targetModel = 'universal',
            strength = 'medium',
            context = '',
            contextFiles = [],
            outputMode = 'standard'
        } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const hadFileUpload = contextFiles && contextFiles.length > 0;
        const fileCount = contextFiles?.length || 0;

        // Call n8n workflow
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            throw new Error('N8N_WEBHOOK_URL not configured');
        }

        const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt, targetModel, strength, context, contextFiles, outputMode, userTier, userId: user.id,
            }),
        });

        if (!n8nResponse.ok) {
            throw new Error(`n8n workflow failed: ${n8nResponse.statusText}`);
        }

        const result = await n8nResponse.json();
        const processingTime = Date.now() - startTime;

        // Extract analytics from n8n response
        const analytics = {
            api_tokens_input: result.analytics?.totalInputTokens || result.totalInputTokens || 0,
            api_tokens_output: result.analytics?.totalOutputTokens || result.totalOutputTokens || 0,
            stages_used: result.analytics?.stagesUsed || result.stagesUsed || ['classify', 'generate'],
            generation_model: result.analytics?.generationModel || result.generationModel || 'deepseek/deepseek-chat',
            validation_score: result.analytics?.validationScore || result.validationScore || null,
            complexity: result.analytics?.complexity || result.complexity || 'simple',
            domain: result.analytics?.domain || result.domain || 'general',
        };

        const apiCost = calculateCost(
            analytics.api_tokens_input,
            analytics.api_tokens_output,
            analytics.generation_model
        );

        // Save to database with analytics - using direct insert since RPC may not exist
        const { data: savedOptimization, error: saveError } = await supabase
            .from('optimizations')
            .insert({
                user_id: user.id,
                original_prompt: prompt,
                optimized_prompt: result.optimizedPrompt || result.optimized_prompt,
                target_model: targetModel,
                strength: strength,
                tokens_original: result.tokensOriginal || result.tokens_original || Math.ceil(prompt.length / 4),
                tokens_optimized: result.tokensOptimized || result.tokens_optimized || 0,
                quick_reference: result.quickReference || result.quick_reference || null,
                snippet: result.snippet || null,
                improvements: result.improvements || [],
                metrics: result.metrics || {},
                was_orchestrated: result.wasOrchestrated || false,
                // Analytics fields
                api_tokens_input: analytics.api_tokens_input,
                api_tokens_output: analytics.api_tokens_output,
                api_tokens_total: analytics.api_tokens_input + analytics.api_tokens_output,
                api_cost_usd: apiCost,
                processing_time_ms: processingTime,
                had_file_upload: hadFileUpload,
                file_count: fileCount,
                generation_model: analytics.generation_model,
                user_tier: userTier,
                complexity: analytics.complexity,
            })
            .select('id')
            .single();

        if (saveError) {
            console.error('Failed to save optimization:', saveError);
        }

        // Update user's optimization count
        await supabase
            .from('profiles')
            .update({
                optimizations_used: (profile?.optimizations_used || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        return NextResponse.json({
            success: true,
            data: {
                id: savedOptimization?.id,
                optimizedPrompt: result.optimizedPrompt || result.optimized_prompt,
                quickReference: result.quickReference || result.quick_reference,
                snippet: result.snippet,
                improvements: result.improvements || [],
                metrics: result.metrics || {},
                tokensOriginal: result.tokensOriginal || result.tokens_original,
                tokensOptimized: result.tokensOptimized || result.tokens_optimized,
                analytics: {
                    processingTimeMs: processingTime,
                    apiTokensUsed: analytics.api_tokens_input + analytics.api_tokens_output,
                    estimatedCost: apiCost,
                    model: analytics.generation_model,
                    complexity: analytics.complexity,
                },
            },
        });

    } catch (error) {
        console.error('Optimize API error:', error);
        return NextResponse.json(
            { error: 'Optimization failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
