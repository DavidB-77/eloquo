"use client";

import * as React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useAuth } from "@/providers/AuthProvider";
import { FreeTierIndicator } from '@/components/FreeTierIndicator';
import Link from "next/link";

export function DashboardHeader() {
    const { user, signOut } = useAuth();

    return (
        <header className="h-16 border-b border-electric-cyan/10 bg-midnight/40 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between glass rounded-none border-x-0 border-t-0">
            {/* Search Bar - hidden on small screens */}
            <div className="hidden md:flex flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                    placeholder="Search prompts, history..."
                    className="pl-9 bg-deep-teal/30 border-electric-cyan/10 focus-visible:ring-electric-cyan/30 text-white placeholder:text-white/20"
                />
            </div>

            {/* Mobile Menu Icon (Placeholder for mobile layout) */}
            <div className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-electric-cyan/10">
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
                <FreeTierIndicator compact className="hidden md:flex mr-4" />

                <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-electric-cyan/10">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-electric-cyan rounded-full border-2 border-midnight shadow-[0_0_8px_rgba(9,183,180,0.8)]" />
                </Button>

                <div className="h-6 w-px bg-electric-cyan/10 mx-2" />

                <Dropdown
                    trigger={
                        <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-lg hover:bg-electric-cyan/5 transition-colors group">
                            <div className="h-8 w-8 rounded-full bg-electric-cyan/10 flex items-center justify-center text-electric-cyan font-bold text-xs border border-electric-cyan/20 group-hover:border-electric-cyan/40 transition-all">
                                {user?.email?.[0].toUpperCase() ?? "U"}
                            </div>
                        </div>
                    }
                    align="right"
                >
                    <div className="px-3 py-2 border-b border-electric-cyan/10">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Account</p>
                        <p className="text-sm font-medium truncate max-w-[150px] text-white">{user?.email}</p>
                    </div>
                    <DropdownItem asChild className="hover:bg-electric-cyan/10 hover:text-white cursor-pointer transition-colors">
                        <Link href="/dashboard/settings">Profile Settings</Link>
                    </DropdownItem>
                    <DropdownItem asChild className="hover:bg-electric-cyan/10 hover:text-white cursor-pointer transition-colors">
                        <Link href="/dashboard/settings?tab=subscription">Subscription</Link>
                    </DropdownItem>
                    <DropdownItem onClick={signOut} className="text-terracotta focus:bg-terracotta/10 focus:text-terracotta cursor-pointer transition-colors">
                        Sign Out
                    </DropdownItem>
                </Dropdown>
            </div>
        </header>
    );
}
