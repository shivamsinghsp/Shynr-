"use client"

import { Phone } from "lucide-react"

export default function FloatingCallButton() {
    return (
        <a
            href="tel:05124050588"
            className="fixed bottom-10 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_20px_rgba(5,3,62,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(5,3,62,0.6)] animate-bounce-slow group"
            style={{
                backgroundColor: "#05033e",
                color: "white"
            }}
            aria-label="Call Us"
        >
            <div className="absolute inset-0 rounded-full border-2 border-[#05033e] opacity-50 animate-ping" />
            <Phone className="w-6 h-6 fill-current relative z-10" />
        </a>
    )
}
