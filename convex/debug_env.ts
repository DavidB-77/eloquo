import { query } from "./_generated/server";

export const checkEnv = query({
    args: {},
    handler: async (ctx) => {
        return {
            JWT_SECRET: process.env.JWT_SECRET || "Missing",
            BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "Missing",
            GOOGLE: process.env.GOOGLE_CLIENT_ID ? "Present" : "Missing",
        };
    },
});
