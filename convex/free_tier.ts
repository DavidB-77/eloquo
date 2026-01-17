import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get current free tier usage for a user/fingerprint
 */
export const checkUsage = query({
    args: {
        userId: v.string(),
        weekStart: v.number(), // Unix timestamp for start of week
        fingerprintHash: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Find existing record by user/week
        // Note: We use the index defined in schema: .index("by_user", ["user_id"])
        // Since we don't have a composite index on user+week yet, we'll query by user and filter
        // Actually, we can add a composite index, but for now filtering is fine if volume is low.
        // Better: Use `by_fingerprint` if userId is not reliable?
        // Let's stick to user_id for logged in users.

        // Find record
        let record = await ctx.db
            .query("free_tier_tracking")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .filter((q) => q.eq(q.field("week_start"), args.weekStart))
            .first();

        // Fallback to fingerprint if no user record (and fingerprint provided)
        if (!record && args.fingerprintHash) {
            record = await ctx.db
                .query("free_tier_tracking")
                // @ts-ignore - TS doesn't narrow args.fingerprintHash correctly in callback
                .withIndex("by_fingerprint", (q) => q.eq("fingerprint_hash", args.fingerprintHash))
                .filter((q) => q.eq(q.field("week_start"), args.weekStart))
                .first();
        }

        return record || null;
    },
});

/**
 * Increment usage for free tier
 */
export const incrementUsage = mutation({
    args: {
        userId: v.string(),
        weekStart: v.number(),
        fingerprintHash: v.string(),
        ipHash: v.string(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        // 1. Find existing record by user for this week
        let record = await ctx.db
            .query("free_tier_tracking")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .filter((q) => q.eq(q.field("week_start"), args.weekStart))
            .unique();

        if (!record) {
            // Create new record
            await ctx.db.insert("free_tier_tracking", {
                user_id: args.userId,
                week_start: args.weekStart,
                fingerprint_hash: args.fingerprintHash,
                ip_hash: args.ipHash,
                weekly_usage: 1, // Start at 1
                is_flagged: false,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
            return { usage: 1, allowed: true };
        }

        // 2. record exists, check limit
        if (record.weekly_usage >= args.limit) {
            return { usage: record.weekly_usage, allowed: false };
        }

        // 3. Increment
        const newUsage = record.weekly_usage + 1;
        await ctx.db.patch(record._id, {
            weekly_usage: newUsage,
            updated_at: Date.now(),
            // Update IP/Fingerprint if changed to track latest
            ip_hash: args.ipHash,
            fingerprint_hash: args.fingerprintHash,
        });

        return { usage: newUsage, allowed: true };
    },
});
