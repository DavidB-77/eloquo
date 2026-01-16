// Better Auth Server Utilities for Next.js
// Server-side authentication helpers

import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
    handler,
    preloadAuthQuery,
    isAuthenticated,
    getToken,
    fetchAuthQuery,
    fetchAuthMutation,
    fetchAuthAction,
} = convexBetterAuthNextJs({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

