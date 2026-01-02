import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    verifyWebhookSignature,
    getSubscriptionTierFromVariant
} from '@/lib/lemon-squeezy';

// Use admin client to create users (requires SUPABASE_SERVICE_ROLE_KEY)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/webhooks/lemonsqueezy
 * Handles subscription events from Lemon Squeezy
 */
export async function POST(request: Request) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('x-signature') || '';

        // Verify webhook signature
        const isValid = await verifyWebhookSignature(payload, signature);

        if (!isValid) {
            console.error('Invalid Lemon Squeezy webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event = JSON.parse(payload);
        const eventName = event.meta?.event_name;
        const customData = event.meta?.custom_data || {};

        console.log('Webhook received:', eventName, customData);

        switch (eventName) {
            case 'order_created':
            case 'subscription_created': {
                const variantId = String(event.data.attributes.variant_id);
                const tier = getSubscriptionTierFromVariant(variantId);
                const customerId = String(event.data.attributes.customer_id);
                const userEmail = event.data.attributes.user_email || customData.email;

                // Check if this is a new signup (payment-first flow)
                if (customData.signup_intent === true || customData.signup_intent === 'true') {
                    console.log('Processing new signup for:', userEmail);

                    // Check if user already exists
                    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
                    const existingUser = existingUsers?.users?.find(u => u.email === userEmail);

                    if (existingUser) {
                        // User exists, just update their profile
                        console.log('User already exists, updating profile:', existingUser.id);
                        await supabaseAdmin
                            .from('profiles')
                            .update({
                                subscription_tier: tier,
                                subscription_status: 'active',
                                lemon_squeezy_customer_id: customerId,
                                is_founding_member: true,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', existingUser.id);
                    } else {
                        // Create new user - they'll use password from sessionStorage or reset
                        const tempPassword = crypto.randomUUID();

                        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                            email: userEmail,
                            password: tempPassword,
                            email_confirm: true, // Auto-confirm since they paid
                        });

                        if (createError) {
                            console.error('Failed to create user:', createError);
                            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
                        }

                        console.log('Created new user:', newUser.user.id);

                        // Wait for trigger to create profile
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Update the profile
                        await supabaseAdmin
                            .from('profiles')
                            .update({
                                subscription_tier: tier,
                                subscription_status: 'active',
                                lemon_squeezy_customer_id: customerId,
                                is_founding_member: true,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', newUser.user.id);
                    }
                } else {
                    // Existing user upgrading - use user_id from custom data
                    const userId = customData.user_id;
                    if (userId && userId !== 'pending_signup') {
                        console.log('Updating existing user subscription:', userId);
                        await supabaseAdmin
                            .from('profiles')
                            .update({
                                subscription_tier: tier,
                                subscription_status: 'active',
                                lemon_squeezy_customer_id: customerId,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', userId);
                    }
                }
                break;
            }

            case 'subscription_updated': {
                const userId = customData.user_id;
                const variantId = String(event.data.attributes.variant_id);
                const tier = getSubscriptionTierFromVariant(variantId);
                const status = event.data.attributes.status;

                let subscriptionStatus = 'active';
                if (status === 'cancelled') subscriptionStatus = 'canceled';
                if (status === 'past_due') subscriptionStatus = 'past_due';
                if (status === 'on_trial') subscriptionStatus = 'trialing';

                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_status: subscriptionStatus,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'subscription_cancelled': {
                const userId = customData.user_id;
                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: 'canceled',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'subscription_expired': {
                const userId = customData.user_id;
                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'basic',
                            subscription_status: 'active',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'subscription_payment_success': {
                const userId = customData.user_id;
                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: 'active',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'subscription_payment_failed': {
                const userId = customData.user_id;
                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: 'past_due',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                }
                break;
            }

            default:
                console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Lemon Squeezy webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
