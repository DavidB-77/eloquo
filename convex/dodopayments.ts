import { createDodoWebhookHandler } from "@dodopayments/convex";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Dodo Payments Webhook Handler
 */
/**
 * Dodo Payments Webhook Handler
 */
/**
 * Dodo Payments Webhook Handler
 */
export const dodoWebhookHandler = createDodoWebhookHandler({
    onSubscriptionActive: async (ctx: any, event: any) => {
        const email = event.data.customer.email;
        const dodoCustomerId = event.data.customer.customer_id;
        const dodoSubscriptionId = event.data.subscription_id;
        const productId = event.data.product_id;

        // Map Dodo Product ID to our tiers
        let tier = "free";
        if (productId.includes("basic")) tier = "basic";
        else if (productId.includes("pro")) tier = "pro";
        else if (productId.includes("business")) tier = "business";

        console.log(`[Dodo Webhook] Subscription Active for ${email} (Tier: ${tier})`);

        await ctx.runMutation(internalMutation({
            args: {
                email: v.string(),
                dodoCustomerId: v.string(),
                dodoSubscriptionId: v.string(),
                tier: v.string(),
                status: v.string(),
            },
            handler: async (ctx, args) => {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
                    .unique();

                if (profile) {
                    await ctx.db.patch(profile._id, {
                        subscription_tier: args.tier as any,
                        subscription_status: args.status,
                        dodo_customer_id: args.dodoCustomerId,
                        dodo_payment_id: args.dodoSubscriptionId,
                        updated_at: new Date().toISOString(),
                    });
                }
            }
        }), {
            email,
            dodoCustomerId,
            dodoSubscriptionId,
            tier,
            status: "active",
        });
    },
    onSubscriptionCancelled: async (ctx: any, event: any) => {
        const dodoSubscriptionId = event.data.subscription_id;

        console.log(`[Dodo Webhook] Subscription Cancelled: ${dodoSubscriptionId}`);

        await ctx.runMutation(internalMutation({
            args: { dodoSubscriptionId: v.string() },
            handler: async (ctx, args) => {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_dodo_payment", (q) => q.eq("dodo_payment_id", args.dodoSubscriptionId))
                    .unique();

                if (profile) {
                    await ctx.db.patch(profile._id, {
                        subscription_status: "cancelled",
                        updated_at: new Date().toISOString(),
                    });
                }
            }
        }), { dodoSubscriptionId });
    },
    onSubscriptionExpired: async (ctx: any, event: any) => {
        const dodoSubscriptionId = event.data.subscription_id;

        console.log(`[Dodo Webhook] Subscription Expired: ${dodoSubscriptionId}`);

        await ctx.runMutation(internalMutation({
            args: { dodoSubscriptionId: v.string() },
            handler: async (ctx, args) => {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_dodo_payment", (q) => q.eq("dodo_payment_id", args.dodoSubscriptionId))
                    .unique();

                if (profile) {
                    await ctx.db.patch(profile._id, {
                        subscription_status: "expired",
                        subscription_tier: "free",
                        updated_at: new Date().toISOString(),
                    });
                }
            }
        }), { dodoSubscriptionId });
    },
});
