"use client";

import * as React from "react";
import { Users, DollarSign, Zap, CreditCard, TrendingUp, RefreshCw } from "lucide-react";
import { StatCard, BankAccountCard, AlertItem, ServiceStatus } from "@/components/admin/StatCards";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getWeekStart(): number {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    monday.setUTCHours(0, 0, 0, 0);
    return monday.getTime();
}

export default function AdminOverviewPage() {
    const [loading, setLoading] = React.useState(false);
    const [openRouterBalance, setOpenRouterBalance] = React.useState<number | null>(null);
    const [dodoData, setDodoData] = React.useState<any>(null);
    const [mercuryData, setMercuryData] = React.useState<{ accounts: any[]; totalBalance: number } | null>(null);
    const [alerts, setAlerts] = React.useState<{ severity: "critical" | "warning"; message: string }[]>([]);

    // Convex Data
    const dashboardStats = useQuery(api.admin.getDashboardStats);
    const recentSignupsRaw = useQuery(api.admin.getRecentSignups, { limit: 5 });
    const ratingsDistribution = useQuery(api.admin.getRatingsDistribution);
    const dailyOptData = useQuery(api.admin.getDailyOptimizations, { days: 7 });
    const freeTierMetrics = useQuery(api.admin.getFreeTierStats, { weekStart: getWeekStart() });

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch OpenRouter Balance
            try {
                const balanceRes = await fetch('/api/admin/openrouter-balance');
                const balanceData = await balanceRes.json();
                if (balanceData.success && typeof balanceData.balance === 'number') {
                    setOpenRouterBalance(balanceData.balance);
                }
            } catch (err) {
                console.error("Error fetching OpenRouter balance:", err);
            }

            // 2. Fetch Dodo revenue data
            try {
                const dodoRes = await fetch('/api/admin/dodo-revenue');
                const dodo = await dodoRes.json();
                if (dodo.success) {
                    setDodoData(dodo);
                }
            } catch (err) {
                console.error("Error fetching Dodo data:", err);
            }

            // 3. Fetch Mercury bank data
            try {
                const mercuryRes = await fetch('/api/admin/mercury');
                const mercury = await mercuryRes.json();
                if (mercury.success) {
                    setMercuryData(mercury);
                }
            } catch (err) {
                console.error("Error fetching Mercury data:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Generate dynamic alerts
    React.useEffect(() => {
        const newAlerts: { severity: "critical" | "warning"; message: string }[] = [];

        if (openRouterBalance !== null && openRouterBalance < 20) {
            newAlerts.push({
                severity: openRouterBalance < 10 ? "critical" : "warning",
                message: `OpenRouter balance: $${openRouterBalance.toFixed(2)} - consider topping up`
            });
        }

        if (mercuryData?.totalBalance !== undefined && mercuryData.totalBalance < 100) {
            newAlerts.push({
                severity: "warning",
                message: `Total bank balance low: $${mercuryData.totalBalance.toFixed(2)}`
            });
        }

        if (dodoData?.summary?.totalSubscribers === 0) {
            newAlerts.push({
                severity: "warning",
                message: "No active subscribers yet - time to launch!"
            });
        }

        setAlerts(newAlerts);
    }, [openRouterBalance, mercuryData, dodoData]);

    // Calculate gross margin
    const calculateGrossMargin = () => {
        if (!dodoData?.revenue?.mrr) return 0;
        const mrr = dodoData.revenue.mrr;
        const apiCost = openRouterBalance !== null ? Math.max(0, 50 - openRouterBalance) : 0;
        const infraCost = 16;
        const paymentFees = mrr * 0.044;
        const totalCosts = apiCost + infraCost + paymentFees;
        if (mrr === 0) return 0;
        return Math.round(((mrr - totalCosts) / mrr) * 100);
    };

    const grossMargin = calculateGrossMargin();
    const mrrValue = dodoData?.revenue?.mrr || 0;
    const mrrGrowth = dodoData?.summary?.totalSubscribers > 0 ? "+new" : "—";

    const formattedSignups = recentSignupsRaw?.map(user => ({
        id: user._id,
        name: user.full_name || user.display_name || user.email?.split('@')[0] || "Unknown User",
        email: user.email || "No email",
        plan: user.subscription_tier === "enterprise" ? "Business" : user.subscription_tier ? capitalize(user.subscription_tier) : "None",
        signedUp: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown"
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header with refresh */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Overview</h1>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Users"
                    value={dashboardStats?.totalUsers.toString() || "..."}
                    change={{
                        value: dashboardStats?.userGrowth || "0%",
                        positive: dashboardStats?.userGrowth.startsWith("+") || false
                    }}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="MRR"
                    value={`$${mrrValue.toFixed(2)}`}
                    change={{ value: mrrGrowth, positive: true }}
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <StatCard
                    title="API Credits"
                    value={openRouterBalance !== null ? `$${openRouterBalance.toFixed(2)}` : "..."}
                    icon={<CreditCard className="h-5 w-5" />}
                />
                <StatCard
                    title="Optimizations Today"
                    value={dashboardStats?.optimizationsToday.toString() || "..."}
                    icon={<Zap className="h-5 w-5" />}
                />
                <StatCard
                    title="Gross Margin"
                    value={`${grossMargin}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
            </div>

            {/* Bank Accounts Section */}
            <div>
                <h2 className="text-sm font-medium text-white/60 mb-3">💰 Bank Accounts (Mercury)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mercuryData?.accounts?.length && mercuryData.accounts.length > 0 ? (
                        mercuryData.accounts.map((account: { id: string; name: string; type: string; balance: number; transactions: any[] }) => (
                            <BankAccountCard
                                key={account.id}
                                name={account.name}
                                emoji={account.type === 'checking' ? '📥' : '💵'}
                                balance={account.balance}
                                change={account.transactions?.[0]?.amount
                                    ? `${account.transactions[0].amount >= 0 ? '+' : ''}$${Math.abs(account.transactions[0].amount).toFixed(2)}`
                                    : "—"
                                }
                                changePositive={account.transactions?.[0]?.amount >= 0}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-8 text-white/40">
                            {loading ? "Loading bank accounts..." : "Connect Mercury to see accounts"}
                        </div>
                    )}
                </div>
            </div>

            {/* Free Tier Stats */}
            <div>
                <h2 className="text-sm font-medium text-white/60 mb-3">🆓 Free Tier (This Week)</h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-2xl font-bold text-white">{freeTierMetrics?.totalFreeUsers ?? "..."}</p>
                            <p className="text-xs text-gray-500">Active Users</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-400">{freeTierMetrics?.atLimit ?? "..."}</p>
                            <p className="text-xs text-gray-500">At Limit (3/3)</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-400">{freeTierMetrics?.flaggedUsers ?? "..."}</p>
                            <p className="text-xs text-gray-500">Flagged</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#09B7B4]">{freeTierMetrics?.avgUsage ?? "..."}</p>
                            <p className="text-xs text-gray-500">Avg Usage</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Adaptive Intelligence Stats */}
            <div>
                <h2 className="text-sm font-medium text-white/60 mb-3">🧠 Adaptive Intelligence Stats</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase">Training Runs</p>
                        <p className="text-2xl font-bold text-white">—</p>
                        <p className="text-xs text-white/30">Total completed</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase">Prompts Improved</p>
                        <p className="text-2xl font-bold text-white">—</p>
                        <p className="text-xs text-white/30">Via self-learning</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase">Avg Quality Improvement</p>
                        <p className="text-2xl font-bold text-electric-cyan">—%</p>
                        <p className="text-xs text-white/30">After training</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase">Training Cost</p>
                        <p className="text-2xl font-bold text-white">$—</p>
                        <p className="text-xs text-white/30">Total API costs</p>
                    </div>
                </div>
            </div>

            {/* User Ratings Distribution */}
            {ratingsDistribution && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">⭐ User Ratings Distribution</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = ratingsDistribution[rating] || 0;
                            const total = Object.values(ratingsDistribution).reduce((a: number, b) => a + (b as number), 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <span className="text-sm text-white/60 w-12">{rating} stars</span>
                                    <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-electric-cyan rounded-full transition-all"
                                            style={{ width: `${percentage}%` } as React.CSSProperties}
                                        />
                                    </div>
                                    <span className="text-sm text-white/40 w-8">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">💰 Revenue (30 days)</h3>
                    <div className="h-48">
                        {dodoData?.revenue?.mrr ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-electric-cyan">${dodoData.revenue.mrr.toFixed(2)}</p>
                                    <p className="text-sm text-white/40">Monthly Recurring Revenue</p>
                                    <p className="text-xs text-white/30 mt-2">{dodoData.summary.totalSubscribers} active subscriber(s)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/30">
                                No revenue data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Optimizations Chart */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">⚡ Optimizations (30 days)</h3>
                    <div className="h-48">
                        {dailyOptData && dailyOptData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyOptData}>
                                    <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#666', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="#09B7B4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/30">
                                {dailyOptData ? "No optimization data yet" : "Loading chart..."}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">👤 Recent Signups</h3>
                    <div className="space-y-3">
                        {formattedSignups.length > 0 ? (
                            formattedSignups.map((user) => (
                                <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">{user.name}</p>
                                        <p className="text-xs text-white/40">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded ${user.plan === 'Business' ? 'bg-purple-500/20 text-purple-400' :
                                            user.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400' :
                                                user.plan === 'Basic' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-white/10 text-white/40'
                                            }`}>
                                            {user.plan}
                                        </span>
                                        <p className="text-xs text-white/30 mt-1">{user.signedUp}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white/30 text-sm text-center py-4">
                                {!recentSignupsRaw ? "Loading signups..." : "No signups yet"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">
                        🔔 Alerts ({alerts.length})
                    </h3>
                    {alerts.length > 0 ? (
                        <div className="space-y-2">
                            {alerts.map((alert, index) => (
                                <AlertItem key={index} severity={alert.severity} message={alert.message} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-green-400/60 text-sm text-center py-4">✓ All systems healthy</p>
                    )}
                </div>
            </div>

            {/* Service Status */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">🔌 Service Status</h3>
                <div className="flex flex-wrap gap-3">
                    <ServiceStatus name="OpenRouter" status={openRouterBalance !== null ? "healthy" : "warning"} />
                    <ServiceStatus name="Dodo" status={dodoData ? "healthy" : "warning"} />
                    <ServiceStatus name="Convex" status="healthy" />
                    <ServiceStatus name="VPS" status="healthy" />
                    <ServiceStatus name="Mercury" status={mercuryData ? "healthy" : "warning"} />
                </div>
            </div>
        </div>
    );
}
