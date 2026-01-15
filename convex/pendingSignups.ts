import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Record a pending signup from a successful payment
 */
export const recordPayment = mutation({
    args: {
        email: v.string(),
        polar_customer_id: v.string(),
        subscription_tier: v.string(),
        is_founding_member: v.boolean(),
        founding_wave: v.number(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();

        // Check if already exists
        const existing = await ctx.db
            .query("pending_signups")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                polar_customer_id: args.polar_customer_id,
                subscription_tier: args.subscription_tier,
                payment_completed_at: new Date().toISOString(),
                account_created: false,
            });
            return existing._id;
        }

        return await ctx.db.insert("pending_signups", {
            email,
            polar_customer_id: args.polar_customer_id,
            subscription_tier: args.subscription_tier,
            is_founding_member: args.is_founding_member,
            founding_wave: args.founding_wave,
            payment_completed_at: new Date().toISOString(),
            account_created: false,
        });
    },
});

/**
 * Check if a payment has been recorded for an email
 */
export const checkPendingSignup = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("pending_signups")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .unique();
    },
});

/**
 * Mark a pending signup as completed
 */
export const completeSignup = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        const pending = await ctx.db
            .query("pending_signups")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (pending) {
            await ctx.db.patch(pending._id, {
                account_created: true,
            });
            return true;
        }
        return false;
    },
});
/**
 * Complete the entire signup process atomically
 */
export const completeSignupProcess = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();

        // 1. Get pending signup
        const pending = await ctx.db
            .query("pending_signups")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!pending) {
            throw new Error("Pending signup not found");
        }

        // 2. Get profile
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!profile) {
            throw new Error("User profile not found");
        }

        // 3. Update profile with subscription info
        await ctx.db.patch(profile._id, {
            subscription_tier: pending.subscription_tier as any,
            subscription_status: "active",
            polar_customer_id: pending.polar_customer_id,
            is_founding_member: pending.is_founding_member,
            founding_wave: pending.founding_wave,
            updated_at: new Date().toISOString(),
        });

        // 4. Mark pending signup as complete
        await ctx.db.patch(pending._id, {
            account_created: true,
        });

        return true;
    },
});
