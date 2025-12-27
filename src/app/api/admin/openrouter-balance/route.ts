import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Admin check
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // 3. Fetch from OpenRouter API
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
        }

        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            return NextResponse.json({ error: 'Failed to fetch from OpenRouter', details: errorData }, { status: response.status });
        }

        const openRouterData = await response.json();
        const limitRemaining = openRouterData?.data?.limit_remaining;

        if (typeof limitRemaining !== 'number') {
            return NextResponse.json({ error: 'Unexpected response format from OpenRouter' }, { status: 500 });
        }

        // 4. Update database
        const { error: updateError } = await supabase.rpc('update_openrouter_balance', {
            new_balance: limitRemaining
        });

        if (updateError) {
            console.error('Failed to update database balance:', updateError);
            return NextResponse.json({ error: 'Failed to update database balance' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            balance: limitRemaining,
            updatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('OpenRouter balance sync error:', error);
        return NextResponse.json(
            { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
