import { internalQuery, internalMutation } from "./_generated/server";

export const findQube = internalQuery({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").collect();
        return profiles
            .filter(p => (p.display_name && p.display_name.includes("Qube")) || (p.full_name && p.full_name.includes("Qube")))
            .map(p => ({
                id: p._id,
                email: p.email,
                userId: p.userId,
                tier: p.subscription_tier,
                isAdmin: p.is_admin,
                name: p.display_name || p.full_name
            }));
    },
});

export const fixQube = internalMutation({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").collect();
        const qube = profiles.find(p => (p.display_name && p.display_name.includes("Qube")) || (p.full_name && p.full_name.includes("Qube")));

        if (!qube) return "QubeShare profile not found.";

        await ctx.db.patch(qube._id, {
            is_admin: true,
            subscription_tier: "enterprise",
            comprehensive_credits_remaining: 9999,
        });
        return `Fixed QubeShare profile (${qube.email}). Set to Admin/Enterprise.`;
    }
});
