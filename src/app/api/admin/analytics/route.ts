// ============================================
// FILE: src/app/api/admin/analytics/route.ts
// Admin Analytics API Endpoint
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

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

        // Get query params
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'dashboard';
        const days = parseInt(searchParams.get('days') || '30');
        const limit = parseInt(searchParams.get('limit') || '20');

        let data;

        switch (type) {
            case 'dashboard':
                const { data: dashboardStats, error: dashboardError } = await supabase
                    .rpc('get_admin_dashboard_stats');
                if (dashboardError) throw dashboardError;
                data = dashboardStats;
                break;

            case 'daily':
                const { data: dailyStats, error: dailyError } = await supabase
                    .rpc('get_daily_analytics', { days_back: days });
                if (dailyError) throw dailyError;
                data = dailyStats;
                break;

            case 'users':
                const { data: userStats, error: userError } = await supabase
                    .rpc('get_top_users', { limit_count: limit });
                if (userError) throw userError;
                data = userStats;
                break;

            case 'models':
                const { data: modelStats, error: modelError } = await supabase
                    .rpc('get_model_usage_stats');
                if (modelError) throw modelError;
                data = modelStats;
                break;

            case 'balance':
                const { data: balanceData, error: balanceError } = await supabase
                    .rpc('get_openrouter_balance');
                if (balanceError) throw balanceError;
                data = balanceData;
                break;

            case 'financial':
                // Fetch from financial_summary view
                const { data: financialData, error: financialError } = await supabase
                    .from('financial_summary')
                    .select('*')
                    .single();

                // Also get standard and bmad summaries
                const { data: standardData } = await supabase
                    .from('standard_optimization_summary')
                    .select('*')
                    .single();

                const { data: bmadData } = await supabase
                    .from('bmad_summary')
                    .select('*')
                    .single();

                data = {
                    totals: financialData || {},
                    standard: standardData || {},
                    bmad: bmadData || {}
                };
                break;

            case 'bmad':
                // Fetch BMAD/Project Protocol summary
                const { data: bmadSummary, error: bmadError } = await supabase
                    .from('bmad_summary')
                    .select('*')
                    .single();
                if (bmadError && bmadError.code !== 'PGRST116') throw bmadError;
                data = bmadSummary || {
                    total_generations: 0,
                    total_tokens: 0,
                    total_credits: 0,
                    total_api_cost: 0,
                    avg_cost_per_generation: 0,
                    avg_processing_ms: 0,
                    total_revenue: 0,
                    total_profit: 0
                };
                break;

            case 'models_cost':
                // Fetch model cost comparison with percentages
                const { data: modelCostData, error: modelCostError } = await supabase
                    .from('model_cost_comparison')
                    .select('*')
                    .order('total_cost', { ascending: false });
                if (modelCostError) throw modelCostError;

                // Calculate cost percentages
                const totalCost = (modelCostData || []).reduce((sum: number, m: any) => sum + (m.total_cost || 0), 0);
                data = (modelCostData || []).map((m: any) => ({
                    ...m,
                    cost_pct: totalCost > 0 ? Math.round((m.total_cost / totalCost) * 1000) / 10 : 0
                }));
                break;

            case 'daily_financial':
                // Fetch daily financial breakdown
                const { data: dailyFinancial, error: dailyFinError } = await supabase
                    .from('daily_financial_breakdown')
                    .select('*')
                    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                    .order('date', { ascending: true });
                if (dailyFinError) throw dailyFinError;
                data = dailyFinancial || [];
                break;

            default:
                return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        }

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
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

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

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Admin analytics POST error:', error);
        return NextResponse.json(
            { error: 'Failed to update', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
