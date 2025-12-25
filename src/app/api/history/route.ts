import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAGE_SIZE = 20;

/**
 * GET /api/history - Get user's optimization history
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search') || '';

        // Get total count for pagination
        let countQuery = supabase
            .from('optimizations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (search) {
            countQuery = countQuery.ilike('original_prompt', `%${search}%`);
        }

        const { count } = await countQuery;
        const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

        // Get paginated results
        let dataQuery = supabase
            .from('optimizations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        if (search) {
            dataQuery = dataQuery.ilike('original_prompt', `%${search}%`);
        }

        const { data: optimizations, error } = await dataQuery;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                optimizations: optimizations || [],
                currentPage: page,
                totalPages,
                totalCount: count || 0,
            },
        });

    } catch (error) {
        console.error('History API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
