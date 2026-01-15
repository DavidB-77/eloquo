"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/providers/BetterAuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UserData {
    tier: "free" | "basic" | "pro" | "business" | "enterprise";
    optimizationsUsed: number;
    optimizationsLimit: number;
    premiumCreditsUsed: number;
    premiumCreditsLimit: number;
    canOptimize: boolean;
    canOrchestrate: boolean;
    hasMcpAccess: boolean;
    comprehensiveCreditsRemaining: number;
    subscriptionStatus?: string;
}

interface UserContextType {
    userData: UserData | null;
    isLoading: boolean;
    refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const convexUsage = useQuery(api.profiles.getUsage);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (convexUsage !== undefined) {
            setIsLoading(false);
        }
    }, [convexUsage]);

    return (
        <UserContext.Provider value={{
            userData: convexUsage as any || null,
            isLoading,
            refreshUserData: () => { } // Convex handles automatic updates
        }}>
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
