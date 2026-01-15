// Better Auth Client
// Client-side authentication utilities

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [convexClient()],
});

// Re-export commonly used functions for convenience
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
