import type { AuthConfig } from "convex/server";

export default {
    providers: [
        {
            domain: "https://eloquo.io/convex-site/api/auth/convex",
            applicationID: "convex",
        },
    ],
} satisfies AuthConfig;
