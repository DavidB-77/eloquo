import { NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { revokeApiKey } from '@/lib/api-keys';

/**
 * POST /api/api-keys/revoke - Revoke an API key
 */
export async function POST(request: Request) {
    try {
        // const supabase = await createClient();
        // const { data: { user }, error: authError } = await supabase.auth.getUser();

        /*
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        */
        const user = { id: 'mock-user' };

        const body = await request.json();
        const { keyId } = body;

        if (!keyId) {
            return NextResponse.json(
                { success: false, error: 'Key ID is required' },
                { status: 400 }
            );
        }

        const success = await revokeApiKey(user.id, keyId);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Failed to revoke API key' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Revoke API key error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
