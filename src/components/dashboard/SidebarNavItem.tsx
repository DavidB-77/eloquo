"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isCollapsed?: boolean;
}

export function SidebarNavItem({ href, icon: Icon, label, isCollapsed }: SidebarNavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group relative",
                isActive
                    ? "bg-electric-cyan/10 text-electric-cyan shadow-[0_0_15px_rgba(9,183,180,0.2)] border border-electric-cyan/20"
                    : "text-white/60 hover:text-white hover:bg-electric-cyan/5"
            )}
        >
            <Icon className={cn("h-5 w-5 shrink-0 transition-all duration-300", isActive ? "text-white glow-sm" : "text-white/40 group-hover:text-white")} />
            {!isCollapsed && (
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] transition-opacity duration-300">
                    {label}
                </span>
            )}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap border">
                    {label}
                </div>
            )}
        </Link>
    );
}
