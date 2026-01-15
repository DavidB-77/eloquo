import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210');

/**
 * POST /api/auth/send-confirmation
 * Sends confirmation email via Convex Resend component
 */
export async function POST(request: Request) {
    try {
        const { email, confirmUrl, name } = await request.json();

        if (!email || !confirmUrl) {
            return NextResponse.json(
                { success: false, error: 'Email and confirmUrl required' },
                { status: 400 }
            );
        }

        // Call Convex function to send email
        // Using dynamic import to avoid build-time issues
        const { api } = await import('../../../../../convex/_generated/api');

        await convex.mutation(api.email.sendConfirmationEmail, {
            email,
            confirmUrl,
            name,
        });

        console.log(`[Send Confirmation] Email queued for: ${email}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Send Confirmation] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}
