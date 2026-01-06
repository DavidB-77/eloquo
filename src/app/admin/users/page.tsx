"use client";

import * as React from "react";
import { Search, Filter, Download, MoreHorizontal, Eye, Pencil, Ban, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    display_name: string | null;
    subscription_tier: string | null;
    created_at: string;
    last_sign_in_at: string | null; // This will now reflect the *real* last activity (latest optimization)
    optimization_count: number;
    is_founding_member: boolean;
    founding_wave: number | null;
    is_admin: boolean;
    status?: string;
}

const PLAN_STYLES: Record<string, string> = {
    none: "bg-gray-500/20 text-gray-400",
    basic: "bg-blue-500/20 text-blue-400",
    pro: "bg-[#09B7B4]/20 text-[#09B7B4]",
    business: "bg-orange-500/20 text-orange-400",
};

export default function AdminUsersPage() {
    const [users, setUsers] = React.useState<UserProfile[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState("");
    const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();

            // 1. Fetch Profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // 2. Fetch Optimizations (minimal data needed for counts/stats)
            // Note: In a production app with millions of rows, you'd want an Aggregation query or RPC.
            // For now, fetching all relevant optimization metadata is acceptable for this scale.
            const { data: optimizations, error: optError } = await supabase
                .from('optimizations')
                .select('user_id, created_at');

            if (optError) {
                console.error("Error fetching optimizations:", optError);
                // We won't block the UI, but counts might be 0
            }

            // 3. Enrich Profiles with Optimization Data
            const enrichedUsers = (profiles || []).map((profile) => {
                const userOpts = (optimizations || []).filter((o) => o.user_id === profile.id);

                // Count
                const realOptCount = userOpts.length;

                // Last Active (Latest optimization time, or fall back to login time)
                let lastActive = profile.last_sign_in_at;
                if (userOpts.length > 0) {
                    // Find the most recent date
                    const timestamps = userOpts.map(o => new Date(o.created_at).getTime());
                    const maxTime = Math.max(...timestamps);

                    // If the latest optimization is more recent than the sign-in (or sign-in is null), use it.
                    // Usually we just want to show "Last Active" as likely the last time they optimized.
                    if (!lastActive || maxTime > new Date(lastActive).getTime()) {
                        lastActive = new Date(maxTime).toISOString();
                    }
                }

                return {
                    ...profile,
                    optimization_count: realOptCount,
                    last_sign_in_at: lastActive
                };
            });

            setUsers(enrichedUsers);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const name = user.full_name || user.display_name || "Unknown";
        const email = user.email || "";
        const matchesSearch =
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase());

        // Normalize plan for filtering
        const userPlan = user.subscription_tier ? user.subscription_tier.toLowerCase() : "none";
        // If selectedPlan is 'None', match null/empty/'none'
        // If selectedPlan is 'Basic'/'Pro'/'Business', match accordingly
        const matchesPlan = !selectedPlan || userPlan === selectedPlan.toLowerCase();

        return matchesSearch && matchesPlan;
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatTimeAgo = (dateString: string | null) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(dateString);
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
                    <Button variant="outline" size="sm" onClick={fetchUsers} className="border-white/20 text-white hover:bg-white/10">
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
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
                    {["None", "Basic", "Pro", "Business"].map((plan) => (
                        <button
                            key={plan}
                            onClick={() => setSelectedPlan(selectedPlan === plan ? null : plan)}
                            className={cn(
                                "px-3 py-2 text-sm rounded-lg border transition-colors",
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
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-red-400">
                        <Ban className="h-8 w-8 mb-4 opacity-50" />
                        <p>{error}</p>
                        <Button variant="outline" className="mt-4 border-red-500/20 hover:bg-red-500/10" onClick={fetchUsers}>Try Again</Button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <Search className="h-8 w-8 mb-4 opacity-20" />
                        <p>No users found matching your criteria.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">User</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Plan</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Founding</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Signed Up</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Last Active</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Optimizations</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => {
                                const planKey = user.subscription_tier ? user.subscription_tier.toLowerCase() : "none";
                                const planStyle = PLAN_STYLES[planKey] || PLAN_STYLES["none"];
                                const isActive = true; // Assuming active unless we have a specific status field

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.full_name || user.display_name || user.email?.split('@')[0] || "Unknown User"}</p>
                                                <p className="text-xs text-gray-500">{user.email || "No email"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", planStyle)}>
                                                {user.subscription_tier === "enterprise" ? "Business" : user.subscription_tier || "None"}
                                            </span>
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
                                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                                            {formatTimeAgo(user.last_sign_in_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-white/80">
                                            {user.optimization_count || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full capitalize",
                                                isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                            )}>
                                                {isActive ? "Active" : "Suspended"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                                {activeMenu === user.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />
                                                        <div className="absolute right-0 mt-2 w-48 bg-[#222] border border-white/10 rounded-lg shadow-xl z-50 py-1">
                                                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left">
                                                                <Eye className="h-4 w-4" /> View Details
                                                            </button>
                                                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left">
                                                                <Pencil className="h-4 w-4" /> Edit User
                                                            </button>
                                                            <div className="h-px bg-white/10 my-1" />
                                                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-white/5 transition-colors text-left">
                                                                <Ban className="h-4 w-4" /> Suspend
                                                            </button>
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
