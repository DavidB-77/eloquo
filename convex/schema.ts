// Convex Schema Definition
// This schema defines the database structure for the proof-of-concept migration

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // User Profiles
    profiles: defineTable({
        userId: v.string(), // Maps to Supabase auth.users.id
        email: v.string(),
        full_name: v.optional(v.union(v.string(), v.null())),
        display_name: v.optional(v.union(v.string(), v.null())),
        subscription_tier: v.optional(v.union(v.string(), v.null())),
        subscription_status: v.optional(v.union(v.string(), v.null())),
        polar_customer_id: v.optional(v.union(v.string(), v.null())),
        dodo_payment_id: v.optional(v.union(v.string(), v.null())),
        dodo_customer_id: v.optional(v.union(v.string(), v.null())),
        optimizations_remaining: v.optional(v.union(v.number(), v.null())),
        optimizations_used: v.optional(v.union(v.number(), v.null())),
        comprehensive_credits_remaining: v.optional(v.union(v.number(), v.null())),
        is_admin: v.optional(v.union(v.boolean(), v.null())),
        is_founding_member: v.optional(v.union(v.boolean(), v.null())),
        founding_wave: v.optional(v.union(v.number(), v.null())),
        created_at: v.optional(v.union(v.number(), v.null())), // Unix timestamp
        last_sign_in_at: v.optional(v.union(v.number(), v.null())),
        updated_at: v.optional(v.union(v.string(), v.null())),
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

    // Optimization Logs (detailed analytics, replaces Supabase agent_requests)
    optimization_logs: defineTable({
        user_id: v.string(),
        request_id: v.optional(v.string()), // Made optional for legacy data compatibility
        status: v.optional(v.string()), // Made optional
        error_message: v.optional(v.string()),

        // Legacy Fields (found in Prod)
        cost_usd: v.optional(v.number()),
        feature: v.optional(v.string()),
        model_used: v.optional(v.string()),

        // Detailed Token Usage
        input_tokens: v.number(),
        output_tokens: v.number(),
        total_tokens: v.optional(v.number()), // Made optional

        // Granular Costs
        classify_cost: v.optional(v.number()),
        analyze_cost: v.optional(v.number()),
        generate_cost: v.optional(v.number()),
        total_cost_usd: v.optional(v.number()), // Made optional

        // Models Used
        classify_model: v.optional(v.string()),
        analyze_model: v.optional(v.string()),
        generate_model: v.optional(v.string()),
        target_model: v.optional(v.string()), // Made optional

        // Performance
        processing_time_ms: v.number(),
        quality_score: v.optional(v.number()),

        // Metadata
        complexity: v.optional(v.string()),
        domain: v.optional(v.string()),
        stages_used: v.optional(v.array(v.string())),
        user_tier: v.optional(v.string()), // Made optional

        created_at: v.number(),
    })
        .index("by_user", ["user_id"])
        .index("by_status", ["status"])
        .index("by_created_at", ["created_at"]),

    // Free Tier Tracking (Replaces Supabase free_tier_tracking)
    free_tier_tracking: defineTable({
        fingerprint_hash: v.string(),
        ip_hash: v.optional(v.string()),
        user_id: v.optional(v.string()),

        weekly_usage: v.number(),
        week_start: v.number(), // Unix timestamp for start of week

        is_flagged: v.boolean(),
        flag_reason: v.optional(v.string()),

        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_fingerprint", ["fingerprint_hash"])
        .index("by_ip", ["ip_hash"])
        .index("by_user", ["user_id"]),

    // Daily Metrics (Replaces Supabase daily_metrics)
    daily_metrics: defineTable({
        date: v.string(), // YYYY-MM-DD
        total_requests: v.number(),
        unique_users: v.number(),
        avg_processing_time_ms: v.number(),
        total_cost_usd: v.number(),
        total_errors: v.number(),

        // Model breakdowns
        model_counts: v.optional(v.object({
            gpt: v.number(),
            claude: v.number(),
            gemini: v.number(),
            deepseek: v.number(),
            other: v.number(),
        })),

        created_at: v.number(),
    }).index("by_date", ["date"]),

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

    // Support Tickets
    support_tickets: defineTable({
        user_id: v.string(),
        user_email: v.string(),
        subject: v.string(),
        message: v.string(),
        category: v.union(
            v.literal("bug"),
            v.literal("feature"),
            v.literal("question"),
            v.literal("feedback"),
            v.literal("other")
        ),
        status: v.union(
            v.literal("open"),
            v.literal("pending"),
            v.literal("resolved"),
            v.literal("archived")
        ),
        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
        )),
        created_at: v.number(),
        updated_at: v.optional(v.number()),
    })
        .index("by_user", ["user_id"])
        .index("by_status", ["status"])
        .index("by_created_at", ["created_at"]),

    // Ticket Responses
    ticket_responses: defineTable({
        ticket_id: v.id("support_tickets"),
        user_id: v.string(),
        is_admin: v.boolean(),
        message: v.string(),
        created_at: v.number(),
    })
        .index("by_ticket", ["ticket_id"]),

    // Announcements (Enhanced)
    announcements: defineTable({
        title: v.string(),
        content: v.string(),
        is_active: v.boolean(),
        priority: v.optional(v.number()), // 1-10, higher = more important

        // NEW: Where to display
        display_location: v.optional(v.string()), // "landing", "dashboard", "both", "all"

        // NEW: How to display
        display_type: v.optional(v.string()), // "modal", "banner", "toast"

        // NEW: Category for filtering
        category: v.optional(v.string()), // "update", "maintenance", "feature", "promotion", "urgent"

        // NEW: Styling options
        theme: v.optional(v.string()), // "info", "warning", "success", "danger"

        // NEW: Call to action
        cta_text: v.optional(v.string()),
        cta_link: v.optional(v.string()),

        // Scheduling
        start_date: v.optional(v.number()),
        end_date: v.optional(v.number()),

        // Metadata
        created_by: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.optional(v.number()),
    })
        .index("by_active", ["is_active"])
        .index("by_location", ["display_location"])
        .index("by_created_at", ["created_at"]),
});
