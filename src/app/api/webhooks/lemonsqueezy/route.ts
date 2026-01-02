import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    verifyWebhookSignature,
    getSubscriptionTierFromVariant
} from '@/lib/lemon-squeezy';

// Use admin client for database operations
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
                    console.log('Recording pending signup for:', userEmail);

                    // DON'T create user here - just record the payment
                    // The success page will create the user with the correct password
                    const { error } = await supabaseAdmin
                        .from('pending_signups')
                        .upsert({
                            email: userEmail.toLowerCase(),
                            lemon_squeezy_customer_id: customerId,
                            subscription_tier: tier,
                            is_founding_member: true,
                            founding_wave: 1,
                            payment_completed_at: new Date().toISOString(),
                            account_created: false,
                        }, {
                            onConflict: 'email'
                        });

                    if (error) {
                        console.error('Failed to record pending signup:', error);
                    } else {
                        console.log('Recorded pending signup for:', userEmail, 'tier:', tier);
                    }
                } else {
                    // Existing user upgrading - update their profile directly
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
