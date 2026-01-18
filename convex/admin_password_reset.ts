"use node";

// Direct password reset script for admin
// Run this once via: npx convex run admin_password_reset:setPassword '{"email":"dj.blaney77@gmail.com","password":"YOUR_NEW_PASSWORD"}'

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const setPassword = internalMutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`[PASSWORD_RESET] Starting password reset for: ${args.email}`);

        // Find user by email in profiles table
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!profile) {
            throw new Error(`No profile found for email: ${args.email}`);
        }

        console.log(`[PASSWORD_RESET] Found profile for user: ${profile.userId}`);

        // Since Better Auth tables are managed by the component, we need to use a different approach
        // Let's just create a new account entry if one doesn't exist

        return {
            success: true,
            message: `Found user ${args.email}. User ID: ${profile.userId}`,
            note: "Please sign up with this email to create a new password, or use the alternative method below.",
        };
    },
});

// Alternative: Create a brand new admin account
export const createAdminAccount = internalMutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`[CREATE_ADMIN] Creating new admin account for: ${args.email}`);

        // Check if profile already exists
        const existingProfile = await ctx.db
            .query("profiles")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingProfile) {
            return {
                success: false,
                message: `Profile already exists for ${args.email}. Please use sign-up flow instead.`,
            };
        }

        // Generate a unique user ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Create profile
        await ctx.db.insert("profiles", {
            userId: userId,
            email: args.email,
            full_name: args.name,
            display_name: args.name,
            subscription_tier: "enterprise",
            subscription_status: "active",
            is_admin: true,
            is_founding_member: true,
            founding_wave: 1,
            optimizations_remaining: 999999,
            comprehensive_credits_remaining: 999999,
            created_at: Date.now(),
            last_sign_in_at: Date.now(),
        });

        console.log(`[CREATE_ADMIN] Profile created with userId: ${userId}`);

        return {
            success: true,
            message: `Admin profile created for ${args.email}. Now go to https://eloquo.io/signup and create an account with this email and your desired password.`,
            userId: userId,
        };
    },
});
