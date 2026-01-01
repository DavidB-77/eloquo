"use client";

import * as React from "react";
import {
    Zap,
    Activity,
    Users,
    Clock,
    History,
    ArrowRight,
    Settings,
    LayoutDashboard,
    Star
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@/providers/UserProvider";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
    const { userData } = useUser();
    const [historyData, setHistoryData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/history?limit=5");
                const data = await res.json();
                if (data.success) {
                    setHistoryData(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const stats = historyData?.stats || {};
    const totalOptimizations = stats.total_optimizations || 0;
    const tokensSaved = stats.tokens_saved || stats.total_tokens_saved || 0;
    const tokensOriginalTotal = stats.tokens_original_total || 0;

    const avgSavingsPercent = stats.avg_savings_percent || (tokensOriginalTotal > 0
        ? (tokensSaved / tokensOriginalTotal) * 100
        : 0);

    const recentPrompts = historyData?.history || [];

    // Calculate avg quality score and ratings count from stats
    const avgQualityScore = stats.avg_quality_score || 0;
    const ratingsGiven = stats.ratings_given || 0;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-4xl font-display text-white glow-sm tracking-tighter">Dashboard</h1>
                <p className="text-white/60 mt-2 font-medium tracking-wide border-l-2 border-electric-cyan pl-4">
                    Welcome back
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Optimizations"
                    value={totalOptimizations.toLocaleString()}
                    icon={Zap}
                    description="All-time optimizations"
                />
                <StatsCard
                    title="Avg Quality Score"
                    value={avgQualityScore > 0 ? avgQualityScore.toFixed(1) : "—"}
                    icon={Activity}
                    description="Across all optimizations"
                />
                <StatsCard
                    title="Active Models"
                    value={userData ? "6+" : "0"}
                    icon={Users}
                    description="Multi-model support"
                />
                <StatsCard
                    title="Ratings Given"
                    value={ratingsGiven.toLocaleString()}
                    icon={Star}
                    description="Help improve Eloquo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 glass border-electric-cyan/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-electric-cyan/10 bg-midnight/20">
                        <CardTitle className="text-white font-display uppercase tracking-widest text-lg">
                            Recent Optimizations
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-electric-cyan hover:bg-electric-cyan/10">
                            <Link href="/dashboard/history" className="flex items-center">
                                View History <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-electric-cyan/10">
                                    <TableHead className="text-white/40 uppercase text-[10px] font-bold tracking-widest pl-6">Title</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Engine</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Status</TableHead>
                                    <TableHead className="text-right text-white/40 uppercase text-[10px] font-bold tracking-widest pr-6">Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-white/20 italic">
                                            Loading history...
                                        </TableCell>
                                    </TableRow>
                                ) : recentPrompts.length > 0 ? (
                                    recentPrompts.map((prompt: any) => (
                                        <TableRow key={prompt.id} className="hover:bg-electric-cyan/5 border-electric-cyan/5 transition-colors group">
                                            <TableCell className="font-bold text-white pl-6 max-w-[200px] truncate">
                                                {prompt.original_prompt.substring(0, 50)}...
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-deep-teal text-electric-cyan border-electric-cyan/20 px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                                                    {prompt.target_model}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-electric-cyan/10 text-electric-cyan border-electric-cyan/20 px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                                                    OPTIMIZED
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-white/40 pr-6 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                                {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-white/20 italic">
                                            No optimizations yet. Start optimizing to see your history.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-6">

                    <Card className="glass border-electric-cyan/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-display uppercase tracking-[0.2em] text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/dashboard/history" className="flex items-center p-4 rounded-xl border border-electric-cyan/5 bg-deep-teal/10 hover:bg-electric-cyan/5 hover:border-electric-cyan/20 transition-all cursor-pointer group">
                                <div className="h-8 w-8 rounded-lg bg-sunset-orange/10 flex items-center justify-center mr-3 border border-sunset-orange/20">
                                    <History className="h-4 w-4 text-sunset-orange" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">View History</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-tighter opacity-60">See all past optimizations</p>
                                </div>
                                <ArrowRight className="h-3 w-3 text-electric-cyan opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                            <Link href="/dashboard/settings" className="flex items-center p-4 rounded-xl border border-electric-cyan/5 bg-deep-teal/10 hover:bg-electric-cyan/5 hover:border-electric-cyan/20 transition-all cursor-pointer group">
                                <div className="h-8 w-8 rounded-lg bg-electric-cyan/10 flex items-center justify-center mr-3 border border-electric-cyan/20">
                                    <Settings className="h-4 w-4 text-electric-cyan" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Settings</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-tighter opacity-60">Manage account settings</p>
                                </div>
                                <ArrowRight className="h-3 w-3 text-electric-cyan opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
