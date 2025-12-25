"use client";

import * as React from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LanguageBanner } from "@/components/LanguageBanner";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <div className="lg:pl-64 h-full flex flex-col">
                    <LanguageBanner />
                    <DashboardHeader />
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
