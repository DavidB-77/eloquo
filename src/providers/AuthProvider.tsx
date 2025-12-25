"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error) throw error;
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
                router.refresh();
            }
        );

        setData();

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [supabase, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const value = {
        user,
        session,
        isLoading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
