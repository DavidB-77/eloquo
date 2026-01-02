/**
 * Lemon Squeezy Integration Helper
 * Handles checkout URL generation and API interactions
 */

const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

// Product variant IDs (configure in Lemon Squeezy dashboard)
export const PRODUCT_VARIANTS = {
    basic_monthly: process.env.LEMON_SQUEEZY_BASIC_MONTHLY_VARIANT_ID || '',
    basic_annual: process.env.LEMON_SQUEEZY_BASIC_ANNUAL_VARIANT_ID || '',
    pro_monthly: process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID || '',
    pro_annual: process.env.LEMON_SQUEEZY_PRO_ANNUAL_VARIANT_ID || '',
    team_monthly: process.env.LEMON_SQUEEZY_TEAM_MONTHLY_VARIANT_ID || '',
    team_annual: process.env.LEMON_SQUEEZY_TEAM_ANNUAL_VARIANT_ID || '',
    enterprise_monthly: process.env.LEMON_SQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID || '',
    enterprise_annual: process.env.LEMON_SQUEEZY_ENTERPRISE_ANNUAL_VARIANT_ID || '',
} as const;

export type PlanVariant = keyof typeof PRODUCT_VARIANTS;

interface CheckoutOptions {
    variantId: string;
    userId: string;
    userEmail: string;
    userName?: string;
    redirectUrl?: string;
    customData?: Record<string, any>;
}

/**
 * Create a checkout URL for a subscription
 */
export async function createCheckoutUrl(options: CheckoutOptions): Promise<string | null> {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
        console.error('Lemon Squeezy API key or store ID not configured');
        return null;
    }

    try {
        const response = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json',
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        checkout_data: {
                            email: options.userEmail,
                            name: options.userName,
                            custom: {
                                user_id: options.userId,
                                ...options.customData,
                            },
                        },
                        product_options: {
                            redirect_url: options.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=subscription`,
                        },
                    },
                    relationships: {
                        store: {
                            data: {
                                type: 'stores',
                                id: storeId,
                            },
                        },
                        variant: {
                            data: {
                                type: 'variants',
                                id: options.variantId,
                            },
                        },
                    },
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Lemon Squeezy checkout error:', error);
            return null;
        }

        const data = await response.json();
        return data.data.attributes.url;

    } catch (error) {
        console.error('Lemon Squeezy checkout error:', error);
        return null;
    }
}

/**
 * Get customer portal URL for managing subscription
 */
export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    if (!apiKey) {
        console.error('Lemon Squeezy API key not configured');
        return null;
    }

    try {
        const response = await fetch(`${LEMON_SQUEEZY_API_URL}/customers/${customerId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/vnd.api+json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data.attributes.urls.customer_portal;

    } catch (error) {
        console.error('Lemon Squeezy portal error:', error);
        return null;
    }
}

/**
 * Map variant ID to subscription tier
 */
export function getSubscriptionTierFromVariant(variantId: string): string {
    for (const [key, id] of Object.entries(PRODUCT_VARIANTS)) {
        if (id === variantId) {
            if (key.startsWith('basic')) return 'basic';
            if (key.startsWith('pro')) return 'pro';
            if (key.startsWith('team')) return 'team';
            if (key.startsWith('enterprise')) return 'enterprise';
        }
    }
    return 'free';
}

/**
 * Verify webhook signature from Lemon Squeezy
 */
export async function verifyWebhookSignature(
    payload: string,
    signature: string
): Promise<boolean> {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
        console.error('Lemon Squeezy webhook secret not configured');
        return false;
    }

    try {
        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(payload).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch {
        return false;
    }
}
