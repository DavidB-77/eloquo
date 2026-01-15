import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { getToken } from "@/lib/auth-server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
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

        // Get profile data for customer ID
        const profile = await convex.query(api.profiles.getProfileByEmail, {
            email: user.email || ''
        });

        if (!profile?.dodo_customer_id) {
            return NextResponse.json(
                { success: false, error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Dodo doesn't have a simple "create session" for portal in the SDK yet,
        // but users can manage via the dashboard or we can provide a link to the Dodo portal.
        // For now, we'll return a success with a placeholder or the Dodo dashboard link.
        const portalUrl = `https://app.dodopayments.com/customer/portal`;

        return NextResponse.json({ success: true, portalUrl });

    } catch (error) {
        console.error('Customer portal error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
