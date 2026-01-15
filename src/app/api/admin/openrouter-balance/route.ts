// import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // const supabase = await createClient();

        // 1. Auth check
        /*
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
        */

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

        // OpenRouter returns usage (amount spent), NOT balance
        // We need to calculate: balance = deposited - usage
        const depositedAmount = parseFloat(process.env.OPENROUTER_DEPOSITED_AMOUNT || "20");
        const usage = openRouterData?.data?.usage || 0;
        const usageDaily = openRouterData?.data?.usage_daily || 0;
        const usageWeekly = openRouterData?.data?.usage_weekly || 0;
        const usageMonthly = openRouterData?.data?.usage_monthly || 0;

        // Calculate remaining balance
        const balance = Math.max(0, depositedAmount - usage);

        // 4. Update database (optional - for caching) - MOCKED
        /*
        try {
            await supabase.rpc('update_openrouter_balance', {
                new_balance: balance
            });
        } catch (updateError) {
            console.warn('Could not update database balance:', updateError);
        }
        */

        return NextResponse.json({
            success: true,
            balance: parseFloat(balance.toFixed(2)),
            deposited: depositedAmount,
            usage: {
                total: parseFloat(usage.toFixed(4)),
                daily: parseFloat(usageDaily.toFixed(6)),
                weekly: parseFloat(usageWeekly.toFixed(4)),
                monthly: parseFloat(usageMonthly.toFixed(4)),
            },
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
