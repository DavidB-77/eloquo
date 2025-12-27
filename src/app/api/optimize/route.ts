import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callOptimize, type OptimizeRequest } from '@/lib/n8n';
import { checkUsageLimits, incrementUsage, saveToHistory, getUserUsage } from '@/lib/usage';

export async function POST(request: Request) {
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

        // 3. Parse request body with all new fields
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

        // 4. Get user profile for tier and comprehensive credits
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, comprehensive_credits_remaining')
            .eq('id', user.id)
            .single();

        const userTier = (profile?.subscription_tier as 'free' | 'pro' | 'team' | 'enterprise') || 'free';
        const comprehensiveCreditsRemaining = profile?.comprehensive_credits_remaining ?? 3;

        // 5. Build complete n8n request
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

        // 6. Call n8n webhook
        const result = await callOptimize(n8nRequest);

        // 7. Handle different response types

        // If n8n needs clarification, return as-is (no usage tracking yet)
        if ('status' in result && result.status === 'needs_clarification') {
            return NextResponse.json(result);
        }

        // If upgrade required, return as-is (no usage tracking yet)
        if ('status' in result && result.status === 'upgrade_required') {
            return NextResponse.json(result);
        }

        // If successful, track usage and save to history
        if ('success' in result && result.success && 'results' in result) {
            const creditsUsed = result.usage?.creditsUsed || 1;
            await incrementUsage(user.id, creditsUsed, 0);

            // Update comprehensive credits if used
            if (result.metrics?.outputMode === 'comprehensive' && comprehensiveCreditsRemaining > 0) {
                await supabase
                    .from('profiles')
                    .update({ comprehensive_credits_remaining: comprehensiveCreditsRemaining - 1 })
                    .eq('id', user.id);
            }

            // Save to history
            await saveToHistory(
                user.id,
                prompt,
                result.results.full,
                targetModel,
                strength,
                false, // not orchestrated
                null,  // no segments
                result.improvements,
                result.metrics
            );
        }

        // 8. Return result
        return NextResponse.json(result);

    } catch (error) {
        console.error('Optimize API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
