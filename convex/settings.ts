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

/**
 * Get all pricing-related settings for the frontend
 */
export const getAllPricingSettings = query({
    args: {},
    handler: async (ctx) => {
        const [pricing, founding, annual, general] = await Promise.all([
            ctx.db.query("system_settings").withIndex("by_key", (q) => q.eq("key", "pricing_tiers")).unique(),
            ctx.db.query("system_settings").withIndex("by_key", (q) => q.eq("key", "founding_member")).unique(),
            ctx.db.query("system_settings").withIndex("by_key", (q) => q.eq("key", "annual_discount")).unique(),
            ctx.db.query("system_settings").withIndex("by_key", (q) => q.eq("key", "general_settings")).unique(),
        ]);

        return {
            pricing: pricing?.value || null,
            founding: founding?.value || null,
            annual: annual?.value || null,
            general: general?.value || null,
        };
    },
});
