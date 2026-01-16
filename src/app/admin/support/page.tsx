"use client";

import * as React from "react";
import { Search, MessageSquare, Send, Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const STATUS_STYLES = {
    open: { bg: "bg-red-500/20", text: "text-red-400", label: "Open" },
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
    resolved: { bg: "bg-green-500/20", text: "text-green-400", label: "Resolved" },
    archived: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Archived" },
};

const CATEGORY_STYLES = {
    bug: { bg: "bg-red-500/20", text: "text-red-400" },
    feature: { bg: "bg-purple-500/20", text: "text-purple-400" },
    question: { bg: "bg-blue-500/20", text: "text-blue-400" },
    feedback: { bg: "bg-green-500/20", text: "text-green-400" },
    other: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

type StatusFilter = "open" | "pending" | "resolved" | "archived" | null;

export default function AdminSupportPage() {
    const [selectedTicketId, setSelectedTicketId] = React.useState<Id<"support_tickets"> | null>(null);
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [replyMessage, setReplyMessage] = React.useState("");
    const [sendingReply, setSendingReply] = React.useState(false);

    // Convex queries
    const tickets = useQuery(api.support.getAllTickets, statusFilter ? { status: statusFilter } : {}) || [];
    const ticketWithResponses = useQuery(
        api.support.getTicketWithResponses,
        selectedTicketId ? { ticketId: selectedTicketId } : "skip"
    );

    // Convex mutations
    const updateStatus = useMutation(api.support.updateTicketStatus);
    const adminReply = useMutation(api.support.adminReply);

    const selectedTicket = ticketWithResponses?.ticket;
    const responses = ticketWithResponses?.responses || [];

    // Filter by search
    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendReply = async () => {
        if (!selectedTicketId || !replyMessage.trim()) return;
        setSendingReply(true);

        try {
            await adminReply({
                ticketId: selectedTicketId,
                message: replyMessage,
                markAsPending: true,
            });
            setReplyMessage("");
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setSendingReply(false);
        }
    };

    const handleStatusChange = async (ticketId: Id<"support_tickets">, newStatus: "open" | "pending" | "resolved" | "archived") => {
        try {
            await updateStatus({ ticketId, status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const loading = tickets === undefined;

    // Count tickets by status
    const statusCounts = React.useMemo(() => {
        if (!tickets) return { open: 0, pending: 0, resolved: 0, archived: 0 };
        return {
            open: tickets.filter(t => t.status === "open").length,
            pending: tickets.filter(t => t.status === "pending").length,
            resolved: tickets.filter(t => t.status === "resolved").length,
            archived: tickets.filter(t => t.status === "archived").length,
        };
    }, [tickets]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-wide">Support</h1>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={statusFilter === null ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(null)}
                    className={statusFilter === null ? "bg-electric-cyan text-black" : ""}
                >
                    All
                </Button>
                {(["open", "pending", "resolved", "archived"] as const).map(status => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            statusFilter === status && STATUS_STYLES[status].bg,
                            statusFilter === status && STATUS_STYLES[status].text
                        )}
                    >
                        {statusCounts[status]} {STATUS_STYLES[status].label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
                {/* Tickets List */}
                <div className="lg:col-span-1 bg-midnight/30 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tickets..."
                                className="pl-9 bg-black/20 border-white/10"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-electric-cyan" />
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                No tickets found
                            </div>
                        ) : (
                            filteredTickets.map(ticket => (
                                <button
                                    key={ticket._id}
                                    onClick={() => setSelectedTicketId(ticket._id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-lg border transition-all",
                                        selectedTicketId === ticket._id
                                            ? "bg-[#09B7B4]/10 border-[#09B7B4]"
                                            : "bg-[#111] border-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-2">
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                                                STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.bg,
                                                STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.text
                                            )}>
                                                {ticket.status}
                                            </span>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full",
                                                CATEGORY_STYLES[ticket.category as keyof typeof CATEGORY_STYLES]?.bg,
                                                CATEGORY_STYLES[ticket.category as keyof typeof CATEGORY_STYLES]?.text
                                            )}>
                                                {ticket.category}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(ticket.created_at))} ago
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-medium text-white line-clamp-1 mb-1">{ticket.subject}</h4>
                                    <p className="text-xs text-gray-400">{ticket.user_email}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="lg:col-span-2 bg-midnight/30 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b border-white/10 bg-white/5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-1">{selectedTicket.subject}</h2>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{selectedTicket.user_email}</span>
                                            <span>•</span>
                                            <span className="capitalize">{selectedTicket.category}</span>
                                            <span>•</span>
                                            <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value as any)}
                                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                        >
                                            <option value="open">Open</option>
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                                {/* Original Message */}
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                                        U
                                    </div>
                                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 max-w-[85%]">
                                        <div className="text-xs text-gray-400 mb-2">{selectedTicket.user_email}</div>
                                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{selectedTicket.message}</p>
                                    </div>
                                </div>

                                {/* Responses */}
                                {responses.map(resp => (
                                    <div key={resp._id} className={cn("flex gap-4", resp.is_admin ? "flex-row-reverse" : "")}>
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs",
                                            resp.is_admin
                                                ? "bg-purple-500/20 text-purple-400"
                                                : "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {resp.is_admin ? "A" : "U"}
                                        </div>
                                        <div className={cn(
                                            "rounded-xl p-4 max-w-[85%] border",
                                            resp.is_admin
                                                ? "bg-purple-500/10 border-purple-500/20"
                                                : "bg-[#111] border-white/10"
                                        )}>
                                            <p className="text-sm text-gray-200 whitespace-pre-wrap">{resp.message}</p>
                                            <p className="text-[10px] text-gray-500 mt-2">
                                                {formatDistanceToNow(new Date(resp.created_at))} ago
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            {selectedTicket.status !== 'archived' && (
                                <div className="p-4 border-t border-white/10 bg-white/5">
                                    <Textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your response..."
                                        className="bg-black/20 border-white/10 mb-3"
                                        rows={3}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSendReply}
                                            disabled={sendingReply || !replyMessage.trim()}
                                            isLoading={sendingReply}
                                            className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Reply
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                            <p>No selection</p>
                            <p className="text-sm">Select a ticket from the list to view submission details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
