import { query } from "./_generated/server";

export const checkEnv = query({
    args: {},
    handler: async () => {
        return {
            SITE_URL: process.env.SITE_URL,
            GOOGLE_ID: process.env.GOOGLE_CLIENT_ID ? "Set (starts with " + process.env.GOOGLE_CLIENT_ID.substring(0, 5) + ")" : "Missing",
            GITHUB_ID: process.env.GITHUB_CLIENT_ID ? "Set (starts with " + process.env.GITHUB_CLIENT_ID.substring(0, 5) + ")" : "Missing",
            AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "Set" : "Missing",
            JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Missing",
        };
    },
});
