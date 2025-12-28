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
    apiCredits: 47.82,
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
        userGrowth: "+0%", // dynamic calculation requires historical data, keeping placeholder logic or 0 for now
        optimizations: 0,
    });
    const [recentSignups, setRecentSignups] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

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
                        name: user.full_name || user.display_name || "Unknown User",
                        email: user.email || "No email",
                        plan: user.subscription_tier ? capitalize(user.subscription_tier) : "None",
                        signedUp: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown"
                    })));
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
                    value={`$${MOCK_FINANCIALS.apiCredits}`}
                    warning={MOCK_FINANCIALS.apiCredits < 50}
                    critical={MOCK_FINANCIALS.apiCredits < 20}
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
                        status={MOCK_FINANCIALS.apiCredits < 20 ? "error" : MOCK_FINANCIALS.apiCredits < 50 ? "warning" : "healthy"}
                        detail={`$${MOCK_FINANCIALS.apiCredits}`}
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
