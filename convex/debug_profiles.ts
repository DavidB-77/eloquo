import { internalQuery, internalMutation } from "./_generated/server";

export const listDuplicates = internalQuery({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").collect();
        // Filter manually to be broad
        return profiles
            .filter(p => p.email && p.email.toLowerCase().includes("dj.blaney"))
            .map(p => ({
                id: p._id,
                email: p.email,
                userId: p.userId,
                tier: p.subscription_tier,
                isAdmin: p.is_admin,
                created: p._creationTime
            }));
    },
});

export const mergeDuplicates = internalMutation({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").collect();
        const matches = profiles.filter(p => p.email && p.email.toLowerCase().includes("dj.blaney"));

        if (matches.length < 2) return "Less than 2 profiles found. No merge needed.";

        // Sort by creation time? Or pick the one "fixDavid" touched?
        // Let's just update ALL of them to be Admin.
        for (const p of matches) {
            await ctx.db.patch(p._id, {
                is_admin: true,
                subscription_tier: "enterprise",
                comprehensive_credits_remaining: 9999,
            });
        }
        return `Updated ${matches.length} profiles to Admin/Enterprise.`;
    }
});
