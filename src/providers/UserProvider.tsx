"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface UserData {
    tier: "free" | "pro" | "team" | "enterprise";
    optimizationsUsed: number;
    optimizationsLimit: number;
    premiumCreditsUsed: number;
    premiumCreditsLimit: number;
    canOptimize: boolean;
    canOrchestrate: boolean;
    hasMcpAccess: boolean;
    comprehensiveCreditsRemaining: number;
}

interface UserContextType {
    userData: UserData | null;
    isLoading: boolean;
    refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserData = useCallback(async () => {
        if (!user) {
            setUserData(null);
            return;
        }

        try {
            // Don't set loading true on refresh to avoid UI flicker
            if (!userData) setIsLoading(true);

            const res = await fetch("/api/usage");
            const data = await res.json();

            if (data.success && data.data) {
                setUserData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, userData]);

    useEffect(() => {
        fetchUserData();
    }, [user]); // Re-fetch when user changes

    return (
        <UserContext.Provider value={{ userData, isLoading, refreshUserData: fetchUserData }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
