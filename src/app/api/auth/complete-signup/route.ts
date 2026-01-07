import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        console.log(`[Complete Signup] Processing for email: ${email}`);

        if (!email) {
            console.error('[Complete Signup] Email required');
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        // Get pending signup
        const { data: pending, error: pendingError } = await supabaseAdmin
            .from('pending_signups')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (pendingError || !pending) {
            console.error('[Complete Signup] Pending signup not found for:', email);
            return NextResponse.json({ success: false, error: 'Pending signup not found' }, { status: 404 });
        }

        console.log(`[Complete Signup] Found pending signup. Tier: ${pending.subscription_tier}`);

        // Find the user directly by email
        // listUsers() is unreliable because it's paginated
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        // Since listUsers doesn't support filter by email directly in current version exposed, 
        // we should try to get the user ID if we can, or iterate if we must? 
        // Actually, supabase-js admin has generic methods. 
        // Let's use listUsers() but properly. Wait, listUsers doesn't filter.
        // Better: We can rely on the fact that we just signed them up.
        // But we don't have the ID here.
        // Wait, supabaseAdmin.rpc might be better if we needed to, but we can iterate/filter if the list is small?
        // NO. The user base might be large.
        // Using `supabaseAdmin.from('auth.users').select` isn't allowed directly via client usually.

        // Actually, we can use `supabaseAdmin.auth.admin.getUserByEmail(email)` check docs?
        // It seems `listUsers` is the main way. But wait.
        // We can just query the `profiles` table!
        // The trigger on signup (if exists) creates the profile. 
        // If checking `auth.users` is hard, we can check `public.profiles`.

        const { data: profile_check, error: profileCheckError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (!profile_check) {
            console.error('[Complete Signup] Profile not found for:', email);
            // User might be unconfirmed or trigger failed?
        }

        // Let's try to get the user ID from the profile lookup, which is indexed.
        const userId = profile_check?.id;

        if (userId) {
            console.log(`[Complete Signup] Updating profile for user: ${userId}`);

            // Update profile with subscription info
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_tier: pending.subscription_tier || 'free',
                    subscription_status: 'active',
                    polar_customer_id: pending.polar_customer_id,
                    is_founding_member: pending.is_founding_member,
                    founding_wave: pending.founding_wave,
                })
                .eq('id', userId);

            if (profileError) {
                console.error('[Complete Signup] Failed to update profile:', profileError);
                return NextResponse.json({ success: false, error: 'Database error saving user profile' }, { status: 500 });
            }
        } else {
            console.error('[Complete Signup] User profile not found, cannot update subscription');
            return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
        }

        // Mark as complete
        await supabaseAdmin
            .from('pending_signups')
            .update({ account_created: true })
            .eq('email', email.toLowerCase());

        console.log('[Complete Signup] Successfully completed signup process');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Complete Signup] Unexpected error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}
