"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useCallback } from "react";

export function useAuth() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const user = session?.user;

    const login = useCallback(async (provider?: string) => {
        setIsLoading(true);
        try {
            if (provider) {
                await signIn(provider, { callbackUrl: "/onboarding" });
            } else {
                await signIn();
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await signOut({ callbackUrl: "/" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const requireAuth = useCallback((callback: () => void, onUnauthenticated?: () => void) => {
        if (isAuthenticated) {
            callback();
        } else if (onUnauthenticated) {
            onUnauthenticated();
        }
    }, [isAuthenticated]);

    return {
        session,
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoading,
        login,
        logout,
        requireAuth,
    };
}
