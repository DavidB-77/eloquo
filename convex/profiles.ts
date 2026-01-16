import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Update a user's subscription tier and status
 */
export const updateSubscription = mutation({
    args: {
        userId: v.string(),
        tier: v.string(),
        status: v.string(),
        polarCustomerId: v.optional(v.string()),
        isFoundingMember: v.optional(v.boolean()),
        foundingWave: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        if (profile) {
            await ctx.db.patch(profile._id, {
                subscription_tier: args.tier as "free" | "basic" | "pro" | "business" | "enterprise",
                subscription_status: args.status,
                polar_customer_id: args.polarCustomerId,
                is_founding_member: args.isFoundingMember ?? profile.is_founding_member,
                founding_wave: args.foundingWave ?? profile.founding_wave,
                updated_at: new Date().toISOString(),
            });
            return true;
        }
        return false;
    },
});

/**
 * Update subscription by Polar Customer ID
 */
export const updateSubscriptionByCustomerId = mutation({
    args: {
        polarCustomerId: v.string(),
        tier: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_polar_customer", (q) => q.eq("polar_customer_id", args.polarCustomerId))
            .unique();

        if (profile) {
            await ctx.db.patch(profile._id, {
                subscription_tier: args.tier as "free" | "basic" | "pro" | "business" | "enterprise",
                subscription_status: args.status,
                updated_at: new Date().toISOString(),
            });
            return true;
        }
        return false;
    },
});

/**
 * Update subscription by Dodo IDs
 */
export const updateSubscriptionByDodoId = mutation({
    args: {
        dodoCustomerId: v.optional(v.string()),
        dodoPaymentId: v.optional(v.string()),
        tier: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        let profile = null;

        if (args.dodoCustomerId) {
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_dodo_customer", (q) => q.eq("dodo_customer_id", args.dodoCustomerId))
                .unique();
        }

        if (!profile && args.dodoPaymentId) {
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_dodo_payment", (q) => q.eq("dodo_payment_id", args.dodoPaymentId))
                .unique();
        }

        if (profile) {
            await ctx.db.patch(profile._id, {
                subscription_tier: args.tier as "free" | "basic" | "pro" | "business" | "enterprise",
                subscription_status: args.status,
                dodo_customer_id: args.dodoCustomerId ?? profile.dodo_customer_id,
                dodo_payment_id: args.dodoPaymentId ?? profile.dodo_payment_id,
                updated_at: new Date().toISOString(),
            });
            return true;
        }
        return false;
    },
});

/**
 * Ensure a profile exists for a user
 */
export const ensureProfile = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        subscriptionTier: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (existing) {
            if (!existing.userId) {
                await ctx.db.patch(existing._id, { userId: args.userId });
            }
            return existing._id;
        }

        return await ctx.db.insert("profiles", {
            userId: args.userId,
            email,
            subscription_tier: (args.subscriptionTier as "free" | "basic" | "pro" | "business" | "enterprise") || "free",
            optimizations_remaining: 3,
            optimizations_used: 0,
            comprehensive_credits_remaining: 0,
            is_admin: false,
            is_founding_member: false,
            created_at: Date.now(),
        });
    },
});

/**
 * Get user usage statistics
 */
export const getUsage = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // First try to find by userId
        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        // If not found by userId, try by email (handles OAuth login scenarios)
        if (!profile && identity.email) {
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_email", (q) => q.eq("email", identity.email!.toLowerCase()))
                .unique();

            // Note: Can't update userId in a query, but ensureProfile mutation handles this
        }

        if (!profile) return null;

        // Map Convex profile to UserData structure used in the app
        return {
            tier: profile.subscription_tier,
            optimizationsUsed: profile.optimizations_used,
            optimizationsLimit: profile.subscription_tier === 'pro' ? 400 :
                profile.subscription_tier === 'business' ? 1000 :
                    profile.subscription_tier === 'basic' ? 150 : 12,
            premiumCreditsUsed: 0, // Placeholder
            premiumCreditsLimit: profile.subscription_tier === 'pro' ? 100 : 0,
            canOptimize: profile.optimizations_remaining > 0 || profile.subscription_tier !== 'free',
            canOrchestrate: profile.subscription_tier === 'pro' || profile.subscription_tier === 'business',
            hasMcpAccess: profile.subscription_tier !== 'free' && profile.subscription_tier !== 'basic',
            comprehensiveCreditsRemaining: profile.comprehensive_credits_remaining,
            subscriptionStatus: profile.subscription_status,
            isAdmin: profile.is_admin ?? false,
            displayName: profile.display_name || profile.full_name,
        };
    },
});
/**
 * Get all user profiles (Admin only)
 */
export const getAllProfiles = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("profiles").collect();
    },
});

/**
 * Get profile by email
 */
export const getProfileByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        return await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();
    },
});

/**
 * Update user admin status
 */
export const updateAdminStatus = mutation({
    args: { userId: v.string(), isAdmin: v.boolean() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            is_admin: args.isAdmin,
            updated_at: new Date().toISOString(),
        });
    },
});
/**
 * Update subscription status only
 */
export const updateSubscriptionStatus = mutation({
    args: {
        userId: v.optional(v.string()),
        polarCustomerId: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        let profile = null;

        if (args.userId) {
            const userId = args.userId;
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .unique();
        } else if (args.polarCustomerId) {
            const customerId = args.polarCustomerId;
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_polar_customer", (q) => q.eq("polar_customer_id", customerId))
                .unique();
        }

        if (profile) {
            await ctx.db.patch(profile._id, {
                subscription_status: args.status as "active" | "canceled" | "past_due" | "trialing" | "unpaid" | "incomplete" | "paused",
                updated_at: new Date().toISOString(),
            });
            return true;
        }
        return false;
    },
});
