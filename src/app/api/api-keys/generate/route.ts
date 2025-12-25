import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createApiKey } from '@/lib/api-keys';

/**
 * POST /api/api-keys/generate - Generate a new API key
 * Returns the full key once (never stored)
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { success: false, error: 'Key name is required' },
                { status: 400 }
            );
        }

        const result = await createApiKey(user.id, name.trim());

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Failed to create API key. You may need to upgrade to Pro.' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: result.id,
                key: result.key, // Full key - only shown once!
            },
        });

    } catch (error) {
        console.error('Generate API key error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
