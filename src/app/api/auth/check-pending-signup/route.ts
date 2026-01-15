import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const data = await convex.query(api.pendingSignups.checkPendingSignup, {
            email: email.toLowerCase()
        });

        if (!data || data.account_created) {
            return NextResponse.json({ success: false, pending: null });
        }

        return NextResponse.json({ success: true, pending: data });

    } catch (error) {
        console.error('Check pending signup error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
