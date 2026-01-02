import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('pending_signups')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('account_created', false)
            .single();

        if (error || !data) {
            return NextResponse.json({ success: false, pending: null });
        }

        return NextResponse.json({ success: true, pending: data });

    } catch (error) {
        console.error('Check pending signup error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
