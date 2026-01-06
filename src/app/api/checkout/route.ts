import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutUrl, PRODUCT_IDS, DISCOUNT_IDS, PlanType } from '@/lib/polar';

/**
 * POST /api/checkout - Create a Polar checkout session (existing users)
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
        const { plan } = body; // plan: 'basic' | 'pro' | 'business'

        if (!plan || !PRODUCT_IDS[plan as PlanType]) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();

        // Get discount code if applicable
        const discountCode = DISCOUNT_IDS[plan as keyof typeof DISCOUNT_IDS];

        // Create checkout URL
        const checkoutUrl = await createCheckoutUrl({
            productId: PRODUCT_IDS[plan as PlanType],
            userId: user.id,
            userEmail: profile?.email || user.email || '',
            userName: profile?.full_name,
            discountCode,
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
