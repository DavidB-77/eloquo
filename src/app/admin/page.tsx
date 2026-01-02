"use client";

import * as React from "react";
import { Users, DollarSign, Zap, CreditCard, TrendingUp, Loader2 } from "lucide-react";
import { StatCard, BankAccountCard, AlertItem, ServiceStatus } from "@/components/admin/StatCards";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

// Mock data (Financials / External APIs placeholders)
const MOCK_FINANCIALS = {
    mrr: 4125,
    mrrGrowth: "+8%",
    grossMargin: 87,
};

const MOCK_BANK_ACCOUNTS = [
    { name: "Income", emoji: "📥", balance: 1247.33, change: "$89", changePositive: true },
    { name: "Operations", emoji: "⚙️", balance: 312.50, change: "-$4.32", changePositive: false },
    { name: "Profit", emoji: "💵", balance: 2891.18, change: "$57", changePositive: true },
];

const MOCK_ALERTS = [
    { severity: "warning" as const, message: "OpenRouter balance below $50 - consider topping up" },
    { severity: "warning" as const, message: "Operations account runway: 12 days remaining" },
];

export default function AdminOverviewPage() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        userGrowth: "+0%",
        optimizations: 0,
    });
    const [recentSignups, setRecentSignups] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [openRouterBalance, setOpenRouterBalance] = React.useState<number | null>(null);
    const [ratingsDistribution, setRatingsDistribution] = React.useState<any>(null);


    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const supabase = createClient();

            try {
                // 1. Total Users
                const { count: userCount, error: countError } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true });

                if (countError) console.error("Error fetching user count:", countError);

                // 2. Recent Signups
                const { data: recentUsers, error: recentError } = await supabase
                    .from("profiles")
                    .select("id, email, full_name, display_name, subscription_tier, created_at")
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (recentError) console.error("Error fetching recent users:", recentError);

                // 3. Optimizations Today
                const now = new Date();
                const year = now.getUTCFullYear();
                const month = now.getUTCMonth();
                const day = now.getUTCDate();
                const todayISO = new Date(Date.UTC(year, month, day)).toISOString();

                const { count: optCount, error: optError } = await supabase
                    .from("optimizations")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", todayISO);

                if (optError) console.error("Error fetching optimizations:", optError);

                setStats({
                    totalUsers: userCount || 0,
                    userGrowth: "+12%", // Placeholder
                    optimizations: optCount || 0,
                });

                if (recentUsers) {
                    setRecentSignups(recentUsers.map(user => ({
                        id: user.id,
                        name: user.full_name || user.display_name || user.email?.split('@')[0] || "Unknown User",
                        email: user.email || "No email",
                        plan: user.subscription_tier ? capitalize(user.subscription_tier) : "None",
                        signedUp: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown"
                    })));
                }

                // 4. Fetch OpenRouter Balance
                try {
                    const balanceRes = await fetch('/api/admin/openrouter-balance');
                    const balanceData = await balanceRes.json();
                    if (balanceData.success && typeof balanceData.balance === 'number') {
                        setOpenRouterBalance(balanceData.balance);
                    }
                } catch (e) {
                    console.warn('Could not fetch OpenRouter balance');
                }

                // 5. Fetch Agent Metrics for Optimizations Today
                try {
                    const agentRes = await fetch('/api/admin/agent-metrics?endpoint=summary&period=today');
                    const agentData = await agentRes.json();
                    if (agentData && !agentData.error && agentData.overview?.total_requests !== undefined) {
                        // Use agent data if available (overrides Supabase count)
                        setStats(prev => ({
                            ...prev,
                            optimizations: agentData.overview.total_requests,
                        }));
                    }
                } catch (e) {
                    console.warn('Could not fetch agent metrics');
                }

                // 6. Fetch Ratings Distribution from dashboard stats
                try {
                    const dashRes = await fetch('/api/admin/analytics?type=dashboard');
                    const dashData = await dashRes.json();
                    if (dashData.success && dashData.data?.ratings_distribution) {
                        setRatingsDistribution(dashData.data.ratings_distribution);
                    }
                } catch (e) {
                    console.warn('Could not fetch ratings distribution');
                }

            } catch (error) {
                console.error("Failed to fetch admin dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-electric-cyan" />
                <span className="ml-3 text-white/50">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    change={{ value: stats.userGrowth, positive: true }}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="MRR"
                    value={`$${MOCK_FINANCIALS.mrr.toLocaleString()}`}
                    change={{ value: MOCK_FINANCIALS.mrrGrowth, positive: true }}
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <StatCard
                    title="API Credits"
                    value={`$${openRouterBalance !== null ? openRouterBalance.toFixed(2) : '...'}`}
                    warning={(openRouterBalance ?? 0) < 50}
                    critical={(openRouterBalance ?? 0) < 20}
                    icon={<CreditCard className="h-5 w-5" />}
                />
                <StatCard
                    title="Optimizations Today"
                    value={stats.optimizations.toLocaleString()}
                    icon={<Zap className="h-5 w-5" />}
                />
                <StatCard
                    title="Gross Margin"
                    value={`${MOCK_FINANCIALS.grossMargin}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
            </div>

            {/* Bank Accounts Row */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">💰 Bank Accounts (Mercury)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_BANK_ACCOUNTS.map((account) => (
                        <BankAccountCard
                            key={account.name}
                            name={account.name}
                            emoji={account.emoji}
                            balance={account.balance}
                            change={account.change}
                            changePositive={account.changePositive}
                        />
                    ))}
                </div>
            </div>

            {/* Adaptive Intelligence Stats */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">🧠 Adaptive Intelligence Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Training Runs</p>
                        <p className="text-2xl font-bold text-white">—</p>
                        <p className="text-xs text-gray-500">Total completed</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Prompts Improved</p>
                        <p className="text-2xl font-bold text-white">—</p>
                        <p className="text-xs text-gray-500">Via self-learning</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Avg Quality Improvement</p>
                        <p className="text-2xl font-bold text-electric-cyan">—%</p>
                        <p className="text-xs text-gray-500">After training</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Training Cost</p>
                        <p className="text-2xl font-bold text-white">$—</p>
                        <p className="text-xs text-gray-500">Total API cost</p>
                    </div>
                </div>
            </div>

            {/* User Ratings Distribution */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">⭐ User Ratings Distribution</h3>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingsDistribution?.[`${stars}_star`] || 0;
                        const total = ratingsDistribution?.total || 1;
                        const percent = total > 0 ? (count / total) * 100 : 0;
                        return (
                            <div key={stars} className="flex items-center gap-3">
                                <span className="text-sm text-white w-16">{stars} stars</span>
                                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-electric-cyan/50 rounded-full transition-all duration-300"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
                {(!ratingsDistribution || ratingsDistribution.total === 0) && (
                    <p className="text-xs text-gray-500 mt-3">No ratings yet</p>
                )}
            </div>

            {/* Charts Row - Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">📈 Revenue (30 days)</h3>
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                        Chart coming soon (Recharts integration)
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">⚡ Optimizations (30 days)</h3>
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                        Chart coming soon (Recharts integration)
                    </div>
                </div>
            </div>

            {/* Two Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">👤 Recent Signups</h3>
                    <div className="space-y-3">
                        {recentSignups.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${user.plan === "Pro"
                                            ? "bg-[#09B7B4]/20 text-[#09B7B4]"
                                            : user.plan === "Business"
                                                ? "bg-purple-500/20 text-purple-400"
                                                : "bg-gray-500/20 text-gray-400"
                                            }`}
                                    >
                                        {user.plan}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">{user.signedUp}</p>
                                </div>
                            </div>
                        ))}
                        {recentSignups.length === 0 && (
                            <p className="text-sm text-gray-500">No recent signups found.</p>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">
                        🔔 Alerts ({MOCK_ALERTS.length})
                    </h3>
                    {MOCK_ALERTS.length > 0 ? (
                        <div className="space-y-3">
                            {MOCK_ALERTS.map((alert, index) => (
                                <AlertItem key={index} severity={alert.severity} message={alert.message} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No active alerts</p>
                    )}
                </div>
            </div>

            {/* Service Status Bar */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center divide-x divide-white/10">
                    <ServiceStatus
                        name="OpenRouter"
                        status={(openRouterBalance ?? 0) < 20 ? "error" : (openRouterBalance ?? 0) < 50 ? "warning" : "healthy"}
                        detail={`$${openRouterBalance !== null ? openRouterBalance.toFixed(2) : '...'}`}
                    />
                    <ServiceStatus name="Lemon Squeezy" status="healthy" />
                    <ServiceStatus name="Supabase" status="healthy" />
                    <ServiceStatus name="VPS" status="healthy" />
                    <ServiceStatus name="n8n" status="healthy" />
                </div>
            </div>
        </div>
    );
}
