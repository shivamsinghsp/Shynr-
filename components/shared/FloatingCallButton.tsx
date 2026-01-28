"use client"

import { useState, useEffect } from "react"

import { Phone } from "lucide-react"

export default function FloatingCallButton() {
    const [isOverFooter, setIsOverFooter] = useState(false)

    useEffect(() => {
        const checkOverlap = () => {
            const button = document.getElementById("floating-call-btn")
            const footer = document.getElementById("main-footer")

            if (button && footer) {
                const buttonRect = button.getBoundingClientRect()
                const footerRect = footer.getBoundingClientRect()

                // Check if button overlaps with footer
                const isOverlapping = !(
                    buttonRect.bottom < footerRect.top ||
                    buttonRect.top > footerRect.bottom ||
                    buttonRect.right < footerRect.left ||
                    buttonRect.left > footerRect.right
                )

                setIsOverFooter(isOverlapping)
            }
        }

        window.addEventListener("scroll", checkOverlap)
        window.addEventListener("resize", checkOverlap)

        // Initial check
        checkOverlap()

        return () => {
            window.removeEventListener("scroll", checkOverlap)
            window.removeEventListener("resize", checkOverlap)
        }
    }, [])

    return (
        <a
            id="floating-call-btn"
            href="tel:05124050588"
            className={`fixed bottom-10 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full 
                      transition-all duration-300 animate-bounce-slow group
                      ${isOverFooter ? 'shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'shadow-[0_0_20px_rgba(5,3,62,0.4)]'}
                      ${isOverFooter ? 'hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]' : 'hover:shadow-[0_0_30px_rgba(5,3,62,0.6)]'}`}
            style={{
                backgroundColor: isOverFooter ? "white" : "#05033e",
                color: isOverFooter ? "#05033e" : "white"
            }}
            aria-label="Call Us"
        >
            <div
                className={`absolute inset-0 rounded-full border-2 opacity-50 animate-ping
                           ${isOverFooter ? 'border-white' : 'border-[#05033e]'}`}
            />
            <Phone className="w-6 h-6 fill-current relative z-10" />
        </a>
    )
}
