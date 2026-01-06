/**
 * Polar.sh Integration Helper
 * Drop-in replacement for Lemon Squeezy
 */

const POLAR_API_URL = 'https://api.polar.sh/v1';

// Product IDs from Polar dashboard
export const PRODUCT_IDS = {
    basic: '084c7e20-e6b9-4d15-8657-05d04fd9dfd2',
    pro: 'c9fcd252-f88a-4e71-b1d2-21f49b1d890d',
    business: '3234e13e-a589-4aba-ab54-3c0bbcec97ee',
    free: '2a415251-2cfd-4d0a-85e6-e59276422e95',
} as const;

// Discount codes for founding members
export const DISCOUNT_IDS = {
    pro: '8bd2db57-c6d1-4cb4-b001-9309b8d7558f',
    business: 'afb25ada-e295-43cc-bb11-9defd3fcebc9',
} as const;

// Tier limits
export const TIER_LIMITS: Record<string, number> = {
    basic: 150,
    pro: 400,
    business: 1000,
};

export type PlanType = keyof typeof PRODUCT_IDS;

interface CheckoutOptions {
    productId: string;
    userId: string;
    userEmail: string;
    userName?: string;
    redirectUrl?: string;
    customData?: Record<string, any>;
    discountCode?: string;
}

/**
 * Create a checkout URL for a subscription
 */
export async function createCheckoutUrl(options: CheckoutOptions): Promise<string | null> {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('Polar access token not configured');
        return null;
    }

    try {
        const checkoutData: any = {
            products: [options.productId],
            success_url: options.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=subscription`,
            customer_email: options.userEmail,
            metadata: {
                user_id: options.userId,
                ...options.customData,
            },
        };

        // Add discount code if provided
        if (options.discountCode) {
            checkoutData.discount_id = options.discountCode;
        }

        console.log('Creating Polar checkout:', JSON.stringify(checkoutData, null, 2));

        const response = await fetch(`${POLAR_API_URL}/checkouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Polar checkout error:', error);
            return null;
        }

        const data = await response.json();
        console.log('Polar checkout created:', data.url);
        return data.url;

    } catch (error) {
        console.error('Polar checkout error:', error);
        return null;
    }
}

/**
 * Get customer portal URL for managing subscription
 */
export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('Polar access token not configured');
        return null;
    }

    try {
        const response = await fetch(`${POLAR_API_URL}/customer-portal/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerId,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Polar portal error:', error);
            return null;
        }

        const data = await response.json();
        return data.url;

    } catch (error) {
        console.error('Polar portal error:', error);
        return null;
    }
}

/**
 * Map product ID to subscription tier
 */
export function getSubscriptionTierFromProduct(productId: string): string {
    for (const [tier, id] of Object.entries(PRODUCT_IDS)) {
        if (id === productId) {
            return tier;
        }
    }
    return 'basic';
}

/**
 * Verify webhook signature from Polar
 */
export async function verifyWebhookSignature(
    payload: string,
    signature: string
): Promise<boolean> {
    const secret = process.env.POLAR_WEBHOOK_SECRET;

    if (!secret) {
        console.error('Polar webhook secret not configured');
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
