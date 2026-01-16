"use client"

import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"

interface ComingSoonProps {
    pageName: string
}

export default function ComingSoon({ pageName }: ComingSoonProps) {
    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Gradient & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted to-background z-0" />

            {/* Animated Neon Lines */}
            <div className="absolute inset-0 z-[1] opacity-20">
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#05033e] to-transparent animate-pulse" />
                <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#05033e] to-transparent animate-pulse delay-75" />
            </div>

            <div className="relative z-10 text-center px-6">
                {/* Animated Icon */}
                <div className="w-24 h-24 mx-auto mb-8 rounded-full border-4 border-[#05033e] flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(5,3,62,0.3)] bg-background">
                    <Clock className="w-10 h-10 text-[#05033e]" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
                    {pageName} <span className="block text-[#05033e] drop-shadow-[0_0_10px_rgba(5,3,62,0.8)] mt-2">Coming Soon</span>
                </h1>

                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                    We are currently crafting an extraordinary experience for this section.
                    Stay tuned for updates as we build the future of workforce solutions.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 border border-transparent hover:border-[#05033e] bg-[#05033e] text-white hover:bg-black hover:text-white shadow-[0_0_20px_rgba(5,3,62,0.4)] hover:shadow-[0_0_40px_rgba(5,3,62,0.6)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </main>
    )
}
