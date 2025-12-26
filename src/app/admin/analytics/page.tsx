"use client";

import * as React from "react";
import { BarChart3, Zap, Users, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCards";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_STATS = {
    totalOptimizations: 24567,
    avgPerUser: 19.7,
    avgTokensSaved: 127,
    avgProcessingTime: 3420,
};

const MOCK_MODEL_DISTRIBUTION = [
    { model: "Universal", count: 8432, percentage: 34 },
    { model: "ChatGPT", count: 6891, percentage: 28 },
    { model: "Claude", count: 5124, percentage: 21 },
    { model: "Gemini", count: 2467, percentage: 10 },
    { model: "Cursor", count: 1653, percentage: 7 },
];

const MOCK_STRENGTH_DISTRIBUTION = [
    { strength: "Light", count: 4912, percentage: 20 },
    { strength: "Medium", count: 14740, percentage: 60 },
    { strength: "Aggressive", count: 4915, percentage: 20 },
];

const MOCK_TOP_USERS = [
    { name: "Alex Wilson", email: "alex@agency.co", plan: "Enterprise", optimizations: 1284 },
    { name: "John Smith", email: "john@example.com", plan: "Pro", optimizations: 892 },
    { name: "Sarah Johnson", email: "sarah@techinc.com", plan: "Team", optimizations: 567 },
    { name: "Mike Chen", email: "mike@startup.io", plan: "Pro", optimizations: 412 },
    { name: "Emma Davis", email: "emma@corp.com", plan: "Pro", optimizations: 389 },
];

const MOCK_DAILY_OPTIMIZATIONS = [
    { day: "Mon", count: 412 },
    { day: "Tue", count: 387 },
    { day: "Wed", count: 456 },
    { day: "Thu", count: 498 },
    { day: "Fri", count: 512 },
    { day: "Sat", count: 234 },
    { day: "Sun", count: 198 },
];

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = React.useState("30d");

    return (
        <div className="space-y-6">
            {/* Date Range Selector */}
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
                            "px-4 py-2 text-sm rounded-lg transition-colors",
                            timeRange === range.value
                                ? "bg-[#09B7B4] text-white"
                                : "bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/10"
                        )}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Optimizations"
                    value={MOCK_STATS.totalOptimizations.toLocaleString()}
                    icon={<Zap className="h-5 w-5" />}
                />
                <StatCard
                    title="Avg per User"
                    value={MOCK_STATS.avgPerUser.toFixed(1)}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="Avg Tokens Saved"
                    value={MOCK_STATS.avgTokensSaved}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                    title="Avg Processing Time"
                    value={`${(MOCK_STATS.avgProcessingTime / 1000).toFixed(1)}s`}
                    icon={<Clock className="h-5 w-5" />}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimizations Chart */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">📈 Daily Optimizations (This Week)</h3>
                    <div className="flex items-end justify-between h-40 gap-2 pt-4">
                        {MOCK_DAILY_OPTIMIZATIONS.map((day) => (
                            <div key={day.day} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-[#09B7B4]/80 rounded-t transition-all hover:bg-[#09B7B4]"
                                    style={{ height: `${(day.count / 512) * 100}%` }}
                                />
                                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                                <span className="text-xs text-gray-400">{day.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Model Distribution */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">🎯 Model Distribution</h3>
                    <div className="space-y-3">
                        {MOCK_MODEL_DISTRIBUTION.map((model) => (
                            <div key={model.model} className="flex items-center gap-3">
                                <span className="text-sm text-gray-400 w-20">{model.model}</span>
                                <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#09B7B4] to-[#09B7B4]/60"
                                        style={{ width: `${model.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-white w-12 text-right">{model.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Strength & Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strength Distribution */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">⚡ Optimization Strength</h3>
                    <div className="space-y-3">
                        {MOCK_STRENGTH_DISTRIBUTION.map((item) => (
                            <div key={item.strength} className="flex items-center gap-3">
                                <span className="text-sm text-gray-400 w-24">{item.strength}</span>
                                <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full",
                                            item.strength === "Light" && "bg-blue-500",
                                            item.strength === "Medium" && "bg-[#09B7B4]",
                                            item.strength === "Aggressive" && "bg-[#E57844]"
                                        )}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-white w-12 text-right">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Users */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">🏆 Top Users This Month</h3>
                    <div className="space-y-3">
                        {MOCK_TOP_USERS.map((user, i) => (
                            <div
                                key={user.email}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            i === 0 && "bg-yellow-500/20 text-yellow-400",
                                            i === 1 && "bg-gray-400/20 text-gray-300",
                                            i === 2 && "bg-orange-500/20 text-orange-400",
                                            i > 2 && "bg-white/5 text-gray-500"
                                        )}
                                    >
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-white">{user.optimizations.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{user.plan}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
