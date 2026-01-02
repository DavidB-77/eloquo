import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        // Get pending signup
        const { data: pending, error: pendingError } = await supabaseAdmin
            .from('pending_signups')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (pendingError || !pending) {
            return NextResponse.json({ success: false, error: 'Pending signup not found' }, { status: 404 });
        }

        // Mark as complete
        await supabaseAdmin
            .from('pending_signups')
            .update({ account_created: true })
            .eq('email', email.toLowerCase());

        // Find the user and update their profile
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (user) {
            // Update profile with subscription info
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_tier: pending.subscription_tier,
                    subscription_status: 'active',
                    lemon_squeezy_customer_id: pending.lemon_squeezy_customer_id,
                    is_founding_member: pending.is_founding_member,
                    founding_wave: pending.founding_wave,
                })
                .eq('id', user.id);

            if (profileError) {
                console.error('Failed to update profile:', profileError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Complete signup error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
