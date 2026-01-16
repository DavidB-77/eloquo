"use client";

import * as React from "react";
import { Plus, MessageSquare, Send, Loader2, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const STATUS_STYLES = {
    open: { bg: "bg-red-500/20", text: "text-red-400", label: "Open" },
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
    resolved: { bg: "bg-green-500/20", text: "text-green-400", label: "Resolved" },
    archived: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Archived" },
};

export default function UserSupportPage() {
    const [selectedTicketId, setSelectedTicketId] = React.useState<Id<"support_tickets"> | null>(null);
    const [ticketFilter, setTicketFilter] = React.useState<'active' | 'archived'>('active');

    // Convex queries
    const tickets = useQuery(api.support.getMyTickets) || [];
    const ticketWithResponses = useQuery(
        api.support.getTicketWithResponses,
        selectedTicketId ? { ticketId: selectedTicketId } : "skip"
    );

    // Convex mutations
    const createTicket = useMutation(api.support.createTicket);
    const addResponse = useMutation(api.support.addResponse);

    // New Ticket State
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [newSubject, setNewSubject] = React.useState("");
    const [newMessage, setNewMessage] = React.useState("");
    const [newCategory, setNewCategory] = React.useState<"bug" | "feature" | "question" | "feedback" | "other">("question");
    const [creating, setCreating] = React.useState(false);

    // Reply State
    const [replyUser, setReplyUser] = React.useState("");
    const [sendingReply, setSendingReply] = React.useState(false);

    const selectedTicket = ticketWithResponses?.ticket;
    const responses = ticketWithResponses?.responses || [];

    const handleCreateTicket = async () => {
        if (!newSubject.trim() || !newMessage.trim()) return;
        setCreating(true);

        try {
            await createTicket({
                subject: newSubject,
                message: newMessage,
                category: newCategory,
            });

            setNewSubject("");
            setNewMessage("");
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Error creating ticket:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleSendReply = async () => {
        if (!selectedTicketId || !replyUser.trim()) return;
        setSendingReply(true);

        try {
            await addResponse({
                ticketId: selectedTicketId,
                message: replyUser,
            });

            setReplyUser("");
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setSendingReply(false);
        }
    };

    // Filter tickets client-side
    const filteredTickets = tickets.filter(t =>
        ticketFilter === 'active' ? t.status !== 'archived' : t.status === 'archived'
    );

    const loading = tickets === undefined;

    return (
        <div className="space-y-6 max-h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-wide">Support Console</h1>
                    <p className="text-gray-400 text-sm">Manage your support requests and get help.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-midnight border-electric-cyan/20 text-white">
                        <DialogHeader>
                            <DialogTitle>Create Support Ticket</DialogTitle>
                            <DialogDescription>Describe your issue and we'll help you resolve it.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                    className="bg-black/20 border-white/10"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                                    className="bg-black/20 border-white/10"
                                >
                                    <option value="question">Question</option>
                                    <option value="bug">Bug Report</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="other">Other</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="bg-black/20 border-white/10 min-h-[100px]"
                                    placeholder="Detailed description..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleCreateTicket}
                                disabled={creating || !newSubject || !newMessage}
                                isLoading={creating}
                                className="bg-[#09B7B4] text-white"
                            >
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
                {/* Lists */}
                <div className="lg:col-span-1 bg-midnight/30 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white text-sm">My Tickets</h3>
                            <div className="flex bg-black/30 rounded-lg p-0.5">
                                <button
                                    onClick={() => setTicketFilter('active')}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded-md transition-all",
                                        ticketFilter === 'active'
                                            ? "bg-electric-cyan text-black font-bold"
                                            : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setTicketFilter('archived')}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded-md transition-all",
                                        ticketFilter === 'archived'
                                            ? "bg-orange-500 text-black font-bold"
                                            : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Archived
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-electric-cyan" /></div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                {ticketFilter === 'active' ? 'No active tickets' : 'No archived tickets'}
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
                                            : ticket.status === 'archived'
                                                ? "bg-[#111] border-orange-500/50 hover:border-orange-500"
                                                : "bg-[#111] border-white/5 hover:border-white/20",
                                        ticket.status === 'archived' && "opacity-75"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                                            STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.bg,
                                            STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.text
                                        )}>
                                            {STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.label || ticket.status}
                                        </div>
                                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(ticket.created_at))} ago</span>
                                    </div>
                                    <h4 className="text-sm font-medium text-white line-clamp-1 mb-1">{ticket.subject}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-1">#{ticket._id.slice(0, 8)}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 bg-midnight/30 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-1">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>#{selectedTicket._id}</span>
                                        <span>•</span>
                                        <span className="capitalize">{selectedTicket.category}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                    STATUS_STYLES[selectedTicket.status as keyof typeof STATUS_STYLES]?.bg,
                                    STATUS_STYLES[selectedTicket.status as keyof typeof STATUS_STYLES]?.text
                                )}>
                                    {selectedTicket.status}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                                {/* Original Message */}
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="h-8 w-8 rounded-full bg-electric-cyan/20 text-electric-cyan flex items-center justify-center flex-shrink-0 font-bold text-xs ring-1 ring-electric-cyan/50">
                                        ME
                                    </div>
                                    <div className="bg-[#09B7B4]/10 border border-[#09B7B4]/20 rounded-2xl rounded-tr-sm p-4 max-w-[85%] text-right text-sm text-gray-200">
                                        <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                                    </div>
                                </div>

                                {/* Responses */}
                                {responses.map(resp => (
                                    <div key={resp._id} className={cn("flex gap-4", !resp.is_admin ? "flex-row-reverse" : "")}>
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ring-1",
                                            !resp.is_admin
                                                ? "bg-electric-cyan/20 text-electric-cyan ring-electric-cyan/50"
                                                : "bg-purple-500/20 text-purple-400 ring-purple-500/50"
                                        )}>
                                            {!resp.is_admin ? "ME" : "SUP"}
                                        </div>
                                        <div className={cn(
                                            "rounded-2xl p-4 max-w-[85%] text-sm border",
                                            !resp.is_admin
                                                ? "bg-[#09B7B4]/10 border-[#09B7B4]/20 rounded-tr-sm text-right text-gray-200"
                                                : "bg-[#111] border-white/10 rounded-tl-sm text-left text-gray-300"
                                        )}>
                                            <p className="whitespace-pre-wrap">{resp.message}</p>
                                            <p className="text-[10px] opacity-50 mt-2">{formatDistanceToNow(new Date(resp.created_at))} ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/5">
                                {selectedTicket.status === 'archived' ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500">
                                            <Archive className="h-4 w-4 inline mr-2" />
                                            This ticket is archived and read-only.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={replyUser}
                                            onChange={e => setReplyUser(e.target.value)}
                                            placeholder="Type a reply..."
                                            className="bg-black/20 border-white/10 focus:border-electric-cyan resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleSendReply}
                                                disabled={sendingReply || !replyUser.trim()}
                                                isLoading={sendingReply}
                                                className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                            <p>Select a ticket to view conversation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
