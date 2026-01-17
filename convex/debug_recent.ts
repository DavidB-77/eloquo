import { internalQuery } from "./_generated/server";

export const listRecent = internalQuery({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").order("desc").take(20);
        return profiles.map(p => ({
            id: p._id,
            email: p.email,
            userId: p.userId,
            name: p.display_name || p.full_name,
            tier: p.subscription_tier,
            created: p._creationTime ? new Date(p._creationTime).toISOString() : "unknown"
        }));
    },
});
