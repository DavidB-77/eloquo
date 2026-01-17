import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const findProfile = internalQuery({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").collect();
        return profiles.map(p => ({
            id: p._id,
            email: p.email,
            userId: p.userId,
            tier: p.subscription_tier,
            isAdmin: p.is_admin
        }));
    },
});

export const fixDavid = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // 1. Find the legacy profile (from Supabase)
        const profiles = await ctx.db.query("profiles").collect();
        const legacyProfile = profiles.find(p => p.email.toLowerCase().includes("dj.blaney"));

        if (!legacyProfile) {
            return "Could not find legacy profile for dj.blaney!";
        }

        // 2. set to admin and enterprise
        await ctx.db.patch(legacyProfile._id, {
            is_admin: true,
            subscription_tier: "enterprise",
            email: args.email, // Normalize email
        });

        return `Fixed profile for ${legacyProfile.email}. Set to Admin/Enterprise.`;
    }
});
