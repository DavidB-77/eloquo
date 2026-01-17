// Convex Auth Configuration
// Configures Better Auth as the authentication provider

import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
    providers: [
        {
            // Use the configured site URL or fallback to the current server for self-hosting
            domain: process.env.NEXT_PUBLIC_SITE_URL || process.env.CONVEX_SITE_URL || "http://localhost:3000",
            applicationID: "convex",
        },
    ],
} satisfies AuthConfig;
