import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callOptimize } from '@/lib/n8n';
import { checkUsageLimits, incrementUsage, saveToHistory } from '@/lib/usage';

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

        // 3. Parse request body
        const body = await request.json();
        const { prompt, targetModel, strength, context } = body;

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // 4. Call n8n webhook
        const result = await callOptimize({
            prompt,
            targetModel: targetModel || 'universal',
            strength: strength || 'medium',
            context,
        });

        // 5. If successful, track usage and save to history
        if (result.success && result.data) {
            await incrementUsage(user.id, 1, 0);
            await saveToHistory(
                user.id,
                prompt,
                result.data.optimizedPrompt,
                targetModel || 'universal',
                strength || 'medium',
                false, // not orchestrated
                null,  // no segments
                result.data.improvements,
                result.data.metrics
            );
        }

        // 6. Return result
        return NextResponse.json(result);

    } catch (error) {
        console.error('Optimize API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
