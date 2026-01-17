// Announcements - Convex Functions

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get active announcements (for all users)
 */
export const getActiveAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        const announcements = await ctx.db
            .query("announcements")
            .withIndex("by_active", (q) => q.eq("is_active", true))
            .order("desc")
            .collect();

        // Filter by date range if set
        return announcements.filter((a) => {
            if (a.start_date && a.start_date > now) return false;
            if (a.end_date && a.end_date < now) return false;
            return true;
        });
    },
});

/**
 * Get all announcements (admin)
 */
export const getAllAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Verify admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile?.is_admin) return [];

        return await ctx.db
            .query("announcements")
            .order("desc")
            .collect();
    },
});

/**
 * Create announcement (admin)
 */
export const createAnnouncement = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        is_active: v.boolean(),
        priority: v.optional(v.number()),
        display_location: v.optional(v.string()), // "landing", "dashboard", "both", "all"
        display_type: v.optional(v.string()), // "modal", "banner", "toast"
        category: v.optional(v.string()), // "update", "maintenance", "feature", "promotion", "urgent"
        theme: v.optional(v.string()), // "info", "warning", "success", "danger"
        dismiss_behavior: v.optional(v.string()), // "once", "session", "always"
        cta_text: v.optional(v.string()),
        cta_link: v.optional(v.string()),
        start_date: v.optional(v.number()),
        end_date: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Verify admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile?.is_admin) throw new Error("Admin only");

        return await ctx.db.insert("announcements", {
            title: args.title,
            content: args.content,
            is_active: args.is_active,
            priority: args.priority ?? 5,
            display_location: args.display_location ?? "both",
            display_type: args.display_type ?? "modal",
            category: args.category ?? "update",
            theme: args.theme ?? "info",
            dismiss_behavior: args.dismiss_behavior ?? "once",
            cta_text: args.cta_text,
            cta_link: args.cta_link,
            start_date: args.start_date,
            end_date: args.end_date,
            created_by: identity.subject,
            created_at: Date.now(),
        });
    },
});

/**
 * Update announcement (admin)
 */
export const updateAnnouncement = mutation({
    args: {
        id: v.id("announcements"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        is_active: v.optional(v.boolean()),
        priority: v.optional(v.number()),
        display_location: v.optional(v.string()),
        display_type: v.optional(v.string()),
        category: v.optional(v.string()),
        theme: v.optional(v.string()),
        dismiss_behavior: v.optional(v.string()),
        cta_text: v.optional(v.string()),
        cta_link: v.optional(v.string()),
        start_date: v.optional(v.number()),
        end_date: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Verify admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile?.is_admin) throw new Error("Admin only");

        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updated_at: Date.now(),
        });
    },
});

/**
 * Delete announcement (admin)
 */
export const deleteAnnouncement = mutation({
    args: { id: v.id("announcements") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Verify admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile?.is_admin) throw new Error("Admin only");

        await ctx.db.delete(args.id);
    },
});
