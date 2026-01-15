import { NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { callAnalyze } from '@/lib/n8n';

/**
 * Analyze endpoint - FREE, no credits used
 * Analyzes prompt complexity and provides recommendations
 */
export async function POST(request: Request) {
    try {
        // 1. Get user from session (still require auth, just no credit cost)
        // const supabase = await createClient();
        // const { data: { user }, error: authError } = await supabase.auth.getUser();

        /*
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        */
        const user = { id: 'mock-user' };

        // 2. Parse request body
        const body = await request.json();
        const { prompt } = body;

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // 3. Call n8n analyze webhook (no usage tracking needed)
        const result = await callAnalyze(prompt);

        // 4. Return result
        return NextResponse.json(result);

    } catch (error) {
        console.error('Analyze API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
