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
                "fixed left-0 top-0 z-40 h-full border-r bg-card transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Header/Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-primary-foreground fill-current" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight">Eloquo</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                            <Zap className="h-5 w-5 text-primary-foreground fill-current" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn("hidden lg:flex", isCollapsed ? "mx-auto" : "")}
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
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Current Plan</div>
                            <div className="font-bold text-sm mb-3 capitalize">{userData.tier} Individual</div>
                            <UsageBar
                                used={userData.optimizationsUsed}
                                limit={userData.optimizationsLimit}
                                label="Optimizations"
                                showNumbers={true}
                            />
                            <div className="mt-3">
                                <Link href="/dashboard/settings?tab=subscription" className="text-xs text-primary font-bold hover:underline">
                                    Upgrade Plan
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer/User */}
                <div className="border-t p-4">
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {user?.email?.[0].toUpperCase() ?? "U"}
                            </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? "User"}
                                </p>
                                <button
                                    onClick={signOut}
                                    className="text-xs text-muted-foreground hover:text-destructive flex items-center mt-0.5 transition-colors"
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
