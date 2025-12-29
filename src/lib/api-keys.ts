/**
 * API Key Helpers
 * Handles generation, validation, and management of MCP API keys
 */

import { createClient } from '@/lib/supabase/server';
import { createHash, randomBytes } from 'crypto';
import { TIER_LIMITS, SubscriptionTier } from './usage';

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

    const supabase = await createClient();
    const keyHash = hashApiKey(key);

    // Look up the key hash
    const { data: apiKey, error } = await supabase
        .from('api_keys')
        .select('user_id, revoked_at')
        .eq('key_hash', keyHash)
        .single();

    if (error || !apiKey || apiKey.revoked_at) {
        return null;
    }

    // Get user's profile for tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', apiKey.user_id)
        .single();

    const tier = (profile?.subscription_tier as SubscriptionTier) || 'basic';
    const hasMcpAccess = TIER_LIMITS[tier].hasMcpAccess;

    // Update last_used_at
    await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('key_hash', keyHash);

    return {
        userId: apiKey.user_id,
        tier,
        hasMcpAccess,
    };
}

/**
 * Create a new API key for a user
 * Returns the full key (only shown once) and the record ID
 */
export async function createApiKey(
    userId: string,
    name: string
): Promise<{ key: string; id: string } | null> {
    const supabase = await createClient();

    // Get user's tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

    const tier = (profile?.subscription_tier as SubscriptionTier) || 'basic';

    // Check if user has MCP access
    if (!TIER_LIMITS[tier].hasMcpAccess) {
        return null;
    }

    // Generate and store key
    const key = generateApiKey(tier);
    const keyHash = hashApiKey(key);
    const keyPrefix = getKeyPrefix(key);

    const { data, error } = await supabase
        .from('api_keys')
        .insert({
            user_id: userId,
            key_hash: keyHash,
            key_prefix: keyPrefix,
            name,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to create API key:', error);
        return null;
    }

    return { key, id: data.id };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId)
        .eq('user_id', userId);

    return !error;
}

/**
 * List user's API keys (only prefix and metadata, never the full key)
 */
export async function listApiKeys(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_prefix, name, last_used_at, created_at, revoked_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to list API keys:', error);
        return [];
    }

    return data;
}
