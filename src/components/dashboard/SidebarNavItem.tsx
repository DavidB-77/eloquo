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
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group relative",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
        >
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
            {!isCollapsed && (
                <span className="font-medium text-sm transition-opacity duration-300">
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
