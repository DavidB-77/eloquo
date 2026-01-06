/**
 * Usage Tracking Helpers
 * Manages user usage limits and tracking per billing cycle
 */

import { createClient } from '@/lib/supabase/server';

// Tier limits
export const TIER_LIMITS = {
    free: { optimizations: 12, premiumCredits: 0, hasMcpAccess: false },
    basic: { optimizations: 150, premiumCredits: 0, hasMcpAccess: false },
    pro: { optimizations: 400, premiumCredits: 100, hasMcpAccess: true },
    business: { optimizations: 1000, premiumCredits: 500, hasMcpAccess: true },
    enterprise: { optimizations: Infinity, premiumCredits: Infinity, hasMcpAccess: true },
} as const;

export type SubscriptionTier = keyof typeof TIER_LIMITS;

export interface UsageStats {
    subscriptionStatus: string;
    tier: SubscriptionTier;
    optimizationsUsed: number;
    optimizationsLimit: number;
    premiumCreditsUsed: number;
    premiumCreditsLimit: number;
    canOptimize: boolean;
    canOrchestrate: boolean;
    hasMcpAccess: boolean;
    comprehensiveCreditsRemaining: number;
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonthYear(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get or create usage record for current month
 */
async function getOrCreateUsageRecord(userId: string) {
    const supabase = await createClient();
    const monthYear = getCurrentMonthYear();

    // Try to get existing record
    const { data: existing } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .single();

    if (existing) return existing;

    // Create new record for this month
    const { data: newRecord, error } = await supabase
        .from('usage')
        .insert({ user_id: userId, month_year: monthYear })
        .select()
        .single();

    if (error) throw error;
    return newRecord;
}

/**
 * Get user's current usage stats
 */
export async function getUserUsage(userId: string): Promise<UsageStats> {
    const supabase = await createClient();

    // First try RPC to get all limits and usage in one call
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_tier_limits', {
        p_user_id: userId
    });

    // If RPC works, use that data
    if (!rpcError && rpcData) {
        const stats = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        const tier = (stats.tier || stats.subscription_tier) as SubscriptionTier || 'free';
        const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
        const optimizationsUsed = stats.used || stats.optimizations_used || 0;
        const optimizationsLimit = stats.limit || stats.optimizations_limit || tierLimits.optimizations;
        const premiumCreditsUsed = stats.premium_credits_used || 0;
        const premiumCreditsLimit = stats.premium_credits_limit || tierLimits.premiumCredits;

        return {
            tier,
            optimizationsUsed,
            optimizationsLimit: tier === 'enterprise' ? 999999 : optimizationsLimit,
            premiumCreditsUsed,
            premiumCreditsLimit,
            canOptimize: optimizationsUsed < optimizationsLimit || tier === 'enterprise',
            canOrchestrate: tier === 'enterprise' || (premiumCreditsUsed < premiumCreditsLimit),
            hasMcpAccess: stats.has_mcp_access || (tier !== 'basic' && tier !== 'free'),
            comprehensiveCreditsRemaining: stats.comprehensive_credits_remaining ?? 3,
            subscriptionStatus: stats.subscription_status || "active",
        };
    }

    // Fallback: Query profiles table directly
    console.warn('RPC get_user_tier_limits failed, falling back to direct query:', rpcError);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, optimizations_used, comprehensive_credits_remaining, has_mcp_access')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('Failed to fetch profile:', profileError);
    }

    // Get tier from database or default to free
    const tier = (profile?.subscription_tier as SubscriptionTier) || 'free';
    const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    const optimizationsUsed = profile?.optimizations_used || 0;
    const optimizationsLimit = tier === 'enterprise' ? 999999 : tierLimits.optimizations;

    return {
        tier,
        optimizationsUsed,
        optimizationsLimit,
        premiumCreditsUsed: 0,
        premiumCreditsLimit: tierLimits.premiumCredits,
        canOptimize: optimizationsUsed < optimizationsLimit || tier === 'enterprise',
        canOrchestrate: tier === 'enterprise' || tier === 'business',
        hasMcpAccess: profile?.has_mcp_access || (tier !== 'basic' && tier !== 'free'),
        comprehensiveCreditsRemaining: profile?.comprehensive_credits_remaining ?? 3,
        subscriptionStatus: profile?.subscription_status || "active",
    };
}


/**
 * Check if user can perform an optimization
 */
export async function checkUsageLimits(userId: string): Promise<{ canOptimize: boolean; usage: UsageStats }> {
    const usage = await getUserUsage(userId);
    return { canOptimize: usage.canOptimize, usage };
}

/**
 * Check if user can perform orchestration (needs premium credits)
 */
export async function checkOrchestrationLimits(userId: string, segmentsNeeded: number): Promise<{ canOrchestrate: boolean; usage: UsageStats }> {
    const usage = await getUserUsage(userId);
    // First segment is free, subsequent segments cost 1 premium credit each
    const creditsNeeded = Math.max(0, segmentsNeeded - 1);
    const canOrchestrate = usage.tier === 'enterprise' ||
        (usage.premiumCreditsLimit - usage.premiumCreditsUsed) >= creditsNeeded;

    return { canOrchestrate, usage };
}

/**
 * Increment usage after a successful optimization
 */
export async function incrementUsage(
    userId: string,
    optimizations: number = 1,
    premiumCredits: number = 0
): Promise<void> {
    const supabase = await createClient();
    const monthYear = getCurrentMonthYear();

    await supabase.rpc('increment_usage', {
        p_user_id: userId,
        p_month_year: monthYear,
        p_optimizations: optimizations,
        p_premium_credits: premiumCredits,
    });
}

/**
 * Save optimization to history
 */
export async function saveToHistory(
    userId: string,
    originalPrompt: string,
    optimizedPrompt: string,
    targetModel: string,
    strength: string,
    wasOrchestrated: boolean = false,
    segments: any[] | null = null,
    improvements: string[] | null = null,
    metrics: any = null
): Promise<string | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('optimizations')
        .insert({
            user_id: userId,
            original_prompt: originalPrompt,
            optimized_prompt: optimizedPrompt,
            target_model: targetModel,
            strength,
            was_orchestrated: wasOrchestrated,
            segments: segments ? JSON.stringify(segments) : null,
            segments_count: segments?.length || 1,
            improvements,
            metrics,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to save to history:', error);
        return null;
    }

    return data.id;
}
