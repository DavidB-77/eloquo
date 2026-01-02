import { NextResponse } from 'next/server';
import { createCheckoutUrl, PRODUCT_VARIANTS, PlanVariant } from '@/lib/lemon-squeezy';

/**
 * POST /api/checkout/guest - Create checkout for new signups (no auth required)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, plan, billing } = body;

        if (!email || !plan || !billing) {
            return NextResponse.json(
                { success: false, error: 'Email, plan, and billing period required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
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

        // Create checkout URL with signup intent in custom data
        const checkoutUrl = await createCheckoutUrl({
            variantId,
            userId: 'pending_signup',
            userEmail: email,
            customData: {
                signup_intent: true,
                email: email,
                plan: plan,
                billing: billing,
            },
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup/success`,
        });

        if (!checkoutUrl) {
            return NextResponse.json(
                { success: false, error: 'Failed to create checkout' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, checkoutUrl });

    } catch (error) {
        console.error('Guest checkout error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
