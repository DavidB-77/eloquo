"use client";

import * as React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

export function DashboardHeader() {
    const { user, signOut } = useAuth();

    return (
        <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
            {/* Search Bar - hidden on small screens */}
            <div className="hidden md:flex flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search prompts, history..."
                    className="pl-9 bg-muted/30 border-none focus-visible:ring-1"
                />
            </div>

            {/* Mobile Menu Icon (Placeholder for mobile layout) */}
            <div className="md:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
                </Button>

                <div className="h-6 w-px bg-border mx-2" />

                <Dropdown
                    trigger={
                        <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border">
                                {user?.email?.[0].toUpperCase() ?? "U"}
                            </div>
                        </div>
                    }
                    align="right"
                >
                    <div className="px-3 py-2 border-b">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Account</p>
                        <p className="text-sm font-medium truncate max-w-[150px]">{user?.email}</p>
                    </div>
                    <DropdownItem asChild>
                        <Link href="/dashboard/settings">Profile Settings</Link>
                    </DropdownItem>
                    <DropdownItem asChild>
                        <Link href="/dashboard/settings?tab=subscription">Subscription</Link>
                    </DropdownItem>
                    <DropdownItem onClick={signOut} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                        Sign Out
                    </DropdownItem>
                </Dropdown>
            </div>
        </header>
    );
}
