"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Search, Download, MoreHorizontal, Eye, Pencil, Ban, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface UserProfile {
    _id: string;
    userId: string;
    email: string;
    full_name?: string;
    display_name?: string;
    subscription_tier: "free" | "basic" | "pro" | "business" | "enterprise";
    subscription_status?: string;
    created_at: number;
    last_sign_in_at?: string;
    optimizations_used: number;
    optimizations_remaining: number;
    is_founding_member: boolean;
    founding_wave?: number;
    is_admin: boolean;
}

const PLAN_STYLES: Record<string, string> = {
    free: "bg-gray-500/20 text-gray-400",
    basic: "bg-blue-500/20 text-blue-400",
    pro: "bg-[#09B7B4]/20 text-[#09B7B4]",
    business: "bg-orange-500/20 text-orange-400",
    enterprise: "bg-purple-500/20 text-purple-400",
};

export default function AdminUsersPage() {
    const [search, setSearch] = React.useState("");
    const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

    // Convex Data
    const usersRaw = useQuery(api.profiles.getAllProfiles);
    const updateAdminStatus = useMutation(api.profiles.updateAdminStatus);

    const loading = usersRaw === undefined;

    const users = (usersRaw || []) as UserProfile[];

    const filteredUsers = users.filter((user) => {
        const name = user.full_name || user.display_name || "Unknown";
        const email = user.email || "";
        const matchesSearch =
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase());

        const userPlan = user.subscription_tier || "free";
        const matchesPlan = !selectedPlan || userPlan.toLowerCase() === selectedPlan.toLowerCase();

        return matchesSearch && matchesPlan;
    });

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const handleResetFreeTier = async (userId: string) => {
        // Placeholder for future reset logic if needed in Convex
        console.log("Reset free tier for", userId);
    };

    const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
        try {
            await updateAdminStatus({ userId, isAdmin: !currentStatus });
        } catch (err) {
            console.error("Failed to toggle admin status:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
                    <p className="text-gray-400 text-sm">
                        Manage all {users.length} registered users
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-electric-cyan/50"
                    />
                </div>
                <div className="flex gap-2">
                    {["free", "basic", "pro", "business", "enterprise"].map((plan) => (
                        <button
                            key={plan}
                            onClick={() => setSelectedPlan(selectedPlan === plan ? null : plan)}
                            className={cn(
                                "px-3 py-2 text-sm rounded-lg border transition-colors capitalize",
                                selectedPlan === plan
                                    ? "border-[#09B7B4] bg-[#09B7B4]/10 text-[#09B7B4]"
                                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                            )}
                        >
                            {plan}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-electric-cyan" />
                        <p>Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <Search className="h-8 w-8 mb-4 opacity-20" />
                        <p>No users found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">User</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Plan</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Usage</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Founding</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Signed Up</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Optimizations</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => {
                                    const planKey = user.subscription_tier || "free";
                                    const planStyle = PLAN_STYLES[planKey] || PLAN_STYLES["free"];

                                    return (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{user.full_name || user.display_name || user.email?.split('@')[0] || "Unknown User"}</p>
                                                    <p className="text-xs text-gray-500">{user.email || "No email"}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", planStyle)}>
                                                    {user.subscription_tier || "free"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {(!user.subscription_tier || user.subscription_tier === 'free') ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-sm",
                                                            (user.optimizations_used || 0) >= 3 ? "text-red-400" : "text-gray-400"
                                                        )}>
                                                            {user.optimizations_used || 0}/3 used
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.is_founding_member ? (
                                                    <Badge className="bg-neon-orange/20 text-neon-orange hover:bg-neon-orange/30 border-none">
                                                        Wave {user.founding_wave || 1} 🔥
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-white/80">
                                                {user.optimizations_used || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-xs px-2 py-1 rounded-full capitalize",
                                                    user.is_admin ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"
                                                )}>
                                                    {user.is_admin ? "Admin" : "User"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                                                        aria-label="User actions"
                                                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                    {activeMenu === user._id && (
                                                        <>
                                                            <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />
                                                            <div className="absolute right-0 mt-2 w-48 bg-[#222] border border-white/10 rounded-lg shadow-xl z-50 py-1">
                                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left">
                                                                    <Eye className="h-4 w-4" /> View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleToggleAdmin(user.userId, user.is_admin);
                                                                        setActiveMenu(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
                                                                >
                                                                    <Pencil className="h-4 w-4" /> {user.is_admin ? "Revoke Admin" : "Make Admin"}
                                                                </button>
                                                                <div className="h-px bg-white/10 my-1" />
                                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-white/5 transition-colors text-left">
                                                                    <Ban className="h-4 w-4" /> Suspend
                                                                </button>
                                                                {(!user.subscription_tier || user.subscription_tier === 'free') && (
                                                                    <button
                                                                        onClick={() => {
                                                                            handleResetFreeTier(user.userId);
                                                                            setActiveMenu(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-white/5 transition-colors text-left"
                                                                    >
                                                                        <RefreshCw className="w-4 h-4" />
                                                                        Reset Free Tier
                                                                    </button>
                                                                )}
                                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors text-left">
                                                                    <Trash2 className="h-4 w-4" /> Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Footer - Keeping simple for now as requested */}
            {!loading && filteredUsers.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {filteredUsers.length} of {users.length} users
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="border-white/20 text-gray-500">
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled className="border-white/20 text-gray-500">
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
