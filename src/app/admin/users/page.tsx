"use client";

import * as React from "react";
import { Search, Filter, Download, MoreHorizontal, Eye, Pencil, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_USERS = [
    {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        plan: "Pro",
        signedUp: "Dec 15, 2025",
        lastActive: "2 hours ago",
        optimizations: 342,
        status: "active",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@techinc.com",
        plan: "Team",
        signedUp: "Dec 10, 2025",
        lastActive: "1 day ago",
        optimizations: 156,
        status: "active",
    },
    {
        id: "3",
        name: "Mike Chen",
        email: "mike@startup.io",
        plan: "Pro",
        signedUp: "Dec 5, 2025",
        lastActive: "3 days ago",
        optimizations: 89,
        status: "active",
    },
    {
        id: "4",
        name: "Emily Brown",
        email: "emily@company.com",
        plan: "Free",
        signedUp: "Nov 28, 2025",
        lastActive: "1 week ago",
        optimizations: 12,
        status: "active",
    },
    {
        id: "5",
        name: "Alex Wilson",
        email: "alex@agency.co",
        plan: "Enterprise",
        signedUp: "Nov 15, 2025",
        lastActive: "Just now",
        optimizations: 1284,
        status: "active",
    },
    {
        id: "6",
        name: "Test User",
        email: "test@test.com",
        plan: "Free",
        signedUp: "Oct 1, 2025",
        lastActive: "30 days ago",
        optimizations: 0,
        status: "suspended",
    },
];

const PLAN_STYLES: Record<string, string> = {
    Free: "bg-gray-500/20 text-gray-400",
    Pro: "bg-[#09B7B4]/20 text-[#09B7B4]",
    Team: "bg-purple-500/20 text-purple-400",
    Enterprise: "bg-orange-500/20 text-orange-400",
};

export default function AdminUsersPage() {
    const [search, setSearch] = React.useState("");
    const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

    const filteredUsers = MOCK_USERS.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesPlan = !selectedPlan || user.plan === selectedPlan;
        return matchesSearch && matchesPlan;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400">
                        Manage all {MOCK_USERS.length} registered users
                    </p>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
                    />
                </div>
                <div className="flex gap-2">
                    {["Free", "Pro", "Team", "Enterprise"].map((plan) => (
                        <button
                            key={plan}
                            onClick={() => setSelectedPlan(selectedPlan === plan ? null : plan)}
                            className={cn(
                                "px-3 py-2 text-sm rounded-lg border transition-colors",
                                selectedPlan === plan
                                    ? "border-[#09B7B4] bg-[#09B7B4]/10 text-[#09B7B4]"
                                    : "border-white/10 text-gray-400 hover:border-white/20"
                            )}
                        >
                            {plan}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                User
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                Plan
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                Signed Up
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                Last Active
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                Optimizations
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                Status
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full",
                                            PLAN_STYLES[user.plan]
                                        )}
                                    >
                                        {user.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {user.signedUp}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {user.lastActive}
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-white">
                                    {user.optimizations.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full",
                                            user.status === "active"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                        )}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                        {activeMenu === user.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-[#222] border border-white/10 rounded-lg shadow-xl z-10">
                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                                                    <Eye className="h-4 w-4" /> View Details
                                                </button>
                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                                                    <Pencil className="h-4 w-4" /> Edit User
                                                </button>
                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-white/5">
                                                    <Ban className="h-4 w-4" /> Suspend
                                                </button>
                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5">
                                                    <Trash2 className="h-4 w-4" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {MOCK_USERS.length} users
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="border-white/20 text-gray-500">
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
