import { query } from "./_generated/server";

export const whoAmI = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { status: "No Identity" };
        return {
            status: "Authenticated",
            subject: identity.subject,
            email: identity.email,
            name: identity.name,
            givenName: identity.givenName,
            tokenIdentifier: identity.tokenIdentifier
        };
    },
});
