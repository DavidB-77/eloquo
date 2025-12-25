import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomerPortalUrl } from '@/lib/lemon-squeezy';

/**
 * GET /api/customer-portal - Get Lemon Squeezy customer portal URL
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

        // Get user's Lemon Squeezy customer ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('lemon_squeezy_customer_id')
            .eq('id', user.id)
            .single();

        if (!profile?.lemon_squeezy_customer_id) {
            return NextResponse.json(
                { success: false, error: 'No active subscription' },
                { status: 404 }
            );
        }

        const portalUrl = await getCustomerPortalUrl(profile.lemon_squeezy_customer_id);

        if (!portalUrl) {
            return NextResponse.json(
                { success: false, error: 'Failed to get portal URL' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: { portalUrl } });

    } catch (error) {
        console.error('Customer portal API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
