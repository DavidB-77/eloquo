// Support Tickets - Convex Functions

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================== USER FUNCTIONS ====================

/**
 * Create a new support ticket
 */
export const createTicket = mutation({
    args: {
        subject: v.string(),
        message: v.string(),
        category: v.union(
            v.literal("bug"),
            v.literal("feature"),
            v.literal("question"),
            v.literal("feedback"),
            v.literal("other")
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const ticketId = await ctx.db.insert("support_tickets", {
            user_id: identity.subject,
            user_email: identity.email || "unknown",
            subject: args.subject,
            message: args.message,
            category: args.category,
            status: "open",
            priority: "medium",
            created_at: Date.now(),
        });

        return ticketId;
    },
});

/**
 * Get user's tickets
 */
export const getMyTickets = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("support_tickets")
            .withIndex("by_user", (q) => q.eq("user_id", identity.subject))
            .order("desc")
            .collect();
    },
});

/**
 * Count user's tickets with unread admin responses
 */
export const countUnreadResponses = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        // Get user's tickets
        const tickets = await ctx.db
            .query("support_tickets")
            .withIndex("by_user", (q) => q.eq("user_id", identity.subject))
            .collect();

        let unreadCount = 0;
        for (const ticket of tickets) {
            // Get last admin response
            const responses = await ctx.db
                .query("ticket_responses")
                .withIndex("by_ticket", (q) => q.eq("ticket_id", ticket._id))
                .order("desc")
                .collect();

            // If the last response is from admin and newer than user's last view, count as unread
            const lastResponse = responses[0];
            if (lastResponse && lastResponse.is_admin) {
                // Check if user has responded after this
                const userResponses = responses.filter(r => !r.is_admin);
                if (userResponses.length === 0 || userResponses[0].created_at < lastResponse.created_at) {
                    unreadCount++;
                }
            }
        }

        return unreadCount;
    },
});

/**
 * Get ticket with responses
 */
export const getTicketWithResponses = query({
    args: { ticketId: v.id("support_tickets") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const ticket = await ctx.db.get(args.ticketId);
        if (!ticket) return null;

        // Check ownership or admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        const isAdmin = profile?.is_admin ?? false;
        if (ticket.user_id !== identity.subject && !isAdmin) {
            throw new Error("Unauthorized");
        }

        const responses = await ctx.db
            .query("ticket_responses")
            .withIndex("by_ticket", (q) => q.eq("ticket_id", args.ticketId))
            .collect();

        return { ticket, responses };
    },
});

/**
 * Add response to ticket (user)
 */
export const addResponse = mutation({
    args: {
        ticketId: v.id("support_tickets"),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const ticket = await ctx.db.get(args.ticketId);
        if (!ticket) throw new Error("Ticket not found");

        // Check ownership or admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        const isAdmin = profile?.is_admin ?? false;
        if (ticket.user_id !== identity.subject && !isAdmin) {
            throw new Error("Unauthorized");
        }

        await ctx.db.insert("ticket_responses", {
            ticket_id: args.ticketId,
            user_id: identity.subject,
            is_admin: isAdmin,
            message: args.message,
            created_at: Date.now(),
        });

        // Update ticket status if pending and user responds
        if (ticket.status === "pending" && !isAdmin) {
            await ctx.db.patch(args.ticketId, {
                status: "open",
                updated_at: Date.now(),
            });
        }
    },
});

// ==================== ADMIN FUNCTIONS ====================

/**
 * Get all tickets (admin)
 */
export const getAllTickets = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Verify admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile?.is_admin) return [];

        let tickets;
        if (args.status) {
            tickets = await ctx.db
                .query("support_tickets")
                .withIndex("by_status", (q) => q.eq("status", args.status as "open" | "pending" | "resolved" | "archived"))
                .order("desc")
                .collect();
        } else {
            tickets = await ctx.db
                .query("support_tickets")
                .order("desc")
                .collect();
        }

        return tickets;
    },
});

/**
 * Count open tickets for admin (tickets needing attention)
 */
export const countOpenTickets = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        // Verify admin
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile?.is_admin) return 0;

        const openTickets = await ctx.db
            .query("support_tickets")
            .withIndex("by_status", (q) => q.eq("status", "open"))
            .collect();

        return openTickets.length;
    },
});

/**
 * Update ticket status (admin)
 */
export const updateTicketStatus = mutation({
    args: {
        ticketId: v.id("support_tickets"),
        status: v.union(
            v.literal("open"),
            v.literal("pending"),
            v.literal("resolved"),
            v.literal("archived")
        ),
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

        await ctx.db.patch(args.ticketId, {
            status: args.status,
            updated_at: Date.now(),
        });
    },
});

/**
 * Admin reply to ticket
 */
export const adminReply = mutation({
    args: {
        ticketId: v.id("support_tickets"),
        message: v.string(),
        markAsPending: v.optional(v.boolean()),
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

        await ctx.db.insert("ticket_responses", {
            ticket_id: args.ticketId,
            user_id: identity.subject,
            is_admin: true,
            message: args.message,
            created_at: Date.now(),
        });

        if (args.markAsPending) {
            await ctx.db.patch(args.ticketId, {
                status: "pending",
                updated_at: Date.now(),
            });
        }
    },
});
