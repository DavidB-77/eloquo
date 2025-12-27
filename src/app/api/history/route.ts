import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAGE_SIZE = 20;

/**
 * GET /api/history - Get user's optimization history
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse query params
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Fetch history using RPC function
        const { data: history, error: historyError } = await supabase.rpc(
            'get_optimization_history',
            {
                p_user_id: user.id,
                p_limit: limit,
                p_offset: offset,
            }
        );

        if (historyError) {
            console.error('History fetch error:', historyError);
            return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
        }

        // Get user dashboard stats
        const { data: stats, error: statsError } = await supabase.rpc(
            'get_user_dashboard_stats',
            { p_user_id: user.id }
        );

        if (statsError) {
            console.error('Stats fetch error:', statsError);
        }

        return NextResponse.json({
            success: true,
            history: history || [],
            stats: stats?.[0] || stats || {
                total_optimizations: 0,
                total_tokens_saved: 0,
                avg_savings_percent: 0,
            },
            pagination: {
                limit,
                offset,
                hasMore: (history?.length || 0) === limit,
            },
        });
    } catch (error) {
        console.error('History API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
