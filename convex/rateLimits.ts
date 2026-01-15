import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
    free: { kind: "fixed window", rate: 3, period: 7 * 24 * 60 * 60 * 1000 }, // 3 per week
    basic: { kind: "fixed window", rate: 150, period: 30 * 24 * 60 * 60 * 1000 }, // 150 per month
    pro: { kind: "fixed window", rate: 400, period: 30 * 24 * 60 * 60 * 1000 }, // 400 per month
    business: { kind: "fixed window", rate: 1000, period: 30 * 24 * 60 * 60 * 1000 }, // 1000 per month
});

export async function checkRateLimit(ctx: MutationCtx, user: Doc<"profiles">) {
    let limitName: "free" | "basic" | "pro" | "business" = "free";

    if (user.subscription_status === "active" && user.subscription_tier) {
        if (user.subscription_tier === "basic") limitName = "basic";
        else if (user.subscription_tier === "pro") limitName = "pro";
        else if (user.subscription_tier === "business") limitName = "business";
    }

    // Use the userId from the profile as the key (since profile has userId)
    const status = await rateLimiter.limit(ctx, limitName, { key: user.userId });

    if (!status.ok) {
        const errorMsg = user.subscription_tier === "free"
            ? "Free Limit Exceeded. You get 3 free optimization requests per week. Please upgrade."
            : `Rate limit exceeded for ${limitName} tier. Please wait or upgrade.`;
        throw new Error(errorMsg);
    }
}
