"use client";

import * as React from "react";
import {
    Zap, Users, TrendingUp, DollarSign, Wallet,
    Activity, Layers
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCards";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type ModelStat = {
    model_name: string;
    usage_count: number;
    percentage: number;
};

type UserStat = {
    user_id: string;
    email: string;
    subscription_tier: string;
    total_optimizations: number;
    total_cost: number;
};

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = React.useState("30d");

    // Convex Data
    const dashboardStats = useQuery(api.admin.getDashboardStats);
    const dailyDataRaw = useQuery(api.admin.getDailyOptimizations, { days: timeRange === "7d" ? 7 : 30 });
    const topUsersRaw = useQuery(api.admin.getTopUsersDetailed, { limit: 10 });
    const modelStatsRaw = useQuery(api.admin.getModelUsageStats);
    const financialData = useQuery(api.admin.getFinancialSummary);

    const loading = dashboardStats === undefined;

    const dailyData = (dailyDataRaw || []) as { date: string; count: number }[];
    const topUsers = (topUsersRaw || []) as UserStat[];
    const modelStats = (modelStatsRaw || []) as ModelStat[];

    // Derived metrics
    const dailyBurnRate = financialData?.totals?.total_api_cost ? financialData.totals.total_api_cost / 30 : 0;
    const costPerOptimization = financialData?.totals?.total_requests ? financialData.totals.total_api_cost / financialData.totals.total_requests : 0;


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
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Estimated Balance</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white font-mono">
                                            ${(financialData?.totals?.total_profit || 0).toFixed(2)}
                                        </span>
                                        <span className="text-sm text-electric-cyan font-medium">Profit</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest transition-colors group-hover:text-white/60">Est. Daily Burn</span>
                            <span className="text-sm font-mono text-white">${dailyBurnRate.toFixed(2)}/day</span>
                        </div>
                        <div className="flex justify-between items-center group border-t border-white/5 pt-3">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest transition-colors group-hover:text-white/60">Cost/Optimization</span>
                            <span className="text-sm font-mono text-white">${costPerOptimization.toFixed(3)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row - Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={dashboardStats?.totalUsers?.toLocaleString() || "—"}
                    icon={<Users className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="User Growth"
                    value={dashboardStats?.userGrowth || "—"}
                    icon={<TrendingUp className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Est. Revenue"
                    value={`$${(financialData?.totals?.total_revenue || 0).toFixed(2)}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Optimizations Today"
                    value={dashboardStats?.optimizationsToday?.toLocaleString() || "—"}
                    icon={<Zap className="h-5 w-5" />}
                    loading={loading}
                />
                <StatCard
                    title="Total Requests"
                    value={financialData?.totals?.total_requests?.toLocaleString() || "—"}
                    icon={<Activity className="h-5 w-5" />}
                    loading={loading}
                />
            </div>

            {/* Project Protocol Metrics Row */}
            <div className="bg-[#1a1a1a] border border-electric-cyan/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🚀</span>
                    <h3 className="text-sm font-medium text-white">Project Protocol Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-midnight/50 rounded-lg p-4 border border-white/5">
                        <p className="text-xs text-white/50 mb-1">PP Generations</p>
                        <p className="text-2xl font-bold text-white">{financialData?.bmad?.total_generations || 0}</p>
                    </div>
                    <div className="bg-midnight/50 rounded-lg p-4 border border-white/5">
                        <p className="text-xs text-white/50 mb-1">PP API Cost</p>
                        <p className="text-2xl font-bold text-sunset-orange">${(financialData?.bmad?.total_api_cost || 0).toFixed(4)}</p>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    Revenue & Profit (Estimated)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-midnight/50 rounded-lg p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Est. Revenue</p>
                        <p className="text-lg font-bold text-electric-cyan">${(financialData?.totals?.total_revenue || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-midnight/50 rounded-lg p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Total API Cost</p>
                        <p className="text-lg font-bold text-sunset-orange">${(financialData?.totals?.total_api_cost || 0).toFixed(4)}</p>
                    </div>
                    <div className="bg-midnight/50 rounded-lg p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Est. Profit</p>
                        <p className="text-lg font-bold text-green-400">${(financialData?.totals?.total_profit || 0).toFixed(2)}</p>
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
                    </div>
                    <div className="flex items-end justify-between h-48 gap-px md:gap-1 pt-4">
                        {dailyData.length > 0 ? (
                            dailyData.map((day, i) => {
                                const maxVal = Math.max(...dailyData.map(d => d.count || 1));
                                const height = ((day.count || 0) / maxVal) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                                        <div
                                            className="w-full bg-[#09B7B4]/40 rounded-t-sm transition-all group-hover:bg-[#09B7B4] group-hover:shadow-[0_0_15px_rgba(9,183,180,0.3)]"
                                            style={{ height: `${height}%` } as React.CSSProperties}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-white/20 text-xs italic">
                                No throughput data available
                            </div>
                        )}
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
                                            <span className="text-white">{model.usage_count.toLocaleString()} ({Math.round(percentage)}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-electric-cyan to-electric-cyan/60 rounded-full"
                                                style={{ width: `${percentage}%` } as React.CSSProperties}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-48 flex items-center justify-center text-white/20 text-xs italic">
                                Pending model usage data...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Power Users */}
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
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                                        i === 0 ? "bg-electric-cyan text-midnight shadow-[0_0_10px_rgba(0,255,255,0.3)]" :
                                            i === 1 ? "bg-white/20 text-white" :
                                                i === 2 ? "bg-white/10 text-white/60" : "bg-white/5 text-white/40"
                                    )}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium truncate max-w-[200px]">{user.email}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-electric-cyan/10 text-electric-cyan font-bold uppercase border border-electric-cyan/20">
                                                {user.subscription_tier}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-white flex items-center justify-end gap-1.5">
                                        {user.total_optimizations.toLocaleString()}
                                        <Zap className="h-3 w-3 text-electric-cyan fill-current" />
                                    </p>
                                    <p className="text-[9px] text-white/40 font-bold uppercase">Cost: ${user.total_cost?.toFixed(3) || "0.000"}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 flex items-center justify-center text-white/20 text-xs italic">
                            No power user data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
