"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Zap,
    History,
    Bookmark,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import { useUser } from "@/providers/UserProvider";

import { UsageBar } from "@/components/dashboard/UsageBar";

const NAV_LINKS = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/optimize", icon: Zap, label: "Optimize" },
    { href: "/dashboard/history", icon: History, label: "History" },
    { href: "/dashboard/saved", icon: Bookmark, label: "Library" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const { userData } = useUser();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-full transition-all duration-300 ease-in-out glass rounded-none border-r border-electric-cyan/20",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Header/Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-electric-cyan/10">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="h-8 w-8 btn-gradient rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-white fill-current" />
                            </div>
                            <span className="font-display text-2xl tracking-tight text-white glow-sm">Eloquo</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <div className="h-8 w-8 btn-gradient rounded-lg flex items-center justify-center mx-auto">
                            <Zap className="h-5 w-5 text-white fill-current" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn("hidden lg:flex hover:bg-electric-cyan/10 text-dusty-rose", isCollapsed ? "mx-auto" : "")}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {NAV_LINKS.map((link) => (
                        <SidebarNavItem
                            key={link.href}
                            href={link.href}
                            icon={link.icon}
                            label={link.label}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </nav>

                {/* Usage Display (Hidden when collapsed) */}
                {!isCollapsed && userData && (
                    <div className="px-4 py-6">
                        <div className="bg-deep-teal/40 border border-electric-cyan/20 rounded-xl p-4 glass">
                            <div className="text-[10px] font-bold text-electric-cyan uppercase tracking-wider mb-2">Current Plan</div>
                            <div className="font-display text-sm mb-3 capitalize text-white">{userData.tier} Individual</div>
                            <UsageBar
                                used={userData.optimizationsUsed}
                                limit={userData.optimizationsLimit}
                                label="Optimizations"
                                showNumbers={true}
                            />
                            <div className="mt-4">
                                <Link href="/dashboard/settings?tab=subscription" className="text-xs text-sunset-orange font-bold hover:glow-sm transition-all">
                                    Upgrade Plan
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer/User */}
                <div className="border-t border-electric-cyan/10 p-4">
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
                        <Avatar className="h-9 w-9 border-electric-cyan/20">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-electric-cyan/10 text-electric-cyan font-bold">
                                {user?.email?.[0].toUpperCase() ?? "U"}
                            </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-white">
                                    {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? "User"}
                                </p>
                                <button
                                    onClick={signOut}
                                    className="text-xs text-dusty-rose hover:text-terracotta flex items-center mt-0.5 transition-colors"
                                >
                                    <LogOut className="h-3 w-3 mr-1" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
