import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { createCheckoutUrl, PRODUCT_IDS, PlanType } from '@/lib/dodopayments';
import { getToken } from "@/lib/auth-server";
import { headers } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/checkout - Create a Dodo checkout session (existing users)
 */
export async function POST(request: Request) {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Set auth for Convex
        convex.setAuth(token);

        // Get user profile from Convex
        const user = await convex.query(api.auth.getCurrentUser);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { plan, billing, discountCode } = body; // plan: 'basic' | 'pro' | 'business'

        if (!plan || !PRODUCT_IDS[plan as PlanType]) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Create checkout URL
        const checkoutUrl = await createCheckoutUrl({
            productId: PRODUCT_IDS[plan as PlanType],
            userId: user.userId ?? '',
            userEmail: user.email || '',
            userName: user.name || undefined,
            discountCode: discountCode,
            customData: {
                user_id: user.userId,
                email: user.email || '',
            }
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
