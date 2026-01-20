"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import SignInModal from "@/components/auth/SignInModal";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [signInOpen, setSignInOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        // If not authenticated, redirect to sign-in page
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Show loading while checking auth
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    // If not authenticated, show nothing (will redirect)
    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                onOpenSignIn={() => setSignInOpen(true)}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                isProtectedRoute={true}
            />

            {/* Main Content - adjusted for sidebar state */}
            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-72'}`}>
                {children}
            </main>

            {/* Sign In Modal (fallback) */}
            <SignInModal
                isOpen={signInOpen}
                onClose={() => setSignInOpen(false)}
                callbackUrl="/jobs"
            />
        </div>
    );
}

