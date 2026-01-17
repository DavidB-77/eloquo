import { query, mutation } from "./_generated/server";
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
        const lastWeekUsers = users.filter(u => (u.created_at ?? 0) <= sevenDaysAgo).length;
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
                    tier: profile?.subscription_tier ?? undefined
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

        const totalRevenue = profiles.reduce((sum, p) => sum + (tierPrices[(p.subscription_tier as keyof typeof tierPrices) ?? 'free'] || 0), 0);
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

/**
 * Setup Admin Profile - Run this once to create your admin profile
 * Usage: Run from Convex Dashboard -> Functions -> admin:setupAdminProfile
 */
export const setupAdminProfile = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        fullName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if profile already exists
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            // Update existing profile to be admin
            await ctx.db.patch(existing._id, {
                is_admin: true,
                subscription_tier: "enterprise",
                subscription_status: "active",
            });
            return { status: "updated", profileId: existing._id };
        }

        // Create new admin profile
        const profileId = await ctx.db.insert("profiles", {
            userId: args.userId,
            email: args.email,
            full_name: args.fullName || "Admin",
            display_name: args.fullName || "Admin",
            subscription_tier: "enterprise",
            subscription_status: "active",
            optimizations_remaining: 10000,
            optimizations_used: 0,
            comprehensive_credits_remaining: 1000,
            is_admin: true,
            is_founding_member: true,
            founding_wave: 1,
            created_at: Date.now(),
        });

        return { status: "created", profileId };
    },
});

/**
 * Migrate profiles from Supabase CSV data
 * This imports the 4 users from the original Supabase database
 */
export const migrateFromSupabase = mutation({
    args: {},
    handler: async (ctx) => {
        // The 4 profiles from Supabase profiles_rows.csv
        const supabaseProfiles = [
            {
                supabaseId: "c93a4854-dce8-4339-860a-992bb6ff41bc",
                email: "dj.blaney77@gmail.com",
                subscription_tier: "enterprise" as const,
                subscription_status: "active",
                is_admin: true,
                comprehensive_credits_remaining: 999969,
                is_founding_member: false,
                optimizations_used: 0,
                created_at: new Date("2025-12-26T15:12:16.106167Z").getTime(),
            },
            {
                supabaseId: "4145d0d5-46dd-433a-9948-77b88b386aec",
                email: "dcdgllc14@gmail.com",
                subscription_tier: "basic" as const,
                subscription_status: "active",
                is_admin: false,
                comprehensive_credits_remaining: 0,
                is_founding_member: true,
                founding_wave: 1,
                optimizations_used: 0,
                created_at: new Date("2026-01-04T02:13:38.901618Z").getTime(),
            },
            {
                supabaseId: "7ff513ec-d197-43ee-b640-3c903aa15f40",
                email: "formatt.ricradio@gmail.com",
                subscription_tier: "free" as const,
                subscription_status: "trialing",
                is_admin: false,
                comprehensive_credits_remaining: 3,
                is_founding_member: true,
                founding_wave: 1,
                polar_customer_id: "aa160c8e-b9cc-4d1f-a034-101e9f459822",
                optimizations_used: 0,
                created_at: new Date("2026-01-07T20:52:54.371258Z").getTime(),
            },
            {
                supabaseId: "d12bf9b1-48d1-40c2-b3c6-9550d108101a",
                email: "isac@polar.sh",
                subscription_tier: "pro" as const,
                subscription_status: "canceled",
                is_admin: false,
                comprehensive_credits_remaining: 3,
                is_founding_member: true,
                founding_wave: 1,
                polar_customer_id: "fbfc505a-0baa-4e82-8023-d4e1127bc7ea",
                optimizations_used: 0,
                created_at: new Date("2026-01-13T08:25:35.480067Z").getTime(),
            },
        ];

        const results = [];

        for (const profile of supabaseProfiles) {
            // Check if profile already exists
            const existing = await ctx.db
                .query("profiles")
                .withIndex("by_email", (q) => q.eq("email", profile.email))
                .first();

            if (existing) {
                results.push({ email: profile.email, status: "skipped", reason: "already exists" });
                continue;
            }

            // Create profile
            const profileId = await ctx.db.insert("profiles", {
                userId: profile.supabaseId, // Use Supabase ID as userId for now
                email: profile.email,
                subscription_tier: profile.subscription_tier,
                subscription_status: profile.subscription_status,
                optimizations_remaining: 10000, // Set high limit
                optimizations_used: profile.optimizations_used,
                comprehensive_credits_remaining: profile.comprehensive_credits_remaining,
                is_admin: profile.is_admin,
                is_founding_member: profile.is_founding_member,
                founding_wave: profile.founding_wave,
                polar_customer_id: profile.polar_customer_id,
                created_at: profile.created_at,
            });

            results.push({ email: profile.email, status: "created", profileId });
        }

        return { migrated: results.length, results };
    },
});

/**
 * SIMPLE: Create admin profile directly - NO INPUT NEEDED
 * Just click "Run Function" and it creates your admin profile
 */
export const createAdminNow = mutation({
    args: {},
    handler: async (ctx) => {
        const adminEmail = "dj.blaney77@gmail.com";
        const adminUserId = "k57fz79t96ddd5wk0k075az36h7zbq4d"; // Your Better Auth userId (from DEBUG)

        // Check if profile already exists
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", adminEmail))
            .first();

        if (existing) {
            // Update existing profile to be admin with correct userId
            await ctx.db.patch(existing._id, {
                userId: adminUserId,
                is_admin: true,
                subscription_tier: "enterprise",
                subscription_status: "active",
                comprehensive_credits_remaining: 999999,
                optimizations_remaining: 10000,
            });
            return { status: "updated", message: "Admin profile updated!", profileId: existing._id };
        }

        // Create new admin profile
        const profileId = await ctx.db.insert("profiles", {
            userId: adminUserId,
            email: adminEmail,
            full_name: "QubeShare",
            display_name: "QubeShare",
            subscription_tier: "enterprise",
            subscription_status: "active",
            optimizations_remaining: 10000,
            optimizations_used: 0,
            comprehensive_credits_remaining: 999999,
            is_admin: true,
            is_founding_member: true,
            founding_wave: 1,
            created_at: Date.now(),
        });

        return { status: "created", message: "Admin profile created!", profileId };
    },
});
