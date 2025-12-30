import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Admin check
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint') || 'summary';
        const period = searchParams.get('period') || 'today';

        let url = `${AGENT_URL}/admin/metrics`;

        if (endpoint === 'summary') {
            url += `/summary?period=${period}`;
        } else if (endpoint === 'recent') {
            const limit = searchParams.get('limit') || '20';
            url += `/recent?limit=${limit}`;
        } else if (endpoint === 'costs') {
            const days = searchParams.get('days') || '30';
            url += `/costs?days=${days}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Short timeout for agent
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            console.error('Agent metrics fetch failed:', response.status);
            return NextResponse.json(
                { error: 'Failed to fetch agent metrics', status: response.status },
                { status: 502 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Agent metrics proxy error:', error);

        // Return mock/fallback data if agent is not reachable
        return NextResponse.json({
            error: 'Agent not reachable',
            fallback: true,
            overview: {
                total_requests: 0,
                successful: 0,
                failed: 0,
                success_rate: 0
            },
            costs: {
                total: 0,
            },
            performance: {
                avg_processing_time_ms: 0,
                avg_quality_score: 0,
                total_tokens: 0
            }
        });
    }
}
