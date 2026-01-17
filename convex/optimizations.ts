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
        userId: v.optional(v.string()),
        userEmail: v.optional(v.string()),
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

        // Detailed Analytics (from Agent)
        analytics: v.optional(v.object({
            status: v.string(),
            completion_tokens: v.optional(v.number()),
            total_tokens: v.number(),
            total_cost: v.number(),
            stages_used: v.array(v.string()),
            complexity: v.optional(v.string()),
            domain: v.optional(v.string()),
            models: v.optional(v.any()), // JSON object for model drilldown
            error_message: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        // 1. Get user identity or fallback to provided userId/email
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || args.userId;
        const userEmail = identity?.email || args.userEmail;

        if (!userId) {
            throw new Error("Unauthenticated: No user identity or userId provided");
        }

        // 2. Get user profile
        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId!))
            .unique();

        if (!profile && userEmail) {
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_email", (q) => q.eq("email", userEmail!.toLowerCase()))
                .unique();
        }

        if (!profile) {
            throw new Error("Profile not found");
        }

        // Use the actual userId from profile if found
        let profileUserId = profile.userId;

        // Defensive Sync: If the provided userId differs from the profile's userId,
        // it means better-auth has a different ID for this user than what's in our DB.
        // We trust the NEW (provided) userId as the definitive "subject" for future auth,
        // so we update the profile to match.
        if (args.userId && profileUserId !== args.userId) {
            console.log(`[SYNC] ID Mismatch Detected! Profile: ${profileUserId}, Request: ${args.userId}, Email: ${userEmail}`);

            // Only sync if we are SURE it's the same user (verified by email lookup above)
            console.log(`[SYNC] Updating profile userId to match request: ${args.userId}`);
            await ctx.db.patch(profile._id, {
                userId: args.userId,
                updated_at: new Date().toISOString()
            });
            profileUserId = args.userId; // Use the updated ID for the new record
        } else {
            if (args.userId) console.log(`[OPTIMIZE] User IDs match: ${args.userId}`);
        }

        const finalUserId = profileUserId;

        // 3. Check rate limits
        await checkRateLimit(ctx, profile);

        // 4. Check if user has credits (basic validation)
        const isPaidUser = profile.subscription_tier !== "free";
        if (!isPaidUser && profile.optimizations_remaining <= 0) {
            throw new Error("No optimizations remaining. Please upgrade.");
        }

        // 4. Create optimization record
        const optimizationId = await ctx.db.insert("optimizations", {
            user_id: finalUserId,
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
                optimizations_remaining: (profile.optimizations_remaining || 0) - 1,
                optimizations_used: (profile.optimizations_used || 0) + 1,
            });
        } else {
            await ctx.db.patch(profile._id, {
                optimizations_used: (profile.optimizations_used || 0) + 1,
            });
        }

        // 6. Log the optimization (Detailed Analytics)
        if (args.analytics) {
            await ctx.db.insert("optimization_logs", {
                user_id: finalUserId,
                request_id: optimizationId, // Link to successful optimization
                status: args.analytics.status,
                input_tokens: args.tokensOriginal || 0,
                output_tokens: args.analytics.completion_tokens || 0,
                total_tokens: args.analytics.total_tokens || 0,

                total_cost_usd: args.analytics.total_cost || 0,

                // Granular metrics if available (simplified for now)
                processing_time_ms: args.metrics?.processing_time_sec ? args.metrics.processing_time_sec * 1000 : 0,

                target_model: args.targetModel,
                complexity: args.analytics.complexity,
                domain: args.analytics.domain,
                stages_used: args.analytics.stages_used,
                user_tier: profile.subscription_tier || "unknown",

                created_at: Date.now(),
            });
        } else {
            // Legacy fallback logging
            await ctx.db.insert("optimization_logs", {
                user_id: finalUserId,
                request_id: optimizationId,
                status: "success",
                input_tokens: args.originalPrompt.length,
                output_tokens: args.optimizedPrompt.length,
                total_tokens: (args.originalPrompt.length + args.optimizedPrompt.length) / 4, // Approx
                total_cost_usd: 0,
                processing_time_ms: 0,
                target_model: args.targetModel,
                user_tier: profile.subscription_tier || "unknown",
                created_at: Date.now(),
            });
        }

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
            return [];
        }

        // 1. Try to find profile to get the "correct" userId
        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile && identity.email) {
            const userEmail = identity.email.toLowerCase();
            profile = await ctx.db
                .query("profiles")
                .withIndex("by_email", (q) => q.eq("email", userEmail))
                .unique();
        }

        // 2. Determine which IDs to query for
        // We query by the profile's userId AND the current identity's subject
        // to catch all records during the transition period.
        const searchIds = [identity.subject];
        if (profile?.userId && profile.userId !== identity.subject) {
            searchIds.push(profile.userId);
        }

        // 3. Collect optimizations for both IDs
        // Since Convex doesn't support "OR" queries or "IN" lists efficiently for indexed fields,
        // we run parallel queries and merge.
        const results = await Promise.all(
            searchIds.map(uid =>
                ctx.db
                    .query("optimizations")
                    .withIndex("by_user", (q) => q.eq("user_id", uid))
                    .order("desc")
                    .take(args.limit ?? 50)
            )
        );

        // Flatten checks
        const allOptimizations = results.flat();

        // Deduplicate by ID
        const uniqueMap = new Map();
        for (const opt of allOptimizations) {
            uniqueMap.set(opt._id, opt);
        }

        return Array.from(uniqueMap.values())
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, args.limit ?? 50);
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
