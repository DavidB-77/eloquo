"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Types for our auth context
interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
});

export function useAuth() {
    return useContext(AuthContext);
}

export function BetterAuthProvider({ children }: { children: ReactNode }) {
    // Use Better Auth session hook
    const { data: session, isPending } = useSession();

    // Get user data from Convex
    const convexUser = useQuery(api.auth.getCurrentUser);

    const user: User | null = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            emailVerified: session.user.emailVerified,
        }
        : null;

    const value: AuthContextType = {
        user,
        isLoading: isPending,
        isAuthenticated: !!session?.user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
