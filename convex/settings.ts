import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get system settings by key
 */
export const getSettings = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const setting = await ctx.db
            .query("system_settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();
        return setting?.value || null;
    },
});
/**
 * Update system settings by key
 */
export const updateSettings = mutation({
    args: { key: v.string(), value: v.any() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("system_settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                updated_at: Date.now(),
            });
        } else {
            await ctx.db.insert("system_settings", {
                key: args.key,
                value: args.value,
                updated_at: Date.now(),
            });
        }
    },
});
