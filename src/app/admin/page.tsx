"use client";

import * as React from "react";
import { Users, DollarSign, Zap, CreditCard, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { StatCard, BankAccountCard, AlertItem, ServiceStatus } from "@/components/admin/StatCards";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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
    const [dailyOptData, setDailyOptData] = React.useState<{ date: string; count: number }[]>([]);
    const [dailyRevenueData, setDailyRevenueData] = React.useState<{ date: string; revenue: number }[]>([]);

    // Real data states (replacing mock)
    const [polarData, setPolarData] = React.useState<any>(null);
    const [mercuryData, setMercuryData] = React.useState<any>(null);
    const [alerts, setAlerts] = React.useState<{ severity: "critical" | "warning"; message: string }[]>([]);

    const fetchData = React.useCallback(async () => {
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

            // Calculate user growth (compare to last week)
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const { count: lastWeekCount } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .lte("created_at", lastWeek.toISOString());

            const growth = lastWeekCount && lastWeekCount > 0 
                ? Math.round(((userCount || 0) - lastWeekCount) / lastWeekCount * 100)
                : 0;

            setStats({
                totalUsers: userCount || 0,
                userGrowth: growth >= 0 ? `+${growth}%` : `${growth}%`,
                optimizations: optCount || 0,
            });

            if (recentUsers) {
                setRecentSignups(recentUsers.map(user => ({
                    id: user.id,
                    name: user.full_name || user.display_name || user.email?.split('@')[0] || "Unknown User",
                    email: user.email || "No email",
                    plan: user.subscription_tier === "enterprise" ? "Business" : user.subscription_tier ? capitalize(user.subscription_tier) : "None",
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
            } catch (err) {
                console.error("Error fetching OpenRouter balance:", err);
            }

            // 5. Fetch Polar revenue data
            try {
                const polarRes = await fetch('/api/admin/polar-revenue');
                const polar = await polarRes.json();
                if (polar.success) {
                    setPolarData(polar);
                }
            } catch (err) {
                console.error("Error fetching Polar data:", err);
            }

            // 6. Fetch Mercury bank data
            try {
                const mercuryRes = await fetch('/api/admin/mercury');
                const mercury = await mercuryRes.json();
                if (mercury.success) {
                    setMercuryData(mercury);
                }
            } catch (err) {
                console.error("Error fetching Mercury data:", err);
            }

            // 7. Fetch ratings distribution
            try {
                const { data: ratings, error: ratingsError } = await supabase
                    .from("optimizations")
                    .select("user_rating")
                    .not("user_rating", "is", null);

                if (!ratingsError && ratings) {
                    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    ratings.forEach((r: any) => {
                        if (r.user_rating >= 1 && r.user_rating <= 5) {
                            distribution[r.user_rating]++;
                        }
                    });
                    setRatingsDistribution(distribution);
                }
            } catch (err) {
                console.error("Error fetching ratings:", err);
            }

            // 8. Fetch daily optimizations for chart
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { data: dailyOpts, error: dailyError } = await supabase
                    .from("optimizations")
                    .select("created_at")
                    .gte("created_at", thirtyDaysAgo.toISOString());

                if (!dailyError && dailyOpts) {
                    const dailyCounts: Record<string, number> = {};
                    dailyOpts.forEach((opt: any) => {
                        const date = new Date(opt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
                    });

                    const chartData = Object.entries(dailyCounts)
                        .map(([date, count]) => ({ date, count }))
                        .slice(-7);

                    setDailyOptData(chartData);
                }
            } catch (err) {
                console.error("Error fetching daily data:", err);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Generate dynamic alerts based on real data
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

        if (polarData?.revenue?.totalSubscribers === 0) {
            newAlerts.push({
                severity: "warning",
                message: "No active subscribers yet - time to launch!"
            });
        }

        setAlerts(newAlerts);
    }, [openRouterBalance, mercuryData, polarData]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate gross margin from real data
    const calculateGrossMargin = () => {
        if (!polarData?.revenue?.mrr) return 0;
        const mrr = polarData.revenue.mrr;
        const apiCost = openRouterBalance !== null ? Math.max(0, 50 - openRouterBalance) : 0;
        const infraCost = 16;
        const paymentFees = mrr * 0.044;
        const totalCosts = apiCost + infraCost + paymentFees;
        if (mrr === 0) return 0;
        return Math.round(((mrr - totalCosts) / mrr) * 100);
    };

    const grossMargin = calculateGrossMargin();
    const mrr = polarData?.revenue?.mrr || 0;
    const mrrGrowth = polarData?.revenue?.totalSubscribers > 0 ? "+new" : "—";

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
                    value={stats.totalUsers.toString()}
                    change={{ value: stats.userGrowth, positive: stats.userGrowth.startsWith("+") }}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="MRR"
                    value={`$${mrr.toFixed(2)}`}
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
                    value={stats.optimizations.toString()}
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
                    {mercuryData?.accounts?.length > 0 ? (
                        mercuryData.accounts.map((account: any) => (
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
                            const total = Object.values(ratingsDistribution).reduce((a: number, b: any) => a + b, 0) as number;
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <span className="text-sm text-white/60 w-12">{rating} stars</span>
                                    <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-electric-cyan rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
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
                        {polarData?.revenue?.mrr ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-electric-cyan">${polarData.revenue.mrr.toFixed(2)}</p>
                                    <p className="text-sm text-white/40">Monthly Recurring Revenue</p>
                                    <p className="text-xs text-white/30 mt-2">{polarData.revenue.totalSubscribers} active subscriber(s)</p>
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
                        {dailyOptData.length > 0 ? (
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
                                No optimization data yet
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
                        {recentSignups.length > 0 ? (
                            recentSignups.map((user) => (
                                <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">{user.name}</p>
                                        <p className="text-xs text-white/40">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            user.plan === 'Business' ? 'bg-purple-500/20 text-purple-400' :
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
                            <p className="text-white/30 text-sm text-center py-4">No signups yet</p>
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
                    <ServiceStatus name="Polar" status={polarData ? "healthy" : "warning"} />
                    <ServiceStatus name="Supabase" status="healthy" />
                    <ServiceStatus name="VPS" status="healthy" />
                    <ServiceStatus name="Mercury" status={mercuryData ? "healthy" : "warning"} />
                </div>
            </div>
        </div>
    );
}
