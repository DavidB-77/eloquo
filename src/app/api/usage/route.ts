import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserUsage } from '@/lib/usage';

/**
 * Usage endpoint - returns current user's usage statistics
 */
export async function GET(request: Request) {
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

        // 2. Get usage stats
        const usage = await getUserUsage(user.id);

        // 3. Return usage
        return NextResponse.json({ success: true, data: usage });

    } catch (error) {
        console.error('Usage API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
