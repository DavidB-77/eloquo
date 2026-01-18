// One-time admin script to reset password for dj.blaney77@gmail.com
// This will be deleted after use

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

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

        console.log(`[ADMIN_RESET] Attempting password reset for: ${args.email}`);

        // Use Better Auth's internal methods to update password
        // This is a direct database operation on the Better Auth tables
        const users = await ctx.db
            .query("betterAuth_user")
            .collect();

        console.log(`[ADMIN_RESET] Found ${users.length} users in database`);

        const user = users.find((u) => u.email === args.email);

        if (!user) {
            throw new Error(`User not found: ${args.email}. Available users: ${users.map(u => u.email).join(", ")}`);
        }

        console.log(`[ADMIN_RESET] Found user: ${user.id}`);

        // For now, just return the user info so you can manually reset via the Better Auth dashboard
        // or we can use the password reset flow
        return {
            success: true,
            message: `Found user ${args.email}. Please use the password reset flow at https://eloquo.io/reset-password`,
            userId: user.id,
            userEmail: user.email,
        };
    },
});
