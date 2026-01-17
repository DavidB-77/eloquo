/**
 * API Key Helpers
 * Handles generation, validation, and management of MCP API keys
 */

import { createHash, randomBytes } from 'crypto';
// import { TIER_LIMITS, SubscriptionTier } from './usage'; // DEPRECATED

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'business' | 'enterprise';

export const TIER_LIMITS: Record<SubscriptionTier, { hasMcpAccess: boolean }> = {
    free: { hasMcpAccess: false },
    basic: { hasMcpAccess: true },
    pro: { hasMcpAccess: true },
    business: { hasMcpAccess: true },
    enterprise: { hasMcpAccess: true },
};

/**
 * Generate a new API key
 * Format: elk_[tier]_[32 random chars]
 */
export function generateApiKey(tier: SubscriptionTier): string {
    const random = randomBytes(16).toString('hex'); // 32 hex chars
    return `elk_${tier}_${random}`;
}

/**
 * Hash an API key for storage (SHA-256)
 */
export function hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
}

/**
 * Get the prefix of an API key for display (first 15 chars + ...)
 */
export function getKeyPrefix(key: string): string {
    return key.substring(0, 15) + '...';
}

/**
 * Extract tier from API key format
 */
export function getTierFromKey(key: string): SubscriptionTier | null {
    const match = key.match(/^elk_(basic|pro|business|enterprise)_/);
    return match ? (match[1] as SubscriptionTier) : null;
}

/**
 * Validate an API key and return the associated user
 */
export async function validateApiKey(key: string): Promise<{
    userId: string;
    tier: SubscriptionTier;
    hasMcpAccess: boolean;
} | null> {
    // Basic format check
    if (!key.startsWith('elk_')) {
        return null;
    }

    try {
        const keyHash = hashApiKey(key);

        // Call Convex mutation to validate and update usage
        // @ts-ignore
        const result = await convex.mutation(api.api_keys.validateApiKey, { keyHash });

        if (!result) return null;

        const tier = result.tier as SubscriptionTier;
        const hasMcpAccess = TIER_LIMITS[tier]?.hasMcpAccess || false;

        return {
            userId: result.userId,
            tier,
            hasMcpAccess,
        };
    } catch (error) {
        console.error("API Key Validation Error:", error);
        return null;
    }
}

/**
 * Create a new API key for a user
 * Returns the full key (only shown once) and the record ID
 */
export async function createApiKey(
    userId: string,
    name: string
): Promise<{ key: string; id: string } | null> {
    try {
        // Get user's tier
        const profile = await convex.query(api.profiles.getProfileByUserId, { userId });
        const tier = (profile?.subscription_tier as SubscriptionTier) || 'free';

        // Check if user has MCP access
        if (!TIER_LIMITS[tier]?.hasMcpAccess) {
            console.warn(`User ${userId} on tier ${tier} tried to create API key without access`);
            return null;
        }

        // Generate and store key
        const key = generateApiKey(tier);
        const keyHash = hashApiKey(key);
        const keyPrefix = getKeyPrefix(key);

        // @ts-ignore
        const { id } = await convex.mutation(api.api_keys.createApiKey, {
            userId,
            name,
            keyHash,
            keyPrefix
        });

        return { key, id };
    } catch (error) {
        console.error('Failed to create API key:', error);
        return null;
    }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
    try {
        // Requires importing Id type if we want strict typing for keyId, but string is usually fine in args passing
        // Casting keyId to match Convex ID type
        // @ts-ignore
        await convex.mutation(api.api_keys.revokeApiKey, { userId, keyId });
        return true;
    } catch (error) {
        console.error('Failed to revoke API key:', error);
        return false;
    }
}

/**
 * List user's API keys (only prefix and metadata, never the full key)
 */
export async function listApiKeys(userId: string) {
    try {
        // @ts-ignore
        const keys = await convex.query(api.api_keys.listApiKeys, { userId });

        // Filter out revoked keys if desired, or return all with status
        // Current implementation returns all, but we can filter or map.
        // Returning raw convex result is fine as it matches expected structure mostly

        return keys.map((k: any) => ({
            id: k._id,
            key_prefix: k.key_prefix,
            name: k.name,
            last_used_at: k.last_used_at ? new Date(k.last_used_at).toISOString() : null,
            created_at: new Date(k.created_at).toISOString(),
            revoked_at: k.revoked_at ? new Date(k.revoked_at).toISOString() : null,
        }));
    } catch (error) {
        console.error('Failed to list API keys:', error);
        return [];
    }
}
