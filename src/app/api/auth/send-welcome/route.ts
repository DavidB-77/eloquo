import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210');

/**
 * POST /api/auth/send-welcome
 * Sends welcome email after successful signup via Convex Resend
 */
export async function POST(request: Request) {
    try {
        const { email, name, tier } = await request.json();

        if (!email || !tier) {
            return NextResponse.json(
                { success: false, error: 'Email and tier required' },
                { status: 400 }
            );
        }

        // Send welcome email via Convex Resend
        const { api } = await import('../../../../../convex/_generated/api');
        await convex.mutation(api.email.sendWelcomeEmail, {
            email,
            name,
            tier,
        });

        console.log(`[Welcome Email] Sent to: ${email} (${tier})`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Welcome Email] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}
