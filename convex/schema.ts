// Convex Schema Definition
// This schema defines the database structure for the proof-of-concept migration

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // User Profiles
    profiles: defineTable({
        userId: v.string(), // Maps to Supabase auth.users.id
        email: v.string(),
        full_name: v.optional(v.string()),
        display_name: v.optional(v.string()),
        subscription_tier: v.union(
            v.literal("free"),
            v.literal("basic"),
            v.literal("pro"),
            v.literal("business"),
            v.literal("enterprise")
        ),
        subscription_status: v.optional(v.string()),
        polar_customer_id: v.optional(v.string()),
        dodo_payment_id: v.optional(v.string()),
        dodo_customer_id: v.optional(v.string()),
        optimizations_remaining: v.number(),
        optimizations_used: v.number(),
        comprehensive_credits_remaining: v.number(),
        is_admin: v.boolean(),
        is_founding_member: v.boolean(),
        founding_wave: v.optional(v.number()),
        created_at: v.number(), // Unix timestamp
        last_sign_in_at: v.optional(v.number()),
        updated_at: v.optional(v.string()),
    })
        .index("by_user", ["userId"])
        .index("by_email", ["email"])
        .index("by_tier", ["subscription_tier"])
        .index("by_polar_customer", ["polar_customer_id"])
        .index("by_dodo_payment", ["dodo_payment_id"])
        .index("by_dodo_customer", ["dodo_customer_id"])
        .index("by_created_at", ["created_at"]),

    pending_signups: defineTable({
        email: v.string(),
        polar_customer_id: v.string(),
        subscription_tier: v.string(),
        is_founding_member: v.boolean(),
        founding_wave: v.number(),
        payment_completed_at: v.string(),
        account_created: v.boolean(),
    }).index("by_email", ["email"]),

    // Optimization Records
    optimizations: defineTable({
        user_id: v.string(),
        original_prompt: v.string(),
        optimized_prompt: v.string(),
        target_model: v.string(),
        optimization_type: v.union(v.literal("standard"), v.literal("comprehensive")),
        strength: v.string(),
        context: v.optional(v.string()),
        user_rating: v.optional(v.number()),

        // Metadata for UI
        tokens_original: v.optional(v.number()),
        tokens_optimized: v.optional(v.number()),
        tokens_saved: v.optional(v.number()),
        token_savings_percent: v.optional(v.number()),
        improvements: v.optional(v.array(v.string())),
        metrics: v.optional(v.object({
            qualityScore: v.optional(v.number()),
            total_tokens: v.optional(v.number()),
            processing_time_sec: v.optional(v.number()),
            api_cost_usd: v.optional(v.number()),
        })),
        quick_reference: v.optional(v.string()),
        snippet: v.optional(v.string()),
        was_orchestrated: v.optional(v.boolean()),
        output_mode: v.optional(v.string()),
        credits_used: v.optional(v.number()),

        // Project Protocol fields
        project_name: v.optional(v.string()),
        project_summary: v.optional(v.string()),
        prd_document: v.optional(v.string()),
        architecture_document: v.optional(v.string()),
        stories_document: v.optional(v.string()),

        created_at: v.number(),
    })
        .index("by_user", ["user_id"])
        .index("by_created_at", ["created_at"]),

    // Optimization Logs (for analytics)
    optimization_logs: defineTable({
        user_id: v.string(),
        feature: v.string(), // "optimize", "refine", "project-protocol", etc.
        input_tokens: v.number(),
        output_tokens: v.number(),
        model_used: v.string(),
        cost_usd: v.number(),
        processing_time_ms: v.number(),
        created_at: v.number(),
    })
        .index("by_user", ["user_id"])
        .index("by_feature", ["feature"])
        .index("by_created_at", ["created_at"]),

    // Free Tier Tracking - DEPRECATED (Moved to Rate Limiter)

    // System Settings
    system_settings: defineTable({
        key: v.string(),
        value: v.any(), // Flexible JSON value
        updated_at: v.number(),
    }).index("by_key", ["key"]),

    // API Keys
    api_keys: defineTable({
        user_id: v.string(),
        key_prefix: v.string(),
        key_hash: v.string(),
        name: v.string(),
        last_used_at: v.optional(v.number()),
        revoked_at: v.optional(v.number()),
        created_at: v.number(),
    })
        .index("by_user", ["user_id"])
        .index("by_key_hash", ["key_hash"]),

    // Password Resets (for email-based password reset flow)
    password_resets: defineTable({
        email: v.string(),
        token: v.string(),
        expires_at: v.number(), // Unix timestamp
        used: v.boolean(),
        created_at: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_token", ["token"]),
});
