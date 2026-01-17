import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validate an API key and register its usage
 */
export const validateApiKey = mutation({
    args: {
        keyHash: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find the key by hash
        const apiKey = await ctx.db
            .query("api_keys")
            .withIndex("by_key_hash", (q) => q.eq("key_hash", args.keyHash))
            .unique();

        if (!apiKey || apiKey.revoked_at) {
            return null;
        }

        // 2. Update last used at
        await ctx.db.patch(apiKey._id, {
            last_used_at: Date.now(),
        });

        // 3. Get User Profile for Tier info
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", apiKey.user_id))
            .unique();

        if (!profile) return null;

        return {
            userId: apiKey.user_id,
            tier: profile.subscription_tier || "free",
        };
    },
});

/**
 * Create a new API key
 */
export const createApiKey = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        keyHash: v.string(),
        keyPrefix: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("api_keys", {
            user_id: args.userId,
            name: args.name,
            key_hash: args.keyHash,
            key_prefix: args.keyPrefix,
            created_at: Date.now(),
        });
        return { id };
    },
});

/**
 * Revoke an API key
 */
export const revokeApiKey = mutation({
    args: {
        userId: v.string(),
        keyId: v.id("api_keys"),
    },
    handler: async (ctx, args) => {
        const apiKey = await ctx.db.get(args.keyId);

        if (!apiKey || apiKey.user_id !== args.userId) {
            throw new Error("API key not found or unauthorized");
        }

        await ctx.db.patch(apiKey._id, {
            revoked_at: Date.now(),
        });

        return true;
    },
});

/**
 * List API keys for a user
 */
export const listApiKeys = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("api_keys")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .order("desc")
            .collect();
    },
});
