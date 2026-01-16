// Better Auth Server Configuration
// Main authentication instance for Convex

import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL || "https://eloquo.io";

// The component client has methods needed for integrating Convex with Better Auth
export const authComponent = createClient<DataModel>(components.betterAuth);

// Create the Better Auth instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth({
        baseURL: siteUrl,
        secret: process.env.JWT_SECRET || "fallback-secret-1234567890", // Prevent crash if env var missing
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
            // GitHub - uncomment when keys are added
            /*
            github: {
                enabled: true,
                clientId: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            },
            */
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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
            return null;
        }
    },
});
