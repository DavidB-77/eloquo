"use client";

import * as React from "react";
import { Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, Send, Loader2, Trash2, AlertTriangle, Archive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const STATUS_STYLES = {
    open: { bg: "bg-red-500/20", text: "text-red-400", label: "Open" },
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
    resolved: { bg: "bg-green-500/20", text: "text-green-400", label: "Resolved" },
};

export default function AdminSupportPage() {
    const [tickets, setTickets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedTicket, setSelectedTicket] = React.useState<any | null>(null);
    const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
    const [response, setResponse] = React.useState("");
    const [sendingResponse, setSendingResponse] = React.useState(false);
    const [ticketResponses, setTicketResponses] = React.useState<any[]>([]);
    const [loadingResponses, setLoadingResponses] = React.useState(false);

    // Delete state
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    // Archive state
    const [archiving, setArchiving] = React.useState(false);

    // Search and filter state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [ticketFilter, setTicketFilter] = React.useState<'active' | 'archived'>('active');

    // Bulk delete (flush) state
    const [showFlushModal, setShowFlushModal] = React.useState(false);
    const [flushStatus, setFlushStatus] = React.useState<'open' | 'pending' | 'resolved' | null>(null);
    const [flushConfirmText, setFlushConfirmText] = React.useState('');
    const [flushing, setFlushing] = React.useState(false);

    const supabase = createClient();

    const fetchTickets = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    React.useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    React.useEffect(() => {
        if (!selectedTicket) return;

        const fetchResponses = async () => {
            setLoadingResponses(true);
            const { data, error } = await supabase
                .from('ticket_responses')
                .select('*') // Sender info if needed (admin/user)
                .eq('ticket_id', selectedTicket.id)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setTicketResponses(data);
            }
            setLoadingResponses(false);
        };

        fetchResponses();
    }, [selectedTicket, supabase]);

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        // Optimistic update
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket((prev: any) => ({ ...prev, status: newStatus }));
        }

        const { error } = await supabase
            .from('support_tickets')
            .update({ status: newStatus })
            .eq('id', ticketId);

        if (error) {
            console.error("Error updating status:", error);
            fetchTickets(); // Revert on error
        }
    };

    const handleSendResponse = async () => {
        if (!selectedTicket || !response.trim()) return;
        setSendingResponse(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Insert response
            const { error: respError } = await supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: selectedTicket.id,
                    user_id: user.id,
                    message: response,
                    is_admin_reply: true
                });

            if (respError) throw respError;

            // 2. Update status to resolved (optional, or keeping as pending)
            // Let's set it to 'resolved' if it was open, or keep it as is? 
            // Usually responding means "Pending User Reply" or similar. Let's toggle to 'pending' if open.
            if (selectedTicket.status === 'open') {
                handleUpdateStatus(selectedTicket.id, 'pending');
            }

            setResponse("");
            // Refresh responses
            const { data: newResponses } = await supabase
                .from('ticket_responses')
                .select('*')
                .eq('ticket_id', selectedTicket.id)
                .order('created_at', { ascending: true });

            if (newResponses) setTicketResponses(newResponses);

        } catch (error) {
            console.error("Error sending response:", error);
        } finally {
            setSendingResponse(false);
        }
    };

    const handleDeleteTicket = async () => {
        if (!selectedTicket) return;
        setDeleting(true);

        try {
            // 1. Delete all responses first
            const { error: respError } = await supabase
                .from('ticket_responses')
                .delete()
                .eq('ticket_id', selectedTicket.id);

            if (respError) throw respError;

            // 2. Delete the ticket
            const { error: ticketError } = await supabase
                .from('support_tickets')
                .delete()
                .eq('id', selectedTicket.id);

            if (ticketError) throw ticketError;

            // Remove from local state and clear selection
            setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
            setSelectedTicket(null);
            setTicketResponses([]);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error("Error deleting ticket:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleArchiveTicket = async () => {
        if (!selectedTicket) return;
        setArchiving(true);

        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ archived: true })
                .eq('id', selectedTicket.id);

            if (error) throw error;

            // Update local state
            setTickets(prev => prev.map(t =>
                t.id === selectedTicket.id ? { ...t, archived: true } : t
            ));
            setSelectedTicket(null);
            setTicketResponses([]);
        } catch (error) {
            console.error("Error archiving ticket:", error);
        } finally {
            setArchiving(false);
        }
    };

    const handleFlushStatus = async () => {
        if (!flushStatus || flushConfirmText !== 'DELETE') return;
        setFlushing(true);

        try {
            // Get all ticket IDs matching the status (non-archived)
            const ticketsToDelete = tickets.filter(t => t.status === flushStatus && !t.archived);

            for (const ticket of ticketsToDelete) {
                // Delete responses first
                await supabase
                    .from('ticket_responses')
                    .delete()
                    .eq('ticket_id', ticket.id);

                // Delete ticket
                await supabase
                    .from('support_tickets')
                    .delete()
                    .eq('id', ticket.id);
            }

            // Update local state
            setTickets(prev => prev.filter(t => !(t.status === flushStatus && !t.archived)));

            // Clear selection if the selected ticket was deleted
            if (selectedTicket && selectedTicket.status === flushStatus && !selectedTicket.archived) {
                setSelectedTicket(null);
                setTicketResponses([]);
            }

            setShowFlushModal(false);
            setFlushStatus(null);
            setFlushConfirmText('');
        } catch (error) {
            console.error("Error flushing tickets:", error);
        } finally {
            setFlushing(false);
        }
    };

    const openFlushModal = (status: 'open' | 'pending' | 'resolved') => {
        setFlushStatus(status);
        setFlushConfirmText('');
        setShowFlushModal(true);
    };

    const stats = {
        open: tickets.filter((t) => t.status === "open" && !t.archived).length,
        pending: tickets.filter((t) => t.status === "pending" && !t.archived).length,
        resolved: tickets.filter((t) => t.status === "resolved" && !t.archived).length,
        archived: tickets.filter((t) => t.archived).length,
    };

    // Filter by active/archived first, then by status, then by search
    const filteredTickets = tickets
        .filter(t => ticketFilter === 'active' ? !t.archived : t.archived)
        .filter(t => !filterStatus || t.status === filterStatus)
        .filter(t => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                t.subject?.toLowerCase().includes(query) ||
                t.message?.toLowerCase().includes(query) ||
                t.id?.toLowerCase().includes(query) ||
                t.user_id?.toLowerCase().includes(query)
            );
        });

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                    {/* Clickable Open Counter */}
                    <button
                        onClick={() => stats.open > 0 && openFlushModal('open')}
                        disabled={stats.open === 0}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                            stats.open > 0
                                ? "hover:bg-red-500/20 cursor-pointer"
                                : "cursor-default opacity-60"
                        )}
                        title={stats.open > 0 ? "Click to flush all open tickets" : "No open tickets"}
                    >
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-white">{stats.open} Open</span>
                    </button>

                    {/* Clickable Pending Counter */}
                    <button
                        onClick={() => stats.pending > 0 && openFlushModal('pending')}
                        disabled={stats.pending === 0}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                            stats.pending > 0
                                ? "hover:bg-yellow-500/20 cursor-pointer"
                                : "cursor-default opacity-60"
                        )}
                        title={stats.pending > 0 ? "Click to flush all pending tickets" : "No pending tickets"}
                    >
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-white">{stats.pending} Pending</span>
                    </button>

                    {/* Clickable Resolved Counter */}
                    <button
                        onClick={() => stats.resolved > 0 && openFlushModal('resolved')}
                        disabled={stats.resolved === 0}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                            stats.resolved > 0
                                ? "hover:bg-green-500/20 cursor-pointer"
                                : "cursor-default opacity-60"
                        )}
                        title={stats.resolved > 0 ? "Click to flush all resolved tickets" : "No resolved tickets"}
                    >
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-white">{stats.resolved} Resolved</span>
                    </button>

                    {/* Non-clickable Archived Counter */}
                    <div className="flex items-center gap-2 px-3 py-1.5">
                        <Archive className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-white">{stats.archived} Archived</span>
                    </div>
                </div>
                {/* Active/Archived Toggle */}
                <div className="flex bg-black/30 rounded-lg p-0.5">
                    <button
                        onClick={() => setTicketFilter('active')}
                        className={cn(
                            "px-4 py-1.5 text-xs rounded-md transition-all font-medium",
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
                            "px-4 py-1.5 text-xs rounded-md transition-all font-medium",
                            ticketFilter === 'archived'
                                ? "bg-orange-500 text-black font-bold"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        Archived
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Tickets List - Scrollable */}
                <div className="lg:col-span-1 flex flex-col gap-4 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 overflow-hidden">
                    {/* Search Bar */}
                    <div className="relative flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tickets..."
                            className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-gray-500 h-10"
                        />
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                        <button
                            onClick={() => setFilterStatus(null)}
                            className={cn(
                                "px-3 py-1.5 text-xs rounded-lg transition-colors",
                                !filterStatus ? "bg-[#09B7B4] text-white" : "bg-midnight text-gray-400 border border-white/10"
                            )}
                        >
                            All
                        </button>
                        {["open", "pending", "resolved"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                                className={cn(
                                    "px-3 py-1.5 text-xs rounded-lg transition-colors capitalize",
                                    filterStatus === status
                                        ? "bg-[#09B7B4] text-white"
                                        : "bg-midnight text-gray-400 border border-white/10"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Ticket List */}
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-electric-cyan" />
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No tickets found</div>
                        ) : (
                            filteredTickets.map((ticket) => {
                                const borderColor = ticket.archived
                                    ? 'border-orange-500/50 hover:border-orange-500'
                                    : ticket.status === 'open'
                                        ? 'border-red-500/50 hover:border-red-500'
                                        : ticket.status === 'pending'
                                            ? 'border-yellow-500/50 hover:border-yellow-500'
                                            : ticket.status === 'resolved'
                                                ? 'border-green-500/50 hover:border-green-500'
                                                : 'border-white/5 hover:border-white/20';
                                return (
                                    <button
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all",
                                            selectedTicket?.id === ticket.id
                                                ? "bg-[#09B7B4]/10 border-[#09B7B4]"
                                                : `bg-[#111] ${borderColor}`,
                                            ticket.archived && "opacity-75"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-sm font-medium text-white">#{ticket.id.slice(0, 8)}</span>
                                            <span
                                                className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full capitalize",
                                                    ticket.archived
                                                        ? "bg-orange-500/20 text-orange-400"
                                                        : STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.bg || "bg-gray-500/20",
                                                    !ticket.archived && (STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES]?.text || "text-gray-400")
                                                )}
                                            >
                                                {ticket.archived ? 'Archived' : ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white mb-1 line-clamp-1">{ticket.subject}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                        </p>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Ticket Detail */}
                <div className="lg:col-span-2 flex flex-col bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b border-white/10 bg-midnight/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                                        <p className="text-sm text-gray-400">
                                            From: {selectedTicket.profiles?.full_name || selectedTicket.profiles?.display_name || 'User'}
                                            <span className="text-gray-600 ml-1">&lt;{selectedTicket.profiles?.email}&gt;</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Created {new Date(selectedTicket.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                                            className="text-xs bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-gray-300 focus:outline-none focus:border-electric-cyan capitalize"
                                        >
                                            <option value="open">Open</option>
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleArchiveTicket}
                                            disabled={archiving || selectedTicket.archived}
                                            className="text-gray-400 hover:text-orange-400 hover:bg-orange-500/10"
                                        >
                                            {archiving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Archive className="h-4 w-4" />
                                            )}
                                            <span className="ml-1.5">{selectedTicket.archived ? 'Archived' : 'Archive'}</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="ml-1.5">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                                {/* Original Message */}
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-white">U</span>
                                    </div>
                                    <div className="bg-[#111] rounded-2xl rounded-tl-sm p-4 border border-white/5 max-w-[85%]">
                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                                    </div>
                                </div>

                                {/* Responses */}
                                {loadingResponses ? (
                                    <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-gray-500" /></div>
                                ) : (
                                    ticketResponses.map((resp) => (
                                        <div key={resp.id} className={cn("flex gap-4", resp.is_admin_reply ? "flex-row-reverse" : "")}>
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                resp.is_admin_reply ? "bg-electric-cyan text-black" : "bg-white/10 text-white"
                                            )}>
                                                <span className="text-xs font-bold">{resp.is_admin_reply ? "A" : "U"}</span>
                                            </div>
                                            <div className={cn(
                                                "rounded-2xl p-4 border max-w-[85%]",
                                                resp.is_admin_reply
                                                    ? "bg-[#09B7B4]/10 border-[#09B7B4]/20 rounded-tr-sm text-right"
                                                    : "bg-[#111] border-white/5 rounded-tl-sm"
                                            )}>
                                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap text-left">{resp.message}</p>
                                                <p className="text-[10px] text-gray-500 mt-2">{formatDistanceToNow(new Date(resp.created_at))} ago</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-midnight/50">
                                <div className="space-y-3">
                                    <Textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Type your response..."
                                        rows={3}
                                        className="bg-[#111] border-white/10 text-white placeholder:text-gray-500 resize-none focus:border-electric-cyan transition-colors"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white"
                                            onClick={handleSendResponse}
                                            disabled={sendingResponse || !response.trim()}
                                            isLoading={sendingResponse}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Response
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                            <MessageSquare className="h-16 w-16 text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-1">No Selection</h3>
                            <p className="text-gray-400">Select a ticket from the list to view conversations</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="bg-midnight border-red-500/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Ticket Permanently
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the ticket
                            <span className="text-white font-medium"> "{selectedTicket?.subject}"</span> and all
                            {ticketResponses.length > 0 ? ` ${ticketResponses.length} ` : ' '}
                            associated responses.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteTicket}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Permanently
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Flush Status Confirmation Dialog */}
            <Dialog open={showFlushModal} onOpenChange={(open) => {
                if (!open) {
                    setShowFlushModal(false);
                    setFlushStatus(null);
                    setFlushConfirmText('');
                }
            }}>
                <DialogContent className="bg-midnight border-red-500/30 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Flush All {flushStatus?.charAt(0).toUpperCase()}{flushStatus?.slice(1)} Tickets
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            This will <span className="text-red-400 font-bold">permanently delete</span> all
                            <span className="text-white font-medium"> {flushStatus && stats[flushStatus]} {flushStatus}</span> tickets
                            and their responses. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <p className="text-sm text-gray-300">
                            Type <span className="font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">DELETE</span> to confirm:
                        </p>
                        <Input
                            value={flushConfirmText}
                            onChange={(e) => setFlushConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="bg-black/30 border-red-500/30 text-white font-mono"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowFlushModal(false);
                                setFlushStatus(null);
                                setFlushConfirmText('');
                            }}
                            disabled={flushing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFlushStatus}
                            disabled={flushing || flushConfirmText !== 'DELETE'}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        >
                            {flushing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete {flushStatus && stats[flushStatus]} Tickets
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
