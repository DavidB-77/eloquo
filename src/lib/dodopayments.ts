import { DodoPayments } from "dodopayments";

/**
 * Dodo Payments Integration Helper
 * Drop-in replacement for Polar/Lemon Squeezy
 */

// Initialize Dodo client
const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode',
});

// Product IDs from Dodo dashboard
// Replace these with your actual Dodo Product IDs
export const PRODUCT_IDS = {
    basic: process.env.NEXT_PUBLIC_DODO_BASIC_ID || 'prod_basic_placeholder',
    pro: process.env.NEXT_PUBLIC_DODO_PRO_ID || 'prod_pro_placeholder',
    business: process.env.NEXT_PUBLIC_DODO_BUSINESS_ID || 'prod_business_placeholder',
} as const;

export type PlanType = keyof typeof PRODUCT_IDS;

interface CheckoutOptions {
    productId: string;
    userId: string;
    userEmail: string;
    userName?: string;
    redirectUrl?: string;
    discountCode?: string;
    customData?: Record<string, any>;
}

/**
 * Create a checkout URL for a subscription
 */
export async function createCheckoutUrl(options: CheckoutOptions): Promise<string | null> {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
        console.error('Dodo Payments API key not configured');
        return null;
    }

    try {
        const session = await dodo.checkoutSessions.create({
            product_cart: [
                {
                    product_id: options.productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: options.userEmail,
                name: options.userName,
            },
            billing_address: {
                country: 'US', // Dodo requires a country for tax calculation
            },
            discount_code: options.discountCode,
            metadata: {
                user_id: options.userId,
                ...options.customData,
            },
            return_url: options.redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?tab=subscription`,
        } as any);

        if (session && 'checkout_url' in session) {
            return (session as any).checkout_url;
        }

        return null;
    } catch (error) {
        console.error('Dodo checkout creation error:', error);
        throw error; // Re-throw to see error in API response
    }
}

/**
 * Map product ID to subscription tier
 */
export function getSubscriptionTierFromProduct(productId: string): string | null {
    for (const [tier, id] of Object.entries(PRODUCT_IDS)) {
        if (id === productId) {
            return tier;
        }
    }
    return null;
}
