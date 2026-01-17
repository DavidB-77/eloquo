import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check optimization count for a specific user
 */
export const checkOptimizations = internalQuery({
    args: {},
    handler: async (ctx) => {
        const email = "dj.blaney77@gmail.com";
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
            .unique();

        if (!profile) return { error: "Profile not found" };

        const optimizations = await ctx.db
            .query("optimizations")
            .withIndex("by_user", (q) => q.eq("user_id", profile.userId))
            .collect();

        return {
            email: email,
            profileOptimizationsUsed: profile.optimizations_used,
            actualTableCount: optimizations.length,
            profileId: profile._id,
            userId: profile.userId
        };
    },
});
