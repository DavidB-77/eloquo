// Password Reset Functions using Convex
// Stores and verifies password reset tokens

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a simple random token (no crypto needed)
 */
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Create a password reset token for an email
 */
export const createResetToken = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, { email }) => {
        const token = generateToken();
        const expiresAt = Date.now() + 3600000; // 1 hour

        // Delete any existing tokens for this email
        const existing = await ctx.db
            .query("password_resets")
            .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }

        // Create new token
        await ctx.db.insert("password_resets", {
            email: email.toLowerCase(),
            token,
            expires_at: expiresAt,
            used: false,
            created_at: Date.now(),
        });

        return { token };
    },
});

/**
 * Verify a password reset token
 */
export const verifyResetToken = query({
    args: {
        token: v.string(),
        email: v.string(),
    },
    handler: async (ctx, { token, email }) => {
        const reset = await ctx.db
            .query("password_resets")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (!reset) {
            return { valid: false, error: "Invalid reset link" };
        }

        if (reset.email !== email.toLowerCase()) {
            return { valid: false, error: "Invalid reset link" };
        }

        if (reset.used) {
            return { valid: false, error: "This reset link has already been used" };
        }

        if (reset.expires_at < Date.now()) {
            return { valid: false, error: "This reset link has expired" };
        }

        return { valid: true };
    },
});

/**
 * Mark a reset token as used
 */
export const markTokenUsed = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        const reset = await ctx.db
            .query("password_resets")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (reset) {
            await ctx.db.patch(reset._id, { used: true });
        }
    },
});
