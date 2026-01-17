"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    DollarSign,
    BarChart3,
    MessageSquare,
    Settings,
    LogOut,
    Shield,
    ChevronLeft,
    ChevronRight,
    Megaphone,
    Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const NAV_ITEMS = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/pricing", label: "Pricing", icon: Tag },
    { href: "/admin/support", label: "Support", icon: MessageSquare },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);

    // Fetch open ticket count for admin
    const openTicketCount = useQuery(api.support.countOpenTickets) ?? 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full bg-[#111] border-r border-white/10 flex flex-col transition-all duration-300 z-50",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-[#09B7B4] flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-white">Admin</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                                    isActive
                                        ? "bg-[#09B7B4]/20 text-[#09B7B4]"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <div className="relative">
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {item.href === "/admin/support" && openTicketCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                                {!collapsed && <span className="text-sm font-medium flex-1">{item.label}</span>}
                                {!collapsed && item.href === "/admin/support" && openTicketCount > 0 && (
                                    <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {openTicketCount > 9 ? "9+" : openTicketCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-white/10">
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all",
                        )}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Exit Admin</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300",
                    collapsed ? "ml-16" : "ml-64"
                )}
            >
                {/* Header Bar */}
                <header className="h-16 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
                    <h1 className="text-lg font-semibold text-white">
                        {NAV_ITEMS.find(item =>
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href))
                        )?.label || "Admin"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Last sync: just now</span>
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                            Refresh
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
