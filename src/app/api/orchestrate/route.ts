import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callOrchestrate } from '@/lib/n8n';
import { checkOrchestrationLimits, incrementUsage, saveToHistory } from '@/lib/usage';

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

        // 2. Parse request body
        const body = await request.json();
        const { prompt, targetModel, strength, context, maxSegments = 6 } = body;

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // 3. Call n8n webhook for orchestration
        const result = await callOrchestrate({
            prompt,
            targetModel: targetModel || 'universal',
            strength: strength || 'medium',
            context,
            orchestration: { enabled: true, maxSegments },
        });

        // 4. Check if we have enough premium credits for the segments
        if (result.success && result.data) {
            const segmentsCount = result.data.totalSegments;
            const premiumCreditsNeeded = result.data.premiumCreditsUsed;

            const { canOrchestrate, usage } = await checkOrchestrationLimits(user.id, segmentsCount);

            if (!canOrchestrate) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Not enough premium credits for this orchestration',
                        usage,
                        creditsNeeded: premiumCreditsNeeded
                    },
                    { status: 429 }
                );
            }

            // 5. Track usage: 1 optimization + premium credits for extra segments
            await incrementUsage(user.id, 1, premiumCreditsNeeded);

            // 6. Save to history
            await saveToHistory(
                user.id,
                prompt,
                result.data.summary, // Use summary as the "optimized" text for history
                targetModel || 'universal',
                strength || 'medium',
                true, // was orchestrated
                result.data.segments,
                null, // no single improvements array
                { segmentsCount, premiumCreditsUsed: premiumCreditsNeeded }
            );
        }

        // 7. Return result
        return NextResponse.json(result);

    } catch (error) {
        console.error('Orchestrate API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
