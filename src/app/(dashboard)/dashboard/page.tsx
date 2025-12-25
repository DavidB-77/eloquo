"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Users, DollarSign, History, ArrowRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
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
                <h1 className="text-3xl font-bold font-display tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
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
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Optimizations</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/history">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Prompt Title</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {RECENT_PROMPTS.map((prompt) => (
                                    <TableRow key={prompt.id}>
                                        <TableCell className="font-medium">{prompt.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px]">{prompt.model}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={prompt.status === "optimized" ? "success" : "warning"} className="text-[10px] capitalize">
                                                {prompt.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">{prompt.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Zap className="h-12 w-12" />
                        </div>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold mb-2">Instant Optimize</h3>
                            <p className="text-primary-foreground/80 text-sm mb-6">
                                Ready to transform a prompt? Start now for maximum efficiency.
                            </p>
                            <Button variant="secondary" className="w-full font-bold" asChild>
                                <Link href="/dashboard/optimize">Optimize Now</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer group">
                                <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center mr-3">
                                    <History className="h-4 w-4 text-accent" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Prompt Guide</p>
                                    <p className="text-xs text-muted-foreground">Best practices for all models</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer group">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center mr-3">
                                    <Zap className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Model Comparison</p>
                                    <p className="text-xs text-muted-foreground">See how models respond</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
