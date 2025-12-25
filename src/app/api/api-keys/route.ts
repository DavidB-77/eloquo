import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listApiKeys } from '@/lib/api-keys';

/**
 * GET /api/api-keys - List user's API keys
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

        const keys = await listApiKeys(user.id);

        return NextResponse.json({ success: true, data: keys });

    } catch (error) {
        console.error('List API keys error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
