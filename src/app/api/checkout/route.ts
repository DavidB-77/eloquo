import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutUrl, PRODUCT_VARIANTS, PlanVariant } from '@/lib/lemon-squeezy';

/**
 * POST /api/checkout - Create a Lemon Squeezy checkout session
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
        const { plan, billing } = body; // plan: 'pro' | 'team' | 'enterprise', billing: 'monthly' | 'annual'

        if (!plan || !billing) {
            return NextResponse.json(
                { success: false, error: 'Plan and billing period required' },
                { status: 400 }
            );
        }

        // Get variant ID for selected plan
        const variantKey = `${plan}_${billing}` as PlanVariant;
        const variantId = PRODUCT_VARIANTS[variantKey];

        if (!variantId) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan or billing period' },
                { status: 400 }
            );
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        // Create checkout URL
        const checkoutUrl = await createCheckoutUrl({
            variantId,
            userId: user.id,
            userEmail: user.email || '',
            userName: profile?.full_name,
        });

        if (!checkoutUrl) {
            return NextResponse.json(
                { success: false, error: 'Failed to create checkout' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, checkoutUrl });

    } catch (error) {
        console.error('Checkout API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
