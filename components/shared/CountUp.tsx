"use client"

import { useEffect, useState, useRef } from "react"

interface CountUpProps {
    end: number
    duration?: number
    suffix?: string
    prefix?: string
    className?: string
}

export default function CountUp({ end, duration = 2000, suffix = "", prefix = "", className = "" }: CountUpProps) {
    const [count, setCount] = useState(0)
    const countRef = useRef<HTMLSpanElement>(null)
    const isVisible = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible.current) {
                    isVisible.current = true
                    let start = 0
                    const stepTime = Math.abs(Math.floor(duration / end))

                    const step = (timestamp: number) => {
                        if (!startTime) startTime = timestamp
                        const progress = timestamp - startTime
                        const percentage = Math.min(progress / duration, 1)

                        // Ease out quart
                        const easeOutQuart = 1 - Math.pow(1 - percentage, 4)

                        const currentCount = Math.floor(easeOutQuart * end)
                        setCount(currentCount)

                        if (progress < duration) {
                            requestAnimationFrame(step)
                        } else {
                            setCount(end)
                        }
                    }

                    let startTime: number | null = null
                    requestAnimationFrame(step)
                }
            },
            { threshold: 0.1 }
        )

        if (countRef.current) {
            observer.observe(countRef.current)
        }

        return () => observer.disconnect()
    }, [end, duration])

    return (
        <span ref={countRef} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}
