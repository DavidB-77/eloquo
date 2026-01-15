import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210');

/**
 * POST /api/auth/send-password-reset
 * Generates reset token in Convex and sends password reset email via Resend
 */
export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email required' },
                { status: 400 }
            );
        }

        // Import Convex API
        const { api } = await import('../../../../convex/_generated/api');

        // Create reset token in Convex
        const { token } = await convex.mutation(api.passwordReset.createResetToken, {
            email: email.toLowerCase(),
        });

        // Create reset URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        // Send email via Convex Resend
        await convex.mutation(api.email.sendPasswordResetEmail, {
            email,
            resetUrl,
        });

        console.log(`[Password Reset] Email sent to: ${email}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Password Reset] Error:', error);
        // Don't reveal errors to user for security
        return NextResponse.json({ success: true });
    }
}
