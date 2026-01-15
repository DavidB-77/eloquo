import { NextResponse } from 'next/server';
import { createCheckoutUrl, PRODUCT_IDS, PlanType } from '@/lib/dodopayments';

/**
 * POST /api/checkout/guest - Create checkout for new signups (no auth required)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, plan } = body;

        if (!email || !plan) {
            return NextResponse.json(
                { success: false, error: 'Email and plan required' },
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

        // Get product ID
        const productId = PRODUCT_IDS[plan as PlanType];
        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Create checkout URL with signup intent in custom data
        const checkoutUrl = await createCheckoutUrl({
            productId,
            userId: 'pending_signup',
            userEmail: email,
            customData: {
                signup_intent: 'true',
                email: email,
                plan: plan,
            },
            redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/signup/success`,
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
