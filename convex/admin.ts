import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get total user count and growth
 */
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const todayStart = new Date().setUTCHours(0, 0, 0, 0);

        // 1. Total Users
        const users = await ctx.db.query("profiles").collect();
        const totalUsers = users.length;

        // 2. User Growth (compare to 7 days ago)
        const lastWeekUsers = users.filter(u => u.created_at <= sevenDaysAgo).length;
        const growth = lastWeekUsers > 0
            ? Math.round(((totalUsers - lastWeekUsers) / lastWeekUsers) * 100)
            : 0;

        // 3. Optimizations Today
        const optsToday = await ctx.db
            .query("optimizations")
            .withIndex("by_created_at", (q) => q.gte("created_at", todayStart))
            .collect();

        return {
            totalUsers,
            userGrowth: growth >= 0 ? `+${growth}%` : `${growth}%`,
            optimizationsToday: optsToday.length,
        };
    },
});

/**
 * Get recent signups
 */
export const getRecentSignups = query({
    args: { limit: v.number() },
    handler: async (ctx, args) => {
        const recent = await ctx.db
            .query("profiles")
            .withIndex("by_created_at")
            .order("desc")
            .take(args.limit);

        return recent;
    },
});

/**
 * Get ratings distribution
 */
export const getRatingsDistribution = query({
    args: {},
    handler: async (ctx) => {
        const opts = await ctx.db
            .query("optimizations")
            .filter((q) => q.neq(q.field("user_rating"), null))
            .collect();

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        opts.forEach((opt) => {
            if (opt.user_rating && opt.user_rating >= 1 && opt.user_rating <= 5) {
                distribution[opt.user_rating]++;
            }
        });

        return distribution;
    },
});

/**
 * Get daily optimizations for the last 7 days
 */
export const getDailyOptimizations = query({
    args: { days: v.number() },
    handler: async (ctx, args) => {
        const since = Date.now() - args.days * 24 * 60 * 60 * 1000;
        const opts = await ctx.db
            .query("optimizations")
            .withIndex("by_created_at", (q) => q.gte("created_at", since))
            .collect();

        const dailyCounts: Record<string, number> = {};

        // Initialize last X days with 0
        for (let i = 0; i < args.days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyCounts[dateStr] = 0;
        }

        opts.forEach((opt) => {
            const dateStr = new Date(opt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dailyCounts[dateStr] !== undefined) {
                dailyCounts[dateStr]++;
            }
        });

        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .reverse(); // Chronological order
    },
});

/**
 * Get detailed model usage stats
 */
export const getModelUsageStats = query({
    args: {},
    handler: async (ctx) => {
        const opts = await ctx.db.query("optimizations").collect();
        const counts: Record<string, number> = {};

        opts.forEach(opt => {
            const model = opt.target_model || "unknown";
            counts[model] = (counts[model] || 0) + 1;
        });

        const total = opts.length;
        return Object.entries(counts).map(([model_name, usage_count]) => ({
            model_name,
            usage_count,
            percentage: total > 0 ? (usage_count / total) * 100 : 0
        })).sort((a, b) => b.usage_count - a.usage_count);
    },
});

/**
 * Get top users by optimization count
 */
export const getTopUsersDetailed = query({
    args: { limit: v.number() },
    handler: async (ctx, args) => {
        const opts = await ctx.db.query("optimizations").collect();
        const userStats: Record<string, { count: number; cost: number; email?: string; tier?: string }> = {};

        const profiles = await ctx.db.query("profiles").collect();
        const profileMap = new Map(profiles.map(p => [p.userId, p]));

        opts.forEach(opt => {
            if (!userStats[opt.user_id]) {
                const profile = profileMap.get(opt.user_id);
                userStats[opt.user_id] = {
                    count: 0,
                    cost: 0,
                    email: profile?.email,
                    tier: profile?.subscription_tier
                };
            }
            userStats[opt.user_id].count++;
            userStats[opt.user_id].cost += (opt.metrics?.api_cost_usd || 0);
        });

        return Object.entries(userStats)
            .map(([user_id, stats]) => ({
                user_id,
                email: stats.email || "Unknown",
                subscription_tier: stats.tier || "free",
                total_optimizations: stats.count,
                total_cost: stats.cost
            }))
            .sort((a, b) => b.total_optimizations - a.total_optimizations)
            .slice(0, args.limit);
    },
});

/**
 * Get financial summary data
 */
export const getFinancialSummary = query({
    args: {},
    handler: async (ctx) => {
        const opts = await ctx.db.query("optimizations").collect();
        const profiles = await ctx.db.query("profiles").collect();

        const totalCost = opts.reduce((sum, opt) => sum + (opt.metrics?.api_cost_usd || 0), 0);

        // Revenue estimation (this would ideally come from a real payments table in the future)
        // For now, calculating based on profile tiers
        const tierPrices = {
            free: 0,
            basic: 9, // Example price
            pro: 19,
            business: 49,
            enterprise: 199
        };

        const totalRevenue = profiles.reduce((sum, p) => sum + (tierPrices[p.subscription_tier] || 0), 0);
        const totalProfit = totalRevenue - totalCost;

        return {
            totals: {
                total_revenue: totalRevenue,
                total_api_cost: totalCost,
                total_profit: totalProfit,
                profit_margin_pct: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
                total_requests: opts.length
            },
            standard: {
                total_optimizations: opts.filter(o => o.optimization_type === "standard").length,
                total_api_cost: opts.filter(o => o.optimization_type === "standard").reduce((sum, o) => sum + (o.metrics?.api_cost_usd || 0), 0)
            },
            bmad: {
                total_generations: opts.filter(o => o.optimization_type === "comprehensive").length,
                total_api_cost: opts.filter(o => o.optimization_type === "comprehensive").reduce((sum, o) => sum + (o.metrics?.api_cost_usd || 0), 0)
            }
        };
    },
});
/**
 * Get free tier stats
 */
export const getFreeTierStats = query({
    args: { weekStart: v.number() },
    handler: async (ctx, args) => {
        const freeUsers = await ctx.db
            .query("profiles")
            .filter((q) => q.eq(q.field("subscription_tier"), "free"))
            .collect();

        const totalFreeUsers = freeUsers.length;
        const atLimit = freeUsers.filter(u => (u.optimizations_used || 0) >= 5).length;
        // Mock flagging logic for now as we don't have explicit flags
        const flaggedUsers = 0;

        const totalUsage = freeUsers.reduce((sum, u) => sum + (u.optimizations_used || 0), 0);
        const avgUsage = totalFreeUsers > 0 ? (totalUsage / totalFreeUsers).toFixed(1) : "0.0";

        return {
            totalFreeUsers,
            atLimit,
            flaggedUsers,
            avgUsage
        };
    },
});
/**
 * Get all admin users
 */
export const getAdmins = query({
    args: {},
    handler: async (ctx) => {
        const admins = await ctx.db
            .query("profiles")
            .filter((q) => q.eq(q.field("is_admin"), true))
            .collect();
        return admins;
    },
});
