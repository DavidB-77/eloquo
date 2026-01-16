"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
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
    isAdmin: boolean;
    displayName?: string;
    userId: string;
    email: string;
}

interface UserContextType {
    userData: UserData | null;
    isLoading: boolean;
    refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const convexUsage = useQuery(api.profiles.getUsage);

    // Derive loading state from query result instead of using effect
    const isLoading = convexUsage === undefined;

    const contextValue = useMemo(() => ({
        userData: (convexUsage as UserData) || null,
        isLoading,
        refreshUserData: () => { } // Convex handles automatic updates
    }), [convexUsage, isLoading]);

    return (
        <UserContext.Provider value={contextValue}>
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

