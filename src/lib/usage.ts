/**
 * Usage Tracking Helpers
 * Manages user usage limits and tracking per billing cycle
 */

import { createClient } from '@/lib/supabase/server';

// Tier limits
export const TIER_LIMITS = {
    free: { optimizations: 10, premiumCredits: 0, hasMcpAccess: false },
    pro: { optimizations: 1000, premiumCredits: 100, hasMcpAccess: true },
    team: { optimizations: 5000, premiumCredits: 500, hasMcpAccess: true },
    enterprise: { optimizations: Infinity, premiumCredits: Infinity, hasMcpAccess: true },
} as const;

export type SubscriptionTier = keyof typeof TIER_LIMITS;

export interface UsageStats {
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

    // Get user's profile for tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, comprehensive_credits_remaining')
        .eq('id', userId)
        .single();

    const tier = (profile?.subscription_tier as SubscriptionTier) || 'free';
    const limits = TIER_LIMITS[tier];

    // Get current month usage
    const usage = await getOrCreateUsageRecord(userId);

    const optimizationsRemaining = limits.optimizations - usage.optimizations_used;
    const premiumCreditsRemaining = limits.premiumCredits - usage.premium_credits_used;

    return {
        tier,
        optimizationsUsed: usage.optimizations_used,
        optimizationsLimit: limits.optimizations,
        premiumCreditsUsed: usage.premium_credits_used,
        premiumCreditsLimit: limits.premiumCredits,
        canOptimize: optimizationsRemaining > 0,
        canOrchestrate: premiumCreditsRemaining > 0 || tier === 'enterprise',
        hasMcpAccess: limits.hasMcpAccess,
        comprehensiveCreditsRemaining: profile?.comprehensive_credits_remaining ?? 3,
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
