import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteUserByEmail = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // 1. Find user in "users" table (Better Auth)
        const user = await ctx.db
            .query("betterAuth_user")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        let deletedUser = false;
        if (user) {
            await ctx.db.delete(user._id);
            deletedUser = true;

            // Delete associated accounts
            const accounts = await ctx.db
                .query("betterAuth_account")
                .withIndex("by_userId", (q) => q.eq("userId", user.id))
                .collect();

            for (const acc of accounts) {
                await ctx.db.delete(acc._id);
            }

            // Delete associated sessions
            const sessions = await ctx.db
                .query("betterAuth_session")
                .withIndex("by_userId", (q) => q.eq("userId", user.id))
                .collect();

            for (const sess of sessions) {
                await ctx.db.delete(sess._id);
            }
        }

        // 2. Find profile in "profiles" table
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        let deletedProfile = false;
        if (profile) {
            await ctx.db.delete(profile._id);
            deletedProfile = true;
        }

        return {
            success: true,
            email: args.email,
            deletedUser,
            deletedProfile,
            message: `User ${args.email} fully removed. You can now sign up fresh.`
        };
    },
});
