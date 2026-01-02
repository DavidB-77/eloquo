"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LanguageBanner } from "@/components/LanguageBanner";
import { useUser } from "@/providers/UserProvider";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const { userData, isLoading } = useUser();
    const [isChecking, setIsChecking] = React.useState(true);

    React.useEffect(() => {
        // Check subscription status
        if (!isLoading && userData) {
            const subscriptionStatus = (userData as any).subscriptionStatus || (userData as any).subscription_status;
            if (subscriptionStatus === 'pending') {
                router.push('/select-plan');
                return;
            }
            setIsChecking(false);
        } else if (!isLoading) {
            setIsChecking(false);
        }
    }, [isLoading, userData, router]);

    // Show loading while checking subscription status
    if (isLoading || isChecking) {
        return (
            <div className="min-h-screen bg-midnight flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-electric-cyan" />
            </div>
        );
    }

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

