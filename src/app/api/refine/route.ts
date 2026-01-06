import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callRefine } from '@/lib/n8n';

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

        // 2. Get request body
        const body = await request.json();
        const { originalPrompt, instruction, userTier } = body;

        if (!originalPrompt || !instruction) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 3. Call refine endpoint
        const response = await callRefine({
            originalPrompt,
            instruction,
            userTier: userTier || 'basic',
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('Refine API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
