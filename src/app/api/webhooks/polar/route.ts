import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    getSubscriptionTierFromProduct,
    TIER_LIMITS
} from '@/lib/polar';

// Use admin client for database operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/webhooks/polar
 * Handles subscription events from Polar
 */
export async function POST(request: Request) {
    try {
        const payload = await request.text();

        // Log for debugging
        console.log('Polar webhook received - raw payload length:', payload.length);

        const event = JSON.parse(payload);
        const eventType = event.type;
        const data = event.data;
        const metadata = data?.metadata || {};

        console.log('Polar webhook event type:', eventType);
        console.log('Polar webhook metadata:', JSON.stringify(metadata));

        switch (eventType) {
            case 'checkout.created':
            case 'checkout.updated': {
                const status = data.status;
                console.log('Checkout status:', status);

                // Only process completed checkouts
                if (status !== 'succeeded' && status !== 'confirmed') {
                    console.log('Checkout not completed yet, skipping');
                    return NextResponse.json({ received: true });
                }

                // Process as order
                const productId = data.product_id || data.product?.id;
                const customerId = data.customer_id || data.customer?.id;
                const customerEmail = data.customer_email || data.customer?.email || metadata.email;
                const userId = metadata.user_id;
                const signupIntent = metadata.signup_intent;

                console.log('Processing checkout:', { productId, customerId, customerEmail, userId, signupIntent });

                if (!productId || !customerEmail) {
                    console.log('Missing product ID or email');
                    return NextResponse.json({ received: true });
                }

                const tier = getSubscriptionTierFromProduct(productId);

                if (!tier) {
                    console.log('Unknown product ID, skipping tier assignment:', productId);
                    return NextResponse.json({ received: true });
                }

                if (signupIntent === true || signupIntent === 'true') {
                    console.log('Recording pending signup for:', customerEmail, 'tier:', tier);

                    const { error } = await supabaseAdmin
                        .from('pending_signups')
                        .upsert({
                            email: customerEmail.toLowerCase(),
                            polar_customer_id: customerId,
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
                        console.log('SUCCESS: Recorded pending signup for:', customerEmail);
                    }
                } else if (userId && userId !== 'pending_signup') {
                    console.log('Updating existing user:', userId);

                    const { error } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_status: 'active',
                            polar_customer_id: customerId,
                            optimizations_limit: TIER_LIMITS[tier],
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);

                    if (error) {
                        console.error('Failed to update profile:', error);
                    }
                }
                break;
            }

            case 'order.created':
            case 'order.paid': {
                const productId = data.product_id || data.product?.id;
                const customerId = data.customer_id || data.customer?.id;
                const customerEmail = data.customer_email || data.customer?.email || metadata.email;
                const userId = metadata.user_id;
                const signupIntent = metadata.signup_intent;

                console.log('Processing order:', { productId, customerId, customerEmail, userId, signupIntent });

                if (!productId) {
                    console.log('No product ID in event');
                    return NextResponse.json({ received: true });
                }

                const tier = getSubscriptionTierFromProduct(productId);

                if (!tier) {
                    console.log('Unknown product ID, skipping tier assignment:', productId);
                    return NextResponse.json({ received: true });
                }

                if (signupIntent === true || signupIntent === 'true') {
                    console.log('Recording pending signup for:', customerEmail, 'tier:', tier);

                    const { error } = await supabaseAdmin
                        .from('pending_signups')
                        .upsert({
                            email: customerEmail.toLowerCase(),
                            polar_customer_id: customerId,
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
                        console.log('SUCCESS: Recorded pending signup for:', customerEmail);
                    }
                } else if (userId && userId !== 'pending_signup') {
                    console.log('Updating existing user:', userId);

                    const { error } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_status: 'active',
                            polar_customer_id: customerId,
                            optimizations_limit: TIER_LIMITS[tier],
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);

                    if (error) {
                        console.error('Failed to update profile:', error);
                    }
                }
                break;
            }

            case 'subscription.created':
            case 'subscription.active': {
                const productId = data.product_id || data.product?.id;
                const customerId = data.customer_id || data.customer?.id;
                const customerEmail = data.customer_email || data.customer?.email;
                const userId = metadata.user_id;
                const signupIntent = metadata.signup_intent;

                console.log('Processing subscription:', { productId, customerId, customerEmail, signupIntent });

                if (!productId || !customerId) break;

                const tier = getSubscriptionTierFromProduct(productId);

                if (!tier) {
                    console.log('Unknown product ID, skipping tier assignment:', productId);
                    break;
                }

                // Handle new signup via subscription event
                if (signupIntent === true || signupIntent === 'true') {
                    console.log('Recording pending signup from subscription for:', customerEmail);

                    const { error } = await supabaseAdmin
                        .from('pending_signups')
                        .upsert({
                            email: customerEmail.toLowerCase(),
                            polar_customer_id: customerId,
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
                        console.log('SUCCESS: Recorded pending signup for:', customerEmail);
                    }
                } else if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_status: 'active',
                            polar_customer_id: customerId,
                            optimizations_limit: TIER_LIMITS[tier],
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'subscription.updated': {
                const productId = data.product_id || data.product?.id;
                const customerId = data.customer_id || data.customer?.id;
                const status = data.status;
                const userId = metadata.user_id;

                if (!productId) break;

                const tier = getSubscriptionTierFromProduct(productId);

                if (!tier) {
                    console.log('Unknown product ID, skipping tier assignment:', productId);
                    break;
                }

                let subscriptionStatus = 'active';
                if (status === 'canceled') subscriptionStatus = 'canceled';
                if (status === 'past_due') subscriptionStatus = 'past_due';
                if (status === 'trialing') subscriptionStatus = 'trialing';

                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_status: subscriptionStatus,
                            optimizations_limit: TIER_LIMITS[tier],
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                } else if (customerId) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_status: subscriptionStatus,
                            optimizations_limit: TIER_LIMITS[tier],
                            updated_at: new Date().toISOString(),
                        })
                        .eq('polar_customer_id', customerId);
                }
                break;
            }

            case 'subscription.canceled':
            case 'subscription.revoked': {
                const customerId = data.customer_id || data.customer?.id;
                const userId = metadata.user_id;

                if (userId && userId !== 'pending_signup') {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: eventType === 'subscription.canceled' ? 'canceled' : 'expired',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);
                } else if (customerId) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: eventType === 'subscription.canceled' ? 'canceled' : 'expired',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('polar_customer_id', customerId);
                }
                break;
            }

            default:
                console.log('Unhandled Polar event:', eventType);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Polar webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Polar may send GET to verify endpoint
export async function GET() {
    return NextResponse.json({ status: 'Polar webhook endpoint active' });
}
