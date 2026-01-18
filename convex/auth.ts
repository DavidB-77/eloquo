// Better Auth Server Configuration
// Main authentication instance for Convex

import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = "https://eloquo.io";
const authBaseUrl = `${siteUrl}/api/auth/convex`;

// The component client has methods needed for integrating Convex with Better Auth
export const authComponent = createClient<DataModel>(components.betterAuth);

// Create the Better Auth instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth({
        baseURL: authBaseUrl,
        secret: process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long-1234567890",
        database: authComponent.adapter(ctx),

        // Email and password authentication
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false, // Handle via Resend separately
        },

        // Social providers
        socialProviders: {
            google: {
                enabled: true,
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
            github: {
                enabled: true,
                clientId: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            },
        },

        // Session configuration
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // Update session every day
        },

        plugins: [
            // The Convex plugin is required for Convex compatibility
            convex({ authConfig }),
        ],
    });
};

// Get the current authenticated user
// Get the current authenticated user
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        try {
            return await authComponent.getAuthUser(ctx);
        } catch {
            return null;
        }
    },
});

// Check if the current user is authenticated
export const isAuthenticated = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            return !!user;
        } catch {
            return false;
        }
    },
});

// Get user by ID
export const getUserById = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return null;

            // Return user with profile data
            return {
                id: user.userId,
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
            };
        } catch {
            return null;
        }
    },
});
