"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Zap,
    History,
    ChevronLeft,
    ChevronRight,
    LifeBuoy,
    Settings,
    LogOut
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/BetterAuthProvider";
import { useUser } from "@/providers/UserProvider";

import { UsageBar } from "@/components/dashboard/UsageBar";

import { FreeTierIndicator } from '@/components/FreeTierIndicator';

const NAV_LINKS = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/optimize", icon: Zap, label: "Optimize" },
    { href: "/dashboard/history", icon: History, label: "History" },
    { href: "/dashboard/support", icon: LifeBuoy, label: "Support" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const { user, signOut } = useAuth();

    const { userData } = useUser();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-full transition-all duration-300 ease-in-out glass rounded-none border-r border-electric-cyan/20 bg-midnight/60",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Header/Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-electric-cyan/10">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="flex items-center space-x-2 pl-2">
                            <span className="font-display text-2xl tracking-widest text-white glow-sm uppercase font-[Comodo] tracking-[0.05em]">ELOQUO</span>
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
                        className={cn("hidden lg:flex hover:bg-electric-cyan/10 text-white/40 hover:text-white", isCollapsed ? "mx-auto" : "")}
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

                {/* Usage Display - Show Credits for Paid Users Only */}
                {!isCollapsed && userData && userData.tier !== 'free' && (
                    <div className="px-5 py-8">
                        <div className="glass bg-deep-teal/20 border-electric-cyan/20 p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="h-12 w-12 text-electric-cyan" />
                            </div>
                            <div className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em] mb-4">Subscription Tier</div>
                            <div className="font-display text-md mb-4 capitalize text-white flex items-center gap-2">
                                {userData.tier === "enterprise" ? "Business" : userData.tier}
                                <Badge variant="pro" className="py-0 px-1.5 h-4">Active</Badge>
                            </div>
                            <UsageBar
                                used={userData.optimizationsUsed}
                                limit={userData.optimizationsLimit}
                                label="Credits"
                                showNumbers={true}
                            />
                            <div className="mt-2 text-[9px] text-white/30 font-mono">
                                1 opt = 1 credit • Project Protocol = 5
                            </div>
                        </div>
                    </div>
                )}

                {/* Free Tier Indicator - Show for Free Users Only */}
                {!isCollapsed && userData && userData.tier === 'free' && <FreeTierIndicator className="mx-3 mb-4" />}

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
                                    className="text-xs text-white/40 hover:text-terracotta flex items-center mt-0.5 transition-colors"
                                >
                                    <LogOut className="h-3 w-3 mr-1" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside >
    );
}
