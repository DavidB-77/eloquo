import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import { query } from "./_generated/server";

export const checkAuthConfig = query({
    args: {},
    handler: async (ctx) => {
        return {
            provider: getAuthConfigProvider(),
            CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
        };
    },
});
