// Convex Optimization Functions (POC)
// This is a proof-of-concept migration of /api/optimize to Convex

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkRateLimit } from "./rateLimits";

/**
 * Create a new optimization (POC)
 * Replaces POST /api/optimize
 */
export const createOptimization = mutation({
    args: {
        originalPrompt: v.string(),
        optimizedPrompt: v.string(),
        targetModel: v.string(),
        optimizationType: v.union(v.literal("standard"), v.literal("comprehensive")),
        strength: v.string(),
        context: v.optional(v.string()),

        // Metadata
        tokensOriginal: v.optional(v.number()),
        tokensOptimized: v.optional(v.number()),
        improvements: v.optional(v.array(v.string())),
        metrics: v.optional(v.object({
            qualityScore: v.optional(v.number()),
            total_tokens: v.optional(v.number()),
            processing_time_sec: v.optional(v.number()),
            api_cost_usd: v.optional(v.number()),
        })),
        wasOrchestrated: v.optional(v.boolean()),
        outputMode: v.optional(v.string()),
        creditsUsed: v.optional(v.number()),
        projectName: v.optional(v.string()),
        projectSummary: v.optional(v.string()),
        prdDocument: v.optional(v.string()),
        architectureDocument: v.optional(v.string()),
        storiesDocument: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Get authenticated user
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // 2. Get user profile
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (!profile) {
            throw new Error("Profile not found");
        }

        // 3. Check rate limits
        await checkRateLimit(ctx, profile);

        // 4. Check if user has credits (basic validation)
        const isPaidUser = profile.subscription_tier !== "free";
        if (!isPaidUser && profile.optimizations_remaining <= 0) {
            throw new Error("No optimizations remaining. Please upgrade.");
        }

        // 4. Create optimization record
        const optimizationId = await ctx.db.insert("optimizations", {
            user_id: identity.subject,
            original_prompt: args.originalPrompt,
            optimized_prompt: args.optimizedPrompt,
            target_model: args.targetModel,
            optimization_type: args.optimizationType,
            strength: args.strength,
            context: args.context,

            tokens_original: args.tokensOriginal,
            tokens_optimized: args.tokensOptimized,
            tokens_saved: args.tokensOriginal && args.tokensOptimized ? args.tokensOriginal - args.tokensOptimized : undefined,
            improvements: args.improvements,
            metrics: args.metrics,
            was_orchestrated: args.wasOrchestrated,
            output_mode: args.outputMode,
            credits_used: args.creditsUsed,
            project_name: args.projectName,
            project_summary: args.projectSummary,
            prd_document: args.prdDocument,
            architecture_document: args.architectureDocument,
            stories_document: args.storiesDocument,

            created_at: Date.now(),
        });

        // 5. Update user's optimization count
        if (!isPaidUser) {
            await ctx.db.patch(profile._id, {
                optimizations_remaining: profile.optimizations_remaining - 1,
                optimizations_used: profile.optimizations_used + 1,
            });
        } else {
            await ctx.db.patch(profile._id, {
                optimizations_used: profile.optimizations_used + 1,
            });
        }

        // 6. Log the optimization
        await ctx.db.insert("optimization_logs", {
            user_id: identity.subject,
            feature: "optimize",
            input_tokens: args.originalPrompt.length, // Simplified
            output_tokens: args.optimizedPrompt.length, // Simplified
            model_used: args.targetModel,
            cost_usd: 0.001, // Placeholder
            processing_time_ms: 0, // Would be calculated by actual API
            created_at: Date.now(),
        });

        return {
            optimizationId,
            success: true,
        };
    },
});

/**
 * Get user's optimization history
 * Replaces GET /api/history
 */
export const getOptimizationHistory = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            // Return empty array instead of throwing - user just hasn't logged in yet
            return [];
        }

        const optimizations = await ctx.db
            .query("optimizations")
            .withIndex("by_user", (q) => q.eq("user_id", identity.subject))
            .order("desc")
            .take(args.limit ?? 50);

        return optimizations;
    },
});

/**
 * Get optimization by ID
 */
export const getOptimization = query({
    args: {
        id: v.id("optimizations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const optimization = await ctx.db.get(args.id);

        // Verify ownership
        if (optimization?.user_id !== identity.subject) {
            throw new Error("Unauthorized");
        }

        return optimization;
    },
});

/**
 * Create optimization record for agent API (no auth required, uses userId directly)
 * Used by Project Protocol and other agent-based features
 */
export const createOptimizationForAgent = mutation({
    args: {
        userId: v.string(),
        userEmail: v.optional(v.string()),
        originalPrompt: v.string(),
        optimizedPrompt: v.string(),
        targetModel: v.string(),
        optimizationType: v.union(v.literal("standard"), v.literal("comprehensive")),
        strength: v.string(),
        context: v.optional(v.string()),
        improvements: v.optional(v.array(v.string())),
        metrics: v.optional(v.object({
            qualityScore: v.optional(v.number()),
            total_tokens: v.optional(v.number()),
            processing_time_sec: v.optional(v.number()),
            api_cost_usd: v.optional(v.number()),
        })),
        outputMode: v.optional(v.string()),
        creditsUsed: v.optional(v.number()),
        projectName: v.optional(v.string()),
        projectSummary: v.optional(v.string()),
        prdDocument: v.optional(v.string()),
        architectureDocument: v.optional(v.string()),
        storiesDocument: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Find profile by userId or email (like we do for credits)
        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile && args.userEmail) {
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_email", (q) => q.eq("email", args.userEmail!.toLowerCase()))
                .unique();
        }

        // Use the actual userId from profile if found, otherwise the provided userId
        const actualUserId = profile?.userId || args.userId;

        // Create optimization record
        const optimizationId = await ctx.db.insert("optimizations", {
            user_id: actualUserId,
            original_prompt: args.originalPrompt,
            optimized_prompt: args.optimizedPrompt,
            target_model: args.targetModel,
            optimization_type: args.optimizationType,
            strength: args.strength,
            context: args.context,
            improvements: args.improvements,
            metrics: args.metrics,
            was_orchestrated: false,
            output_mode: args.outputMode,
            credits_used: args.creditsUsed,
            project_name: args.projectName,
            project_summary: args.projectSummary,
            prd_document: args.prdDocument,
            architecture_document: args.architectureDocument,
            stories_document: args.storiesDocument,
            created_at: Date.now(),
        });

        return {
            optimizationId,
            success: true,
        };
    },
});
