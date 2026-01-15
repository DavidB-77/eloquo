// ============================================
// FILE: src/app/api/admin/analytics/route.ts
// Admin Analytics API Endpoint
// ============================================

// import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // const supabase = await createClient();

        // Get authenticated user
        // const { data: { user }, error: authError } = await supabase.auth.getUser();

        /*
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        */

        // Get query params
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'dashboard';
        const days = parseInt(searchParams.get('days') || '30');
        const limit = parseInt(searchParams.get('limit') || '20');

        let data;

        // switch (type) {
        //     case 'dashboard':
        //         /*
        //         const { data: dashboardStats, error: dashboardError } = await supabase
        //             .rpc('get_admin_dashboard_stats');
        //         if (dashboardError) throw dashboardError;
        //         data = dashboardStats;
        //         */
        //         data = { total_users: 100, active_users: 50, total_revenue: 1000 };
        //         break;

        //     case 'daily':
        //         /*
        //         const { data: dailyStats, error: dailyError } = await supabase
        //             .rpc('get_daily_analytics', { days_back: days });
        //         if (dailyError) throw dailyError;
        //         data = dailyStats;
        //         */
        //         data = [];
        //         break;

        //     case 'users':
        //         /*
        //         const { data: userStats, error: userError } = await supabase
        //             .rpc('get_top_users', { limit_count: limit });
        //         if (userError) throw userError;
        //         data = userStats;
        //         */
        //         data = [];
        //         break;

        //     case 'models':
        //         data = [];
        //         break;

        //     case 'balance':
        //         data = { balance: 0 };
        //         break;

        //     case 'financial':
        //         data = {
        //             totals: {},
        //             standard: {},
        //             bmad: {}
        //         };
        //         break;

        //     case 'bmad':
        //         data = {
        //             total_generations: 0,
        //             total_tokens: 0,
        //             total_credits: 0,
        //             total_api_cost: 0,
        //             avg_cost_per_generation: 0,
        //             avg_processing_ms: 0,
        //             total_revenue: 0,
        //             total_profit: 0
        //         };
        //         break;

        //     case 'models_cost':
        //         data = [];
        //         break;

        //     case 'daily_financial':
        //         data = [];
        //         break;

        //     default:
        //         return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        // }
        data = {};

        return NextResponse.json({ data, success: true });

    } catch (error) {
        console.error('Admin analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // const supabase = await createClient();

        // const { data: { user }, error: authError } = await supabase.auth.getUser();

        /*
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { action, balance } = body;

        if (action === 'update_balance' && typeof balance === 'number') {
            const { error } = await supabase
                .rpc('update_openrouter_balance', { new_balance: balance });

            if (error) throw error;

            return NextResponse.json({ success: true, message: 'Balance updated' });
        }
        */

        return NextResponse.json({ success: true, message: 'Balance updated (MOCKED)' });

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Admin analytics POST error:', error);
        return NextResponse.json(
            { error: 'Failed to update', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
