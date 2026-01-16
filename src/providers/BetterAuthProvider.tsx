"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signOut as authSignOut } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Types for our auth context
interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
    // For backward compatibility with components expecting Supabase-style user_metadata
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    signOut: async () => { },
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
            // Provide user_metadata for backward compatibility
            user_metadata: {
                full_name: session.user.name || undefined,
                avatar_url: session.user.image || undefined,
            },
        }
        : null;

    const handleSignOut = async () => {
        await authSignOut({
            fetchOptions: {
                onSuccess: () => {
                    // Redirect to login page after sign out
                    window.location.href = "/login";
                }
            }
        });
    };

    const value: AuthContextType = {
        user,
        isLoading: isPending,
        isAuthenticated: !!session?.user,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

