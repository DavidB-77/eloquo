"use client";

import * as React from "react";
import {
    BarChart3, Zap, Users, Clock, TrendingUp,
    DollarSign, Wallet, RefreshCw, ArrowUpRight,
    Activity, Layers, Database
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCards";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = React.useState("30d");
    const [loading, setLoading] = React.useState(true);
    const [updatingBalance, setUpdatingBalance] = React.useState(false);
    const [syncingBalance, setSyncingBalance] = React.useState(false);
    const [showManualUpdate, setShowManualUpdate] = React.useState(false);

    // Data states
    const [dashboardStats, setDashboardStats] = React.useState<any>(null);
    const [agentMetrics, setAgentMetrics] = React.useState<any>(null);
    const [dailyData, setDailyData] = React.useState<any[]>([]);
    const [topUsers, setTopUsers] = React.useState<any[]>([]);
    const [modelStats, setModelStats] = React.useState<any[]>([]);
    const [balanceData, setBalanceData] = React.useState<any>(null);
    const [newBalance, setNewBalance] = React.useState("");
    const [bmadData, setBmadData] = React.useState<any>(null);
    const [financialData, setFinancialData] = React.useState<any>(null);
    const [tierCounts, setTierCounts] = React.useState({
        free: 0,
        basic: 0,
        pro: 0,
        business: 0
    });

    const syncBalance = React.useCallback(async () => {
        setSyncingBalance(true);
        try {
            const res = await fetch('/api/admin/openrouter-balance');
            const data = await res.json();
            if (data.success) {
                // Refresh balance data specifically
                const balanceRes = await fetch('/api/admin/analytics?type=balance');
                const balanceData = await balanceRes.json();
                if (balanceData.success) {
                    setBalanceData(balanceData.data);
                    setNewBalance(balanceData.data.balance !== null ? balanceData.data.balance.toString() : "0");
                }
            }
       
            // Fetch tier distribution
            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                const { data: tierData } = await supabase
                    .from('profiles')
                    .select('subscription_tier');

                const counts = { free: 0, basic: 0, pro: 0, business: 0 };
                (tierData || []).forEach(user => {
                    const tier = user.subscription_tier || 'free';
                    if (tier in counts) {
                        counts[tier as keyof typeof counts]++;
                    }
                });
                setTierCounts(counts);
            } catch(err) {
                console.error('Error fetching tier distribution:', err);
            }
} catch (error) {
            console.error("Failed to sync balance:", error);
        } finally {
            setSyncingBalance(false);
        }
    }, []);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
            const agentPeriod = timeRange === "7d" ? "week" : timeRange === "30d" ? "month" : "all";

            const [dashRes, dailyRes, usersRes, modelsRes, balanceRes, agentRes, agentTodayRes] = await Promise.all([
                fetch('/api/admin/analytics?type=dashboard'),
                fetch(`/api/admin/analytics?type=daily&days=${days}`),
                fetch('/api/admin/analytics?type=users&limit=10'),
                fetch('/api/admin/analytics?type=models'),
                fetch('/api/admin/analytics?type=balance'),
                fetch(`/api/admin/agent-metrics?endpoint=summary&period=${agentPeriod}`).catch(() => null),
                fetch('/api/admin/agent-metrics?endpoint=summary&period=today').catch(() => null),
            ]);

            const dashData = await dashRes.json();
            const daily = await dailyRes.json();
            const users = await usersRes.json();
            const models = await modelsRes.json();
            const balance = await balanceRes.json();
            const agentData = agentRes ? await agentRes.json() : null;
            const agentTodayData = agentTodayRes ? await agentTodayRes.json() : null;

            if (dashData.success) setDashboardStats(dashData.data);
            if (daily.success) setDailyData(daily.data || []);
            if (users.success) setTopUsers(users.data || []);
            if (models.success) setModelStats(models.data || []);

            // Merge agent metrics (if available)
            if (agentData && !agentData.error) {
                setAgentMetrics({
                    ...agentData,
                    today: agentTodayData && !agentTodayData.error ? agentTodayData : null,
                });
            }

            // Fetch financial and BMAD data
            try {
                const [financialRes, bmadRes] = await Promise.all([
                    fetch('/api/admin/analytics?type=financial'),
                    fetch('/api/admin/analytics?type=bmad'),
                ]);
                const finData = await financialRes.json();
                const bmData = await bmadRes.json();
                if (finData.success) setFinancialData(finData.data);
                if (bmData.success) setBmadData(bmData.data);
            } catch (e) {
                console.warn('Could not fetch financial/bmad data');
            }

            if (balance.success && balance.data) {
                setBalanceData(balance.data);
                setNewBalance(balance.data.balance !== null ? balance.data.balance.toString() : "0");

                // If it hasn't been synced recently (e.g. over 1 hour), trigger an auto-sync
                const lastChecked = balance.data.last_checked ? new Date(balance.data.last_checked).getTime() : 0;
                const moreThanHourAgo = Date.now() - lastChecked > 3600000;
                if (moreThanHourAgo) {
                    syncBalance();
                }
            }
       
            // Fetch tier distribution
            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                const { data: tierData } = await supabase
                    .from('profiles')
                    .select('subscription_tier');

                const counts = { free: 0, basic: 0, pro: 0, business: 0 };
                (tierData || []).forEach(user => {
                    const tier = user.subscription_tier || 'free';
                    if (tier in counts) {
                        counts[tier as keyof typeof counts]++;
                    }
                });
                setTierCounts(counts);
            } catch(err) {
                console.error('Error fetching tier distribution:', err);
            }
} catch (error) {
            console.error("Failed to fetch analytics data:", error);
        } finally {
            setLoading(false);
        }
    }, [timeRange, syncBalance]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateBalance = async () => {
        if (!newBalance || isNaN(parseFloat(newBalance))) return;

        setUpdatingBalance(true);
        try {
            const res = await fetch('/api/admin/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_balance',
                    balance: parseFloat(newBalance)
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to update balance:", error);
        } finally {
            setUpdatingBalance(false);
        }
    };

    const estOptimizationsRemaining = balanceData?.balance && dashboardStats?.avg_cost_per_optimization && dashboardStats.avg_cost_per_optimization > 0
        ? Math.floor(balanceData.balance / dashboardStats.avg_cost_per_optimization)
        : 0;

    // Business Health Calculations
    const dailyBurnRate = (dashboardStats?.cost_this_week || 0) / 7;
    const projectedRunway = dailyBurnRate > 0 ? Math.floor((balanceData?.balance || 0) / dailyBurnRate) : "∞";
    const costPerOptimization = dashboardStats?.total_optimizations > 0
        ? (dashboardStats.total_cost_usd / dashboardStats.total_optimizations)
        : 0;

    // Pro Tier Margin: ($9 / 200) - avg_cost_per_optimization
    const proRevenuePerOpt = 9 / 200; // $0.045
    const proMarginPerOpt = proRevenuePerOpt - (dashboardStats?.avg_cost_per_optimization || 0);
    const proMarginPercent = proRevenuePerOpt > 0 ? (proMarginPerOpt / proRevenuePerOpt) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header with Refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-2">
                    {[
                        { value: "7d", label: "7 Days" },
                        { value: "30d", label: "30 Days" },
                        { value: "90d", label: "90 Days" },
                        { value: "all", label: "All Time" },
                    ].map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={cn(
                                "px-4 py-2 text-sm rounded-lg transition-colors border",
                                timeRange === range.value
                                    ? "bg-[#09B7B4] text-white border-[#09B7B4]"
                                    : "bg-[#1a1a1a] text-gray-400 hover:text-white border-white/10"
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    disabled={loading}
                    className="border-white/10 text-white hover:bg-white/5"
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh Data
                </Button>
            </div>

            {/* OpenRouter Balance & Business Health Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass border-electric-cyan/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Wallet className="h-32 w-32 text-electric-cyan" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-electric-cyan/10 flex items-center justify-center text-electric-cyan border border-electric-cyan/20">
                                    <DollarSign className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">OpenRouter Credits</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white font-mono">
                                            ${balanceData?.balance !== null ? balanceData?.balance?.toFixed(2) : "0.00"}
                                        </span>
                                        <span className="text-sm text-electric-cyan font-medium">Remaining</span>
                                    </div>
                                    <p className="text-white/40 text-[10px] mt-2">
                                        Last checked: {balanceData?.last_checked ? new Date(balanceData.last_checked).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="text-center sm:text-right">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Capacity</p>
                                    <p className="text-lg font-bold text-white">
                                        ~{estOptimizationsRemaining.toLocaleString()}
                                    </p>
                                    <p className="text-white/40 text-[10px]">Est. Optimizations</p>
                                </div>
                                <div className="h-10 w-px bg-white/10 hidden sm:block mx-2" />
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => syncBalance()}
                                        disabled={syncingBalance}
                                        variant="outline"
                                        className="border-white/10 text-white hover:bg-white/5 h-10 px-4"
                                    >
                                        <RefreshCw className={cn("h-4 w-4 mr-2", syncingBalance && "animate-spin")} />
                                        Sync Now
                                    </Button>
                                    <Button
                                        onClick={() => setShowManualUpdate(!showManualUpdate)}
                                        variant="ghost"
                                        className="text-white/40 hover:text-white h-10 px-2"
                                    >
                                        <Layers className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showManualUpdate && (
                            <div className="mt-6 flex items-center justify-end gap-2 animate-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] text-white/40 uppercase font-bold mr-2">Manual Override:</p>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    placeholder="Set balance..."
                                    className="w-32 bg-midnight/50 border-white/10 text-white h-9"
                                />
                                <Button
                                    onClick={() => handleUpdateBalance()}
                                    disabled={updatingBalance || !newBalance}
                                    className="bg-white/10 text-white hover:bg-white/20 text-[10px] font-bold uppercase h-9 px-4 border border-white/10"
                                >
                                    Force Update
                                </Button>
                                <Button
                                    onClick={() => setShowManualUpdate(false)}
                                    variant="ghost"
                                    className="text-white/40 hover:text-white h-9 px-2 text-[10px] uppercase font-bold"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Business Health Summary */}
                <Card className="glass border-white/10 overflow-hidden">
                    <CardHeader className="pb-2 border-b border-white/5">
                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2 italic uppercase tracking-wider">
                            <Activity className="h-4 w-4 text-electric-cyan" />
                            Business Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest transition-colors group-hover:text-white/60">Daily Burn Rate</span>
                            <span className="text-sm font-mono text-white">${dailyBurnRate.toFixed(2)}/day</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest transition-colors group-hover:text-white/60">Projected Runway</span>
                            <span className="text-sm font-mono text-electric-cyan">{projectedRunway} days</span>
                        </div>
                        <div className="flex justify-between items-center group border-t border-white/5 pt-3">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest transition-colors group-hover:text-white/60">Cost/Optimization</span>
                            <span className="text-sm font-mono text-white">${costPerOptimization.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest transition-colors group-hover:text-white/60">Pro Margin/Opt</span>
                            <div className="text-right">
                                <p className="text-sm font-mono text-green-400">${proMarginPerOpt.toFixed(3)}</p>
                                <p className="text-[9px] text-green-400/60 font-medium">({isNaN(proMarginPercent) ? '0' : proMarginPercent.toFixed(1)}%)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row - Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Optimizations"
                    value={(agentMetrics?.overview?.total_requests ?? dashboardStats?.total_optimizations ?? 0).toLocaleString()}
                    icon={<Zap className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Avg Quality Score"
                    value={agentMetrics?.performance?.avg_quality_score
                        ? `${agentMetrics.performance.avg_quality_score.toFixed(1)}/10`
                        : (dashboardStats?.avg_quality_score ? `${dashboardStats.avg_quality_score.toFixed(1)}/10` : "—")}
                    icon={<TrendingUp className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Optimizations Today"
                    value={(agentMetrics?.today?.overview?.total_requests ?? dashboardStats?.optimizations_today ?? 0).toLocaleString()}
                    icon={<Activity className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Avg Time"
                    value={agentMetrics?.performance?.avg_processing_time_ms
                        ? `${(agentMetrics.performance.avg_processing_time_ms / 1000).toFixed(1)}s`
                        : (dashboardStats?.avg_processing_time_ms ? `${(dashboardStats.avg_processing_time_ms / 1000).toFixed(1)}s` : "0s")}
                    icon={<Clock className="h-5 w-5" />}
                    loading={loading}
                />
            </div>

            {/* Stats Row - Cost Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total API Cost"
                    value={`$${(agentMetrics?.costs?.total ?? dashboardStats?.total_cost_usd ?? 0).toFixed(4)}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Avg Cost/Opt"
                    value={`$${agentMetrics?.overview?.total_requests > 0
                        ? ((agentMetrics.costs?.total || 0) / agentMetrics.overview.total_requests).toFixed(4)
                        : (dashboardStats?.avg_cost_per_optimization?.toFixed(4) || "0.0000")}`}
                    icon={<ArrowUpRight className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Today's Cost"
                    value={`$${(agentMetrics?.today?.costs?.total ?? dashboardStats?.cost_today ?? 0).toFixed(4)}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="This Week's Cost"
                    value={`$${dashboardStats?.cost_this_week?.toFixed(4) || "0.0000"}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    loading={loading}
                />
            </div>

            {/* Project Protocol Metrics Row */}
            <div className="bg-[#1a1a1a] border border-electric-cyan/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🚀</span>
                    <h3 className="text-sm font-medium text-white">Project Protocol Metrics</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-electric-cyan/20 text-electric-cyan uppercase tracking-wider">BMAD</span>
                </div>
                {(bmadData?.total_generations ?? 0) > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-midnight/50 rounded-lg p-4 border border-white/5">
                            <p className="text-xs text-white/50 mb-1">PP Generations</p>
                            <p className="text-2xl font-bold text-white">{bmadData?.total_generations || 0}</p>
                        </div>
                        <div className="bg-midnight/50 rounded-lg p-4 border border-white/5">
                            <p className="text-xs text-white/50 mb-1">PP Revenue</p>
                            <p className="text-2xl font-bold text-electric-cyan">${(bmadData?.total_revenue || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-midnight/50 rounded-lg p-4 border border-white/5">
                            <p className="text-xs text-white/50 mb-1">PP Cost</p>
                            <p className="text-2xl font-bold text-sunset-orange">${(bmadData?.total_api_cost || 0).toFixed(4)}</p>
                        </div>
                        <div className="bg-midnight/50 rounded-lg p-4 border border-white/5">
                            <p className="text-xs text-white/50 mb-1">PP Profit</p>
                            <p className="text-2xl font-bold text-green-400">${(bmadData?.total_profit || 0).toFixed(2)}</p>
                            <p className="text-[10px] text-white/40 mt-1">
                                {bmadData?.total_revenue > 0
                                    ? `${((bmadData.total_profit / bmadData.total_revenue) * 100).toFixed(0)}% margin`
                                    : '—'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-white/40 italic">No Project Protocol generations yet</p>
                )}
            </div>

            {/* Request Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-electric-cyan" />
                        Request Breakdown
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-midnight/50 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-electric-cyan" />
                                <span className="text-sm text-white">Standard Optimizations</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-white">{dashboardStats?.standard_count || dashboardStats?.standard_count || dashboardStats?.standard_count || dashboardStats?.standard_count || dashboardStats?.standard_count || financialData?.standard?.total_optimizations || 0}</span>
                                <span className="text-xs text-white/40 ml-2">
                                    ${(financialData?.standard?.total_api_cost || 0).toFixed(4)} cost
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-midnight/50 rounded-lg border border-electric-cyan/20">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-sunset-orange" />
                                <span className="text-sm text-white">Project Protocol</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sunset-orange/20 text-sunset-orange uppercase">Premium</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-white">{financialData?.bmad?.total_generations || bmadData?.total_generations || 0}</span>
                                <span className="text-xs text-white/40 ml-2">
                                    ${(financialData?.bmad?.total_api_cost || bmadData?.total_api_cost || 0).toFixed(4)} cost
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Health (Revenue/Profit) */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        Revenue & Profit
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-midnight/50 rounded-lg p-3 border border-white/5 text-center">
                            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Revenue/Opt</p>
                            <p className="text-lg font-bold text-electric-cyan">
                                ${financialData?.totals?.total_requests > 0
                                    ? (financialData.totals.total_revenue / financialData.totals.total_requests).toFixed(3)
                                    : '0.000'}
                            </p>
                        </div>
                        <div className="bg-midnight/50 rounded-lg p-3 border border-white/5 text-center">
                            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Profit/Opt</p>
                            <p className="text-lg font-bold text-green-400">
                                ${financialData?.totals?.total_requests > 0
                                    ? (financialData.totals.total_profit / financialData.totals.total_requests).toFixed(3)
                                    : '0.000'}
                            </p>
                        </div>
                        <div className="bg-midnight/50 rounded-lg p-3 border border-white/5 text-center">
                            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Profit Margin</p>
                            <p className="text-lg font-bold text-white">
                                {financialData?.totals?.profit_margin_pct?.toFixed(1) || '—'}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-[10px] text-white/40">Total Revenue</p>
                            <p className="text-sm font-semibold text-electric-cyan">${(financialData?.totals?.total_revenue || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/40">Total Cost</p>
                            <p className="text-sm font-semibold text-sunset-orange">${(financialData?.totals?.total_api_cost || 0).toFixed(4)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/40">Net Profit</p>
                            <p className="text-sm font-semibold text-green-400">${(financialData?.totals?.total_profit || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Chart */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-electric-cyan" />
                            Daily Throughput
                        </h3>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{timeRange} View</span>
                    </div>
                    <div className="flex items-end justify-between h-48 gap-px md:gap-1 pt-4">
                        {dailyData.length > 0 ? (
                            dailyData.map((day, i) => {
                                const maxVal = Math.max(...dailyData.map(d => d.optimizations || 1));
                                const height = ((day.optimizations || 0) / maxVal) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                                        <div
                                            className="w-full bg-[#09B7B4]/40 rounded-t-sm transition-all group-hover:bg-[#09B7B4] group-hover:shadow-[0_0_15px_rgba(9,183,180,0.3)]"
                                            style={{ height: `${height}%` }}
                                        />
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-midnight border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-20 pointer-events-none transition-opacity">
                                            {new Date(day.date).toLocaleDateString()}: {day.optimizations}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-white/20 text-xs italic">
                                No throughput data for this period
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-4">
                        <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
                            {dailyData[0] ? new Date(dailyData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
                            {dailyData[dailyData.length - 1] ? new Date(dailyData[dailyData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                    </div>
                </div>

                {/* Model Distribution */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Layers className="h-4 w-4 text-electric-cyan" />
                            Model Distribution
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {modelStats.length > 0 ? (
                            modelStats.map((model) => {
                                const percentage = model.percentage || 0;
                                return (
                                    <div key={model.model_name} className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-white/60">{model.model_name}</span>
                                            <span className="text-white">{model.usage_count.toLocaleString()} ({isNaN(percentage) ? '0' : Math.round(percentage)}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-electric-cyan to-electric-cyan/60 rounded-full"
                                                style={{ width: `${isNaN(percentage) ? 0 : percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-48 flex items-center justify-center text-white/20 text-xs italic border border-dashed border-white/5 rounded-lg">
                                Pending model usage data...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subscription Distribution */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">📊 User Distribution by Tier</h3>

                <div className="space-y-3">
                    {/* Free */}
                    <div className="flex items-center gap-3">
                        <span className="w-20 text-sm text-gray-400">Free</span>
                        <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                            <div
                                className="h-full bg-gray-500 flex items-center justify-end pr-2"
                                style={{ width: `${Object.values(tierCounts).reduce((a, b) => a + b, 0) > 0 ? (tierCounts.free / Object.values(tierCounts).reduce((a, b) => a + b, 0)) * 100 : 0}%`, minWidth: tierCounts.free > 0 ? '30px' : '0' }}
                            >
                                <span className="text-xs text-white font-medium">{tierCounts.free}</span>
                            </div>
                        </div>
                    </div>

                    {/* Basic */}
                    <div className="flex items-center gap-3">
                        <span className="w-20 text-sm text-blue-400">Basic</span>
                        <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                            <div
                                className="h-full bg-blue-500 flex items-center justify-end pr-2"
                                style={{ width: `${Object.values(tierCounts).reduce((a, b) => a + b, 0) > 0 ? (tierCounts.basic / Object.values(tierCounts).reduce((a, b) => a + b, 0)) * 100 : 0}%`, minWidth: tierCounts.basic > 0 ? '30px' : '0' }}
                            >
                                <span className="text-xs text-white font-medium">{tierCounts.basic}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro */}
                    <div className="flex items-center gap-3">
                        <span className="w-20 text-sm text-[#09B7B4]">Pro</span>
                        <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                            <div
                                className="h-full bg-[#09B7B4] flex items-center justify-end pr-2"
                                style={{ width: `${Object.values(tierCounts).reduce((a, b) => a + b, 0) > 0 ? (tierCounts.pro / Object.values(tierCounts).reduce((a, b) => a + b, 0)) * 100 : 0}%`, minWidth: tierCounts.pro > 0 ? '30px' : '0' }}
                            >
                                <span className="text-xs text-white font-medium">{tierCounts.pro}</span>
                            </div>
                        </div>
                    </div>

                    {/* Business */}
                    <div className="flex items-center gap-3">
                        <span className="w-20 text-sm text-orange-400">Business</span>
                        <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                            <div
                                className="h-full bg-orange-500 flex items-center justify-end pr-2"
                                style={{ width: `${Object.values(tierCounts).reduce((a, b) => a + b, 0) > 0 ? (tierCounts.business / Object.values(tierCounts).reduce((a, b) => a + b, 0)) * 100 : 0}%`, minWidth: tierCounts.business > 0 ? '30px' : '0' }}
                            >
                                <span className="text-xs text-white font-medium">{tierCounts.business}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                    <span className="text-gray-500 text-sm">Total Users: {Object.values(tierCounts).reduce((a, b) => a + b, 0)}</span>
                </div>
            </div>

            {/* Token & User Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost & Token Summary */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-6 flex items-center gap-2">
                        <Database className="h-4 w-4 text-electric-cyan" />
                        Infrastructure Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-midnight/30 border border-white/5 rounded-xl">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Total Tokens</p>
                            <p className="text-xl font-bold text-white font-mono">{dashboardStats?.total_tokens ? (dashboardStats.total_tokens / 1000).toFixed(1) : '0.0'}k</p>
                        </div>
                        <div className="p-4 bg-midnight/30 border border-white/5 rounded-xl">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Cost per 1k</p>
                            <p className="text-xl font-bold text-electric-cyan font-mono">
                                ${((dashboardStats?.total_cost_usd || 0) / ((dashboardStats?.total_tokens || 0) / 1000 + 0.000001)).toFixed(4)}
                            </p>
                        </div>
                        <div className="p-4 bg-midnight/30 border border-white/5 rounded-xl">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Input Density</p>
                            <p className="text-xl font-bold text-white font-mono">
                                {dashboardStats?.total_tokens > 0
                                    ? Math.round((dashboardStats.total_tokens_input / dashboardStats.total_tokens) * 100)
                                    : 0}%
                            </p>
                        </div>
                        <div className="p-4 bg-midnight/30 border border-white/5 rounded-xl">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Savings ROI</p>
                            <p className="text-xl font-bold text-green-400 font-mono">
                                {dashboardStats?.total_tokens_optimized > 0
                                    ? Math.round((dashboardStats.total_tokens_saved / dashboardStats.total_tokens_optimized) * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 border border-electric-cyan/10 bg-electric-cyan/5 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Operational Efficiency</p>
                            <p className="text-[10px] text-white/40">Tokens processed vs Optimized output ratio</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-electric-cyan font-mono">High</p>
                        </div>
                    </div>
                </div>

                {/* Top Users */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 overflow-hidden">
                    <h3 className="text-sm font-medium text-white mb-6 flex items-center gap-2">
                        <Users className="h-4 w-4 text-electric-cyan" />
                        Power Users
                    </h3>
                    <div className="space-y-1">
                        {topUsers.length > 0 ? (
                            topUsers.map((user, i) => (
                                <div
                                    key={user.user_id}
                                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-transform group-hover:scale-110",
                                            i === 0 ? "bg-electric-cyan text-midnight shadow-[0_0_10px_rgba(0,255,255,0.3)]" :
                                                i === 1 ? "bg-white/20 text-white" :
                                                    i === 2 ? "bg-white/10 text-white/60" : "bg-white/5 text-white/40"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium truncate max-w-[120px] md:max-w-none">{user.email}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-electric-cyan/10 text-electric-cyan font-bold uppercase border border-electric-cyan/20">
                                                    {user.subscription_tier === "enterprise" ? "Business" : user.subscription_tier}
                                                </span>
                                                <span className="text-[9px] text-white/40">ID: {user.user_id.slice(0, 6)}...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-sm font-mono text-white flex items-center gap-1.5">
                                            {user.total_optimizations.toLocaleString()}
                                            <Zap className="h-3 w-3 text-electric-cyan fill-current" />
                                        </p>
                                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">Cost: ${user.total_cost?.toFixed(3) || "0.000"}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-64 flex items-center justify-center text-white/20 text-xs italic border border-dashed border-white/5 rounded-lg">
                                Calculating user power levels...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
