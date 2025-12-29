import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    verifyWebhookSignature,
    getSubscriptionTierFromVariant
} from '@/lib/lemon-squeezy';

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
        const userId = customData.user_id;

        if (!userId) {
            console.error('No user_id in webhook custom data');
            return NextResponse.json({ received: true });
        }

        const supabase = await createClient();

        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated': {
                const subscription = event.data.attributes;
                const variantId = String(event.data.attributes.variant_id);
                const tier = getSubscriptionTierFromVariant(variantId);
                const customerId = String(event.data.attributes.customer_id);

                // Determine subscription status
                let status = 'active';
                if (subscription.status === 'cancelled') {
                    status = 'canceled';
                } else if (subscription.status === 'past_due') {
                    status = 'past_due';
                } else if (subscription.status === 'on_trial') {
                    status = 'trialing';
                }

                // Update user's subscription in database
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: tier,
                        subscription_status: status,
                        lemon_squeezy_customer_id: customerId,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update subscription:', error);
                } else {
                    console.log(`Updated user ${userId} to ${tier} (${status})`);
                }
                break;
            }

            case 'subscription_cancelled': {
                // Mark subscription as cancelled but don't downgrade immediately
                // User keeps access until end of billing period
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'canceled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update subscription status:', error);
                }
                break;
            }

            case 'subscription_expired': {
                // Subscription has fully expired, downgrade to basic
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: 'basic',
                        subscription_status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to downgrade subscription:', error);
                }
                break;
            }

            case 'subscription_payment_success': {
                // Payment successful, ensure status is active
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update payment status:', error);
                }
                break;
            }

            case 'subscription_payment_failed': {
                // Payment failed, mark as past_due
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'past_due',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update payment status:', error);
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
