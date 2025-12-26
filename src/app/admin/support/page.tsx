"use client";

import * as React from "react";
import { Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_TICKETS = [
    {
        id: "127",
        date: "Dec 26, 2025",
        name: "John Smith",
        email: "john@example.com",
        subject: "Can't login to my account",
        message: "I've been trying to log in for the past hour but keep getting an error. I've tried resetting my password twice but nothing works. Please help!",
        priority: "high",
        status: "open",
    },
    {
        id: "126",
        date: "Dec 25, 2025",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        subject: "Question about Team plan",
        message: "Hi, I'm considering upgrading to the Team plan. Can you tell me more about the shared prompt library feature?",
        priority: "normal",
        status: "pending",
    },
    {
        id: "125",
        date: "Dec 24, 2025",
        name: "Mike Chen",
        email: "mike@startup.io",
        subject: "Feature request: API access",
        message: "Would love to see API access for Pro users as well. Happy to pay a bit extra for it.",
        priority: "low",
        status: "resolved",
    },
    {
        id: "124",
        date: "Dec 23, 2025",
        name: "Emma Davis",
        email: "emma@corp.com",
        subject: "Billing issue",
        message: "I was charged twice for my subscription this month. Can you please look into this?",
        priority: "high",
        status: "resolved",
    },
];

const STATUS_STYLES = {
    open: { bg: "bg-red-500/20", text: "text-red-400", label: "Open" },
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
    resolved: { bg: "bg-green-500/20", text: "text-green-400", label: "Resolved" },
};

const PRIORITY_STYLES = {
    high: { bg: "bg-red-500/10", text: "text-red-400", label: "High" },
    normal: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Normal" },
    low: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Low" },
};

export default function AdminSupportPage() {
    const [selectedTicket, setSelectedTicket] = React.useState<typeof MOCK_TICKETS[0] | null>(null);
    const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
    const [response, setResponse] = React.useState("");

    const stats = {
        open: MOCK_TICKETS.filter((t) => t.status === "open").length,
        pending: MOCK_TICKETS.filter((t) => t.status === "pending").length,
        resolved: MOCK_TICKETS.filter((t) => t.status === "resolved").length,
    };

    const filteredTickets = filterStatus
        ? MOCK_TICKETS.filter((t) => t.status === filterStatus)
        : MOCK_TICKETS;

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="flex items-center gap-6 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-white">{stats.open} Open</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-white">{stats.pending} Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white">{stats.resolved} Resolved This Week</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Filters */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus(null)}
                            className={cn(
                                "px-3 py-1.5 text-xs rounded-lg transition-colors",
                                !filterStatus ? "bg-[#09B7B4] text-white" : "bg-[#1a1a1a] text-gray-400 border border-white/10"
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
                                        : "bg-[#1a1a1a] text-gray-400 border border-white/10"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Ticket List */}
                    <div className="space-y-2">
                        {filteredTickets.map((ticket) => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all",
                                    selectedTicket?.id === ticket.id
                                        ? "bg-[#09B7B4]/10 border-[#09B7B4]"
                                        : "bg-[#1a1a1a] border-white/10 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm font-medium text-white">#{ticket.id}</span>
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES].bg,
                                            STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES].text
                                        )}
                                    >
                                        {STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES].label}
                                    </span>
                                </div>
                                <p className="text-sm text-white mb-1 line-clamp-1">{ticket.subject}</p>
                                <p className="text-xs text-gray-500">
                                    {ticket.name} • {ticket.date}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ticket Detail */}
                <div className="lg:col-span-2">
                    {selectedTicket ? (
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                                    <p className="text-sm text-gray-500">
                                        From: {selectedTicket.name} ({selectedTicket.email})
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedTicket.date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedTicket.priority}
                                        className="text-xs bg-[#111] border border-white/10 rounded-lg px-2 py-1 text-gray-300"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="normal">Normal Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                    <select
                                        value={selectedTicket.status}
                                        className="text-xs bg-[#111] border border-white/10 rounded-lg px-2 py-1 text-gray-300"
                                    >
                                        <option value="open">Open</option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="bg-[#111] rounded-lg p-4 border border-white/5">
                                <p className="text-sm text-gray-300 leading-relaxed">{selectedTicket.message}</p>
                            </div>

                            {/* Response */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Your Response</label>
                                <Textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Type your response..."
                                    rows={4}
                                    className="bg-[#111] border-white/10 text-white placeholder:text-gray-500"
                                />
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                        Save Draft
                                    </Button>
                                    <Button className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Response
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-12 w-12 text-gray-600 mb-4" />
                            <p className="text-gray-400">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
