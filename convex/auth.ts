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
        database: authComponent.adapter(ctx),

        // Email and password authentication
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false, // Handle via Resend separately
        },

        // Social providers - Disabled until keys are added
        /*
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
        */

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
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        return authComponent.getAuthUser(ctx);
    },
});

// Check if the current user is authenticated
export const isAuthenticated = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx);
        return !!user;
    },
});

// Get user by ID
export const getUserById = query({
    args: {},
    handler: async (ctx) => {
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
    },
});
