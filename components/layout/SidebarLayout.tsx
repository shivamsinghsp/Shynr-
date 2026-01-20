"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import SignInModal from "../auth/SignInModal";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const [signInOpen, setSignInOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar onOpenSignIn={() => setSignInOpen(true)} />

            {/* Main Content - adjusted for sidebar */}
            <main className="flex-1 md:ml-72 transition-all duration-300">
                {children}
            </main>

            {/* Sign In Modal */}
            <SignInModal
                isOpen={signInOpen}
                onClose={() => setSignInOpen(false)}
                callbackUrl="/onboarding"
            />
        </div>
    );
}
