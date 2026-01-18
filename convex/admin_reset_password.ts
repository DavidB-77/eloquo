// One-time admin script to reset password for dj.blaney77@gmail.com
// This will be deleted after use

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const resetAdminPassword = mutation({
    args: {
        email: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        // Only allow for the specific admin email
        if (args.email !== "dj.blaney77@gmail.com") {
            throw new Error("This script is only for the admin email");
        }

        // Import bcrypt-like hashing from Better Auth
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(args.newPassword, 10);

        // Find the user in the Better Auth users table
        const user = await ctx.db
            .query("betterAuth_user")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error(`User not found: ${args.email}`);
        }

        // Update the password in the Better Auth accounts table
        const account = await ctx.db
            .query("betterAuth_account")
            .withIndex("by_userId", (q) => q.eq("userId", user.id))
            .filter((q) => q.eq(q.field("providerId"), "credential"))
            .first();

        if (!account) {
            throw new Error("No credential account found for this user");
        }

        await ctx.db.patch(account._id, {
            password: hashedPassword,
        });

        return {
            success: true,
            message: `Password reset successfully for ${args.email}`,
        };
    },
});
