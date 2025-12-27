"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Users, DollarSign, History, ArrowRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import Link from "next/link";

const RECENT_PROMPTS = [
    { id: "1", title: "Marketing Blog Post", model: "GPT-4", status: "optimized", date: "2 mins ago" },
    { id: "2", title: "Customer Support Email", model: "Claude 3", status: "optimized", date: "15 mins ago" },
    { id: "3", title: "Product Description", model: "Gemini Pro", status: "optimized", date: "1 hour ago" },
    { id: "4", title: "Sales Script", model: "GPT-4", status: "processing", date: "Just now" },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-4xl font-display text-white glow-sm">Dashboard Overview</h1>
                <p className="text-white/60 mt-2 font-medium tracking-wide border-l-2 border-electric-cyan pl-4">
                    WELCOME BACK, OPERATIVE. SYSTEM STATUS: <span className="text-electric-cyan animate-pulse">OPTIMIZED</span>
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Optimizations"
                    value="154"
                    icon={Zap}
                    trend={{ value: "12%", isPositive: true }}
                    description="Across all models"
                />
                <StatsCard
                    title="Tokens Saved"
                    value="45.2K"
                    icon={Activity}
                    trend={{ value: "24%", isPositive: true }}
                    description="Avg. 32% per prompt"
                />
                <StatsCard
                    title="Active Models"
                    value="3"
                    icon={Users}
                    description="GPT-4, Claude, Gemini"
                />
                <StatsCard
                    title="Cost Reduction"
                    value="$128.40"
                    icon={DollarSign}
                    trend={{ value: "8%", isPositive: true }}
                    description="This month"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 glass border-electric-cyan/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-electric-cyan/10 bg-midnight/20">
                        <CardTitle className="text-white font-display uppercase tracking-widest text-lg">
                            Archive Records
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-electric-cyan hover:bg-electric-cyan/10">
                            <Link href="/dashboard/history" className="flex items-center">
                                Access Full History <ArrowRight className="ml-2 h-4 w-4" />
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
                                {RECENT_PROMPTS.map((prompt) => (
                                    <TableRow key={prompt.id} className="hover:bg-electric-cyan/5 border-electric-cyan/5 transition-colors group">
                                        <TableCell className="font-bold text-white pl-6">{prompt.title}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-deep-teal text-electric-cyan border-electric-cyan/20 px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                                                {prompt.model}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "px-2 py-0 text-[10px] uppercase font-bold tracking-wider",
                                                    prompt.status === "optimized"
                                                        ? "bg-electric-cyan/10 text-electric-cyan border-electric-cyan/20"
                                                        : "bg-sunset-orange/10 text-sunset-orange border-sunset-orange/20"
                                                )}
                                            >
                                                {prompt.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-white/40 pr-6 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                            {prompt.date}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <Link href="/dashboard/optimize" className="group">
                        <Card className="relative overflow-hidden glass border-electric-cyan/20 cursor-pointer h-full transition-all group-hover:border-electric-cyan/40">
                            <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/20 via-transparent to-sunset-orange/20 opacity-40 group-hover:opacity-70 transition-opacity" />
                            <div className="absolute -top-4 -right-4 h-24 w-24 bg-electric-cyan/10 blur-3xl rounded-full" />

                            <CardContent className="relative pt-8 pb-8 flex flex-col items-center text-center">
                                <div className="h-16 w-16 rounded-2xl btn-gradient flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(9,183,180,0.4)] group-hover:scale-110 transition-transform duration-500">
                                    <Zap className="h-8 w-8 text-white fill-current" />
                                </div>
                                <h3 className="text-2xl font-display text-white mb-2 uppercase tracking-widest glow-sm">Ignite Base</h3>
                                <p className="text-white/40 text-xs font-bold leading-relaxed mb-8 max-w-[200px] uppercase tracking-tighter">
                                    INITIALIZE NEW PROMPT TRANSFORM SEQUENCE
                                </p>
                                <div className="flex items-center text-electric-cyan text-[10px] font-bold tracking-[0.3em] uppercase group-hover:gap-4 transition-all">
                                    START SESSION <ArrowRight className="ml-2 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="glass border-electric-cyan/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-display uppercase tracking-[0.2em] text-white">Neural Hub</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center p-3 rounded-xl border border-electric-cyan/5 bg-deep-teal/10 hover:bg-electric-cyan/5 hover:border-electric-cyan/20 transition-all cursor-pointer group">
                                <div className="h-8 w-8 rounded-lg bg-sunset-orange/10 flex items-center justify-center mr-3 border border-sunset-orange/20">
                                    <History className="h-4 w-4 text-sunset-orange" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Prompt Codex</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-tighter opacity-60">Architectural guidelines</p>
                                </div>
                                <ArrowRight className="h-3 w-3 text-electric-cyan opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </div>
                            <div className="flex items-center p-3 rounded-xl border border-electric-cyan/5 bg-deep-teal/10 hover:bg-electric-cyan/5 hover:border-electric-cyan/20 transition-all cursor-pointer group">
                                <div className="h-8 w-8 rounded-lg bg-electric-cyan/10 flex items-center justify-center mr-3 border border-electric-cyan/20">
                                    <Zap className="h-4 w-4 text-electric-cyan" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Engine Matrix</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-tighter opacity-60">Cross-model comparison</p>
                                </div>
                                <ArrowRight className="h-3 w-3 text-electric-cyan opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
