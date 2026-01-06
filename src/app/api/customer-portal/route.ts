import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomerPortalUrl } from '@/lib/polar';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's Polar customer ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('polar_customer_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.polar_customer_id) {
            return NextResponse.json(
                { success: false, error: 'No active subscription found' },
                { status: 404 }
            );
        }

        const portalUrl = await getCustomerPortalUrl(profile.polar_customer_id);

        if (!portalUrl) {
            return NextResponse.json(
                { success: false, error: 'Failed to get portal URL' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, portalUrl });

    } catch (error) {
        console.error('Customer portal error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
